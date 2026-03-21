import {
    BarChart2,
    BookOpen,
    Brain,
    Code2,
    FileText,
    Flame,
    Target,
    Terminal,
    Trophy,
    Zap,
} from "lucide-react";

export const steps = [
    {
        icon: Zap,
        title: "1. Start a Session",
        description:
            "Begin your journey from the Dashboard by clicking 'Start Session'. Choose your desired difficulty (Easy, Medium, or Hard) and optionally specify a topic like 'Dynamic Programming' or 'Trees'.",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
    },
    {
        icon: Brain,
        title: "2. AI Question Generation",
        description:
            "Our platform uses advanced LLMs (Groq, OpenAI, Anthropic, or Gemini) to generate a unique, completely new coding challenge tailored to your chosen difficulty and topic. We ensure you never see the same question twice in a session.",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
    },
    {
        icon: Code2,
        title: "3. Write Code in Monaco Editor",
        description:
            "Solve the problem in a professional VS Code-like environment supporting 5 languages: JavaScript, TypeScript, Python, Java, and C++. The editor comes with syntax highlighting, IntelliSense, and language-specific starter code.",
        color: "text-green-400",
        bg: "bg-green-500/10",
    },
    {
        icon: Terminal,
        title: "4. Run & Submit for Evaluation",
        description:
            "Click 'Run' to test your logic against visible test cases. When ready, click 'Submit' to evaluate against hidden edge cases. A robust execution engine grades your attempt. Once 'Accepted', your stats are updated and the 'Next' button unlocks.",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
    {
        icon: FileText,
        title: "5. End Session & PDF Report",
        description:
            "When you are done practicing, click 'End Session'. A detailed performance report summarizing your solved questions, difficulty breakdown, and time spent is compiled into a beautiful PDF and instantly emailed to your inbox.",
        color: "text-red-400",
        bg: "bg-red-500/10",
    },
];

export const PROVIDERS = [
    { value: "openai", label: "OpenAI", models: ["gpt-4o-mini", "gpt-4o", "gpt-4"] },
    {
        value: "anthropic",
        label: "Anthropic",
        models: ["claude-3-haiku", "claude-3-sonnet", "claude-3-opus"],
    },
    {
        value: "google",
        label: "Google Gemini",
        models: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash"],
    },
    { value: "custom", label: "Custom / Local", models: [] },
];

export const API_KEY_PROVIDER_LINK = [
    {
        name: "Google AI",
        url: "https://aistudio.google.com/app/apikey",
        badge: "Recommended",
    },
    { name: "OpenAI", url: "https://platform.openai.com/api-keys" },
    {
        name: "Anthropic",
        url: "https://console.anthropic.com/settings/keys",
    },
];
export const SQL_DIALECTS = [
    { value: "mysql", label: "MySQL", description: "The world's most popular open-source SQL database" },
    { value: "postgresql", label: "PostgreSQL", description: "Advanced open-source relational database with strong standards compliance" },
    { value: "oracle", label: "Oracle SQL", description: "Enterprise-grade SQL with ROWNUM, CONNECT BY, and PL/SQL extensions" },
    { value: "sqlite", label: "SQLite", description: "Lightweight, serverless, self-contained SQL engine" },
];

export const sqlSteps = [
    {
        icon: Zap,
        title: "1. Start a SQL Session",
        description: "Select your SQL dialect (MySQL, PostgreSQL, Oracle SQL, or SQLite), choose difficulty, and optionally specify a topic like 'JOINs' or 'window functions'.",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
    },
    {
        icon: Brain,
        title: "2. AI Question Generation",
        description: "Our AI generates a unique SQL challenge with a full database schema, sample data, and clearly defined expected output per test case.",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
    },
    {
        icon: Code2,
        title: "3. Write SQL in Monaco Editor",
        description: "Write your SQL query in the Monaco editor with full SQL syntax highlighting. Switch dialects and themes on the fly.",
        color: "text-green-400",
        bg: "bg-green-500/10",
    },
    {
        icon: Terminal,
        title: "4. Run & Submit for Evaluation",
        description: "Click 'Run' to test against visible test cases. Submit to evaluate all hidden test cases. The AI simulates SQL execution displaying pass/fail result tables.",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
    {
        icon: Target,
        title: "5. Get AI Feedback",
        description: "Receive detailed feedback including code quality score, query complexity, optimization suggestions, and best practices for your SQL.",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
    },
];
