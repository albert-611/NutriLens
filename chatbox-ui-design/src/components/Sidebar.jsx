import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { anim } from '../lib/anim';

function ConversationItem({ conversation, active, index, animateIn, onSelect }) {
  const ref = useRef(null);

  // Items slide in one after another on first paint only.
  useEffect(() => {
    if (animateIn) {
      anim(ref.current, [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], {
        delay: index * 55,
        duration: 340,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      role="listitem"
      className="item"
      aria-current={active ? 'true' : 'false'}
      onClick={() => onSelect(conversation.id)}
    >
      <Icon name="chat" />
      <span>{conversation.title}</span>
    </button>
  );
}

export default function Sidebar({ conversations, activeId, open, onSelect }) {
  const [query, setQuery] = useState('');
  const firstPaint = useRef(true);
  useEffect(() => {
    firstPaint.current = false;
  }, []);

  const q = query.trim().toLowerCase();
  const visible = conversations.filter((c) => c.title.toLowerCase().includes(q));

  return (
    <aside className={`side${open ? ' open' : ''}`} aria-label="Conversations">
      <div className="brand">
        <div className="logo">
          <Icon name="spark" />
        </div>
        <div>
          <b>NutriLens</b>
          <small>Workspace</small>
        </div>
      </div>

      <label className="search">
        <Icon name="search" />
        <input
          type="search"
          placeholder="Search"
          aria-label="Search conversations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <div className="sect">
        <div className="label head">
          <Icon name="chat" />
          Conversations
        </div>
        <div className="label sub">Strictly Isolated &amp; Private</div>
        <div className="label">Today</div>
        <div role="list">
          {visible.map((c, i) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              index={i}
              active={c.id === activeId}
              animateIn={firstPaint.current}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
