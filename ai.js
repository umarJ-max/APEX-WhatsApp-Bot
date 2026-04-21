import { apexWrap, apexThinking, apexError } from './apexWrap.js';

const AI_BASE_URL = 'https://apis.davidcyril.name.ng/ai/gemini?text=';

async function askAI(prompt) {
  const url = AI_BASE_URL + encodeURIComponent(prompt);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (!data.success || !data.message) throw new Error('Bad API response');
  return data.message
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    .replace(/#{1,3} (.*)/g, '*$1*')
    .replace(/`{3}[\s\S]*?`{3}/g, (m) =>
      m.replace(/`{3}\w*\n?/, '').replace(/\n?`{3}/, '').trim()
    )
    .trim();
}

export { askAI };

export const commands = ['.ai', '.joke', '.fact', '.roast'];

export async function handle(msg, body, client) {

  // .ai <question>
  if (body.startsWith('.ai ')) {
    const prompt = body.slice(4).trim();
    if (!prompt) return;
    await msg.react('🧠');
    await client.sendMessage((msg._chatId || msg.from), apexThinking());
    try {
      const response = await askAI(prompt);
      await client.sendMessage((msg._chatId || msg.from), apexWrap(response));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError());
    }
    return;
  }

  // .joke
  if (body === '.joke') {
    await msg.react('😂');
    await client.sendMessage((msg._chatId || msg.from), apexThinking('cooking a joke...'));
    try {
      const joke = await askAI('Tell me one short funny joke. Just the joke, no intro.');
      await client.sendMessage((msg._chatId || msg.from), apexWrap(`😂 ${joke}`));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError('joke machine broke, try again 😅'));
    }
    return;
  }

  // .fact
  if (body === '.fact') {
    await msg.react('🤯');
    await client.sendMessage((msg._chatId || msg.from), apexThinking('pulling a fact...'));
    try {
      const fact = await askAI('Give me one random mind-blowing fact. Just the fact, no intro.');
      await client.sendMessage((msg._chatId || msg.from), apexWrap(`🤯 ${fact}`));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError('fact machine broke, try again 😅'));
    }
    return;
  }

  // .roast
  if (body === '.roast') {
    await msg.react('💀');
    let target = 'someone';
    if (msg.hasQuotedMsg) {
      const quoted = await msg.getQuotedMessage();
      target = quoted.body ? `someone who said: "${quoted.body.slice(0, 100)}"` : 'someone';
    }
    await client.sendMessage((msg._chatId || msg.from), apexThinking('loading disrespect...'));
    try {
      const roast = await askAI(`Give me a savage but funny roast for ${target}. Keep it short and witty. Just the roast.`);
      await client.sendMessage((msg._chatId || msg.from), apexWrap(`💀 ${roast}`));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError('roast machine broke 😅'));
    }
    return;
  }
}
