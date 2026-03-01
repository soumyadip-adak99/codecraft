# CodeCraft 🚀

![CodeCraft Banner](https://via.placeholder.com/1200x400.png?text=CodeCraft+-+AI+Powered+Coding+Platform)

**CodeCraft** is an advanced, AI-powered coding practice platform designed to help developers ace their next technical interview. Built with **Next.js 16**, **Convex**, and **Monaco Editor**, it dynamically generates coding challenges tailored to your skill level, provides a real-time execution environment, and tracks your progress across sessions.

---

## ✨ Features

- **🤖 AI Question Generation**: Generate unique Easy, Medium, or Hard algorithmic challenges using powerful LLMs like Groq, OpenAI GPT-4, or Google Gemini.
- **💻 VS Code-Like Editor**: Interactive code environment powered by `monaco-editor` with syntax highlighting and IntelliSense.
- **🌍 Multi-Language Support**: Write solutions in JavaScript, TypeScript, Python, Java, or C++, complete with language-specific starter code.
- **✅ Robust Execution Engine**: Built-in syntax checking, multiple test case evaluation, compilation error tracing, and runtime analysis.
- **🚥 Run-to-Submit Workflow**: Strict validation to ensure users can only submit code to the database after successfully passing all generated test cases.
- **📊 Progress & Analytics**: Real-time stats synchronization via Convex. Track problems solved, difficulty breakdowns, and total active developers.
- **📑 PDF Session Reports**: At the end of a session, automatically generate and email a detailed PDF performance report encompassing all solved questions.
- **🔐 Secure Authentication**: OAuth login via NextAuth.js (Google Provider) seamlessly saving user identity across MongoDB and Convex.
- **💬 Community Reviews**: Share and view platform feedback directly populated from the real-time Convex database.

---

## 🛠️ Tech Stack

**Frontend & Framework:**
- [![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/) (App Router, Turbopack)
- [![React](https://img.shields.io/badge/React-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://react.dev/)
- [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
- [![Zustand](https://img.shields.io/badge/Zustand-%2330363d.svg?style=flat)](https://github.com/pmndrs/zustand) (State Management)
- [![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-%231E1E1E.svg?style=flat)](https://microsoft.github.io/monaco-editor/)

**Backend & Database:**
- [![Convex](https://img.shields.io/badge/Convex-%23FF8000.svg?style=flat)](https://www.convex.dev/) (Real-time Database & Serverless Functions)
- [![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/) (User Identity & App metadata mapping)
- ⚡ **Next.js API Routes** (Serverless backend for LLM & execution)

**Authentication:**
- [![NextAuth.js](https://img.shields.io/badge/NextAuth.js-%23000000.svg?style=flat)](https://next-auth.js.org/) v5 (Beta) 

**Utilities & Animations:**
- [![GSAP](https://img.shields.io/badge/GSAP-%2388CE02.svg?style=flat&logo=greensock&logoColor=white)](https://gsap.com/)
- [![Motion](https://img.shields.io/badge/Motion-%23FF0080.svg?style=flat)](https://motion.dev/)
- [![Lucide React](https://img.shields.io/badge/Lucide_React-%23F97316.svg?style=flat)](https://lucide.dev/) (Icons)
- [![Nodemailer](https://img.shields.io/badge/Nodemailer-%2314A03D.svg?style=flat)](https://nodemailer.com/) & [![jsPDF](https://img.shields.io/badge/jsPDF-%23FF0000.svg?style=flat)](https://parall.ax/products/jspdf)

---

## ⚙️ Local Development Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.17 or higher)
- **npm**, **yarn**, or **pnpm**
- A [Convex](https://www.convex.dev/) account
- A [MongoDB](https://www.mongodb.com/atlas) cluster 
- Google OAuth credentials for NextAuth
- API Keys for your preferred LLM (e.g., [Groq](https://console.groq.com/))

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/codecraft.git
cd codecraft
```

### 3. Install Dependencies
```bash
npm install
# or
yarn install
```

### 4. Environment Variables
Create a `.env.local` file in the root of your project and configure the following variables:

```env
# URL Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Convex Deployment (Will be auto-generated when running `npx convex dev`)
CONVEX_DEPLOYMENT=your_convex_deployment_name
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# LLM Provider Keys
GROQ_API_KEY=your_groq_api_key

# Email/Nodemailer Configuration (For Session Reports)
EMAIL_SERVER_USER=your_smtp_email
EMAIL_SERVER_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@yourdomain.com
```

### 5. Start the Convex Backend
In a separate terminal, initialize and run your Convex database:
```bash
npx convex dev
```

### 6. Start the Development Server
```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.

---

## 📁 Project Structure

```text
├── @types/               # Global TypeScript definitions
├── app/                  # Next.js 14 App Router routes (API, Dashboard, Marketing, Editor)
├── components/           # Reusable UI components (shadcn/ui, Layouts, Forms)
├── convex/               # Convex database schema, queries, and mutations
├── lib/                  # Utility functions, Auth config, Email service, PDF Generator
├── models/               # MongoDB Mongoose schemas
├── store/                # Zustand global state management (Challenge Store)
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

---

## 🤝 Contributing

Contributions are always welcome! Whether it's reporting a bug, proposing a feature, or writing code.

1. Fork the project.
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ for developers leveling up their coding skills.*
