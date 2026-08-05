let currentAbortController = null;
let activeImageBase64 = null;

// DOM Elements
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const stopBtn = document.getElementById('stopBtn');
const cameraBtn = document.getElementById('cameraBtn');
const cameraInput = document.getElementById('cameraInput');
const mediaPreview = document.getElementById('mediaPreview');
const messagesContainer = document.getElementById('messagesContainer');
const themeToggle = document.getElementById('themeToggle');
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const sidebar = document.getElementById('sidebar');
const newChatBtn = document.getElementById('newChatBtn');
const historyList = document.getElementById('historyList');

// --- 1. Theme Setup ---
const savedTheme = localStorage.getItem('yg_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('yg_theme', newTheme);
  });
}

// --- 2. Sidebar & New Chat ---
if (toggleSidebarBtn && sidebar) {
  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
}

if (newChatBtn) {
  newChatBtn.addEventListener('click', () => {
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="welcome-card">
          <h2>Namaste! 🛠️</h2>
          <p>Snap a photo of your machine, appliance, or vehicle part for immediate repair diagnosis and workarounds.</p>
        </div>
      `;
    }
    clearImage();
  });
}

// --- 3. Camera & Image Logic ---
if (cameraBtn && cameraInput) {
  cameraBtn.addEventListener('click', () => cameraInput.click());

  cameraInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        activeImageBase64 = event.target.result;
        if (mediaPreview) {
          mediaPreview.innerHTML = `
            <div style="position:relative; display:inline-block; margin-top:8px;">
              <img src="${activeImageBase64}" class="preview-img" style="max-height:100px; border-radius:8px;">
              <button onclick="clearImage()" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer;">✕</button>
            </div>`;
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

function clearImage() {
  activeImageBase64 = null;
  if (mediaPreview) mediaPreview.innerHTML = '';
  if (cameraInput) cameraInput.value = '';
}

// --- 4. Message Rendering Helper ---
function appendMessage(role, text, imageB64 = null) {
  if (!messagesContainer) return null;

  // Remove welcome card on first message
  const welcomeCard = messagesContainer.querySelector('.welcome-card');
  if (welcomeCard) {
    welcomeCard.remove();
  }

  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role}-message`;
  msgDiv.style.cssText = `margin-bottom: 12px; padding: 10px 14px; border-radius: 8px; max-width: 85%; ${
    role === 'user'
      ? 'margin-left: auto; background: #2563eb; color: white;'
      : 'margin-right: auto; background: #1e293b; color: #f8fafc;'
  }`;

  if (imageB64) {
    const img = document.createElement('img');
    img.src = imageB64;
    img.style.cssText = 'max-width: 100%; max-height: 200px; border-radius: 6px; display: block; margin-bottom: 8px;';
    msgDiv.appendChild(img);
  }

  const textNode = document.createElement('div');
  textNode.innerText = text;
  msgDiv.appendChild(textNode);

  messagesContainer.appendChild(msgDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  return textNode;
}

// --- 5. Controls & Keyboard Setup ---
if (userInput) {
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
  });
}

if (sendBtn) {
  sendBtn.addEventListener('click', sendQuery);
}

function stopGeneration() {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
    toggleControls(false);
  }
}

if (stopBtn) stopBtn.addEventListener('click', stopGeneration);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || (e.ctrlKey && e.key === 'c')) {
    stopGeneration();
  }
});

function toggleControls(isGenerating) {
  if (sendBtn) sendBtn.style.display = isGenerating ? 'none' : 'inline-block';
  if (stopBtn) stopBtn.style.display = isGenerating ? 'inline-block' : 'none';
}

// --- 6. Stream Communication with Backend ---
async function sendQuery() {
  const text = userInput ? userInput.value.trim() : '';
  if (!text && !activeImageBase64) return;

  appendMessage('user', text, activeImageBase64);
  if (userInput) userInput.value = '';

  const payload = { prompt: text, image_base64: activeImageBase64 };
  clearImage();

  toggleControls(true);
  currentAbortController = new AbortController();

  const botMsgTextNode = appendMessage('assistant', '');

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: currentAbortController.signal
    });

    if (!response.ok) {
      throw new Error(`Server status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let resultText = '';
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.replace('data: ', '');
          if (content === '[DONE]') break;
          resultText += content.replace(/\\n/g, '\n');
          if (botMsgTextNode) {
            botMsgTextNode.innerText = resultText;
          }
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      if (botMsgTextNode) botMsgTextNode.innerText += '\n[Stopped by user]';
    } else {
      console.error('Fetch Error:', err);
      if (botMsgTextNode) {
        botMsgTextNode.innerText = `Error: Could not communicate with server (${err.message}). Check GEMINI_API_KEY on Vercel.`;
      }
    }
  } finally {
    toggleControls(false);
    currentAbortController = null;
    saveToHistory(text, botMsgTextNode ? botMsgTextNode.innerText : '');
  }
}

// --- 7. Local Storage History ---
function saveToHistory(query, response) {
  if (!query) return;
  const history = JSON.parse(localStorage.getItem('yg_history') || '[]');
  const newItem = { id: Date.now(), query, response, timestamp: new Date().toISOString() };
  history.unshift(newItem);
  localStorage.setItem('yg_history', JSON.stringify(history.slice(0, 15)));
  renderHistory();
}

function deleteHistoryItem(id, e) {
  e.stopPropagation();
  let history = JSON.parse(localStorage.getItem('yg_history') || '[]');
  history = history.filter((item) => item.id !== id);
  localStorage.setItem('yg_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  if (!historyList) return;
  const history = JSON.parse(localStorage.getItem('yg_history') || '[]');
  historyList.innerHTML = '';

  history.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; margin-bottom: 6px; cursor: pointer; border-radius: 8px; background: rgba(255,255,255,0.05);';

    const titleSpan = document.createElement('span');
    titleSpan.innerText = item.query || 'Image Diagnostic';
    titleSpan.style.cssText = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;';

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.style.cssText = 'background: transparent; border: none; cursor: pointer; font-size: 14px; opacity: 0.7;';
    deleteBtn.title = 'Delete Chat';
    deleteBtn.onclick = (e) => deleteHistoryItem(item.id, e);

    div.appendChild(titleSpan);
    div.appendChild(deleteBtn);

    div.onclick = () => {
      if (messagesContainer) {
        messagesContainer.innerHTML = '';
        appendMessage('user', item.query);
        appendMessage('assistant', item.response);
      }
    };

    historyList.appendChild(div);
  });
}

renderHistory();