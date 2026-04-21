import { apexWrap, apexError, apexThinking } from './apexWrap.js';
import { askAI } from './ai.js';
import pkg from 'whatsapp-web.js';

const { MessageMedia } = pkg;
const BASE = 'https://apis.davidcyril.name.ng';

async function apiFetch(endpoint) {
  const res = await fetch(`${BASE}${endpoint}`);
  const json = await res.json();
  if (!json.success) throw new Error('no result');
  return json;
}

export const commands = ['.rizz', '.truth', '.dare', '.ship', '.rate', '.flipcoin', '.quote', '.8ball', '.pickupline', '.fact', '.couplepp'];

export async function handle(msg, body, client) {

  // .rizz
  if (body === '.rizz' || body === '.pickupline') {
    await msg.react('😏');
    await client.sendMessage((msg._chatId || msg.from), apexThinking('summoning rizz...'));
    try {
      const line = await askAI('Give me one short smooth pickup line. Just the line, no intro.');
      await client.sendMessage((msg._chatId || msg.from), apexWrap(`😏 ${line}`));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError());
    }
    return;
  }

  // .truth
  if (body === '.truth') {
    await msg.react('👀');
    await client.sendMessage((msg._chatId || msg.from), apexThinking());
    try {
      const truth = await askAI('Give me one fun truth question for a party game. Just the question, no intro.');
      await client.sendMessage((msg._chatId || msg.from), apexWrap(`👀 *Truth:*\n${truth}`));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError());
    }
    return;
  }

  // .dare
  if (body === '.dare') {
    await msg.react('😈');
    await client.sendMessage((msg._chatId || msg.from), apexThinking());
    try {
      const dare = await askAI('Give me one fun dare challenge for a party game. Keep it clean and funny. Just the dare, no intro.');
      await client.sendMessage((msg._chatId || msg.from), apexWrap(`😈 *Dare:*\n${dare}`));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError());
    }
    return;
  }

  // .fact
  if (body === '.fact') {
    await msg.react('🧠');
    await client.sendMessage((msg._chatId || msg.from), apexThinking('pulling a fact...'));
    try {
      const fact = await askAI('Give me one interesting random fact. Just the fact, no intro.');
      await client.sendMessage((msg._chatId || msg.from), apexWrap(`🧠 *Random Fact:*\n${fact}`));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError());
    }
    return;
  }

  // .couplepp
  if (body === '.couplepp') {
    await msg.react('💑');
    try {
      const data = await apiFetch('/couplepp');
      const male = await fetch(data.male);
      const maleBuf = Buffer.from(await male.arrayBuffer());
      const female = await fetch(data.female);
      const femaleBuf = Buffer.from(await female.arrayBuffer());
      await client.sendMessage((msg._chatId || msg.from), new MessageMedia('image/jpeg', maleBuf.toString('base64'), 'couple_male.jpg'), { caption: apexWrap('💑 *Couple PP — His*') });
      await client.sendMessage((msg._chatId || msg.from), new MessageMedia('image/jpeg', femaleBuf.toString('base64'), 'couple_female.jpg'), { caption: apexWrap('💑 *Couple PP — Hers*') });
      await msg.react('✅');
    } catch { await client.sendMessage((msg._chatId || msg.from), apexError('could not get couple pictures')); }
    return;
  }

  // .ship <name1> & <name2>
  if (body.startsWith('.ship ')) {
    await msg.react('💘');
    const names = body.slice(6).trim();
    if (!names) {
      await client.sendMessage((msg._chatId || msg.from), apexError('usage: .ship Name1 & Name2'));
      return;
    }
    const score = Math.floor(Math.random() * 101);
    const emoji = score >= 80 ? '🔥' : score >= 50 ? '💕' : score >= 30 ? '😬' : '💔';
    await client.sendMessage((msg._chatId || msg.from), apexWrap(
      `💘 *Ship Score*\n\n${names}\n\n${emoji} *${score}%* compatible`
    ));
    return;
  }

  // .rate <anything>
  if (body.startsWith('.rate ')) {
    await msg.react('⭐');
    const thing = body.slice(6).trim();
    if (!thing) return;
    const score = Math.floor(Math.random() * 11);
    const bar = '█'.repeat(score) + '░'.repeat(10 - score);
    await client.sendMessage((msg._chatId || msg.from), apexWrap(
      `⭐ *Rating: ${thing}*\n\n${bar}\n*${score}/10*`
    ));
    return;
  }

  // .flipcoin
  if (body === '.flipcoin') {
    await msg.react('🪙');
    const result = Math.random() < 0.5 ? 'Heads 🟡' : 'Tails ⚪';
    await client.sendMessage((msg._chatId || msg.from), apexWrap(`🪙 *Coin Flip*\n\n${result}`));
    return;
  }

  // .quote
  if (body === '.quote') {
    await msg.react('💬');
    await client.sendMessage((msg._chatId || msg.from), apexThinking('finding a quote...'));
    try {
      const quote = await askAI('Give me one short powerful motivational quote with the author name. Format: "quote" — Author');
      await client.sendMessage((msg._chatId || msg.from), apexWrap(`💬 ${quote}`));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError());
    }
    return;
  }

  // .8ball <question>
  if (body.startsWith('.8ball ')) {
    await msg.react('🎱');
    const responses = [
      'It is certain 🟢', 'Definitely yes 🟢', 'Without a doubt 🟢',
      'Yes, for sure 🟢', 'Most likely 🟢', 'Signs point to yes 🟡',
      'Ask again later 🟡', 'Cannot predict now 🟡', 'Don\'t count on it 🔴',
      'My sources say no 🔴', 'Very doubtful 🔴', 'Absolutely not 🔴'
    ];
    const answer = responses[Math.floor(Math.random() * responses.length)];
    const question = body.slice(7).trim();
    await client.sendMessage((msg._chatId || msg.from), apexWrap(`🎱 *${question}*\n\n${answer}`));
    return;
  }
}
