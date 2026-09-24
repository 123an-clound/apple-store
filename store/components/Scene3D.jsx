'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const MODEL_URL = '/models/iphone-18-pro-max.glb';
const MODEL_HEIGHT = 6.4;
// Cap at 60fps: 120Hz phones/iPads would otherwise render twice as many frames for no visible gain.
const FRAME_INTERVAL = 1000 / 60 - 1;

const lerp = (current, target, speed) => current + (target - current) * speed;
const smoothstep = (value) => value * value * (3 - 2 * value);

function sampleTimeline(frames, progress) {
  for (let index = 0; index < frames.length - 1; index += 1) {
    const [startTime, startValue] = frames[index];
    const [endTime, endValue] = frames[index + 1];
    if (progress <= endTime) {
      const local = smoothstep((progress - startTime) / Math.max(endTime - startTime, 0.001));
      return THREE.MathUtils.lerp(startValue, endValue, THREE.MathUtils.clamp(local, 0, 1));
    }
  }
  return frames.at(-1)[1];
}

function createStage(compact, lowPower) {
  const stage = new THREE.Group();
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(compact ? 3.15 : 3.55, 0.018, lowPower ? 6 : 10, lowPower ? 96 : 160),
    new THREE.MeshBasicMaterial({ color: 0x78d7ff, transparent: true, opacity: 0.38 }),
  );
  halo.rotation.x = 1.12;
  halo.rotation.y = 0.2;
  stage.add(halo);

  const innerHalo = new THREE.Mesh(
    new THREE.TorusGeometry(compact ? 2.55 : 2.9, 0.008, lowPower ? 6 : 8, lowPower ? 80 : 140),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }),
  );
  innerHalo.rotation.set(1.3, -0.35, 0.25);
  stage.add(innerHalo);

  const particleCount = lowPower ? 42 : 120;
  const positions = new Float32Array(particleCount * 3);
  for (let index = 0; index < particleCount; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 10;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[index * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0x93dcff,
      size: compact ? 0.025 : 0.035,
      transparent: true,
      opacity: 0.46,
      sizeAttenuation: true,
    }),
  );
  stage.add(particles);

  return { stage, halo, innerHalo, particles };
}

function disposeSceneResources(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    if (Array.isArray(object.material)) object.material.forEach((material) => materials.add(material));
    else if (object.material) materials.add(object.material);
  });

  materials.forEach((material) => {
    Object.values(material).forEach((value) => {
      if (value?.isTexture) textures.add(value);
    });
  });
  textures.forEach((texture) => texture.dispose());
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

function prepareImportedModel(gltf, renderer, lowPower) {
  const source = gltf.scene;
  const maxAnisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

  source.traverse((object) => {
    if (!object.isMesh) return;
    object.frustumCulled = true;

    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (!material) return;
      material.envMapIntensity = Math.max(material.envMapIntensity ?? 1, 1.08);
      if (lowPower) {
        // Zeroing these drops their shader branches; the clearcoat on the screen/front glass is
        // the costliest since it covers most pixels, and the difference is subtle at phone size.
        if ('clearcoat' in material) material.clearcoat = 0;
        if ('iridescence' in material) material.iridescence = 0;
        if ('anisotropy' in material) material.anisotropy = 0;
      }
      Object.values(material).forEach((value) => {
        if (value?.isTexture) value.anisotropy = maxAnisotropy;
      });
      material.needsUpdate = true;
    });
  });

  const initialBounds = new THREE.Box3().setFromObject(source);
  const initialSize = initialBounds.getSize(new THREE.Vector3());
  const normalizationScale = MODEL_HEIGHT / Math.max(initialSize.y, 0.001);
  source.scale.setScalar(normalizationScale);
  source.updateMatrixWorld(true);

  const normalizedBounds = new THREE.Box3().setFromObject(source);
  const center = normalizedBounds.getCenter(new THREE.Vector3());
  source.position.sub(center);
  source.updateMatrixWorld(true);

  const model = new THREE.Group();
  model.add(source);

  return model;
}

