'use client';

import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('./Scene3D'), {
  ssr: false,
  loading: () => <div className="scene-3d scene-3d-fallback" aria-hidden="true" />,
});

export default function Scene3DLoader() {
  return <Scene3D />;
}
