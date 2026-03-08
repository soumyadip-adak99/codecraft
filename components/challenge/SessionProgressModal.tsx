"use client";

import { useChallengeStore } from "@/store/challengeStore";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    CheckCircle2,
    Circle,
    Loader2,
    Play,
    Trophy,
    Zap,
    LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

const DIFFICULTY_COLOR: Record<string, string> = {
    Easy: "#22c55e",
    Medium: "#f97316",
    Hard: "#ef4444",
};

/**
 * SessionProgressModal
 *
 * Shown on the /dashboard page whenever the user navigates back from the
 * /challenge page using the browser back button. Lets them either:
 *   • Resume  — go back to their active challenge
 *   • End     — end the session (sends report) and stay on dashboard
 */
export function SessionProgressModal() {
    const router = useRouter();
    const {
        showSessionProgressModal,
        closeSessionProgressModal,
        sessionActive,
        solvedQuestions,
        currentQuestion,
        endSession,
        isEndingSession,
        sessionId,
    } = useChallengeStore();

    // Only render if the flag is set and there is actually an active session
    if (!showSessionProgressModal || !sessionActive) return null;

    const totalSolved = solvedQuestions.length;
    const easyCount = solvedQuestions.filter((q) => q.difficulty === "Easy").length;
    const mediumCount = solvedQuestions.filter((q) => q.difficulty === "Medium").length;
    const hardCount = solvedQuestions.filter((q) => q.difficulty === "Hard").length;

    const handleResume = () => {
        closeSessionProgressModal();
        if (currentQuestion) {
            router.push(`/challenge/${currentQuestion.questionId}`);
        } else {
            router.push("/dashboard");
        }
    };

    const handleEndSession = async () => {
        await endSession();
        closeSessionProgressModal();
    };

    return (
        <>
            {/* ── Backdrop ── */}
            <div
                className="spm-backdrop"
                onClick={() => !isEndingSession && closeSessionProgressModal()}
                aria-hidden="true"
            />

            {/* ── Modal ── */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="spm-title"
                aria-describedby="spm-desc"
                className="spm-modal"
            >
                {/* Header */}
                <div className="spm-header">
                    <div className="spm-icon-wrap" aria-hidden="true">
                        <Trophy className="spm-icon" />
                        <div className="spm-icon-glow" />
                    </div>
                    <div>
                        <h2 id="spm-title" className="spm-title">
                            Session in Progress
                        </h2>
                        <p id="spm-desc" className="spm-subtitle">
                            You left an active coding session
                        </p>
                    </div>
                </div>

                <div className="spm-divider" />

                {/* Stats row */}
                <div className="spm-stats">
                    {[
                        { label: "Solved", value: totalSolved, color: "#fff" },
                        { label: "Easy", value: easyCount, color: "#22c55e" },
                        { label: "Medium", value: mediumCount, color: "#f97316" },
                        { label: "Hard", value: hardCount, color: "#ef4444" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="spm-stat-cell">
                            <span className="spm-stat-value" style={{ color }}>
                                {value}
                            </span>
                            <span className="spm-stat-label">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Solved list */}
                {solvedQuestions.length > 0 && (
                    <div className="spm-list">
                        <p className="spm-list-heading">Solved this session</p>
                        <ul className="spm-list-items">
                            {solvedQuestions.map((q) => (
                                <li key={q.questionId} className="spm-list-item">
                                    <CheckCircle2
                                        size={14}
                                        style={{ color: DIFFICULTY_COLOR[q.difficulty] ?? "#fff", flexShrink: 0 }}
                                    />
                                    <span className="spm-list-item-title">{q.title}</span>
                                    <span
                                        className="spm-list-item-badge"
                                        style={{
                                            color: DIFFICULTY_COLOR[q.difficulty] ?? "#fff",
                                            background: `${DIFFICULTY_COLOR[q.difficulty] ?? "#fff"}18`,
                                            border: `1px solid ${DIFFICULTY_COLOR[q.difficulty] ?? "#fff"}30`,
                                        }}
                                    >
                                        {q.difficulty}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Current question chip */}
                {currentQuestion && (
                    <div className="spm-current">
                        <Circle size={8} className="spm-current-dot" aria-hidden="true" />
                        <span className="spm-current-label">
                            Currently on:{" "}
                            <strong style={{ color: "#fff" }}>{currentQuestion.title}</strong>
                        </span>
                    </div>
                )}

                {/* Progress bar while ending */}
                {isEndingSession && (
                    <div className="spm-progress" aria-live="polite">
                        <div className="spm-progress-bar" />
                        <span className="spm-progress-label">Ending session &amp; sending report…</span>
                    </div>
                )}

                {/* Action buttons */}
                <div className="spm-actions">
                    <Button
                        variant="destructive"
                        onClick={handleEndSession}
                        disabled={isEndingSession}
                        className="spm-btn-end"
                    >
                        {isEndingSession ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                Ending…
                            </>
                        ) : (
                            <>
                                <LogOut size={15} />
                                End Session
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleResume}
                        disabled={isEndingSession}
                        className="spm-btn-resume"
                    >
                        <Play size={15} />
                        Resume Session
                        <ArrowRight size={14} />
                    </Button>
                </div>
            </div>

            <style>{css}</style>
        </>
    );
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

const css = `
  /* ── Backdrop ── */
  .spm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9990;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    animation: spm-fade 0.25s ease both;
  }
  @keyframes spm-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ── Modal ── */
  .spm-modal {
    position: fixed;
    z-index: 9991;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(480px, calc(100vw - 24px));
    background: #0c0c0c;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 22px;
    padding: 28px 28px 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.04),
      0 40px 100px rgba(0, 0, 0, 0.7),
      0 0 80px rgba(249, 115, 22, 0.05);
    animation: spm-slide 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes spm-slide {
    from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)) scale(0.96); }
    to   { opacity: 1; transform: translate(-50%, -50%)               scale(1);   }
  }

  /* ── Header ── */
  .spm-header {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .spm-icon-wrap {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(249, 115, 22, 0.1);
    border: 1px solid rgba(249, 115, 22, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .spm-icon {
    width: 22px;
    height: 22px;
    color: #f97316;
    position: relative;
    z-index: 1;
  }
  .spm-icon-glow {
    position: absolute;
    inset: 0;
    border-radius: 14px;
    background: rgba(249, 115, 22, 0.15);
    animation: spm-glow-pulse 2.5s ease-in-out infinite;
  }
  @keyframes spm-glow-pulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1;   box-shadow: 0 0 16px rgba(249,115,22,0.3); }
  }
  .spm-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
    font-family: var(--font-sans, system-ui, sans-serif);
  }
  .spm-subtitle {
    margin: 3px 0 0;
    font-size: 0.8125rem;
    color: #71717a;
    font-family: var(--font-sans, system-ui, sans-serif);
  }

  /* ── Divider ── */
  .spm-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.05);
    margin: 0 -4px;
  }

  /* ── Stats ── */
  .spm-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .spm-stat-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 8px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .spm-stat-value {
    font-size: 1.375rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    font-family: var(--font-sans, system-ui, sans-serif);
    line-height: 1;
  }
  .spm-stat-label {
    font-size: 0.6875rem;
    color: #52525b;
    font-family: var(--font-sans, system-ui, sans-serif);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  /* ── Solved list ── */
  .spm-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .spm-list-heading {
    margin: 0;
    font-size: 0.75rem;
    color: #52525b;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: var(--font-sans, system-ui, sans-serif);
  }
  .spm-list-items {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 140px;
    overflow-y: auto;
  }
  .spm-list-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);
  }
  .spm-list-item-title {
    flex: 1;
    font-size: 0.8125rem;
    color: #d4d4d8;
    font-family: var(--font-sans, system-ui, sans-serif);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .spm-list-item-badge {
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 6px;
    flex-shrink: 0;
    font-family: var(--font-sans, system-ui, sans-serif);
  }

  /* ── Current question chip ── */
  .spm-current {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(249, 115, 22, 0.05);
    border: 1px solid rgba(249, 115, 22, 0.12);
  }
  .spm-current-dot {
    color: #f97316;
    fill: #f97316;
    flex-shrink: 0;
    animation: spm-dot-pulse 1.5s ease-in-out infinite;
  }
  @keyframes spm-dot-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  .spm-current-label {
    font-size: 0.8125rem;
    color: #a1a1aa;
    font-family: var(--font-sans, system-ui, sans-serif);
  }

  /* ── Progress bar ── */
  .spm-progress {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
  .spm-progress-bar {
    width: 100%;
    height: 2px;
    border-radius: 2px;
    background: rgba(249, 115, 22, 0.1);
    overflow: hidden;
    position: relative;
  }
  .spm-progress-bar::after {
    content: "";
    position: absolute;
    top: 0; left: -40%;
    width: 40%;
    height: 100%;
    background: #f97316;
    border-radius: 2px;
    animation: spm-bar 1.2s ease-in-out infinite;
  }
  @keyframes spm-bar {
    0%   { left: -40%; }
    100% { left: 100%; }
  }
  .spm-progress-label {
    font-size: 0.75rem;
    color: #71717a;
    font-family: var(--font-sans, system-ui, sans-serif);
  }

  /* ── Actions ── */
  .spm-actions {
    display: flex;
    gap: 10px;
  }
  .spm-btn-end {
    flex: 0 0 auto;
    height: 44px !important;
    padding: 0 18px !important;
    border-radius: 11px !important;
    background: rgba(239, 68, 68, 0.12) !important;
    color: #ef4444 !important;
    border: 1px solid rgba(239, 68, 68, 0.2) !important;
    gap: 6px;
    cursor: pointer;
    font-size: 0.875rem !important;
    transition: background 0.15s, border-color 0.15s !important;
  }
  .spm-btn-end:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.2) !important;
    border-color: rgba(239, 68, 68, 0.35) !important;
  }
  .spm-btn-end:disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
  }
  .spm-btn-resume {
    flex: 1;
    height: 44px !important;
    border-radius: 11px !important;
    background: #f97316 !important;
    color: #fff !important;
    gap: 6px;
    cursor: pointer;
    font-size: 0.875rem !important;
    font-weight: 600 !important;
    box-shadow: 0 0 20px rgba(249,115,22,0.25) !important;
    transition: background 0.15s, box-shadow 0.15s !important;
  }
  .spm-btn-resume:hover:not(:disabled) {
    background: #ea580c !important;
    box-shadow: 0 0 28px rgba(249,115,22,0.4) !important;
  }
  .spm-btn-resume:disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
  }
`;
