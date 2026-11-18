import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { anim, EASE, reduceMotion } from '../lib/anim';

const CHIPS = [
  { icon: 'db', label: "Today's intake", prompt: 'What food did I intake today?' },
  { icon: 'shield', label: 'Foods to avoid', prompt: 'What foods should I avoid?' },
  { icon: 'spark', label: 'Meal ideas', prompt: 'Suggest a Bangladeshi meal within my budget' },
];
const MIN_H = 24;
const MAX_H = 160;

export default function Composer({ isWelcome, busy, onSend, focusTick }) {
  const [value, setValue] = useState('');
  const formRef = useRef(null);
  const taRef = useRef(null);
  const sendRef = useRef(null);
  const lastTop = useRef(null);
  const prevWelcome = useRef(isWelcome);

  // Entrance on first paint.
  useEffect(() => {
    anim(formRef.current, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], {
      duration: 520,
      delay: 180,
    });
  }, []);

  // Textarea height eases between sizes instead of jumping.
  useLayoutEffect(() => {
    const t = taRef.current;
    const prev = t.offsetHeight;
    t.style.transition = 'none';
    t.style.height = 'auto';
    const next = Math.max(MIN_H, Math.min(t.scrollHeight, MAX_H));
    t.style.height = `${prev}px`;
    void t.offsetHeight; // force reflow so the next change transitions
    t.style.transition = reduceMotion ? 'none' : `height .18s ${EASE}`;
    t.style.height = `${next}px`;
  }, [value]);

  // FLIP: the composer glides between its centered (welcome) and bottom (chat) positions.
  useLayoutEffect(() => {
    const top = formRef.current.getBoundingClientRect().top;
    if (prevWelcome.current !== isWelcome && lastTop.current != null) {
      const d = lastTop.current - top;
      if (d) anim(formRef.current, [{ transform: `translateY(${d}px)` }, { transform: 'none' }], { duration: 560, fill: 'none' });
    }
    prevWelcome.current = isWelcome;
    lastTop.current = top;
  });

  useEffect(() => {
    const onResize = () => {
      if (formRef.current) lastTop.current = formRef.current.getBoundingClientRect().top;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // "New Chat" puts the cursor back in the box.
  useEffect(() => {
    if (focusTick) taRef.current?.focus();
  }, [focusTick]);

  const submit = () => {
    const text = value.trim();
    if (!text || busy) return;
    anim(sendRef.current, [{ transform: 'scale(1)' }, { transform: 'scale(.82)' }, { transform: 'scale(1)' }], {
      duration: 260,
      fill: 'none',
    });
    setValue('');
    onSend(text);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const useChip = (e, prompt) => {
    anim(e.currentTarget, [{ transform: 'scale(1)' }, { transform: 'scale(.93)' }, { transform: 'scale(1)' }], {
      duration: 200,
      fill: 'none',
    });
    setValue(prompt);
    taRef.current?.focus();
  };

  return (
    <div className="composer-wrap">
      <form
        className="composer"
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="field">
          <Icon name="spark" />
          <textarea
            ref={taRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask NutriLens AI about your meals, allergies, or nutrition targets…"
            aria-label="Message"
          />
        </div>
        <div className="tools">
          <button type="button" className="chip icon-only" aria-label="Attach">
            <Icon name="clip" />
          </button>
          {CHIPS.map((c) => (
            <button key={c.label} type="button" className="chip" onClick={(e) => useChip(e, c.prompt)}>
              <Icon name={c.icon} />
              {c.label}
            </button>
          ))}
          <button type="submit" ref={sendRef} className={`send${value.trim() ? ' ready' : ''}`} aria-label="Send">
            <Icon name="send" />
          </button>
        </div>
      </form>
    </div>
  );
}
