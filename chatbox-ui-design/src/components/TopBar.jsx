import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { anim } from '../lib/anim';

export default function TopBar({ isBn, onToggleLang, onNew, onMenu }) {
  const ref = useRef(null);

  useEffect(() => {
    anim(ref.current, [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 450 });
  }, []);

  return (
    <div className="topbar" ref={ref}>
      <button className="menu" type="button" aria-label="Open conversations" onClick={onMenu}>
        <Icon name="menu" />
      </button>

      <button className="pill btn" type="button">
        <span className="dot" />
        Gemma 4 26B <Icon name="chev" />
      </button>

      <div className="spacer" />

      <button className="pill btn" type="button" onClick={onToggleLang}>
        <Icon name="lang" />
        <span>{isBn ? 'বাং' : 'EN'}</span>
      </button>

      <button className="pill hide-sm" type="button">
        <Icon name="info" />
        Active Profile Context
      </button>

      <button className="dark-btn" type="button" onClick={onNew}>
        <Icon name="plus" />
        New Chat
      </button>

      <div className="avatar sm">A</div>
    </div>
  );
}
