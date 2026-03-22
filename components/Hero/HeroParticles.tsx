"use client";

/**
 * HeroParticles.tsx
 * ─────────────────────────────────────────────────────────
 * Three.js particle system for the Hero background.
 * Uses createScene() from lib/three-init.ts.
 * Particles drift gently; mouse movement parallaxes the camera.
 * ─────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createScene, randomPositions } from "@/lib/three-init";

const PARTICLE_COUNT = 1800;
const SPREAD         = 18;
const DRIFT_SPEED    = 0.00015;

export default function HeroParticles({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { scene, camera, renderer, cleanup } = createScene(canvas, {
      fov: 60,
      alpha: true,
      antialias: false, // perf — particles don't need MSAA
    });

    camera.position.z = 7;

    // ── Geometry ────────────────────────────────────────────
    const geometry = new THREE.BufferGeometry();
    const positions = randomPositions(PARTICLE_COUNT, SPREAD);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // ── Material ────────────────────────────────────────────
    const material = new THREE.PointsMaterial({
      size:         0.04,
      color:        new THREE.Color("#ff6b00"),
      transparent:  true,
      opacity:      0.45,
      depthWrite:   false,
      sizeAttenuation: true,
    });

    // Second layer: faint white particles to add depth
    const whiteGeom = new THREE.BufferGeometry();
    whiteGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(randomPositions(PARTICLE_COUNT * 2, SPREAD * 1.5), 3)
    );
    const whiteMat = new THREE.PointsMaterial({
      size:        0.022,
      color:       new THREE.Color("#ffffff"),
      transparent: true,
      opacity:     0.12,
      depthWrite:  false,
      sizeAttenuation: true,
    });

    const particles      = new THREE.Points(geometry, material);
    const particlesWhite = new THREE.Points(whiteGeom, whiteMat);
    scene.add(particles, particlesWhite);

    // ── Mouse parallax ──────────────────────────────────────
    let targetX = 0;
    let targetY = 0;
    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth  - 0.5) * 0.6;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Override tick to add drift + parallax ───────────────
    let frame = 0;
    const animateTick = () => {
      frame++;
      particles.rotation.y      += DRIFT_SPEED * 0.8;
      particles.rotation.x      += DRIFT_SPEED * 0.5;
      particlesWhite.rotation.y -= DRIFT_SPEED * 0.35;

      // Smooth camera toward mouse position
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (-targetY - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      return requestAnimationFrame(animateTick);
    };

    // Replace the default tick with our custom one (cleanup handles the old raf)
    const rafId = animateTick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