export default function Scene3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.WebGLRenderingContext) return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduceMotion = motionPreference.matches;
    const compact = window.matchMedia('(max-width: 767px)').matches;
    // Phones and tablets: layout still follows `compact`, render cost follows `lowPower`.
    const lowPower = window.matchMedia('(max-width: 1024px), (pointer: coarse)').matches;
    let disposed = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(compact ? 31 : 29, 1, 0.1, 60);
    camera.position.set(0, 0, compact ? 14.4 : 13.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !lowPower,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.25 : lowPower ? 1.5 : 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);
    container.dataset.modelState = 'loading';

    const roomEnvironment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentTarget = pmremGenerator.fromScene(roomEnvironment, 0.04);
    scene.environment = environmentTarget.texture;
    pmremGenerator.dispose();
    disposeSceneResources(roomEnvironment);

    const phone = new THREE.Group();
    phone.rotation.order = 'YXZ';
    scene.add(phone);

    const { stage, halo, innerHalo, particles } = createStage(compact, lowPower);
    scene.add(stage);

    const ambientLight = new THREE.HemisphereLight(0xe7f5ff, 0x111827, 2.2);
    const keyLight = new THREE.SpotLight(0xdff6ff, 70, 28, 0.62, 0.72, 1.5);
    keyLight.position.set(4.5, 5.8, 7);
    keyLight.target = phone;
    const rimLight = new THREE.PointLight(0x4fbaff, 44, 20, 1.7);
    rimLight.position.set(-4.8, 0.5, 3.2);
    const warmLight = new THREE.PointLight(0xffb27d, 21, 18, 1.9);
    warmLight.position.set(3.6, -3.2, 2.4);
    scene.add(ambientLight, keyLight, rimLight, warmLight);

    const pointer = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    // Drag-to-rotate: yaw/pitch offsets layered on top of the cinematic timeline.
    const drag = { id: null, lastX: 0, lastY: 0, lastMove: 0, yaw: 0, pitch: 0, velocity: 0 };
    let timelineTime = 0;
    let lastFrameTime = null;
    let lastRenderTime = -Infinity;
    let resumeAt = 0;
    let frameId = 0;
    let tabVisible = !document.hidden;
    let inViewport = true;

    const renderOnce = () => renderer.render(scene, camera);
    const setStaticPose = () => {
      phone.rotation.set(-0.08 + drag.pitch, -0.42 + drag.yaw, 0.025);
      phone.position.set(0, 0, 0.18);
      phone.scale.setScalar(compact ? 0.78 : 0.9);
    };
    const setTheme = () => {
      const dark = document.documentElement.classList.contains('dark');
      ambientLight.color.set(dark ? 0x9ed7ff : 0xe7f5ff);
      ambientLight.groundColor.set(dark ? 0x050811 : 0x4a5566);
      particles.material.color.set(dark ? 0x75d3ff : 0x248dcc);
      halo.material.opacity = dark ? 0.46 : 0.28;
      innerHalo.material.opacity = dark ? 0.28 : 0.16;
      renderer.toneMappingExposure = dark ? 1.18 : 1.02;
      if (reduceMotion) renderOnce();
    };

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (reduceMotion) renderOnce();
    };

    const onPointerMove = (event) => {
      const bounds = container.getBoundingClientRect();
      pointer.x = THREE.MathUtils.clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1);
      pointer.y = THREE.MathUtils.clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1);
    };
    const onPointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };

    const onDragStart = (event) => {
      if (drag.id !== null || (event.pointerType === 'mouse' && event.button !== 0)) return;
      drag.id = event.pointerId;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.lastMove = performance.now();
      drag.velocity = 0;
      container.setPointerCapture(event.pointerId);
      container.dataset.dragging = 'true';
    };
    const onDragMove = (event) => {
      if (event.pointerId !== drag.id) return;
      const deltaYaw = (event.clientX - drag.lastX) * 0.012;
      drag.yaw += deltaYaw;
      drag.pitch = THREE.MathUtils.clamp(drag.pitch + (event.clientY - drag.lastY) * 0.006, -0.5, 0.5);
      drag.velocity = deltaYaw;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.lastMove = performance.now();
      if (reduceMotion) {
        setStaticPose();
        renderOnce();
      }
    };
    const onDragEnd = (event) => {
      if (event.pointerId !== drag.id) return;
      drag.id = null;
      // No fling when the finger rested before lifting, or when motion is reduced.
      if (reduceMotion || performance.now() - drag.lastMove > 80) drag.velocity = 0;
      resumeAt = performance.now() + 2000;
      delete container.dataset.dragging;
    };

    const render = (time = 0) => {
      frameId = 0;
      if (reduceMotion || !tabVisible || !inViewport) return;
      if (time - lastRenderTime < FRAME_INTERVAL) {
        scheduleFrame();
        return;
      }
      lastRenderTime = time;
      const delta = lastFrameTime === null ? 0 : Math.min(time - lastFrameTime, 100);
      lastFrameTime = time;
      const dragging = drag.id !== null;
      if (!dragging) {
        // Pause the show while the user holds the phone and briefly after release.
        if (time >= resumeAt) timelineTime += delta;
        drag.yaw += drag.velocity;
        drag.velocity *= 0.92;
        if (time >= resumeAt) drag.pitch = lerp(drag.pitch, 0, 0.03);
      }
      const progress = (timelineTime % 18000) / 18000;
      current.x = lerp(current.x, pointer.x, 0.045);
      current.y = lerp(current.y, pointer.y, 0.045);

      const cinematicY = sampleTimeline([
        [0, -0.34], [0.14, -0.34], [0.34, Math.PI * 0.52], [0.48, Math.PI + 0.16],
        [0.66, Math.PI + 0.16], [0.84, Math.PI * 1.72], [1, Math.PI * 2 - 0.34],
      ], progress);
      const revealPulse = Math.sin(progress * Math.PI * 2);
      const scalePulse = 1 + Math.sin(progress * Math.PI * 4 - 0.7) * 0.018;

      phone.rotation.y = cinematicY + drag.yaw + current.x * 0.14;
      phone.rotation.x = -0.1 + Math.sin(progress * Math.PI * 2 - 0.4) * 0.11 + current.y * 0.07 + drag.pitch;
      phone.rotation.z = 0.025 + Math.sin(progress * Math.PI * 2) * 0.045 - current.x * 0.025;
      phone.position.x = current.x * 0.13;
      phone.position.y = Math.sin(progress * Math.PI * 2 - 0.5) * 0.16 - current.y * 0.08;
      phone.position.z = 0.18 + revealPulse * 0.12;
      phone.scale.setScalar((compact ? 0.78 : 0.9) * scalePulse);

      halo.rotation.z = time * 0.000075;
      halo.rotation.y = 0.2 + Math.sin(time * 0.00022) * 0.16;
      innerHalo.rotation.z = 0.25 - time * 0.000055;
      particles.rotation.y = time * 0.000028;
      particles.rotation.z = Math.sin(time * 0.00008) * 0.05;
      keyLight.position.x = 4.5 + current.x * 2.6 + Math.sin(time * 0.00031) * 1.1;
      keyLight.position.y = 5.6 - current.y * 2.2;
      rimLight.position.x = -4.6 + Math.cos(time * 0.00024) * 1.4;
      warmLight.intensity = 18 + (revealPulse + 1) * 3;

      renderer.render(scene, camera);
      scheduleFrame();
    };
    const scheduleFrame = () => {
      if (!reduceMotion && tabVisible && inViewport && !frameId) frameId = requestAnimationFrame(render);
    };

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) {
          disposeSceneResources(gltf.scene);
          return;
        }
        phone.add(prepareImportedModel(gltf, renderer, lowPower));
        container.dataset.modelState = 'ready';
        container.style.removeProperty('--model-progress');
        if (reduceMotion) {
          setStaticPose();
          renderOnce();
        } else {
          scheduleFrame();
        }
      },
      (event) => {
        if (event.lengthComputable && event.total > 0) {
          const progress = Math.round((event.loaded / event.total) * 100);
          container.style.setProperty('--model-progress', `${progress}%`);
        }
      },
      () => {
        if (disposed) return;
        container.dataset.modelState = 'error';
        container.style.removeProperty('--model-progress');
        renderOnce();
      },
    );

    const onVisibilityChange = () => {
      tabVisible = !document.hidden;
      scheduleFrame();
    };
    const onMotionPreferenceChange = (event) => {
      reduceMotion = event.matches;
      cancelAnimationFrame(frameId);
      frameId = 0;
      if (reduceMotion) {
        setStaticPose();
        renderOnce();
      } else {
        scheduleFrame();
      }
    };

    const themeObserver = new MutationObserver(setTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      scheduleFrame();
    }, { threshold: 0.02 });
    intersectionObserver.observe(container);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerdown', onDragStart);
    container.addEventListener('pointermove', onDragMove);
    container.addEventListener('pointerup', onDragEnd);
    container.addEventListener('pointercancel', onDragEnd);
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    motionPreference.addEventListener('change', onMotionPreferenceChange);
    resize();
    setTheme();

    if (reduceMotion) {
      setStaticPose();
      renderOnce();
    } else {
      scheduleFrame();
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onDragStart);
      container.removeEventListener('pointermove', onDragMove);
      container.removeEventListener('pointerup', onDragEnd);
      container.removeEventListener('pointercancel', onDragEnd);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      motionPreference.removeEventListener('change', onMotionPreferenceChange);
      disposeSceneResources(scene);
      environmentTarget.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className="scene-3d" aria-hidden="true" />;
}
