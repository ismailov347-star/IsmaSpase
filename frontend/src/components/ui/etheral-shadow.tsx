'use client';

import React, { useRef, useId, useEffect, CSSProperties } from 'react';
import { animate, useMotionValue, AnimationPlaybackControls } from 'framer-motion';

// Type definitions
interface AnimationConfig {
  scale: number; // Intensity (1-100, higher = more distortion)
  speed: number; // Speed (1-100, higher = faster movement)
}

interface NoiseConfig {
  opacity: number; // Texture visibility (0-1)
  scale: number; // Texture density multiplier
}

interface EtherealShadowProps {
  color?: string; // Shadow color in RGBA format
  sizing?: 'fill' | 'stretch'; // How the shadow mask fills the container
  animation?: AnimationConfig; // Animation intensity and speed settings
  noise?: NoiseConfig; // Noise texture overlay configuration
  className?: string; // Additional Tailwind CSS classes
  children?: React.ReactNode; // Content to display above the shadow effect
  style?: CSSProperties;
}

function mapRange(
  value: number,
  fromLow: number,
  fromHigh: number,
  toLow: number,
  toHigh: number
): number {
  if (fromLow === fromHigh) {
    return toLow;
  }
  const percentage = (value - fromLow) / (fromHigh - fromLow);
  return toLow + percentage * (toHigh - toLow);
}

const useInstanceId = (): string => {
  return useId();
};

export function EtherealShadow({
  color = 'rgba(128, 128, 128, 0.8)',
  sizing = 'fill',
  animation = { scale: 30, speed: 20 },
  noise = { opacity: 0.3, scale: 2 },
  className = '',
  children,
  style,
}: EtherealShadowProps) {
  const instanceId = useInstanceId();
  const animationEnabled = animation && animation.scale > 0 && animation.speed > 0;
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const baseFrequency = useMotionValue(0.02);

  // Animation setup
  useEffect(() => {
    if (!animationEnabled || !turbulenceRef.current) return;

    const turbulence = turbulenceRef.current;
    const scaledSpeed = mapRange(animation.speed, 1, 100, 0.5, 5);
    const scaledScale = mapRange(animation.scale, 1, 100, 0.01, 0.1);

    // Animate the turbulence for organic movement
    animationRef.current = animate(baseFrequency, [scaledScale * 0.5, scaledScale * 1.5], {
      duration: 10 / scaledSpeed,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
      onUpdate: (value) => {
        if (turbulence) {
          turbulence.setAttribute('baseFrequency', `${value} ${value * 0.8}`);
        }
      },
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [animationEnabled, animation.scale, animation.speed, baseFrequency]);

  const filterId = `ethereal-filter-${instanceId}`;
  const maskId = `ethereal-mask-${instanceId}`;
  const noiseId = `ethereal-noise-${instanceId}`;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        isolation: 'isolate',
      }}
    >
      {/* SVG Filters */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: -1 }}
      >
        <defs>
          {/* Main ethereal shadow filter */}
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              ref={turbulenceRef}
              baseFrequency="0.02 0.016"
              numOctaves="3"
              result="turbulence"
              seed="2"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale={mapRange(animation?.scale || 30, 1, 100, 5, 50)}
              result="displacement"
            />
            <feGaussianBlur
              in="displacement"
              stdDeviation="3"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.8 0"
              result="shadow"
            />
          </filter>

          {/* Noise texture filter */}
          <filter id={noiseId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              baseFrequency={0.9 * (noise?.scale || 2)}
              numOctaves="4"
              result="noise"
              seed="5"
            />
            <feColorMatrix
              in="noise"
              type="saturate"
              values="0"
              result="desaturatedNoise"
            />
            <feComponentTransfer in="desaturatedNoise" result="contrastNoise">
              <feFuncA type="discrete" tableValues="0.5 0.6 0.7 0.8 0.9 1"/>
            </feComponentTransfer>
            <feComposite
              in="contrastNoise"
              in2="SourceGraphic"
              operator="multiply"
              result="noiseOverlay"
            />
          </filter>

          {/* Mask for shadow shape */}
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
          </mask>
        </defs>

        {/* Background shadow layer */}
        <rect
          width="100%"
          height="100%"
          fill={color}
          filter={`url(#${filterId})`}
          mask={`url(#${maskId})`}
          style={{
            mixBlendMode: 'multiply',
          }}
        />

        {/* Noise texture overlay */}
        {noise && noise.opacity > 0 && (
          <rect
            width="100%"
            height="100%"
            fill="rgba(255, 255, 255, 0.1)"
            filter={`url(#${noiseId})`}
            opacity={noise.opacity}
            style={{
              mixBlendMode: 'overlay',
            }}
          />
        )}
      </svg>

      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 30, 0.8) 50%, rgba(0, 0, 0, 0.9) 100%),
            radial-gradient(circle at 20% 80%, rgba(120, 50, 200, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(50, 120, 200, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(200, 50, 120, 0.2) 0%, transparent 50%),
            conic-gradient(from 180deg at 50% 50%, rgba(100, 50, 200, 0.4) 0deg, rgba(50, 100, 200, 0.3) 120deg, rgba(200, 100, 50, 0.3) 240deg, rgba(100, 50, 200, 0.4) 360deg)
          `,
          zIndex: -2,
        }}
      />

      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Animated noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.03) 2px,
              rgba(255, 255, 255, 0.03) 4px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.03) 2px,
              rgba(255, 255, 255, 0.03) 4px
            )
          `,
          animation: animationEnabled ? 'ethereal-float 8s ease-in-out infinite' : 'none',
          zIndex: -1,
        }}
      />

      {/* CSS Animation Keyframes */}
      <style jsx>{`
        @keyframes ethereal-float {
          0%, 100% {
            opacity: 0.1;
            filter: hue-rotate(0deg) brightness(1) contrast(1);
          }
          25% {
            opacity: 0.3;
            filter: hue-rotate(90deg) brightness(1.2) contrast(1.1);
          }
          50% {
            opacity: 0.2;
            filter: hue-rotate(180deg) brightness(0.9) contrast(1.2);
          }
          75% {
            opacity: 0.25;
            filter: hue-rotate(270deg) brightness(1.1) contrast(0.9);
          }
        }
      `}</style>
    </div>
  );
}

// Export with different name for compatibility
export { EtherealShadow as EtheralShadows };
export default EtherealShadow;