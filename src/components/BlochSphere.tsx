import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { QubitState } from '@/lib/quantum';

interface BlochSphereProps {
  qubit: QubitState;
  size?: number;
}

export function BlochSphere({ qubit, size = 200 }: BlochSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    sphere: THREE.Mesh;
    vector: THREE.ArrowHelper;
    animationId?: number;
  }>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Bloch sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a365d,
      transparent: true,
      opacity: 0.1,
      wireframe: true
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Coordinate axes
    const axesHelper = new THREE.AxesHelper(1.2);
    scene.add(axesHelper);

    // State vector
    const direction = new THREE.Vector3(
      qubit.position.x,
      qubit.position.y,
      qubit.position.z
    );
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 1;
    const vector = new THREE.ArrowHelper(
      direction.normalize(),
      origin,
      length,
      0x00ffff,
      0.3,
      0.1
    );
    scene.add(vector);

    // Add glowing point at vector tip
    const pointGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const pointMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    point.position.copy(direction);
    scene.add(point);

    camera.position.set(2, 2, 2);
    camera.lookAt(0, 0, 0);

    sceneRef.current = { scene, renderer, camera, sphere, vector };

    // Animation loop
    const animate = () => {
      if (sceneRef.current) {
        sceneRef.current.sphere.rotation.y += 0.005;
        sceneRef.current.renderer.render(
          sceneRef.current.scene, 
          sceneRef.current.camera
        );
        sceneRef.current.animationId = requestAnimationFrame(animate);
      }
    };
    animate();

    return () => {
      if (sceneRef.current?.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size]);

  // Update vector when qubit state changes
  useEffect(() => {
    if (sceneRef.current) {
      const direction = new THREE.Vector3(
        qubit.position.x,
        qubit.position.y,
        qubit.position.z
      );
      sceneRef.current.vector.setDirection(direction.normalize());
    }
  }, [qubit.position]);

  return (
    <div 
      ref={mountRef} 
      className="bloch-sphere"
      style={{ width: size, height: size }}
    />
  );
}