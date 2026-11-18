// Web Animations API helper for NutriLens Chatbox
export const EASE = 'cubic-bezier(.2,.8,.2,1)';

export const reduceMotion =
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const UP: Keyframe[] = [
  { opacity: 0, transform: 'translateY(12px)' },
  { opacity: 1, transform: 'none' },
];

export function anim(
  node: HTMLElement | null,
  frames: Keyframe[] | PropertyIndexedKeyframes,
  opt: KeyframeAnimationOptions = {}
): Animation | null {
  if (reduceMotion || !node || !node.animate) return null;
  return node.animate(frames, { duration: 380, easing: EASE, fill: 'backwards', ...opt });
}
