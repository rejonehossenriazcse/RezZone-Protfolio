import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useCMS } from '../context/CMSContext';

export const ThreeCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { cmsData, isDarkMode } = useCMS();
  const { enable3D, threeStyle = 'torus', theme } = cmsData.siteSettings;

  useEffect(() => {
    if (!enable3D || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dynamic Colors based on CMS Theme
    const primaryHex = theme.primaryColor || '#2563eb';
    const accentHex = theme.accentColor || '#6366f1';
    const primaryColor = new THREE.Color(primaryHex);
    const accentColor = new THREE.Color(accentHex);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDarkMode ? 0.9 : 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(primaryColor, isDarkMode ? 2.2 : 2.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(accentColor, isDarkMode ? 2.0 : 1.8, 15);
    pointLight.position.set(-3, -2, 3);
    scene.add(pointLight);

    let mainMesh: THREE.Object3D | null = null;
    const group = new THREE.Group();
    scene.add(group);

    if (threeStyle === 'particles') {
      const particleCount = 200;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 1.2 + Math.random() * 1.5;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        const mixColor = Math.random() > 0.5 ? primaryColor : accentColor;
        colors[i * 3] = mixColor.r;
        colors[i * 3 + 1] = mixColor.g;
        colors[i * 3 + 2] = mixColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const pMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: isDarkMode ? 0.85 : 0.65,
      });

      mainMesh = new THREE.Points(geometry, pMaterial);
      group.add(mainMesh);
    } else if (threeStyle === 'rings') {
      const ringGroup = new THREE.Group();
      const ringMat1 = new THREE.MeshStandardMaterial({
        color: primaryColor,
        roughness: 0.25,
        metalness: 0.6,
        wireframe: true,
      });
      const ringMat2 = new THREE.MeshStandardMaterial({
        color: accentColor,
        roughness: 0.3,
        metalness: 0.7,
        wireframe: true,
      });

      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.04, 16, 100), ringMat1);
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.03, 16, 100), ringMat2);
      const ring3 = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.02, 16, 80), ringMat1);

      ring2.rotation.x = Math.PI / 3;
      ring3.rotation.y = Math.PI / 4;

      ringGroup.add(ring1);
      ringGroup.add(ring2);
      ringGroup.add(ring3);
      mainMesh = ringGroup;
      group.add(mainMesh);
    } else {
      // Default: Elegant Torus Knot with sleek dual wireframe & phong core
      const knotGeo = new THREE.TorusKnotGeometry(1.1, 0.32, 100, 16, 2, 3);
      const knotMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        roughness: 0.2,
        metalness: 0.6,
        wireframe: true,
        transparent: true,
        opacity: isDarkMode ? 0.8 : 0.65,
      });
      const knotMesh = new THREE.Mesh(knotGeo, knotMat);

      const innerGeo = new THREE.TorusKnotGeometry(1.08, 0.25, 64, 12, 2, 3);
      const innerMat = new THREE.MeshPhysicalMaterial({
        color: accentColor,
        roughness: 0.3,
        metalness: 0.4,
        transparent: true,
        opacity: isDarkMode ? 0.35 : 0.2,
        transmission: 0.4,
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);

      const knotGroup = new THREE.Group();
      knotGroup.add(knotMesh);
      knotGroup.add(innerMesh);
      mainMesh = knotGroup;
      group.add(mainMesh);
    }

    // Interactive mouse parallax
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 1.5;
      targetY = y * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const newWidth = container.clientWidth || 300;
      const newHeight = container.clientHeight || 300;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (group) {
        group.rotation.x += 0.004;
        group.rotation.y += 0.006;

        // Smooth lerp towards cursor target
        group.position.x += (targetX - group.position.x) * 0.05;
        group.position.y += (-targetY - group.position.y) * 0.05;

        // Soft floating bounce
        group.position.y += Math.sin(elapsedTime * 1.2) * 0.0015;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [enable3D, threeStyle, theme.primaryColor, theme.accentColor, isDarkMode]);

  if (!enable3D) return null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[300px] overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};
