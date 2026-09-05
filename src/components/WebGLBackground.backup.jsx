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

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      // Cyan-tinted particles for phosphor feel
      const brightness = 0.3 + Math.random() * 0.5;
      colors[i * 3] = brightness * 0.85;
      colors[i * 3 + 1] = brightness * 0.95;
      colors[i * 3 + 2] = brightness * 1.1;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
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
    };
    window.addEventListener('resize', onResize);

    // ─── ANIMATION LOOP (pauses when tab hidden) ───
    let animationId;
    let running = true;
    const startTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!running) return;

      const elapsed = (performance.now() - startTime) / 1000;

      // Rotate particles slowly
      particles.rotation.y = elapsed * 0.02;
      particles.rotation.x = elapsed * 0.01;

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