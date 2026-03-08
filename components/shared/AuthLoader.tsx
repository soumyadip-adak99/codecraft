"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthLoaderProps {
  /** Where to send authenticated users. Defaults to "/dashboard" */
  authenticatedRedirect?: string;
  /** Where to send unauthenticated users. Defaults to "/" */
  unauthenticatedRedirect?: string;
}

/**
 * AuthLoader — Full-screen auth gate.
 *
 * Shows a skeleton UI while the session resolves, then redirects
 * based on auth status.  No page content is ever shown before redirect.
 */
export function AuthLoader({
  authenticatedRedirect = "/dashboard",
  unauthenticatedRedirect = "/",
}: AuthLoaderProps) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(authenticatedRedirect);
    } else if (status === "unauthenticated") {
      router.replace(unauthenticatedRedirect);
    }
  }, [status, router, authenticatedRedirect, unauthenticatedRedirect]);

  if (status === "loading" || status === "authenticated" || status === "unauthenticated") {
    return <AuthSkeleton />;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Skeleton layout
// ---------------------------------------------------------------------------

function Bone({ w, h, r = 8 }: { w: string | number; h: string | number; r?: number }) {
  return (
    <div
      className="auth-sk__bone"
      style={{
        width: w,
        height: h,
        borderRadius: r,
      }}
    />
  );
}

function AuthSkeleton() {
  return (
    <div className="auth-sk" role="status" aria-label="Loading session" aria-live="polite">
      <style>{css}</style>

      {/* ── Navbar ── */}
      <nav className="auth-sk__nav">
        {/* Logo block */}
        <div className="auth-sk__nav-left">
          <Bone w={32} h={32} r={8} />
          <Bone w={110} h={18} r={6} />
        </div>

        {/* Nav links */}
        <div className="auth-sk__nav-center">
          <Bone w={60} h={14} r={4} />
          <Bone w={80} h={14} r={4} />
          <Bone w={70} h={14} r={4} />
        </div>

        {/* Right actions */}
        <div className="auth-sk__nav-right">
          <Bone w={34} h={34} r={17} />
          <Bone w={90} h={34} r={8} />
        </div>
      </nav>

      {/* ── Page body ── */}
      <div className="auth-sk__body">

        {/* Hero / greeting row */}
        <div className="auth-sk__hero">
          <div className="auth-sk__hero-text">
            <Bone w="55%" h={36} r={8} />
            <Bone w="35%" h={18} r={5} />
          </div>
          <Bone w={140} h={40} r={10} />
        </div>

        {/* Stat cards */}
        <div className="auth-sk__stats">
          {[1, 2, 3].map((i) => (
            <div key={i} className="auth-sk__stat-card">
              <div className="auth-sk__stat-icon">
                <Bone w={20} h={20} r={4} />
              </div>
              <Bone w="60%" h={13} r={4} />
              <Bone w="40%" h={30} r={6} />
              <Bone w="50%" h={11} r={3} />
            </div>
          ))}
        </div>

        {/* Two-column: main content + sidebar */}
        <div className="auth-sk__grid">

          {/* Main panel */}
          <div className="auth-sk__main">
            {/* Section header */}
            <div className="auth-sk__row" style={{ marginBottom: 20 }}>
              <Bone w="30%" h={20} r={6} />
              <Bone w={90} h={32} r={8} />
            </div>

            {/* Table rows */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="auth-sk__table-row">
                <Bone w={28} h={28} r={6} />
                <div className="auth-sk__table-text">
                  <Bone w="55%" h={13} r={4} />
                  <Bone w="35%" h={10} r={3} />
                </div>
                <Bone w={60} h={22} r={11} />
                <Bone w={70} h={22} r={11} />
              </div>
            ))}
          </div>

          {/* Sidebar panel */}
          <div className="auth-sk__sidebar">
            <Bone w="60%" h={18} r={5} />
            <Bone w="100%" h={120} r={10} />
            <div className="auth-sk__sidebar-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="auth-sk__sidebar-item">
                  <Bone w={36} h={36} r={18} />
                  <div className="auth-sk__table-text">
                    <Bone w="70%" h={12} r={4} />
                    <Bone w="45%" h={10} r={3} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orange scan-line shimmer across the entire viewport */}
      <div className="auth-sk__scanline" aria-hidden="true" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

const css = `
  /* ── Root ── */
  .auth-sk {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #000;
    overflow: hidden;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: auth-sk-fadein 0.25s ease both;
  }
  @keyframes auth-sk-fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Ambient glow blobs */
  .auth-sk::before,
  .auth-sk::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
    z-index: 0;
  }
  .auth-sk::before {
    width: 600px; height: 600px;
    top: -200px; right: -150px;
    background: rgba(249,115,22,0.07);
  }
  .auth-sk::after {
    width: 400px; height: 400px;
    bottom: -100px; left: -100px;
    background: rgba(249,115,22,0.04);
  }

  /* ── Bone (shimmer block) ── */
  .auth-sk__bone {
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.045) 0%,
      rgba(255,255,255,0.09)  40%,
      rgba(255,255,255,0.045) 80%
    );
    background-size: 400% 100%;
    animation: auth-sk-shimmer 1.6s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes auth-sk-shimmer {
    0%   { background-position: 100% 50%; }
    100% { background-position:   0% 50%; }
  }

  /* staggered delays so blocks don't all pulse together */
  .auth-sk__bone:nth-child(2)  { animation-delay: 0.08s; }
  .auth-sk__bone:nth-child(3)  { animation-delay: 0.16s; }
  .auth-sk__bone:nth-child(4)  { animation-delay: 0.24s; }
  .auth-sk__bone:nth-child(5)  { animation-delay: 0.32s; }

  /* ── Navbar ── */
  .auth-sk__nav {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 24px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(12px);
  }
  .auth-sk__nav-left,
  .auth-sk__nav-center,
  .auth-sk__nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .auth-sk__nav-center { gap: 24px; }

  /* ── Body ── */
  .auth-sk__body {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 24px 48px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* ── Hero row ── */
  .auth-sk__hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }
  .auth-sk__hero-text {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }

  /* ── Stat cards ── */
  .auth-sk__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .auth-sk__stat-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    border-radius: 14px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.05);
  }
  .auth-sk__stat-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: rgba(249,115,22,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Two-column grid ── */
  .auth-sk__grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 20px;
  }
  @media (max-width: 768px) {
    .auth-sk__grid { grid-template-columns: 1fr; }
    .auth-sk__stats { grid-template-columns: 1fr; }
    .auth-sk__nav-center { display: none; }
  }

  /* ── Main panel ── */
  .auth-sk__main {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    border-radius: 14px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
  }

  /* ── Table rows ── */
  .auth-sk__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .auth-sk__table-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .auth-sk__table-row:last-child { border-bottom: none; }
  .auth-sk__table-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  /* ── Sidebar ── */
  .auth-sk__sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    border-radius: 14px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    align-self: flex-start;
  }
  .auth-sk__sidebar-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .auth-sk__sidebar-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* ── Orange scan-line ── */
  .auth-sk__scanline {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(249,115,22,0.025) 50%,
      transparent 100%
    );
    background-size: 100% 200px;
    animation: auth-sk-scan 3s linear infinite;
  }
  @keyframes auth-sk-scan {
    0%   { background-position: 0 -200px; }
    100% { background-position: 0 100vh;  }
  }
`;
