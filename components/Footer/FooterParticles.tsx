"use client";

/**
 * FooterParticles.tsx
 * ─────────────────────────────────────────────────────────
 * Subtle Three.js wave-mesh canvas for the Footer.
 * A plane geometry with animated vertex displacement gives
 * a calm "ocean" feel without being distracting.
 * ─────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createScene } from "@/lib/three-init";

const SEGMENTS = 60;

export default function FooterParticles({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { scene, camera, renderer, cleanup } = createScene(canvas, {
      fov: 50,
      alpha: true,
      antialias: false,
    });

    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

    // ── Wave plane ──────────────────────────────────────────
    const geometry = new THREE.PlaneGeometry(20, 10, SEGMENTS, SEGMENTS);
    const material = new THREE.MeshBasicMaterial({
      color:       0xff6b00,
      wireframe:   true,
      transparent: true,
      opacity:     0.08,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 3.5;
    scene.add(mesh);

    // Cache original Y positions
    const pos = geometry.attributes.position;
    const origY: number[] = [];
    for (let i = 0; i < pos.count; i++) origY.push(pos.getY(i));

    let t = 0;
    const tick = () => {
      t += 0.008;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setY(i, origY[i] + Math.sin(x * 0.5 + t) * 0.25 + Math.cos(z * 0.4 + t * 0.8) * 0.2);
      }
      pos.needsUpdate = true;
      geometry.computeVertexNormals();
      renderer.render(scene, camera);
    };

    // Override renderer loop  
    const rafIds: number[] = [];
    const loop = () => {
      tick();
      rafIds[0] = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafIds[0]);
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
