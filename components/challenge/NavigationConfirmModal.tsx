"use client";

import { useChallengeStore } from "@/store/challengeStore";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, LogOut, X } from "lucide-react";

/**
 * NavigationConfirmModal
 *
 * Shown whenever the user tries to leave the /challenge page without
 * clicking "End Session". Ends the session (calls the API) and then
 * navigates away only after confirmation.
 */
export function NavigationConfirmModal() {
    const { isEndingSession, endSession, isExitModalOpen, closeExitModal, exitTargetUrl } =
        useChallengeStore();

    const handleConfirm = async () => {
        await endSession();
        closeExitModal();

        // Use window.location so we bypass the patched history API
        const destination = exitTargetUrl || "/dashboard";
        window.location.href = destination;
    };

    if (!isExitModalOpen) return null;

    return (
        <>
            {/* ── Backdrop ── */}
            <div
                className="ncm-backdrop"
                onClick={() => !isEndingSession && closeExitModal()}
                aria-hidden="true"
            />

            {/* ── Modal ── */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="ncm-title"
                aria-describedby="ncm-desc"
                className="ncm-modal"
            >
                {/* Close button */}
                {!isEndingSession && (
                    <button className="ncm-close" onClick={closeExitModal} aria-label="Cancel">
                        <X size={16} />
                    </button>
                )}

                {/* Icon */}
                <div className="ncm-icon-wrap" aria-hidden="true">
                    <div className="ncm-icon-ring" />
                    <AlertTriangle className="ncm-icon" />
                </div>

                {/* Copy */}
                <h2 id="ncm-title" className="ncm-title">
                    Exit Active Session?
                </h2>
                <p id="ncm-desc" className="ncm-desc">
                    You have an{" "}
                    <span className="ncm-highlight">active coding session</span> in progress.
                    Leaving now will <strong>end the session</strong> and send your performance
                    report. This action cannot be undone.
                </p>

                {/* Progress indicator while ending */}
                {isEndingSession && (
                    <div className="ncm-progress" aria-live="polite">
                        <div className="ncm-progress-bar" />
                        <span className="ncm-progress-label">Ending session &amp; sending report…</span>
                    </div>
                )}

                {/* Actions */}
                <div className="ncm-actions">
                    <Button
                        variant="ghost"
                        onClick={closeExitModal}
                        disabled={isEndingSession}
                        className="ncm-btn-cancel"
                    >
                        Keep Coding
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isEndingSession}
                        className="ncm-btn-confirm"
                    >
                        {isEndingSession ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Ending Session…
                            </>
                        ) : (
                            <>
                                <LogOut className="h-4 w-4" />
                                End &amp; Leave
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <style>{css}</style>
        </>
    );
}

const css = `
  /* ── Backdrop ── */
  .ncm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(6px);
    animation: ncm-fade-in 0.2s ease both;
  }

  /* ── Modal card ── */
  .ncm-modal {
    position: fixed;
    z-index: 9999;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(440px, calc(100vw - 32px));
    background: #0d0d0d;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 36px 32px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.04),
      0 32px 80px rgba(0, 0, 0, 0.7),
      0 0 60px rgba(239, 68, 68, 0.06);
    animation: ncm-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes ncm-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes ncm-slide-in {
    from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)) scale(0.96); }
    to   { opacity: 1; transform: translate(-50%, -50%)                scale(1);   }
  }

  /* ── Close button ── */
  .ncm-close {
    position: absolute;
    top: 14px;
    right: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #52525b;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .ncm-close:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #a1a1aa;
  }

  /* ── Animated icon ── */
  .ncm-icon-wrap {
    position: relative;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ncm-icon-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1.5px solid rgba(239, 68, 68, 0.25);
    background: rgba(239, 68, 68, 0.08);
    animation: ncm-ring-pulse 2s ease-in-out infinite;
  }
  @keyframes ncm-ring-pulse {
    0%, 100% { box-shadow: 0 0 0 0  rgba(239,68,68,0.2); }
    50%       { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
  }
  .ncm-icon {
    position: relative;
    z-index: 1;
    width: 26px;
    height: 26px;
    color: #ef4444;
  }

  /* ── Copy ── */
  .ncm-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    text-align: center;
    letter-spacing: -0.02em;
    font-family: var(--font-sans, system-ui, sans-serif);
  }
  .ncm-desc {
    margin: 0;
    font-size: 0.875rem;
    color: #71717a;
    text-align: center;
    line-height: 1.6;
    max-width: 340px;
    font-family: var(--font-sans, system-ui, sans-serif);
  }
  .ncm-desc strong { color: #a1a1aa; font-weight: 500; }
  .ncm-highlight {
    color: #f97316;
    font-weight: 500;
  }

  /* ── Progress bar ── */
  .ncm-progress {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
  .ncm-progress-bar {
    width: 100%;
    height: 2px;
    border-radius: 2px;
    background: rgba(239, 68, 68, 0.15);
    overflow: hidden;
    position: relative;
  }
  .ncm-progress-bar::after {
    content: "";
    position: absolute;
    top: 0; left: -40%;
    width: 40%;
    height: 100%;
    background: #ef4444;
    border-radius: 2px;
    animation: ncm-bar-slide 1.2s ease-in-out infinite;
  }
  @keyframes ncm-bar-slide {
    0%   { left: -40%; }
    100% { left: 100%;  }
  }
  .ncm-progress-label {
    font-size: 0.75rem;
    color: #71717a;
    font-family: var(--font-sans, system-ui, sans-serif);
  }

  /* ── Action buttons ── */
  .ncm-actions {
    display: flex;
    gap: 10px;
    width: 100%;
    margin-top: 4px;
  }
  .ncm-btn-cancel {
    flex: 1;
    color: #71717a !important;
    background: transparent !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    height: 44px !important;
    border-radius: 10px !important;
    cursor: pointer;
    transition: background 0.15s, color 0.15s !important;
  }
  .ncm-btn-cancel:hover:not(:disabled) {
    background: rgba(255,255,255,0.05) !important;
    color: #fff !important;
  }
  .ncm-btn-confirm {
    flex: 1;
    height: 44px !important;
    border-radius: 10px !important;
    background: #ef4444 !important;
    gap: 6px;
    cursor: pointer;
    transition: background 0.15s !important;
  }
  .ncm-btn-confirm:hover:not(:disabled) {
    background: #f87171 !important;
  }
  .ncm-btn-confirm:disabled {
    opacity: 0.7 !important;
    cursor: not-allowed !important;
  }
`;
