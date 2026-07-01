import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GITHUB_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFFFFF"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;

const vertexShader = `
  attribute vec3 aTarget;
  uniform float uTime;
  uniform vec2 uMouse;
  
  varying float vOpacity;
  
  void main() {
    // Map mouse to approximate world space (-10 to 10)
    vec2 mouseWorld = uMouse * 10.0;
    
    // Distance from particle's target position to mouse
    float dist = distance(aTarget.xy, mouseWorld);
    
    // Hover deformation factor (1.0 when mouse is close, 0.0 when further away)
    float hoverDeform = smoothstep(3.5, 0.0, dist);
    
    // Morph factor is 1.0 (fully formed logo) minus hover deformation
    float morphFactor = 1.0 - hoverDeform;
    
    // Lively micro-movements on the target shape so it breathes gently
    vec3 targetPos = aTarget;
    targetPos.x += sin(uTime + position.y * 2.0) * 0.05;
    targetPos.y += cos(uTime + position.x * 2.0) * 0.05;
    targetPos.z += sin(uTime * 0.5 + position.z) * 0.1;

    // Dispersed cloud position (where particles go when hovered)
    vec3 cloudPos = position;
    // Push away direction from the mouse
    vec2 dir = normalize(aTarget.xy - mouseWorld + 0.001);
    cloudPos.x = aTarget.x + dir.x * 5.0;
    cloudPos.y = aTarget.y + dir.y * 5.0;
    cloudPos.z = position.z + 4.0; // Push out towards camera

    // Add chaotic drift when scattered
    cloudPos.x += sin(uTime * 2.0 + position.y) * 2.0;
    cloudPos.y += cos(uTime * 2.5 + position.x) * 2.0;
    
    // Interpolate between the chaotic cloud and the structured logo
    vec3 finalPos = mix(cloudPos, targetPos, morphFactor);
    
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    
    // Dynamic point sizing based on depth
    gl_PointSize = (120.0 / -mvPosition.z);
    
    // Calculate opacity (brighter when formed as logo, fades out in distance)
    vOpacity = mix(0.15, 0.7, morphFactor) * clamp(1.0 - (-mvPosition.z - 3.0) / 15.0, 0.1, 1.0);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vOpacity;
  
  void main() {
    // Generate soft circular particle alpha mask
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    
    // Gaussian falloff for smooth glowing edges
    float alpha = exp(-r * 3.0) * vOpacity;
    
    // Crisp white/light-gray accent color
    vec3 color = vec3(0.85, 0.88, 0.95);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

const ParticleField = ({ mousePos }) => {
  const pointsRef = useRef();
  const materialRef = useRef();
  const count = 5000;
  
  // Set up initial coordinate buffers
  const [positions, targetPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const tar = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Widespread random cloud for the completely broken state
      pos[i * 3] = (Math.random() - 0.5) * 30; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30; // z
      
      // Fallback target shape (sphere) while SVG is processing
      const r = 5 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      tar[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      tar[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      tar[i * 3 + 2] = r * Math.cos(phi);
    }
    return [pos, tar];
  }, [count]);

  // Load and parse SVG data to replace fallback targets with GitHub logo coordinates
  useEffect(() => {
    const img = new Image();
    img.src = GITHUB_SVG;
    img.onload = () => {
      const size = 128; // Sampling resolution
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      
      const extractedTargets = [];
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const alpha = data[(y * size + x) * 4 + 3];
          if (alpha > 128) {
            extractedTargets.push({
              x: (x / size - 0.5) * 12, // Center and scale to 3D world
              y: -(y / size - 0.5) * 12, // Invert Y-axis
              z: 0
            });
          }
        }
      }
      
      if (pointsRef.current && extractedTargets.length > 0) {
        const newTargets = new Float32Array(count * 3);
        const shuffled = extractedTargets.sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) {
          const t = shuffled[i % shuffled.length];
          newTargets[i * 3] = t.x;
          newTargets[i * 3 + 1] = t.y;
          // Subtly scatter particles in Z for a volumetric 3D feel
          newTargets[i * 3 + 2] = t.z + (Math.random() - 0.5) * 1.5; 
        }
        
        pointsRef.current.geometry.setAttribute('aTarget', new THREE.BufferAttribute(newTargets, 3));
        pointsRef.current.geometry.attributes.aTarget.needsUpdate = true;
      }
    };
  }, [count]);

  // Main animation loop
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      
      // Smoothly interpolate the mouse uniform for fluid interaction
      const targetMouseX = mousePos.x * 2.0;
      const targetMouseY = mousePos.y * 2.0;
      materialRef.current.uniforms.uMouse.value.x += (targetMouseX - materialRef.current.uniforms.uMouse.value.x) * 0.05;
      materialRef.current.uniforms.uMouse.value.y += (targetMouseY - materialRef.current.uniforms.uMouse.value.y) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTarget"
          count={count}
          array={targetPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) }
        }}
      />
    </points>
  );
};

const AnimatedBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse coordinates from -1 to 1
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-black overflow-hidden">
      {/* Subtle Monochrome Gradients to prevent a flat, pure black void */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-slate-800/10 blur-[120px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full mix-blend-screen" />
      
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ParticleField mousePos={mousePos} />
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;
