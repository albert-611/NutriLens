'use client';

import React, { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

export interface BorderBeamProps {
  /**
   * The size/length of the border beam in pixels.
   */
  size?: number;
  /**
   * Duration in seconds for one full lap around the border.
   */
  duration?: number;
  /**
   * Delay in seconds before animation starts.
   */
  delay?: number;
  /**
   * Start color of the beam gradient.
   */
  colorFrom?: string;
  /**
   * End color of the beam gradient.
   */
  colorTo?: string;
  /**
   * Transition configuration for compatibility with Magic UI API.
   */
  transition?: {
    type?: string;
    stiffness?: number;
    damping?: number;
    duration?: number;
    ease?: string;
    repeat?: number;
  };
  /**
   * Additional classes for the beam element.
   */
  className?: string;
  /**
   * Inline styles for container.
   */
  style?: CSSProperties;
  /**
   * Reverse direction of rotation.
   */
  reverse?: boolean;
  /**
   * Initial offset along perimeter (0 to 100 percentage).
   */
  initialOffset?: number;
  /**
   * Border stroke width in pixels.
   */
  borderWidth?: number;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className,
  size = 48,
  delay = 0,
  duration = 6,
  colorFrom = '#eab308', // yellow-500
  colorTo = '#facc15',   // yellow-400
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGRectElement>(null);
  const [radius, setRadius] = useState<number>(12);
  const [perimeter, setPerimeter] = useState<number>(300);

  // Measure parent container border radius and perimeter
  useEffect(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current.parentElement;
    if (parent) {
      const computed = window.getComputedStyle(parent);
      const parsedRadius = parseFloat(computed.borderRadius) || 12;
      setRadius(parsedRadius);
    }

    if (pathRef.current) {
      try {
        const total = pathRef.current.getTotalLength();
        if (total > 0) setPerimeter(total);
      } catch {
        // Fallback handled gracefully
      }
    }
  }, []);

  // Motion value tracking traveling position in pixels along the perimeter
  const progress = useMotionValue<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);

  // Effective duration
  const effectiveDuration = transition?.duration || duration || 6;

  useAnimationFrame((time) => {
    const path = pathRef.current;
    if (!path) return;

    let length = perimeter;
    try {
      const currentLength = path.getTotalLength();
      if (currentLength > 0 && currentLength !== perimeter) {
        length = currentLength;
        setPerimeter(currentLength);
      }
    } catch {
      // keep current
    }

    if (length <= 0) return;

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      const startPx = ((initialOffset % 100) / 100) * length;
      progress.set(startPx);
      return;
    }

    const delta = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    // Respect delay
    if (delay > 0) {
      elapsedRef.current += delta;
      if (elapsedRef.current < delay) return;
    }

    const pxPerSec = length / Math.max(effectiveDuration, 0.5);
    const direction = reverse ? -1 : 1;
    let next = progress.get() + direction * pxPerSec * delta;

    if (next > length) next = next % length;
    if (next < 0) next = (next % length) + length;

    progress.set(next);
  });

  // Calculate coordinates along the path
  const posX = useTransform(progress, (val) => {
    if (!pathRef.current) return 0;
    try {
      return pathRef.current.getPointAtLength(val).x;
    } catch {
      return 0;
    }
  });

  const posY = useTransform(progress, (val) => {
    if (!pathRef.current) return 0;
    try {
      return pathRef.current.getPointAtLength(val).y;
    } catch {
      return 0;
    }
  });

  // Unique SVG gradient ID per component instance
  const gradientId = useRef(`border-beam-grad-${Math.random().toString(36).substring(2, 9)}`).current;

  return (
    <div
      ref={containerRef}
      style={style}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
      aria-hidden="true"
    >
      {/* Invisible reference SVG measuring exact curved boundary */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} stopOpacity="1" />
            <stop offset="100%" stopColor={colorTo} stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect
          ref={pathRef}
          fill="none"
          width="100%"
          height="100%"
          rx={radius}
          ry={radius}
        />
      </svg>

      {/* Primary Traveling Beam (Specular Glow + Laser Bloom) */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          x: posX,
          y: posY,
          translateX: '-50%',
          translateY: '-50%',
          width: size,
          height: size,
        }}
        className={cn(
          'pointer-events-none rounded-full blur-[2px]',
          className || 'bg-gradient-to-r from-transparent via-yellow-400 to-transparent'
        )}
      />

      {/* Intense Center Core Sparkle */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          x: posX,
          y: posY,
          translateX: '-50%',
          translateY: '-50%',
          width: Math.max(size * 0.45, 12),
          height: Math.max(size * 0.45, 12),
        }}
        className="pointer-events-none rounded-full bg-white/90 blur-[1px] shadow-[0_0_12px_rgba(234,179,8,0.9)]"
      />
    </div>
  );
};

export default BorderBeam;
