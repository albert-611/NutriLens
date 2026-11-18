import { useEffect, useMemo, useRef } from 'react';
import { anim, UP } from '../lib/anim';

function greeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 17) return 'Good Afternoon';
  if (h >= 17 && h < 21) return 'Good Evening';
  return 'Good Night';
}

export default function Hero({ name = 'Albert' }) {
  const orbRef = useRef(null);
  const titleRef = useRef(null);
  const greet = useMemo(greeting, []);

  // Orb pops in, then the greeting rises. Runs each time the welcome screen appears.
  useEffect(() => {
    anim(orbRef.current, [{ opacity: 0, transform: 'scale(.55)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 650 });
    anim(titleRef.current, UP, { duration: 560, delay: 140 });
  }, []);

  return (
    <section className="hero" aria-live="polite">
      <div className="orb" ref={orbRef} aria-hidden="true" />
      <h1 ref={titleRef}>
        {greet}, {name}
        <br />
        How Can I <em>Assist You Today?</em>
      </h1>
    </section>
  );
}
