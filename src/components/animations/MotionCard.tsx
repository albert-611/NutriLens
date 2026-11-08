import React, { useState, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

export interface MotionCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: ReactNode | ((props: { isOpen: boolean }) => ReactNode);
  className?: string;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hoverLift?: number;
  hoverScale?: number;
  springStiffness?: number;
  springDamping?: number;
}

export const MotionCard: React.FC<MotionCardProps> = ({
  children,
  className = '',
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onOpenChange,
  hoverLift = -8,
  hoverScale = 1.02,
  springStiffness = 300,
  springDamping = 20,
  onClick,
  ...rest
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) onClick(e);
    const nextState = !isOpen;
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(nextState);
    }
    onOpenChange?.(nextState);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      whileHover={{
        y: hoverLift,
        scale: hoverScale,
        boxShadow: '0px 14px 32px -8px rgba(0, 0, 0, 0.25)',
      }}
      transition={{
        duration: 0.3,
        type: 'spring',
        stiffness: springStiffness,
        damping: springDamping,
      }}
      onClick={handleClick}
      className={['cursor-pointer', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {typeof children === 'function'
        ? (children as (props: { isOpen: boolean }) => ReactNode)({ isOpen })
        : children}
    </motion.div>
  );
};

export default MotionCard;
