// Small Web Animations API helper. Does nothing when the viewer prefers reduced motion.
export const EASE = 'cubic-bezier(.2,.8,.2,1)';

export const reduceMotion =
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const UP = [
  { opacity: 0, transform: 'translateY(12px)' },
  { opacity: 1, transform: 'none' },
];

export function anim(node, frames, opt = {}) {
  if (reduceMotion || !node || !node.animate) return null;
  return node.animate(frames, { duration: 380, easing: EASE, fill: 'backwards', ...opt });
}
