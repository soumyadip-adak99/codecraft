/**
 * three-init.ts
 * ─────────────────────────────────────────────────────────
 * Shared Three.js scene bootstrap.
 * Usage:
 *   const { scene, camera, renderer, cleanup } = createScene(canvasEl);
 *   // add your meshes
 *   // teardown with cleanup() inside useEffect return
 * ─────────────────────────────────────────────────────────
 */

import * as THREE from "three";

export interface ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  /** Call inside useEffect cleanup to stop RAF + dispose renderer */
  cleanup: () => void;
}

/**
 * Initialise a full Three.js scene on the given canvas element.
 * Handles resize automatically via ResizeObserver.
 */
export function createScene(
  canvas: HTMLCanvasElement,
  options: {
    fov?: number;
    near?: number;
    far?: number;
    alpha?: boolean;
    antialias?: boolean;
  } = {}
): ThreeScene {
  const {
    fov = 75,
    near = 0.1,
    far = 1000,
    alpha = true,
    antialias = true,
  } = options;

  // ── Scene ────────────────────────────────────────────────
  const scene = new THREE.Scene();

  // ── Camera ───────────────────────────────────────────────
  const { clientWidth: w, clientHeight: h } = canvas;
  const camera = new THREE.PerspectiveCamera(fov, w / h, near, far);
  camera.position.z = 5;

  // ── Renderer ─────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias });
  renderer.setSize(w, h, false); // false = don't set canvas style
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // transparent

  // ── Resize observer ──────────────────────────────────────
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { inlineSize: width, blockSize: height } = entry.contentBoxSize[0];
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
  });
  ro.observe(canvas);

  // ── RAF loop (consumer renders inside this) ──────────────
  let rafId: number;
  const tick = () => {
    rafId = requestAnimationFrame(tick);
    renderer.render(scene, camera);
  };
  tick();

  // ── Cleanup ──────────────────────────────────────────────
  const cleanup = () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    renderer.dispose();
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
  };

  return { scene, camera, renderer, cleanup };
}

/**
 * Helper — create a Float32Array of random 3-D positions within a box.
 * Useful for particle systems.
 */
export function randomPositions(
  count: number,
  spread: number
): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * spread;
  }
  return positions;
}
