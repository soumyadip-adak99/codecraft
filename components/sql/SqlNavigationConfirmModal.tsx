"use client";

import { useSqlStore } from "@/store/sqlStore";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  FileWarning,
  Loader2,
  LogOut,
  Send,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function SqlNavigationConfirmModal() {
  const router = useRouter();
  const {
    isSqlEndingSession,
    isSqlSubmitting,
    endSqlSession,
    executeSql,
    isSqlExitModalOpen,
    closeSqlExitModal,
    sqlExitTargetUrl,
    sqlCodeModified,
    canGoNextSql,
    sqlSessionActive,
  } = useSqlStore();

  const hasUnsavedCode = !!sqlSessionActive && sqlCodeModified && !canGoNextSql;

  const navigate = () => {
    const destination = sqlExitTargetUrl || "/dashboard";
    router.push(destination);
  };

  const handleConfirmEnd = async () => {
    await endSqlSession();
    closeSqlExitModal();
    navigate();
  };

  const handleForceEnd = async () => {
    await endSqlSession();
    closeSqlExitModal();
    navigate();
  };

  const handleSubmitCode = async () => {
    await executeSql("submit");
  };

  if (!isSqlExitModalOpen) return null;

  return (
    <>
      <div
        className="ncm-backdrop"
        onClick={() => !isSqlEndingSession && !isSqlSubmitting && closeSqlExitModal()}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ncm-title"
        aria-describedby="ncm-desc"
        className="ncm-modal"
      >
        {!isSqlEndingSession && !isSqlSubmitting && (
          <button className="ncm-close" onClick={closeSqlExitModal} aria-label="Cancel">
            <X size={16} />
          </button>
        )}

        {hasUnsavedCode ? (
          <>
            <div className="ncm-icon-wrap ncm-icon-wrap--warn" aria-hidden="true">
              <div className="ncm-icon-ring ncm-icon-ring--warn" />
              <FileWarning className="ncm-icon ncm-icon--warn" />
            </div>

            <h2 id="ncm-title" className="ncm-title">
              Unsaved SQL Detected
            </h2>
            <p id="ncm-desc" className="ncm-desc">
              You have written an SQL query that has{" "}
              <span className="ncm-highlight--warn">not been submitted yet</span>. Please{" "}
              <strong className="text-white/80">submit your solution</strong> before ending
              the session to ensure your progress is saved.
            </p>

            {isSqlSubmitting && (
              <div className="ncm-progress ncm-progress--orange" aria-live="polite">
                <div className="ncm-progress-bar ncm-progress-bar--orange" />
                <span className="ncm-progress-label">Evaluating your query…</span>
              </div>
            )}

            {isSqlEndingSession && (
              <div className="ncm-progress" aria-live="polite">
                <div className="ncm-progress-bar" />
                <span className="ncm-progress-label">Ending session & sending report…</span>
              </div>
            )}

            <div className="ncm-actions ncm-actions--col">
              <Button
                onClick={handleSubmitCode}
                disabled={isSqlSubmitting || isSqlEndingSession}
                className="ncm-btn-submit"
              >
                {isSqlSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Query
                  </>
                )}
              </Button>

              <Button
                onClick={handleConfirmEnd}
                disabled={isSqlEndingSession || isSqlSubmitting || !canGoNextSql}
                title={!canGoNextSql ? "Submit your code first to enable this" : undefined}
                className="ncm-btn-end-safe"
              >
                {isSqlEndingSession ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ending Session…
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    End Session
                  </>
                )}
              </Button>

              <div className="ncm-divider">
                <span>or</span>
              </div>

              <Button
                onClick={handleForceEnd}
                disabled={isSqlEndingSession || isSqlSubmitting}
                className="ncm-btn-force"
              >
                {isSqlEndingSession ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ending…
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Force End Session
                    <span className="ncm-force-badge">Discards code</span>
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="ncm-icon-wrap" aria-hidden="true">
              <div className="ncm-icon-ring" />
              <AlertTriangle className="ncm-icon" />
            </div>

            <h2 id="ncm-title" className="ncm-title">
              Exit Active Session?
            </h2>
            <p id="ncm-desc" className="ncm-desc">
              You have an{" "}
              <span className="ncm-highlight">active SQL practice session</span> in progress.
              Leaving now will <strong>end the session</strong> and send your performance
              report. This action cannot be undone.
            </p>

            {isSqlEndingSession && (
              <div className="ncm-progress" aria-live="polite">
                <div className="ncm-progress-bar" />
                <span className="ncm-progress-label">Ending session & sending report…</span>
              </div>
            )}

            <div className="ncm-actions">
              <Button
                variant="ghost"
                onClick={closeSqlExitModal}
                disabled={isSqlEndingSession}
                className="ncm-btn-cancel"
              >
                Keep Practicing
              </Button>

              <Button
                variant="destructive"
                onClick={handleConfirmEnd}
                disabled={isSqlEndingSession}
                className="ncm-btn-confirm"
              >
                {isSqlEndingSession ? (
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
          </>
        )}
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
    width: min(460px, calc(100vw - 32px));
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
      0 32px 80px rgba(0, 0, 0, 0.7);
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
    top: 14px; right: 14px;
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px;
    border-radius: 8px; border: none;
    background: transparent; color: #52525b;
    cursor: pointer; transition: background 0.15s, color 0.15s;
  }
  .ncm-close:hover { background: rgba(255,255,255,0.06); color: #a1a1aa; }

  /* ── Icon ── */
  .ncm-icon-wrap {
    position: relative; width: 60px; height: 60px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ncm-icon-ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 1.5px solid rgba(239,68,68,0.25);
    background: rgba(239,68,68,0.08);
    animation: ncm-ring-pulse 2s ease-in-out infinite;
  }
  .ncm-icon-ring--warn {
    border-color: rgba(249,115,22,0.3);
    background: rgba(249,115,22,0.08);
  }
  @keyframes ncm-ring-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.2); }
    50%      { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
  }
  .ncm-icon { position: relative; z-index: 1; width: 26px; height: 26px; color: #ef4444; }
  .ncm-icon--warn { color: #f97316; }

  /* ── Copy ── */
  .ncm-title {
    margin: 0; font-size: 1.2rem; font-weight: 700;
    color: #fff; text-align: center; letter-spacing: -0.02em;
  }
  .ncm-desc {
    margin: 0; font-size: 0.875rem; color: #71717a;
    text-align: center; line-height: 1.6; max-width: 360px;
  }
  .ncm-desc strong { color: #a1a1aa; font-weight: 500; }
  .ncm-highlight      { color: #f97316; font-weight: 500; }
  .ncm-highlight--warn { color: #fb923c; font-weight: 500; }

  /* ── Progress bars ── */
  .ncm-progress {
    width: 100%; display: flex; flex-direction: column;
    gap: 8px; align-items: center;
  }
  .ncm-progress-bar {
    width: 100%; height: 2px; border-radius: 2px;
    background: rgba(239,68,68,0.15); overflow: hidden; position: relative;
  }
  .ncm-progress-bar--orange { background: rgba(249,115,22,0.15); }
  .ncm-progress-bar::after,
  .ncm-progress-bar--orange::after {
    content: ""; position: absolute; top: 0; left: -40%;
    width: 40%; height: 100%; border-radius: 2px;
    background: #ef4444;
    animation: ncm-bar-slide 1.2s ease-in-out infinite;
  }
  .ncm-progress-bar--orange::after { background: #f97316; }
  @keyframes ncm-bar-slide {
    0%   { left: -40%; }
    100% { left: 100%; }
  }
  .ncm-progress-label { font-size: 0.75rem; color: #71717a; }

  /* ── Action groups ── */
  .ncm-actions { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
  .ncm-actions--col { flex-direction: column; }

  /* Branch B buttons */
  .ncm-btn-cancel {
    flex: 1; color: #71717a !important; background: transparent !important;
    border: 1px solid rgba(255,255,255,0.08) !important; height: 44px !important;
    border-radius: 10px !important; cursor: pointer;
    transition: background 0.15s, color 0.15s !important;
  }
  .ncm-btn-cancel:hover:not(:disabled) { background: rgba(255,255,255,0.05) !important; color: #fff !important; }
  .ncm-btn-confirm {
    flex: 1; height: 44px !important; border-radius: 10px !important;
    background: #ef4444 !important; gap: 6px; cursor: pointer;
    transition: background 0.15s !important;
  }
  .ncm-btn-confirm:hover:not(:disabled) { background: #f87171 !important; }
  .ncm-btn-confirm:disabled { opacity: 0.7 !important; cursor: not-allowed !important; }

  /* Branch A buttons */
  .ncm-btn-submit {
    width: 100%; height: 44px !important; border-radius: 10px !important;
    background: #f97316 !important; color: #fff !important; gap: 6px;
    font-size: 0.9rem !important; font-weight: 600 !important;
    box-shadow: 0 0 20px rgba(249,115,22,0.3) !important;
    transition: background 0.15s !important;
  }
  .ncm-btn-submit:hover:not(:disabled) { background: #ea580c !important; }
  .ncm-btn-submit:disabled { opacity: 0.6 !important; cursor: not-allowed !important; }

  .ncm-btn-end-safe {
    width: 100%; height: 44px !important; border-radius: 10px !important;
    background: rgba(255,255,255,0.06) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    color: #d4d4d8 !important; gap: 6px; font-size: 0.875rem !important;
    transition: background 0.15s !important;
  }
  .ncm-btn-end-safe:hover:not(:disabled) { background: rgba(255,255,255,0.1) !important; color: #fff !important; }
  .ncm-btn-end-safe:disabled { opacity: 0.4 !important; cursor: not-allowed !important; }

  /* Divider */
  .ncm-divider {
    display: flex; align-items: center; gap: 10px; width: 100%;
    color: #3f3f46; font-size: 0.75rem;
  }
  .ncm-divider::before, .ncm-divider::after {
    content: ""; flex: 1; height: 1px; background: rgba(255,255,255,0.06);
  }

  .ncm-btn-force {
    width: 100%; height: 44px !important; border-radius: 10px !important;
    background: transparent !important;
    border: 1px solid rgba(239,68,68,0.25) !important;
    color: #f87171 !important; gap: 6px; font-size: 0.8rem !important;
    transition: background 0.15s, border-color 0.15s !important;
    display: flex; align-items: center; justify-content: center;
  }
  .ncm-btn-force:hover:not(:disabled) {
    background: rgba(239,68,68,0.08) !important;
    border-color: rgba(239,68,68,0.4) !important;
  }
  .ncm-btn-force:disabled { opacity: 0.5 !important; cursor: not-allowed !important; }
  .ncm-force-badge {
    margin-left: 6px; font-size: 0.65rem; font-weight: 600;
    padding: 2px 6px; border-radius: 4px;
    background: rgba(239,68,68,0.12); color: #f87171;
    border: 1px solid rgba(239,68,68,0.2);
    letter-spacing: 0.02em;
  }
`;;
