import { useEffect, useRef, useState } from 'react';
import { IconSprite } from './components/Icon';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ChatHeader from './components/ChatHeader';
import Hero from './components/Hero';
import Thread from './components/Thread';
import Composer from './components/Composer';
import { initialConversations, newMsgId } from './data/conversations.jsx';
import { sendMessage } from './api';

const shorten = (text) => text.slice(0, 28) + (text.length > 28 ? '…' : '');

export default function App() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(1);
  const [busy, setBusy] = useState(false);
  const [isBn, setIsBn] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const nextConvId = useRef(5);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const isWelcome = active.messages.length === 0;

  const update = (id, fn) => setConversations((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));

  const handleSend = async (text) => {
    const convId = active.id;
    setBusy(true);
    update(convId, (c) => ({
      ...c,
      title: c.custom && c.messages.length === 0 ? shorten(text) : c.title,
      messages: [...c.messages, { id: newMsgId(), role: 'user', text }],
    }));

    let reply;
    try {
      const r = await sendMessage(text, convId);
      reply = r.html
        ? { body: <div dangerouslySetInnerHTML={{ __html: r.html }} /> }
        : { text: r.text };
    } catch {
      reply = { text: 'Something went wrong while contacting the assistant. Please try again.' };
    }
    update(convId, (c) => ({ ...c, messages: [...c.messages, { id: newMsgId(), role: 'ai', ...reply }] }));
    setBusy(false);
  };

  const handleNew = () => {
    let c = conversations.find((x) => x.custom && x.messages.length === 0);
    if (!c) {
      c = { id: nextConvId.current++, title: 'New conversation', custom: true, messages: [] };
      setConversations((cs) => [c, ...cs]);
    }
    setActiveId(c.id);
    setDrawer(false);
    setFocusTick((t) => t + 1);
  };

  const handleSelect = (id) => {
    setActiveId(id);
    setDrawer(false);
  };

  const toggleLang = () => {
    const next = !isBn;
    setIsBn(next);
    document.dispatchEvent(new CustomEvent('nutrilens:lang', { detail: next ? 'bn' : 'en' }));
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setDrawer(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <IconSprite />
      <div className="app">
        <Sidebar conversations={conversations} activeId={active.id} open={drawer} onSelect={handleSelect} />

        <main className={`main ${isWelcome ? 'is-welcome' : 'is-chat'}`}>
          <TopBar isBn={isBn} onToggleLang={toggleLang} onNew={handleNew} onMenu={() => setDrawer(true)} />
          {!isWelcome && <ChatHeader />}
          {isWelcome && <Hero name="Albert" />}
          {!isWelcome && <Thread messages={active.messages} activeId={active.id} typing={busy} />}
          {isWelcome && <div className="tail" />}
          <Composer isWelcome={isWelcome} busy={busy} onSend={handleSend} focusTick={focusTick} />
        </main>
      </div>
      <div className={`scrim${drawer ? ' show' : ''}`} onClick={() => setDrawer(false)} />
    </>
  );
}
