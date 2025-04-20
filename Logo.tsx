import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Logo = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up ThreeJS scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(60, 60);
    renderer.setClearColor(0x000000, 0);

    // Create axes and sphere at the intersection
    const axisLength = 1.8;
    const axisWidth = 0.08;

    // X axis (white)
    const xAxis = new THREE.Mesh(
      new THREE.BoxGeometry(axisLength, axisWidth, axisWidth),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    xAxis.position.x = axisLength / 2;
    scene.add(xAxis);

    // Y axis (white)
    const yAxis = new THREE.Mesh(
      new THREE.BoxGeometry(axisWidth, axisLength, axisWidth),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    yAxis.position.y = axisLength / 2;
    scene.add(yAxis);

    // Z axis (white)
    const zAxis = new THREE.Mesh(
      new THREE.BoxGeometry(axisWidth, axisWidth, axisLength),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    zAxis.position.z = axisLength / 2;
    scene.add(zAxis);

    // Sphere at the intersection
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    scene.add(sphere);

    // Initial scene rotation
    scene.rotation.x = Math.PI / 6;
    scene.rotation.y = Math.PI / 4;

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      scene.rotation.y += 0.023;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="logo-canvas"
      width="60"
      height="60"
      style={{
        marginRight: '12px',
        position: 'relative',
        top: '-7px',
      }}
    />
  );
};

export default Logo;
