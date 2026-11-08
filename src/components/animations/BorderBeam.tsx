import React, { type CSSProperties } from 'react';
import { motion, type Transition } from 'motion/react';
import { cn } from '@/lib/utils';

export interface BorderBeamProps {
  /**
   * The size of the border beam in pixels.
   */
  size?: number;
  /**
   * The duration of the border beam animation in seconds.
   */
  duration?: number;
  /**
   * Delay in seconds before animation begins.
   */
  delay?: number;
  /**
   * Color at start of gradient.
   */
  colorFrom?: string;
  /**
   * Color at end of gradient.
   */
  colorTo?: string;
  /**
   * Custom transition definition (e.g. spring, ease, etc.).
   */
  transition?: Transition;
  /**
   * Additional classes for styling the beam element.
   */
  className?: string;
  /**
   * Additional styles.
   */
  style?: CSSProperties;
  /**
   * Reverse rotation direction.
   */
  reverse?: boolean;
  /**
   * Initial offset percentage along the border (0-100).
   */
  initialOffset?: number;
  /**
   * Border width in pixels.
   */
  borderWidth?: number;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1.5,
}) => {
  return (
    <div
      style={
        {
          '--border-width': `${borderWidth}px`,
          ...style,
        } as CSSProperties
      }
      className="pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]"
    >
      <motion.div
        className={cn(
          'absolute aspect-square',
          'bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent',
          className
        )}
        style={
          {
            width: size,
            offsetPath: 'rect(0 auto auto 0 round inherit)',
            '--color-from': colorFrom,
            '--color-to': colorTo,
            ...style,
          } as CSSProperties
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={
          transition
            ? {
                repeat: Infinity,
                ease: 'linear',
                ...transition,
              }
            : {
                repeat: Infinity,
                ease: 'linear',
                duration,
                delay: -delay,
              }
        }
      />
    </div>
  );
};

export default BorderBeam;
