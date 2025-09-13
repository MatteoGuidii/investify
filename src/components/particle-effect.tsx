'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ParticleEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function ParticleEffect({ isActive, onComplete }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5
      }));
      setParticles(newParticles);
      
      // Clean up after animation
      const timeout = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [isActive, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
          initial={{ 
            x: `${particle.x}vw`, 
            y: `${particle.y}vh`,
            scale: 0,
            opacity: 0 
          }}
          animate={{ 
            x: `${particle.x + (Math.random() - 0.5) * 30}vw`,
            y: `${particle.y + (Math.random() - 0.5) * 30}vh`,
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0] 
          }}
          transition={{ 
            duration: 1.5,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
