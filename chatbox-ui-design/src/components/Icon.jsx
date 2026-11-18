export function Icon({ name, className = '', style }) {
  return (
    <svg className={`ico ${className}`.trim()} style={style} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}

// Rendered once in App. Every <Icon name="..."/> references one of these symbols.
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="i-chat" viewBox="0 0 24 24">
        <path d="M21 12a8 8 0 0 1-11.7 7L4 20l1.2-4.6A8 8 0 1 1 21 12Z" />
      </symbol>
      <symbol id="i-search" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4-4" />
      </symbol>
      <symbol id="i-plus" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </symbol>
      <symbol id="i-clip" viewBox="0 0 24 24">
        <path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4L14 7.5" />
      </symbol>
      <symbol id="i-send" viewBox="0 0 24 24">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </symbol>
      <symbol id="i-spark" viewBox="0 0 24 24">
        <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3ZM18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
      </symbol>
      <symbol id="i-shield" viewBox="0 0 24 24">
        <path d="M12 3 5 6v5.5c0 4.3 2.9 7.6 7 9.5 4.1-1.9 7-5.2 7-9.5V6l-7-3Z" />
        <path d="m9 12 2.2 2.2L15 10.4" />
      </symbol>
      <symbol id="i-chev" viewBox="0 0 24 24">
        <path d="m7 10 5 5 5-5" />
      </symbol>
      <symbol id="i-menu" viewBox="0 0 24 24">
        <path d="M4 7h16M4 12h16M4 17h10" />
      </symbol>
      <symbol id="i-lang" viewBox="0 0 24 24">
        <path d="M4 6h9M8.5 4v2M6 6c.5 3 2.5 5.5 5.5 7M12 6c-.5 3-3 6-7 8M13 20l4-9 4 9M14.5 17h5" />
      </symbol>
      <symbol id="i-info" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </symbol>
      <symbol id="i-db" viewBox="0 0 24 24">
        <ellipse cx="12" cy="6" rx="7" ry="3" />
        <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
      </symbol>
    </svg>
  );
}
