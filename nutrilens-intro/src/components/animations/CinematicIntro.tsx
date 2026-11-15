import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { completeIntro, isIntroPending, releaseIntroGate } from '../../lib/introGate';

/**
 * NutriLens — "Beyond the Lens"
 *
 * Deep forest-green screen, the word "NutriLens" centred in white, then the
 * camera dives into the word. The green sheet is a mask with the letters cut
 * out of it, so the already-rendered landing page shows *through* the letters
 * as they swell past the viewport edges — one continuous move, no cross-fade.
 *
 * Layers (bottom → top, all inside one fixed overlay):
 *   1. white "veil"  – what the letters look like at first (reads as white type);
 *                      fades out during the zoom to expose the page.
 *   2. green sheet   – #071A14, SVG-masked with the NutriLens glyphs.
 *
 * One GSAP master timeline drives everything. Theme-independent by design.
 */

const BG = '#071A14';
const MAX_FONT_WAIT = 1500; // ms – never hold the intro hostage to a slow font
const MAX_ASSET_WAIT = 1200; // ms – cap on waiting for hero images
const FAILSAFE_MS = 7000; // hard stop: the page must never stay locked
const WORD = 'NutriLens';
const FOCUS_CHAR_INDEX = 5; // the "L": a heavy vertical stem near the word's centre

interface Geometry {
  W: number;
  H: number;
  wx: number; // word centre (text-local)
  fx: number; // zoom focus (text-local, centre of the L stem)
  wy: number; // vertical centre of the cap-height band (text-local)
  lnS: number; // ln(final scale)
}

