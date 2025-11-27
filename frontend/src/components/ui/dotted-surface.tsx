import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    points: THREE.Points;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log("Initializing DottedSurface...");

    const SEPARATION = 80;
    const AMOUNTX = 60;
    const AMOUNTY = 50;

    // Scene setup with Wicky navy background
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1b2838, 1000, 5000);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    camera.position.set(0, 200, 800);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    containerRef.current.appendChild(renderer.domElement);
    console.log("Canvas added to DOM");

    // Create particle geometry
    const positions: number[] = [];
    const colors: number[] = [];
    const geometry = new THREE.BufferGeometry();

    // Wicky green color (brighter for visibility)
    const wickyGreen = new THREE.Color(0x00d9c0);

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const y = 0;
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

        positions.push(x, y, z);
        colors.push(wickyGreen.r, wickyGreen.g, wickyGreen.b);
      }
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3),
    );

    // Create material with increased visibility
    const material = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    // Create points mesh
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let frameCount = 0;

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);

      const positionAttribute = geometry.attributes.position;
      const positions = positionAttribute.array as Float32Array;

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const index = i * 3;

          // Create wave animation
          positions[index + 1] =
            Math.sin((ix + count) * 0.3) * 35 +
            Math.sin((iy + count) * 0.5) * 35;

          i++;
        }
      }

      positionAttribute.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.08;

      // Log first few frames for debugging
      if (frameCount < 3) {
        console.log(`Frame ${frameCount} rendered`);
        frameCount++;
      }

      if (sceneRef.current) {
        sceneRef.current.animationId = animationId;
      }
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Start animation
    const initialAnimationId = requestAnimationFrame(animate);
    console.log("Animation started");

    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      points,
      animationId: initialAnimationId,
    };

    // Cleanup
    return () => {
      console.log("Cleaning up DottedSurface...");
      window.removeEventListener('resize', handleResize);

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);

        sceneRef.current.points.geometry.dispose();
        if (sceneRef.current.points.material instanceof THREE.Material) {
          sceneRef.current.points.material.dispose();
        }

        sceneRef.current.renderer.dispose();

        if (containerRef.current?.contains(sceneRef.current.renderer.domElement)) {
          containerRef.current.removeChild(sceneRef.current.renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none fixed inset-0 -z-10', className)}
      {...props}
    />
  );
}
