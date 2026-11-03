import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const IMAGES = {
  f1: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=50&w=640&auto=format&fit=crop',
  cricket: 'https://images.unsplash.com/photo-1531415080290-bc98529c113a?q=50&w=640&auto=format&fit=crop',
  football: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=50&w=640&auto=format&fit=crop'
};

function FloatingMesh({ position, color, size, speed }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime * speed;
    
    // Slow drifting movement
    meshRef.current.position.x = position[0] + Math.sin(time) * 2;
    meshRef.current.position.y = position[1] + Math.cos(time * 0.8) * 1.5;
    meshRef.current.position.z = position[2] + Math.sin(time * 0.5) * 1;
    
    // Rotate slowly
    meshRef.current.rotation.x = time * 0.1;
    meshRef.current.rotation.y = time * 0.15;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 20, 20]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.06}
        wireframe={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function AmbientGlows() {
  return (
    <group>
      {/* Floating abstract glowing blobs */}
      <FloatingMesh position={[-6, 3, -10]} color="#ff4b44" size={8} speed={0.12} />
      <FloatingMesh position={[6, -2, -12]} color="#e10600" size={9} speed={0.08} />
      <FloatingMesh position={[0, 4, -8]} color="#38bdf8" size={5} speed={0.15} />
      <FloatingMesh position={[-4, -4, -14]} color="#0369a1" size={7} speed={0.09} />
    </group>
  );
}

function CameraDrift() {
  useFrame((state) => {
    const { camera } = state;
    const time = state.clock.elapsedTime;
    // Tiny drifting rotation
    camera.position.x = Math.sin(time * 0.05) * 0.8;
    camera.position.y = Math.cos(time * 0.04) * 0.5;
  });
  return null;
}

export default function Background3D({ disabled, activeSport = 'all' }) {
  // Lite mode: skip the WebGL canvas entirely on mobile, reduced-motion
  // or low-core devices — the CSS wallpaper layers still give the look.
  const [lite] = useState(() =>
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
      window.innerWidth < 768 ||
      (navigator.hardwareConcurrency || 8) <= 4));
  const [activeSlide, setActiveSlide] = useState(0); // 0 = F1, 1 = Cricket, 2 = Football

  // Dynamic slideshow when activeSport is 'all'
  useEffect(() => {
    if (activeSport !== 'all') return undefined;
    
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 8500); // Crossfade every 8.5 seconds

    return () => clearInterval(interval);
  }, [activeSport]);

  // Determine opacities for background images
  const showF1 = activeSport === 'f1' || (activeSport === 'all' && activeSlide === 0);
  const showCricket = activeSport === 'cricket' || (activeSport === 'all' && activeSlide === 1);
  const showFootball = activeSport === 'football' || (activeSport === 'all' && activeSlide === 2);

  return (
    <div 
      className="arena-background-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -2,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: '#02050f'
      }}
      aria-hidden="true"
    >
      {/* ── IMAGE WALLPAPER LAYERS ── */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: showF1 ? 0.32 : 0,
          backgroundImage: `url(${IMAGES.f1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.22) contrast(1.1) saturate(0.9)',
          transition: 'opacity 1.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
          zIndex: 1
        }}
      />
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: showCricket ? 0.35 : 0,
          backgroundImage: `url(${IMAGES.cricket})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.22) contrast(1.1) saturate(0.9)',
          transition: 'opacity 1.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
          zIndex: 1
        }}
      />
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: showFootball ? 0.32 : 0,
          backgroundImage: `url(${IMAGES.football})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.22) contrast(1.1) saturate(0.9)',
          transition: 'opacity 1.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
          zIndex: 1
        }}
      />

      {/* Dark vignette gradient masks overlaying the images to preserve readability */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(2, 5, 15, 0.4) 0%, rgba(2, 5, 15, 0.75) 50%, rgba(2, 5, 15, 0.95) 100%)',
          zIndex: 2
        }}
      />
      
      {/* ── 3D CANVAS LAYER ── */}
      {!disabled && !lite && (
        <div 
          className="arena-canvas"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            opacity: 0.9
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 10], fov: 60 }}
            gl={{ antialias: false, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
            dpr={[1, 1.2]}
          >
            <Suspense fallback={null}>
              <CameraDrift />
              <AmbientGlows />
              
              {/* Subtle cinematic space dust/particles */}
              <Sparkles count={28} scale={[25, 15, 20]} size={1.2} speed={0.06} color="#ff4b44" opacity={0.25} />
              <Sparkles count={14} scale={[25, 15, 20]} size={1.5} speed={0.10} color="#f3c623" opacity={0.15} />
              
              {/* Light setup */}
              <ambientLight intensity={0.2} />
              <pointLight position={[0, 10, -5]} color="#ff4b44" intensity={1.5} distance={30} />
              <pointLight position={[-10, -5, -5]} color="#e10600" intensity={1.2} distance={25} />
            </Suspense>
          </Canvas>
        </div>
      )}
    </div>
  );
}
