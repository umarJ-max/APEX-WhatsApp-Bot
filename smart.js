import { apexWrap, apexThinking, apexError } from './apexWrap.js';
import { askAI } from './ai.js';
import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;

export const commands = ['.summarize', '.fix', '.currency', '.zodiac', '.wikipedia', '.wiki'];

export async function handle(msg, body, client) {
  const chatId = msg._chatId || msg.from;

  // .summarize — reply to a long message to summarize it
  if (body === '.summarize') {
    if (!msg.hasQuotedMsg) {
      await client.sendMessage(chatId, apexError('reply to a message to summarize it'));
      return;
    }
    await msg.react('📝');
    await client.sendMessage(chatId, apexThinking('summarizing...'));
    try {
      const quoted = await msg.getQuotedMessage();
      const text = quoted.body;
      if (!text || text.length < 50) {
        await client.sendMessage(chatId, apexError('message is too short to summarize'));
        return;
      }
      const result = await askAI(`Summarize this message in 2-3 short sentences. Be clear and concise:\n\n"${text}"`);
      await client.sendMessage(chatId, apexWrap(`📝 *Summary*\n\n${result}`));
    } catch {
      await client.sendMessage(chatId, apexError('could not summarize'));
    }
    return;
  }

  // .fix <text> — fix grammar and spelling
  if (body.startsWith('.fix ')) {
    const text = body.slice(5).trim();
    if (!text) {
      await client.sendMessage(chatId, apexError('usage: .fix <text>\nexample: .fix i are going to market'));
      return;
    }
    await msg.react('✏️');
    await client.sendMessage(chatId, apexThinking('fixing...'));
    try {
      const result = await askAI(`Fix the grammar and spelling of this text. Reply with ONLY the corrected text, nothing else:\n"${text}"`);
      await client.sendMessage(chatId, apexWrap(`✏️ *Fixed*\n\n${result}`));
    } catch {
      await client.sendMessage(chatId, apexError('could not fix text'));
    }
    return;
  }

  // .currency <amount> <from> <to>
  // example: .currency 100 usd pkr
  if (body.startsWith('.currency ')) {
    const parts = body.slice(10).trim().split(' ');
    if (parts.length < 3) {
      await client.sendMessage(chatId, apexError('usage: .currency <amount> <from> <to>\nexample: .currency 100 usd pkr'));
      return;
    }
    const amount = parseFloat(parts[0]);
    const from = parts[1].toUpperCase();
    const to = parts[2].toUpperCase();
    if (isNaN(amount)) {
      await client.sendMessage(chatId, apexError('invalid amount\nexample: .currency 100 usd pkr'));
      return;
    }
    await msg.react('💱');
    await client.sendMessage(chatId, apexThinking('fetching rate...'));
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      const converted = data?.rates?.[to];
      if (!converted) throw new Error('currency not found');
      await client.sendMessage(chatId, apexWrap(
        `💱 *Currency Conversion*\n\n` +
        `${amount} ${from} = *${converted.toFixed(2)} ${to}*\n` +
        `📅 Rate as of ${data.date}`
      ));
    } catch {
      // AI fallback
      try {
        const result = await askAI(`What is the current exchange rate? Convert ${amount} ${from} to ${to}. Give only the converted amount and rate, no extra text.`);
        await client.sendMessage(chatId, apexWrap(`💱 *Currency*\n\n${result}`));
      } catch {
        await client.sendMessage(chatId, apexError(`could not convert ${from} to ${to}\nmake sure currency codes are correct (USD, PKR, EUR...)`));
      }
    }
    return;
  }

  // .zodiac <sign>
  if (body.startsWith('.zodiac ')) {
    const sign = body.slice(8).trim().toLowerCase();
    const validSigns = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
    if (!validSigns.includes(sign)) {
      await client.sendMessage(chatId, apexError(`invalid sign\nvalid signs: ${validSigns.join(', ')}`));
      return;
    }
    await msg.react('⭐');
    await client.sendMessage(chatId, apexThinking('reading the stars...'));
    try {
      const result = await askAI(`Give me today's horoscope for ${sign}. Include: love, career, and general vibe. Keep it fun, short, and positive. Format nicely with emojis.`);
      await client.sendMessage(chatId, apexWrap(`⭐ *${sign.charAt(0).toUpperCase() + sign.slice(1)} Horoscope*\n\n${result}`));
    } catch {
      await client.sendMessage(chatId, apexError('could not fetch horoscope'));
    }
    return;
  }

  // .wikipedia <topic> or .wiki <topic>
  if (body.startsWith('.wikipedia ') || body.startsWith('.wiki ')) {
    const topic = body.startsWith('.wiki ') ? body.slice(6).trim() : body.slice(11).trim();
    if (!topic) {
      await client.sendMessage(chatId, apexError('usage: .wiki <topic>\nexample: .wiki Elon Musk'));
      return;
    }
    await msg.react('📚');
    await client.sendMessage(chatId, apexThinking('searching Wikipedia...'));
    try {
      // Wikipedia API — free, no key needed
      const searchRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
      if (!searchRes.ok) throw new Error('not found');
      const data = await searchRes.json();
      if (!data?.extract) throw new Error('no content');
      const extract = data.extract.length > 800
        ? data.extract.slice(0, 800) + '...'
        : data.extract;
      await client.sendMessage(chatId, apexWrap(
        `📚 *${data.title}*\n\n${extract}\n\n🔗 ${data.content_urls?.mobile?.page || ''}`
      ));
    } catch {
      // AI fallback
      try {
        const result = await askAI(`Give me a brief Wikipedia-style summary of "${topic}" in 3-4 sentences.`);
        await client.sendMessage(chatId, apexWrap(`📚 *${topic}*\n\n${result}`));
      } catch {
        await client.sendMessage(chatId, apexError(`could not find "${topic}" on Wikipedia`));
      }
    }
    return;
  }
}
