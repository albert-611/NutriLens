import { useEffect, useRef } from 'react';
import Message, { TypingRow } from './Message';
import { anim, reduceMotion } from '../lib/anim';

export default function Thread({ messages, activeId, typing }) {
  const ref = useRef(null);
  const fadedFor = useRef(null);
  const scrolledFor = useRef(activeId);

  // Whole thread fades in when the user switches to another conversation.
  useEffect(() => {
    if (fadedFor.current !== null && fadedFor.current !== activeId) {
      anim(ref.current, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 340 });
    }
    fadedFor.current = activeId;
  }, [activeId]);

  // Scrolling: new AI reply -> show its start; user message or typing -> bottom; conversation switch -> bottom instantly.
  useEffect(() => {
    const t = ref.current;
    if (!t) return;
    const behavior = reduceMotion ? 'auto' : 'smooth';

    if (scrolledFor.current !== activeId) {
      scrolledFor.current = activeId;
      t.scrollTop = t.scrollHeight;
      return;
    }
    if (typing) {
      t.scrollTo({ top: t.scrollHeight, behavior });
      return;
    }
    const last = messages[messages.length - 1];
    if (!last) return;
    if (last.role === 'ai') {
      const row = t.querySelector(`[data-mid="${last.id}"]`);
      if (row) {
        const top = row.getBoundingClientRect().top - t.getBoundingClientRect().top + t.scrollTop - 8;
        t.scrollTo({ top, behavior });
        return;
      }
    }
    t.scrollTo({ top: t.scrollHeight, behavior });
  }, [messages.length, activeId, typing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="thread" ref={ref} aria-live="polite">
      {messages.map((m) => (
        <Message key={m.id} message={m} />
      ))}
      {typing && <TypingRow />}
    </section>
  );
}
