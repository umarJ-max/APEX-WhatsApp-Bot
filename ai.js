import { apexWrap, apexThinking, apexError } from './apexWrap.js';

const DAVID_URL = 'https://apis.davidcyril.name.ng/ai/gemini?text=';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Format AI response — strip markdown bold/headers to WhatsApp style
function formatResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    .replace(/#{1,3} (.*)/g, '*$1*')
    .replace(/`{3}[\s\S]*?`{3}/g, (m) =>
      m.replace(/`{3}\w*\n?/, '').replace(/\n?`{3}/, '').trim()
    )
    .trim();
}

// 1️⃣ David API
async function askDavid(prompt) {
  const res = await fetch(DAVID_URL + encodeURIComponent(prompt));
  if (!res.ok) throw new Error(`David error: ${res.status}`);
  const data = await res.json();
  if (!data.success || !data.message) throw new Error('David bad response');
  return formatResponse(data.message);
}

// 2️⃣ Groq API (free, fast — llama3)
async function askGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('No GROQ_API_KEY');
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    })
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq empty response');
  return formatResponse(text);
}

// 3️⃣ Gemini API (free tier fallback)
async function askGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('No GEMINI_API_KEY');
  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 500 }
    })
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini empty response');
  return formatResponse(text);
}

// Main askAI — tries David → Groq → Gemini
export async function askAI(prompt) {
  const providers = [
  { name: 'David', fn: askDavid },
  { name: 'Groq',  fn: askGroq  },
  { name: 'Gemini', fn: askGemini }
];
  let lastError;
  for (const { name, fn } of providers) {
    try {
      const result = await fn(prompt);
      if (name !== 'David') console.log(`  ℹ️  AI fallback used: ${name}`);
      return result;
    } catch (e) {
      console.log(`  ⚠️  ${name} failed: ${e.message}`);
      lastError = e;
    }
  }
  throw new Error('All AI providers failed: ' + lastError?.message);
}

export const commands = ['.ai', '.joke', '.fact', '.roast'];

export async function handle(msg, body, client) {
  const chatId = msg._chatId || msg.from;

  // .ai <question>
  if (body.startsWith('.ai ')) {
    const prompt = body.slice(4).trim();
    if (!prompt) return;
    await msg.react('🧠');
    await client.sendMessage(chatId, apexThinking());
    try {
      const response = await askAI(prompt);
      await client.sendMessage(chatId, apexWrap(response));
    } catch {
      await client.sendMessage(chatId, apexError());
    }
    return;
  }

  // .joke
  if (body === '.joke') {
    await msg.react('😂');
    await client.sendMessage(chatId, apexThinking('cooking a joke...'));
    try {
      const joke = await askAI('Tell me one short funny joke. Just the joke, no intro.');
      await client.sendMessage(chatId, apexWrap(`😂 ${joke}`));
    } catch {
      await client.sendMessage(chatId, apexError('joke machine broke, try again 😅'));
    }
    return;
  }

  // .fact
  if (body === '.fact') {
    await msg.react('🤯');
    await client.sendMessage(chatId, apexThinking('pulling a fact...'));
    try {
      const fact = await askAI('Give me one random mind-blowing fact. Just the fact, no intro.');
      await client.sendMessage(chatId, apexWrap(`🤯 ${fact}`));
    } catch {
      await client.sendMessage(chatId, apexError('fact machine broke, try again 😅'));
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
    await client.sendMessage(chatId, apexThinking('loading disrespect...'));
    try {
      const roast = await askAI(`Give me a savage but funny roast for ${target}. Keep it short and witty. Just the roast.`);
      await client.sendMessage(chatId, apexWrap(`💀 ${roast}`));
    } catch {
      await client.sendMessage(chatId, apexError('roast machine broke 😅'));
    }
    return;
  }
}
