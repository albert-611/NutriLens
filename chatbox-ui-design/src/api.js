/*
  INTEGRATION POINT
  Replace the body of sendMessage with your real backend call, for example:

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, conversationId }),
    });
    const data = await res.json();
    return { text: data.reply };

  It must resolve to { text } (plain text, blank line = new paragraph).
  Optional: { html } renders trusted or sanitized HTML instead.

  If window.NutriLens.send is defined (for example by a script tag in index.html),
  it is used first, so the original hook keeps working.
*/
export async function sendMessage(text, conversationId) {
  if (typeof window !== 'undefined' && window.NutriLens && window.NutriLens.send) {
    return window.NutriLens.send(text, conversationId);
  }
  return {
    text: 'Preview mode: no backend is connected yet. Edit src/api.js (sendMessage) to return { text } from your API.',
  };
}
