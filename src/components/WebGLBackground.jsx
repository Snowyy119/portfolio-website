import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function WebGLBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = window.innerWidth || 1920;
    const h = window.innerHeight || 1080;

    // ─── RENDERER ───
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050508, 1);
    container.appendChild(renderer.domElement);

    // ─── 3D SCENE ───
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.008);

    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 30;

    // Particles
    const particleCount = 1200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const aSize = new Float32Array(particleCount);
    const aPhase = new Float32Array(particleCount);
    const aBrightness = new Float32Array(particleCount);
    const seeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      // Cyan-tinted particles for phosphor feel
      const brightness = 0.3 + Math.random() * 0.5;
      colors[i * 3] = brightness * 0.85;
      colors[i * 3 + 1] = brightness * 0.95;
      colors[i * 3 + 2] = brightness * 1.1;

      aSize[i] = 0.8 + Math.random() * 1.2;        // 0.8 – 2.0
      aPhase[i] = Math.random() * Math.PI * 2;     // 0 – 2π
      aBrightness[i] = 0.6 + Math.random() * 0.4;  // 0.6 – 1.0
      seeds[i] = Math.random();                    // 0 – 1
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
    particleGeometry.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1));
    particleGeometry.setAttribute('aBrightness', new THREE.BufferAttribute(aBrightness, 1));

    const particleVertexShader = `
attribute vec3 aColor;
attribute float aSize;
attribute float aPhase;
attribute float aBrightness;
uniform float uTime;
uniform float uScale;
uniform float uAudioBass;
uniform float uAudioMid;
uniform float uAudioHigh;
uniform float uAudioLevel;
varying vec3 vColor;
varying float vAlpha;
void main() {
  // Mids: subtle brightness/glow lift.
  vColor = aColor * (1.0 + uAudioMid * 0.15);
  float pulse = 0.85 + 0.15 * sin(uTime * 1.5 + aPhase);
  // Highs: very subtle per-particle shimmer (zero when no audio).
  float shimmer = 1.0 + (uAudioHigh * 0.35 * (sin(uTime * 9.0 + aPhase) - 0.5));
  vAlpha = aBrightness * pulse * (1.0 + uAudioMid * 0.2) * (1.0 + uAudioLevel * 0.1) * shimmer;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  // Bass: gentle size response (kept small).
  float sizeBoost = 1.0 + uAudioBass * 0.12;
  gl_PointSize = aSize * sizeBoost * 0.3 * uScale / -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

    const particleFragmentShader = `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float glow = pow(1.0 - smoothstep(0.0, 0.5, d), 2.5);
  float intensity = glow * vAlpha;
  gl_FragColor = vec4(vColor * intensity, intensity);
}
`;

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: renderer.getPixelRatio() * window.innerHeight / 2 },
        uAudioBass: { value: 0 },
        uAudioMid: { value: 0 },
        uAudioHigh: { value: 0 },
        uAudioLevel: { value: 0 },
      },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Wireframe shapes
    const shapes = [];
    const shapeGeometries = [
      new THREE.IcosahedronGeometry(3, 0),
      new THREE.OctahedronGeometry(2.5, 0),
      new THREE.TetrahedronGeometry(2, 0),
      new THREE.DodecahedronGeometry(2, 0),
    ];

    for (let i = 0; i < 10; i++) {
      const geo = shapeGeometries[i % shapeGeometries.length];
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.3, 0.4 + Math.random() * 0.2),
        wireframe: true,
        transparent: true,
        opacity: 0.06 + Math.random() * 0.06,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      shapes.push({
        mesh,
        initialPos: mesh.position.clone(),
        floatSpeed: 0.1 + Math.random() * 0.2,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmplitude: 1.5 + Math.random() * 3,
      });
    }

    // ─── CURSOR TRACKING ───
    const mouse = { x: 0.5, y: 0.5, rawX: 0.5, rawY: 0.5 };

    const onMouseMove = (e) => {
      mouse.rawX = e.clientX / window.innerWidth;
      mouse.rawY = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ─── RESIZE ───
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      particleMaterial.uniforms.uScale.value = renderer.getPixelRatio() * window.innerHeight / 2;
    };
    window.addEventListener('resize', onResize);

    // ─── ANIMATION LOOP (pauses when tab hidden) ───
    let animationId;
    let running = true;
    const startTime = performance.now();
    let lastTime = startTime;

    const FLOW = 1.8;
    const BOUND = { x: 50, y: 40, z: 40 };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!running) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const elapsed = (now - startTime) / 1000;

      // Rotate particles slowly
      particles.rotation.y = elapsed * 0.02;
      particles.rotation.x = elapsed * 0.01;

      // ─── Audio reactivity: read shared state, smooth (no jitter) ───
      const ar = (typeof window !== 'undefined') ? window.__audioReactivity : null;
      const smk = 0.1;
      let aBass = particleMaterial.uniforms.uAudioBass.value;
      let aMid = particleMaterial.uniforms.uAudioMid.value;
      let aHigh = particleMaterial.uniforms.uAudioHigh.value;
      let aLevel = particleMaterial.uniforms.uAudioLevel.value;
      if (ar && ar.active) {
        aBass += (ar.bass - aBass) * smk;
        aMid += (ar.mids - aMid) * smk;
        aHigh += (ar.highs - aHigh) * smk;
        aLevel += (ar.level - aLevel) * smk;
      } else {
        // Audio inactive (off / unsupported) — smoothly relax to baseline.
        aBass *= 0.9; aMid *= 0.9; aHigh *= 0.9; aLevel *= 0.9;
      }
      particleMaterial.uniforms.uAudioBass.value = aBass;
      particleMaterial.uniforms.uAudioMid.value = aMid;
      particleMaterial.uniforms.uAudioHigh.value = aHigh;
      particleMaterial.uniforms.uAudioLevel.value = aLevel;
      // Bass + overall level: slightly faster, subtle flow (never violent).
      const flow = FLOW * (1.0 + aBass * 0.3 + aLevel * 0.15);

      // Per-particle organic flow (in-place, zero allocation)
      const pos = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const s = seeds[i];

        pos[i3]     += Math.sin(elapsed * 0.15 + s * 17.0) * flow * dt;
        pos[i3 + 1] += Math.cos(elapsed * 0.12 + s * 23.0) * flow * 0.7 * dt;
        pos[i3 + 2] += (Math.sin(elapsed * 0.10 + s * 31.0) * 0.5 + 0.5) * flow * 0.5 * dt;

        if (pos[i3]     >  BOUND.x) pos[i3]     -= 2 * BOUND.x;
        if (pos[i3]     < -BOUND.x) pos[i3]     += 2 * BOUND.x;
        if (pos[i3 + 1] >  BOUND.y) pos[i3 + 1] -= 2 * BOUND.y;
        if (pos[i3 + 1] < -BOUND.y) pos[i3 + 1] += 2 * BOUND.y;
        if (pos[i3 + 2] >  BOUND.z) pos[i3 + 2] -= 2 * BOUND.z;
        if (pos[i3 + 2] < -BOUND.z) pos[i3 + 2] += 2 * BOUND.z;
      }
      particleGeometry.attributes.position.needsUpdate = true;
      particleMaterial.uniforms.uTime.value = elapsed;

      // Animate shapes
      shapes.forEach((s, i) => {
        s.mesh.rotation.x += 0.0008 * (i + 1);
        s.mesh.rotation.y += 0.0012 * (i + 1);
        const t = elapsed * s.floatSpeed + s.floatPhase;
        s.mesh.position.x = s.initialPos.x + Math.sin(t) * s.floatAmplitude;
        s.mesh.position.y = s.initialPos.y + Math.cos(t * 0.7) * s.floatAmplitude * 0.8;
        s.mesh.position.z = s.initialPos.z + Math.sin(t * 0.5 + 1) * s.floatAmplitude * 0.6;
      });

      // Smooth camera parallax with mouse
      mouse.x += (mouse.rawX - mouse.x) * 0.03;
      mouse.y += (mouse.rawY - mouse.y) * 0.03;
      camera.position.x += (mouse.x * 8 - 4 - camera.position.x) * 0.015;
      camera.position.y += (mouse.y * 8 - 4 - camera.position.y) * 0.015;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    // Pause/resume when tab visibility changes
    const onVisibilityChange = () => {
      running = document.visibilityState === 'visible';
      if (running) {
        // Reset start time to avoid huge elapsed jump
        // We keep startTime but the animation will resume smoothly
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // ─── CLEANUP ───
    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      shapes.forEach(s => { s.mesh.geometry.dispose(); s.mesh.material.dispose(); });
      if (renderer.domElement.parentNode) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}