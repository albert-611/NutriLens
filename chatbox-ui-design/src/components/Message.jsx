import { useLayoutEffect, useRef } from 'react';
import { anim, UP } from '../lib/anim';

// Ids that have already played their entrance, so switching conversations or re-rendering never replays it.
const animated = new Set();

function PlainText({ text }) {
  return text.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>);
}

export default function Message({ message }) {
  const rowRef = useRef(null);
  const bubbleRef = useRef(null);
  const isUser = message.role === 'user';

  useLayoutEffect(() => {
    if (animated.has(message.id)) return;
    animated.add(message.id);
    anim(
      rowRef.current,
      [
        { opacity: 0, transform: 'translateY(16px) scale(.985)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 420 }
    );
    if (!isUser && bubbleRef.current) {
      // Paragraphs and list items of an AI reply reveal one after another.
      bubbleRef.current.querySelectorAll('p,li').forEach((node, k) => {
        anim(node, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], {
          delay: 140 + k * 90,
          duration: 400,
        });
      });
    }
  }, [message.id, isUser]);

  let content;
  if (isUser) content = message.text;
  else if (message.body) content = message.body;
  else content = <PlainText text={message.text || ''} />;

  return (
    <div ref={rowRef} className={`row${isUser ? ' user-row' : ''}`} data-mid={message.id}>
      <div ref={bubbleRef} className="bubble">
        {content}
      </div>
    </div>
  );
}

export function TypingRow() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    anim(ref.current, UP, { duration: 300 });
  }, []);
  return (
    <div className="row typing-row" ref={ref}>
      <div className="bubble">
        <span className="typing" aria-label="NutriLens AI is typing">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
