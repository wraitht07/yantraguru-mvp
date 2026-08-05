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

// --- 1. Dark/Light Theme Toggle ---
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('yg_theme', newTheme);
});

// Load saved theme on startup
const savedTheme = localStorage.getItem('yg_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// --- 2. Sidebar & New Chat Logic ---
if (toggleSidebarBtn) {
  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
}

newChatBtn.addEventListener('click', () => {
  messagesContainer.innerHTML = `
    <div class="welcome-card">
      <h2>Namaste! 🛠️</h2>
      <p>Snap a photo of your machine, appliance, or vehicle part for immediate repair diagnosis and workarounds.</p>
    </div>
  `;
  clearImage();
});

// --- 3. Camera Input Logic ---
cameraBtn.addEventListener('click', () => cameraInput.click());

cameraInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      activeImageBase64 = event.target.result;
      mediaPreview.innerHTML = `
        <div style="position:relative; display:inline-block;">
          <img src="${activeImageBase64}" class="preview-img">
          <button onclick="clearImage()" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer;">✕</button>
        </div>`;
    };
    reader.readAsDataURL(file);
  }
});

function clearImage() {
  activeImageBase64 = null;
  mediaPreview.innerHTML = '';
  cameraInput.value = '';
}

// --- 4. Enter Key & Send/Stop Fixes ---
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // Prevents newline insertion
    sendQuery();
  }
});

sendBtn.addEventListener('click', sendQuery);

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
  sendBtn.style.display = isGenerating ? 'none' : 'inline-block';
  if (stopBtn) stopBtn.style.display = isGenerating ? 'inline-block' : 'none';
}

// --- 5. Stream Communication with Backend ---
// --- 5. Stream Communication with Backend ---
async function sendQuery() {
  const text = userInput.value.trim();
  if (!text && !activeImageBase64) return;

  appendMessage('user', text, activeImageBase64);
  userInput.value = '';

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
      throw new Error(`Server returned HTTP ${response.status}`);
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
      
      // Keep incomplete chunk in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.replace('data: ', '');
          if (content === '[DONE]') break;
          resultText += content.replace(/\\n/g, '\n');
          botMsgTextNode.innerText = resultText;
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      botMsgTextNode.innerText += '\n[Generation stopped by user]';
    } else {
      console.error('Fetch Error:', err);
      botMsgTextNode.innerText = `Error: Could not receive response from server (${err.message}).`;
    }
  } finally {
    toggleControls(false);
    currentAbortController = null;
    saveToHistory(text, botMsgTextNode.innerText);
  }
}

// --- 6. Local Storage History with Deletion Support ---
function saveToHistory(query, response) {
  if (!query) return;
  const history = JSON.parse(localStorage.getItem('yg_history') || '[]');
  const newItem = { id: Date.now(), query, response, timestamp: new Date().toISOString() };
  history.unshift(newItem);
  const sliced = history.slice(0, 15);
  localStorage.setItem('yg_history', JSON.stringify(sliced));
  renderHistory();
}

function deleteHistoryItem(id, e) {
  e.stopPropagation(); // Prevents loading the chat when clicking the delete icon
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
    div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; margin-bottom: 6px; cursor: pointer; border-radius: 8px;';

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
      messagesContainer.innerHTML = '';
      appendMessage('user', item.query);
      appendMessage('assistant', item.response);
    };

    historyList.appendChild(div);
  });
}

// Initial render when page loads
renderHistory();