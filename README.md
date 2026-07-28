# 🛠️ YantraGuru (यंत्रगुरु) — Local AI Mechanic & Equipment Repair Companion

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E44AD?style=for-the-badge&logo=google&logoColor=white" alt="Gemini"/>
  <img src="https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
  <img src="https://img.shields.io/badge/UV-Dependency_Manager-DE5E97?style=for-the-badge&logo=python&logoColor=white" alt="UV"/>
</p>

<p align="center">
AI-powered repair assistant for mechanics, shop owners, students, and DIY enthusiasts across Tier-2 and Tier-3 India.
</p>

---

# 📖 Table of Contents

* [Project Overview](#-project-overview)
* [Features](#-features)
* [Technology Stack](#-technology-stack)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)
* [Environment Variables](#-environment-variables)
* [Running Locally](#-running-locally)
* [Deployment](#-deployment)
* [Future Improvements](#-future-improvements)
* [License](#-license)

---

# 📌 Project Overview

**YantraGuru (यंत्रगुरु)** is a hyper-local AI repair assistant built specifically for Indian users who frequently depend on local mechanics, repair shops, and community knowledge.

Instead of searching through lengthy YouTube tutorials or waiting for a mechanic to inspect a problem, users simply capture a photo of the faulty component using their smartphone camera.

The AI analyzes the image, identifies visible defects or wear, and provides:

* Step-by-step repair guidance
* Possible causes of failure
* DIY troubleshooting instructions
* Practical *jugaad* alternatives when original spare parts are unavailable
* Safety precautions before attempting repairs

YantraGuru is designed for:

* 🔧 Local mechanics
* 🛵 Two-wheeler owners
* 🚜 Farmers maintaining irrigation equipment
* 🏠 Home appliance users
* 🎓 Engineering and diploma students
* 👨‍🔧 Independent repair technicians

---

# 🌟 Features

### 📷 Native Camera Capture

Uses the native mobile camera through the browser (`capture="environment"`), allowing users to instantly photograph faulty components without installing an app.

---

### 🤖 AI-Powered Diagnostics

Upload a machine or component image and receive:

* Visual fault identification
* Repair suggestions
* Troubleshooting workflow
* Practical repair advice

---

### ⚡ Real-Time Streaming

Responses stream progressively using **Server-Sent Events (SSE)**, giving immediate feedback without waiting for the full response.

---

### 🛑 Instant Stream Cancellation

Generation can be stopped anytime using:

* Stop button
* `Esc`
* `Ctrl + C`

---

### 🎨 Responsive Interface

* Dark Mode
* Light Mode
* Mobile-friendly layout
* Tactile button animations
* Smooth UI interactions

---

### 🔒 Secure Backend

Google Gemini API keys remain securely stored on the FastAPI backend.

No client-side API key exposure.

---

### 💾 Local Conversation History

Previous conversations are cached locally using `localStorage`, allowing users to revisit earlier diagnostics.

---

# 🛠 Technology Stack

| Layer              | Technology               |
| ------------------ | ------------------------ |
| Backend            | FastAPI                  |
| AI Model           | Google Gemini 2.5 Flash  |
| Frontend           | HTML5, CSS3, JavaScript  |
| Streaming          | Server-Sent Events (SSE) |
| Dependency Manager | UV                       |
| Deployment         | Vercel                   |
| Language           | Python 3.11+             |

---

# 📂 Project Structure

```text
yantraguru-mvp/
│
├── .env                  # Environment variables
├── .gitignore            # Git ignored files
├── pyproject.toml        # Project metadata
├── uv.lock               # Locked dependencies
├── vercel.json           # Deployment configuration
│
├── backend/
│   ├── __init__.py
│   ├── config.py         # Environment configuration
│   └── main.py           # FastAPI application
│
└── frontend/
    ├── index.html        # Main UI
    ├── style.css         # Styling
    └── app.js            # Client-side logic
```

---

# 🚀 Getting Started

## Prerequisites

Ensure the following are installed:

* Python 3.11+
* UV Package Manager
* Google Gemini API Key

Install UV if needed:

```bash
pip install uv
```

or

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/yantraguru-mvp.git

cd yantraguru-mvp
```

---

## Create Virtual Environment

```bash
uv venv
```

Activate it:

### Linux / macOS

```bash
source .venv/bin/activate
```

### Windows

```powershell
.venv\Scripts\activate
```

---

## Install Dependencies

```bash
uv sync
```

---

# 🔑 Environment Variables

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

# ▶️ Running Locally

## Start the Backend

```bash
source .venv/bin/activate

uvicorn backend.main:app --reload --port 8000
```

Backend:

```
http://127.0.0.1:8000
```

---

## Start the Frontend

Open another terminal.

```bash
python -m http.server 3000 --directory frontend
```

Frontend:

```
http://127.0.0.1:3000
```

---

## Open in Browser

Visit:

```
http://127.0.0.1:3000
```

You can now:

* Upload machine images
* Stream AI diagnostics
* Switch themes
* Stop generation
* View cached history

---

# ☁️ Deployment

This project is configured for deployment on **Vercel**.

Ensure the following are configured:

* `vercel.json`
* Environment Variable:

```
GEMINI_API_KEY
```

Deploy using:

```bash
vercel
```

or connect the GitHub repository directly through the Vercel dashboard.

---

# 🚧 Future Improvements

* 🎤 Voice-based troubleshooting
* 🌐 Multilingual responses (Hindi, Tamil, Telugu, Kannada, Marathi, etc.)
* 📍 Nearby spare-part shop recommendations
* 📦 Repair cost estimation
* 📄 Maintenance history
* 📹 Video diagnostics
* 🔍 OCR for machine labels and serial numbers
* 📱 Progressive Web App (PWA) support
* Offline image queue
* Fine-tuned local repair knowledge base

---

# 🤝 Contributing

Contributions, feature requests, and improvements are welcome.

Feel free to fork the repository, open issues, or submit pull requests.

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for more information.

---

<p align="center">
Made with ❤️ for India's repair ecosystem.
</p>
