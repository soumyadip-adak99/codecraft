# CodeCraft 🚀

<div align="center">
<img src="https://res.cloudinary.com/dzunlgq2p/image/upload/v1772396005/Screenshot_2026-03-02_013706_fk6lhf.png" alt="CodeCraft Banner" width="100%" />

**An advanced AI‑powered coding practice platform designed to help developers ace technical interviews.**

</div>

---

## 📖 Table of Contents

* About the Project
* Key Features
* System Architecture
* Tech Stack
* Getting Started
* Project Structure
* Contributing
* License

---

## 💡 About the Project

CodeCraft is a modern coding practice environment designed to simulate real-world technical interviews.

By leveraging advanced Large Language Models (LLMs), CodeCraft dynamically generates algorithmic challenges tailored to your skill level.

With a built‑in execution engine, real‑time analytics, and seamless GitHub integration, CodeCraft provides an end‑to‑end experience that helps developers practice, track progress, and build a coding portfolio.

---

## ✨ Key Features

### 🤖 AI‑Driven Question Generation

Generate algorithmic challenges (Easy, Medium, Hard) using powerful LLMs such as:

* OpenAI GPT‑4
* Google Gemini
* Anthropic
* Groq

### 💻 Professional Editor Experience

* Monaco Editor (VS Code engine)
* Syntax highlighting
* IntelliSense
* Clean developer workflow

### 🌍 Multi‑Language Support

Solve problems in multiple languages:

* JavaScript
* TypeScript
* Python
* Java
* C++

### ⚡ Robust Code Execution Engine

* Syntax checking
* Multi test case evaluation
* Compilation error tracing
* Runtime analysis

### 🚦 Run → Submit Workflow

Code must pass all generated test cases before submission, ensuring strict validation similar to real interview platforms.

### 📊 Real‑Time Analytics

Live progress tracking powered by **Convex**:

* Problems solved
* Difficulty distribution
* Community statistics

### 🐙 GitHub Integration

Connect your GitHub account to:

* Create repositories automatically
* Push accepted solutions
* Build your coding portfolio

### 🔐 Enterprise‑Grade Security

* OAuth authentication via NextAuth
* AES‑256‑GCM encryption for tokens
* Secure API handling

### 📧 Automated Reports

Receive email reports containing:

* Session performance
* Submitted code
* Detailed analytics

---

## 🏗️ System Architecture

CodeCraft uses a modern serverless architecture:

### Frontend (Next.js)

* UI rendering
* Monaco editor integration
* Global state management with Zustand

### Backend (Next.js API Routes)

Handles:

* AI challenge generation
* Code execution validation
* GitHub integrations
* Email services

### Primary Database (MongoDB)

Stores:

* User profiles
* Encrypted tokens
* Repository metadata

### Real‑Time Database (Convex)

Provides:

* Live analytics
* Active developer tracking
* Community reviews

### External Integrations

* OpenAI
* Google Gemini
* Anthropic
* Groq

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* TailwindCSS
* Monaco Editor

### Backend

* Next.js Serverless API
* Node.js

### Database

* MongoDB
* Convex

### Security

* NextAuth
* AES‑256‑GCM encryption

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure the following are installed:

* Node.js (v18+)
* npm / yarn / pnpm
* MongoDB Atlas
* Convex account
* OAuth credentials (Google & GitHub)

---

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/codecraft.git
cd codecraft
```

---

### 3. Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

---

### 4. Environment Variables

Create a `.env.local` file in the root directory.

You will need configuration for:

* NextAuth secrets
* Google OAuth credentials
* GitHub OAuth credentials
* MongoDB connection string
* Convex deployment URL
* AES encryption keys
* SMTP email configuration

---

### 5. Initialize Convex

```bash
npx convex dev
```

---

### 6. Run the Application

```bash
npm run dev
```

Open your browser and navigate to:

```
http://localhost:3000
```

---

## 📁 Project Structure

```
codecraft/

├── @types/        Global TypeScript definitions
├── app/           Next.js App Router
├── components/    Reusable UI components
├── convex/        Convex schema and functions
├── lib/           Core services (crypto, email, engine, GitHub)
├── models/        MongoDB schemas
├── store/         Zustand state management
├── public/        Static assets
└── package.json
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit changes

```bash
git commit -m "Add amazing feature"
```

4. Push to your branch

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License.

See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ for developers leveling up their coding skills.

</div>
