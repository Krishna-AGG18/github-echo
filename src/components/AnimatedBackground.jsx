import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

const ParticleField = ({ mousePos }) => {
  const ref = useRef();
  const count = 4000;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25; // z
    }
    return positions;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Base Drift
    ref.current.rotation.x -= delta * 0.02;
    ref.current.rotation.y -= delta * 0.03;
    
    // Global Parallax based on normalized mouse coordinates
    const targetX = mousePos.x * 0.8;
    const targetY = mousePos.y * 0.8;
    
    ref.current.rotation.y += (targetX - ref.current.rotation.y) * 0.02;
    ref.current.rotation.x += (targetY - ref.current.rotation.x) * 0.02;
  });

  return (
    <group>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial 
          transparent 
          color="#d8b4fe" 
          size={0.06} 
          sizeAttenuation={true} 
          depthWrite={false} 
          opacity={0.6} 
        />
      </Points>
    </group>
  );
};

const AnimatedBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize to -1 to 1
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#030014]">
      {/* Deep Holographic Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
      
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ParticleField mousePos={mousePos} />
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;
