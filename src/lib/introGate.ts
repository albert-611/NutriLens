import { useSyncExternalStore } from 'react';

/**
 * Tiny shared gate that lets the cinematic intro and the landing page's own
 * entrance animations agree on *when* the page is allowed to start animating.
 *
 * - The intro only plays on a fresh load of "/" (the landing entry route) and
 *   never when the user prefers reduced motion.
 * - When the intro is not going to play, the gate is open from the start, so
 *   every existing animation behaves exactly as it did before.
 */
const introEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (window.location.pathname !== '/') return false;
  try {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return true;
  }
};

let released = !introEnabled();
let completed = released;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((fn) => fn());

/** True until the intro has fully finished (or was never going to play). */
export const isIntroPending = (): boolean => !completed;

/** True while page entrance animations must still wait for the reveal. */
export const isIntroGateClosed = (): boolean => !released;

/** Called by the intro at the moment the landing page starts to show through. */
export const releaseIntroGate = (): void => {
  if (released) return;
  released = true;
  emit();
};

/** Called once the intro has finished (or been aborted). Idempotent. */
export const completeIntro = (): void => {
  completed = true;
  releaseIntroGate();
};

/** Run `cb` once, as soon as the gate opens (immediately if already open). */
export const onIntroRelease = (cb: () => void): (() => void) => {
  if (released) {
    cb();
    return () => {};
  }
  const handler = () => {
    if (!released) return;
    listeners.delete(handler);
    cb();
  };
  listeners.add(handler);
  return () => listeners.delete(handler);
};

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** React hook: false while the intro is still hiding the page, true afterwards. */
export const useIntroReleased = (): boolean =>
  useSyncExternalStore(subscribe, () => released, () => true);
