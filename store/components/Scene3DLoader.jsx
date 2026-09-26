'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Fallback = () => <div className="scene-3d scene-3d-fallback" aria-hidden="true" />;

const Scene3D = dynamic(() => import('./Scene3D'), {
  ssr: false,
  loading: Fallback,
});

// Software WebGL (SwiftShader / llvmpipe — no GPU acceleration) spends ~10 s of
// main-thread time compiling shaders and drawing the first frame, freezing the
// whole page. Those visitors keep the static backdrop instead.
function hasHardwareWebGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software/i.test(renderer);
  } catch {
    return false;
  }
}

export default function Scene3DLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Start the three.js bundle only once the page is idle, so it never
    // competes with first paint and the hero headline (the LCP element).
    const run = () => { if (hasHardwareWebGL()) setShow(true); };
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(run, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(run, 1200);
    return () => clearTimeout(t);
  }, []);

  return show ? <Scene3D /> : <Fallback />;
}
