'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Component, useState } from 'react';
import { Rotate3D, X } from 'lucide-react';

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false, loading: () => null });

// Keep the product poster visible if WebGL initialization or a dynamic import fails.
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function hasHardwareWebGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software/i.test(renderer);
  } catch { return false; }
}

export default function Scene3DLoader() {
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const close = () => { setShow(false); setReady(false); };
  const open = () => {
    if (!hasHardwareWebGL()) { setUnavailable(true); return; }
    setUnavailable(false);
    setShow(true);
  };
  const onError = () => { close(); setUnavailable(true); };

  return (
    <div className="scene-viewer">
      <div className={'scene-poster' + (ready ? ' scene-poster--hidden' : '')}>
        <Image src="/images/iphone-hero.webp" alt="Mặt trước và mặt sau mô hình iPhone 18 Pro Max màu burgundy" fill loading="eager" fetchPriority="high" decoding="sync" sizes="(max-width: 359px) 512px, (max-width: 575px) 576px, (max-width: 1100px) 100vw, 1100px" className="hero-poster" />
      </div>
      {show && <SceneBoundary onError={onError}><Scene3D onReady={() => setReady(true)} onError={onError} /></SceneBoundary>}
      <p className="scene-status" role="status">
        {unavailable ? 'Thiết bị đang hiển thị ảnh sản phẩm. Chế độ 3D chưa khả dụng.' : show ? ready ? 'Kéo để xoay. Dùng phím mũi tên khi chọn mô hình.' : 'Đang tải mô hình 3D…' : ''}
      </p>
      <button type="button" className="scene-toggle focus-ring" onClick={show ? close : open} aria-pressed={show}>
        {show ? <X size={15} aria-hidden="true" /> : <Rotate3D size={16} aria-hidden="true" />}
        {show ? 'Đóng chế độ 3D' : 'Khám phá 360°'}
      </button>
    </div>
  );
}
