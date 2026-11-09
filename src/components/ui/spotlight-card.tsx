import React, { useEffect, useRef, ReactNode } from 'react';

export interface GlowCardProps {
  children?: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean; // When true, ignores size prop and uses width/height or className
  radius?: number | string;
  borderWidth?: number | string;
  spotlightSize?: number | string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const glowColorMap = {
  blue: { base: 220, spread: 200, primary: 'rgba(59, 130, 246, 0.95)', secondary: 'rgba(96, 165, 250, 0.6)', highlight: 'rgba(147, 197, 253, 1)' },
  purple: { base: 280, spread: 300, primary: 'rgba(168, 85, 247, 0.95)', secondary: 'rgba(192, 132, 252, 0.6)', highlight: 'rgba(216, 180, 254, 1)' },
  // Exact Green Box Palette: #10B981 (Emerald 500), #34D399 (Emerald 400), #6EE7B7 (Emerald 300)
  green: { base: 158, spread: 0, primary: 'rgba(16, 185, 129, 0.95)', secondary: 'rgba(52, 211, 153, 0.6)', highlight: 'rgba(110, 231, 183, 1)' },
  red: { base: 0, spread: 200, primary: 'rgba(239, 68, 68, 0.95)', secondary: 'rgba(248, 113, 113, 0.6)', highlight: 'rgba(252, 165, 165, 1)' },
  orange: { base: 30, spread: 200, primary: 'rgba(249, 115, 22, 0.95)', secondary: 'rgba(251, 146, 60, 0.6)', highlight: 'rgba(253, 186, 116, 1)' }
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'green',
  size = 'md',
  width,
  height,
  customSize = false,
  radius = 24,
  borderWidth = 2,
  spotlightSize = 320,
  style = {},
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;
      
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
        cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
      }
    };

    window.addEventListener('pointermove', syncPointer, { passive: true });
    return () => window.removeEventListener('pointermove', syncPointer);
  }, []);

  const { base, spread, primary, secondary, highlight } = glowColorMap[glowColor] || glowColorMap.green;

  // Determine sizing
  const getSizeClasses = () => {
    if (customSize) {
      return ''; // Let className or inline styles handle sizing
    }
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    const baseStyles: React.CSSProperties & Record<string, string | number> = {
      '--base': base,
      '--spread': spread,
      '--glow-primary': primary,
      '--glow-secondary': secondary,
      '--glow-highlight': highlight,
      '--radius': String(radius),
      '--border': String(borderWidth),
      '--backdrop': 'transparent',
      '--backup-border': 'transparent',
      '--size': String(spotlightSize),
      '--outer': '0.7',
      '--border-size': 'calc(var(--border, 2) * 1px)',
      '--spotlight-size': 'calc(var(--size, 320) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      position: 'relative' as const,
      ...style
    };

    // Add width and height if provided
    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles;
  };

  const beforeAfterStyles = `
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size, 2px) * -1);
      border: var(--border-size, 2px) solid transparent;
      border-radius: calc(var(--radius, 24) * 1px);
      background-attachment: fixed;
      background-size: calc(100% + (2 * var(--border-size, 2px))) calc(100% + (2 * var(--border-size, 2px)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      z-index: 2;
    }
    
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size, 320px) * 0.75) calc(var(--spotlight-size, 320px) * 0.75) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        var(--glow-primary, rgba(16, 185, 129, 0.95)) 0%,
        var(--glow-secondary, rgba(52, 211, 153, 0.55)) 38%,
        rgba(110, 231, 183, 0.18) 65%,
        transparent 100%
      );
    }
    
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size, 320px) * 0.45) calc(var(--spotlight-size, 320px) * 0.45) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        var(--glow-highlight, rgba(110, 231, 183, 1)) 0%,
        var(--glow-secondary, rgba(52, 211, 153, 0.7)) 45%,
        transparent 100%
      );
    }
    
    [data-glow] [data-glow] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 0.5);
      border-radius: calc(var(--radius, 24) * 1px);
      border-width: calc(var(--border-size, 2px) * 12);
      filter: blur(calc(var(--border-size, 2px) * 8));
      background: none;
      pointer-events: none;
      border: none;
      z-index: 1;
    }
    
    [data-glow] > [data-glow]::before {
      inset: -8px;
      border-width: 8px;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        onClick={onClick}
        style={getInlineStyles()}
        className={`
          ${getSizeClasses()}
          ${!customSize ? 'aspect-[3/4] p-4 gap-4 grid grid-rows-[1fr_auto] shadow-[0_1rem_2rem_-1rem_black] backdrop-blur-[5px]' : ''}
          rounded-2xl 
          relative 
          ${className}
        `}
      >
        <div ref={innerRef} data-glow></div>
        {children}
      </div>
    </>
  );
};

export { GlowCard, GlowCard as SpotlightCard };
export default GlowCard;