/** Rasterise one glyph and read its stem + cap height in em units (font-agnostic). */
const measureGlyphEm = (family: string, weight: string) => {
  const fallback = { stemStart: 0.09, stemWidth: 0.16, cap: 0.72 };
  try {
    const size = 400;
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return fallback;
    ctx.font = `${weight} ${size}px ${family}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#000';
    const x0 = size * 0.5;
    const y0 = size * 1.4;

    const cap = ctx.measureText('N').actualBoundingBoxAscent / size || fallback.cap;

    ctx.fillText(WORD[FOCUS_CHAR_INDEX], x0, y0);
    const row = Math.round(y0 - cap * size * 0.5);
    const data = ctx.getImageData(0, row, canvas.width, 1).data;
    let a = -1;
    let b = -1;
    for (let x = 0; x < canvas.width; x++) {
      const filled = data[x * 4 + 3] > 128;
      if (filled && a < 0) a = x;
      if (!filled && a >= 0) {
        b = x;
        break;
      }
    }
    if (a < 0 || b <= a) return { ...fallback, cap };
    return { stemStart: (a - x0) / size, stemWidth: (b - a) / size, cap };
  } catch {
    return fallback;
  }
};

const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T | void> =>
  Promise.race([p, new Promise<void>((resolve) => window.setTimeout(resolve, ms))]);

const loadFonts = (): Promise<unknown> => {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  return withTimeout(
    Promise.all([
      document.fonts.load('700 1em "Plus Jakarta Sans"'),
      document.fonts.load('800 1em "Plus Jakarta Sans"'),
    ]).catch(() => undefined),
    MAX_FONT_WAIT
  );
};

/** Resolve when the hero's images are decoded, or after a short cap. */
const heroAssetsReady = (): Promise<unknown> => {
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('#home img'));
  const pending = imgs
    .filter((img) => !img.complete || img.naturalWidth === 0)
    .map((img) => (img.decode ? img.decode().catch(() => undefined) : Promise.resolve()));
  if (pending.length === 0) return Promise.resolve();
  return withTimeout(Promise.all(pending), MAX_ASSET_WAIT);
};

const lockPage = () => {
  document.documentElement.classList.add('nl-intro-lock');
  document.documentElement.classList.remove('nl-intro-boot');
  document.getElementById('root')?.setAttribute('inert', '');
};

const unlockPage = () => {
  document.documentElement.classList.remove('nl-intro-lock', 'nl-intro-boot');
  document.getElementById('root')?.removeAttribute('inert');
};

export const CinematicIntro: React.FC = () => {
  const [active, setActive] = useState<boolean>(() => isIntroPending());
  const rootRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const mountedRef = useRef(false);
  const maskId = `nl-intro-mask-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  // Lock scrolling / interaction before the first paint, release on teardown.
  useLayoutEffect(() => {
    if (!active) {
      unlockPage();
      return undefined;
    }
    lockPage();
    return () => unlockPage();
  }, [active]);

  useEffect(() => {
    if (!active) return undefined;
    mountedRef.current = true;

    let cancelled = false;
    let ctx: gsap.Context | null = null;
    let resizeRaf = 0;

    const state = { s0: 0.75, p: 0 };
    let geom: Geometry | null = null;

    const measure = () => {
      const root = rootRef.current;
      const text = textRef.current;
      if (!root || !text) return;
      const W = root.clientWidth;
      const H = root.clientHeight;
      const cs = getComputedStyle(text);
      const fontPx = parseFloat(cs.fontSize) || 96;
      const { stemStart, stemWidth, cap } = measureGlyphEm(cs.fontFamily, cs.fontWeight);

      const len = text.getComputedTextLength();
      let charX = len * 0.55;
      try {
        charX = text.getStartPositionOfChar(FOCUS_CHAR_INDEX).x;
      } catch {
        /* fall back to the estimate above */
      }

      const capPx = cap * fontPx;
      const stemPx = Math.max(1, stemWidth * fontPx);
      // Scale at which the L stem alone covers the whole viewport (+12% safety),
      // never less than 35 so the zoom always reads as dramatic.
      const needed = Math.max((W * 1.12) / stemPx, (H * 1.12) / Math.max(1, capPx));
      const S = Math.min(Math.max(needed, 35), 600);

      geom = {
        W,
        H,
        wx: len / 2,
        wy: -capPx / 2,
        fx: charX + (stemStart + stemWidth / 2) * fontPx,
        lnS: Math.log(S),
      };
    };

    const render = () => {
      const g = groupRef.current;
      if (!g || !geom) return;
      const { W, H, wx, wy, fx, lnS } = geom;
      const s = state.s0 * Math.exp(state.p * lnS);
      // The pivot glides from the word's centre to the centre of the L stem, so
      // the move starts as a pure centre zoom and lands inside solid letter.
      const px = wx + (fx - wx) * state.p;
      g.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${s}) translate(${-px} ${-wy})`);
    };

    const finish = () => {
      if (!mountedRef.current) return;
      completeIntro(); // opens the gate (no-op if already open) and marks done
      unlockPage();
      ScrollTrigger.refresh();
      setActive(false);
    };

    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        measure();
        render();
      });
    };

    const failsafe = window.setTimeout(finish, FAILSAFE_MS);

    const start = async () => {
      await loadFonts();
      if (cancelled || !rootRef.current) return;

      measure();
      render();
      window.addEventListener('resize', onResize);

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ paused: true, onComplete: finish });

        // STAGE 1 — the word appears, centred (0 → 0.45s)
        tl.fromTo(state, { s0: 0.75 }, { s0: 1, duration: 0.45, ease: 'power2.out', onUpdate: render }, 0)
          .fromTo(textRef.current, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' }, 0);

        // Short beat, then hold only if the hero's images still need a moment.
        tl.addPause(0.6, () => {
          heroAssetsReady().then(() => {
            if (!cancelled) tl.play();
          });
        });

        // STAGE 2 — dive into the word. Exponential scale = constant perceived speed;
        // the ease makes it accelerate toward the viewer (0.6 → 2.0s).
        tl.fromTo(
          state,
          { p: 0 },
          { p: 1, duration: 1.4, ease: 'power1.in', onUpdate: render },
          0.6
        );

        // STAGE 3 — the page shows through the swelling letters (~1.35 → 2.0s).
        // The hero's own entrance starts at the same instant.
        tl.add(() => releaseIntroGate(), 1.35);
        tl.to(veilRef.current, { opacity: 0, duration: 0.65, ease: 'power1.inOut' }, 1.35);

        // STAGE 4 — clean completion, overlay removed.
        tl.add(finish, 2.05);

        tl.play();
      }, rootRef);
    };

    start();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      window.clearTimeout(failsafe);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener('resize', onResize);
      ctx?.revert();
      // React StrictMode re-runs this effect immediately; only treat it as a real
      // teardown if we are still unmounted after the current task.
      window.setTimeout(() => {
        if (!mountedRef.current) {
          completeIntro();
          unlockPage();
        }
      }, 0);
    };
  }, [active]);

  if (!active) return null;

  return createPortal(
    <div ref={rootRef} className="nl-intro" aria-hidden="true" data-nl-intro>
      <div
        ref={veilRef}
        style={{ position: 'absolute', inset: 0, background: '#ffffff', willChange: 'opacity' }}
      />
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, display: 'block' }}
        focusable="false"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
            <g ref={groupRef}>
              <text
                ref={textRef}
                x="0"
                y="0"
                fill="#000"
                className="font-sans font-bold"
                style={{
                  fontSize: 'clamp(2.75rem, 12.5vw, 7rem)',
                  letterSpacing: '-0.02em',
                  opacity: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {WORD}
              </text>
            </g>
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill={BG} mask={`url(#${maskId})`} />
      </svg>
    </div>,
    document.body
  );
};

export default CinematicIntro;
