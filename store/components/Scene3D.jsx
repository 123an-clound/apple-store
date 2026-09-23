'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const MODEL_URL = '/models/iphone-17-pro-max.glb';
const WALLPAPER_URL = '/models/iphone-17-pro-max-wallpaper.jpg';
const MODEL_HEIGHT = 6.4;

const lerp = (current, target, speed) => current + (target - current) * speed;
const smoothstep = (value) => value * value * (3 - 2 * value);

function roundedRectShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function normalizeShapeUvs(geometry, width, height) {
  const positions = geometry.getAttribute('position');
  const uvs = geometry.getAttribute('uv');
  for (let index = 0; index < positions.count; index += 1) {
    uvs.setXY(
      index,
      (positions.getX(index) + width / 2) / width,
      (positions.getY(index) + height / 2) / height,
    );
  }
  uvs.needsUpdate = true;
  return geometry;
}

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

function createStage(compact) {
  const stage = new THREE.Group();
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(compact ? 3.15 : 3.55, 0.018, 10, compact ? 96 : 160),
    new THREE.MeshBasicMaterial({ color: 0x78d7ff, transparent: true, opacity: 0.38 }),
  );
  halo.rotation.x = 1.12;
  halo.rotation.y = 0.2;
  stage.add(halo);

  const innerHalo = new THREE.Mesh(
    new THREE.TorusGeometry(compact ? 2.55 : 2.9, 0.008, 8, compact ? 80 : 140),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }),
  );
  innerHalo.rotation.set(1.3, -0.35, 0.25);
  stage.add(innerHalo);

  const particleCount = compact ? 42 : 120;
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

function prepareImportedModel(gltf, renderer, displayTexture = null) {
  const source = gltf.scene;
  const maxAnisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  let wallpaperTexture = displayTexture;

  source.traverse((object) => {
    if (!object.isMesh) return;
    object.frustumCulled = true;

    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (!material) return;
      material.envMapIntensity = Math.max(material.envMapIntensity ?? 1, 1.08);
      // The GLB ships the OLED at emissive strength 10, which clips the wallpaper to white
      // under ACES tone mapping. Reuse the embedded texture on a calibrated screen layer.
      if (material.name === 'OLED') {
        wallpaperTexture ??= material.map ?? material.emissiveMap;
        material.transparent = true;
        material.opacity = 0;
        material.depthWrite = false;
        material.colorWrite = false;
      }
      Object.values(material).forEach((value) => {
        if (value?.isTexture) value.anisotropy = maxAnisotropy;
      });
      material.needsUpdate = true;
    });
  });

  // The supplied Blender model faces -Z. Rotate once so its display faces the camera.
  source.rotation.y = Math.PI;
  source.updateMatrixWorld(true);

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

  if (wallpaperTexture) {
    const screenWidth = 2.86;
    const screenHeight = 6.14;
    const screenGeometry = normalizeShapeUvs(
      new THREE.ShapeGeometry(roundedRectShape(screenWidth, screenHeight, 0.46), 28),
      screenWidth,
      screenHeight,
    );
    const screen = new THREE.Mesh(
      screenGeometry,
      new THREE.MeshBasicMaterial({ map: wallpaperTexture, toneMapped: false }),
    );
    screen.position.z = 0.215;
    model.add(screen);
  }

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
    let disposed = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(compact ? 31 : 29, 1, 0.1, 60);
    camera.position.set(0, 0, compact ? 14.4 : 13.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !compact,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.25 : 1.8));
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

    const { stage, halo, innerHalo, particles } = createStage(compact);
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
    let frameId = 0;
    let tabVisible = !document.hidden;
    let inViewport = true;

    const renderOnce = () => renderer.render(scene, camera);
    const setStaticPose = () => {
      phone.rotation.set(-0.08, -0.42, 0.025);
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

    const render = (time = 0) => {
      frameId = 0;
      if (reduceMotion || !tabVisible || !inViewport) return;
      const progress = (time % 18000) / 18000;
      current.x = lerp(current.x, pointer.x, 0.045);
      current.y = lerp(current.y, pointer.y, 0.045);

      const cinematicY = sampleTimeline([
        [0, -0.34], [0.14, -0.34], [0.34, Math.PI * 0.52], [0.48, Math.PI + 0.16],
        [0.66, Math.PI + 0.16], [0.84, Math.PI * 1.72], [1, Math.PI * 2 - 0.34],
      ], progress);
      const revealPulse = Math.sin(progress * Math.PI * 2);
      const scalePulse = 1 + Math.sin(progress * Math.PI * 4 - 0.7) * 0.018;

      phone.rotation.y = cinematicY + current.x * 0.14;
      phone.rotation.x = -0.1 + Math.sin(progress * Math.PI * 2 - 0.4) * 0.11 + current.y * 0.07;
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
    const textureLoader = new THREE.TextureLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) {
          disposeSceneResources(gltf.scene);
          return;
        }
        const attachModel = (displayTexture = null) => {
          if (disposed) {
            displayTexture?.dispose();
            disposeSceneResources(gltf.scene);
            return;
          }
          if (displayTexture) {
            displayTexture.colorSpace = THREE.SRGBColorSpace;
            displayTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          }
          phone.add(prepareImportedModel(gltf, renderer, displayTexture));
          container.dataset.modelState = 'ready';
          container.style.removeProperty('--model-progress');
          if (reduceMotion) {
            setStaticPose();
            renderOnce();
          } else {
            scheduleFrame();
          }
        };

        textureLoader.load(WALLPAPER_URL, attachModel, undefined, () => attachModel());
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
