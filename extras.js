import { apexWrap, apexThinking, apexError } from './apexWrap.js';
import { askAI } from './ai.js';
import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;

const DAVID = 'https://apis.davidcyril.name.ng';

export const commands = [
  '.qr', '.shorturl', '.define', '.time',
  '.wyr', '.trivia', '.compliment', '.insult', '.ascii',
  '.poll'
];

export async function handle(msg, body, client) {
  const chatId = msg._chatId || msg.from;

  // .qr <text or url>
  if (body.startsWith('.qr ')) {
    const text = body.slice(4).trim();
    await msg.react('🔲');
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(text)}`;
      const media = await MessageMedia.fromUrl(url, { unsafeMime: true });
      await client.sendMessage(chatId, media, { caption: apexWrap(`🔲 *QR Code*\n\n${text}`) });
    } catch {
      await client.sendMessage(chatId, apexError('could not generate QR code'));
    }
    return;
  }

  // .shorturl <url>
  if (body.startsWith('.shorturl ')) {
    const url = body.slice(10).trim();
    await msg.react('🔗');
    await client.sendMessage(chatId, apexThinking('shortening...'));
    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error('failed');
      const short = await res.text();
      if (!short.startsWith('http')) throw new Error('invalid response');
      await client.sendMessage(chatId, apexWrap(`🔗 *Short URL*\n\n${short}`));
    } catch {
      await client.sendMessage(chatId, apexError('could not shorten URL\nmake sure it starts with https://'));
    }
    return;
  }

  // .define <word>
  if (body.startsWith('.define ')) {
    const word = body.slice(8).trim();
    await msg.react('📖');
    await client.sendMessage(chatId, apexThinking('looking up...'));
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      const entry = data[0];
      const meanings = entry.meanings.slice(0, 2).map(m => {
        const def = m.definitions[0].definition;
        const example = m.definitions[0].example ? `\n_"${m.definitions[0].example}"_` : '';
        return `*${m.partOfSpeech}*\n${def}${example}`;
      }).join('\n\n');
      await client.sendMessage(chatId, apexWrap(`📖 *${entry.word}*\n\n${meanings}`));
    } catch {
      await client.sendMessage(chatId, apexError(`word "${word}" not found`));
    }
    return;
  }

  // .time <city>
  if (body.startsWith('.time ')) {
    const city = body.slice(6).trim();
    await msg.react('🕐');
    try {
      const res = await fetch(`https://timeapi.io/api/time/current/zone?timeZone=${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      if (!data?.dateTime) throw new Error('not found');
      const dt = new Date(data.dateTime);
      const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      await client.sendMessage(chatId, apexWrap(`🕐 *Time in ${city}*\n\n🕰️ *${timeStr}*\n📅 ${dateStr}`));
    } catch {
      // fallback to AI
      try {
        const result = await askAI(`What is the current time and date in ${city}? Reply in format: Time: HH:MM AM/PM, Date: Day, Month DD YYYY`);
        await client.sendMessage(chatId, apexWrap(`🕐 *Time in ${city}*\n\n${result}`));
      } catch {
        await client.sendMessage(chatId, apexError(`timezone not found for "${city}"\nexample: .time Asia/Karachi`));
      }
    }
    return;
  }

  // .wyr — Would You Rather
  if (body === '.wyr') {
    await msg.react('🤔');
    await client.sendMessage(chatId, apexThinking('cooking a dilemma...'));
    try {
      const result = await askAI('Give me one fun "Would You Rather" question with two options. Format exactly like this:\n🤔 *Would you rather...*\n\n🅰️ Option one here\n\n*OR*\n\n🅱️ Option two here\n\nJust the question, nothing else.');
      await client.sendMessage(chatId, apexWrap(result));
    } catch {
      await client.sendMessage(chatId, apexError('could not generate question'));
    }
    return;
  }

  // .trivia
  if (body === '.trivia') {
    await msg.react('🧠');
    await client.sendMessage(chatId, apexThinking('loading trivia...'));
    try {
      const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
      const data = await res.json();
      const q = data?.results?.[0];
      if (!q) throw new Error('no question');
      const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      const question = decode(q.question);
      const correct = decode(q.correct_answer);
      const wrong = q.incorrect_answers.map(decode);
      const all = [...wrong, correct].sort(() => Math.random() - 0.5);
      const options = all.map((o, i) => `${['🅰️','🅱️','🆎','🆑'][i]} ${o}`).join('\n');
      const correctLetter = ['🅰️','🅱️','🆎','🆑'][all.indexOf(correct)];
      await client.sendMessage(chatId, apexWrap(
        `🧠 *Trivia — ${decode(q.category)}*\n\n${question}\n\n${options}\n\n||Answer: ${correctLetter} ${correct}||`
      ));
    } catch {
      try {
        const result = await askAI('Give me a fun trivia question with 4 options (A, B, C, D) and mark the correct answer at the end. Keep it short.');
        await client.sendMessage(chatId, apexWrap(`🧠 *Trivia*\n\n${result}`));
      } catch {
        await client.sendMessage(chatId, apexError('could not load trivia'));
      }
    }
    return;
  }

  // .compliment
  if (body === '.compliment') {
    await msg.react('💝');
    try {
      const result = await askAI('Give me one short genuine compliment. Just the compliment, no intro.');
      await client.sendMessage(chatId, apexWrap(`💝 ${result}`));
    } catch {
      await client.sendMessage(chatId, apexError('compliment machine broke 😅'));
    }
    return;
  }

  // .insult
  if (body === '.insult') {
    await msg.react('💀');
    try {
      const result = await askAI('Give me one savage but funny playful insult. Keep it witty, not mean. Just the insult, no intro.');
      await client.sendMessage(chatId, apexWrap(`💀 ${result}`));
    } catch {
      await client.sendMessage(chatId, apexError('insult machine broke 😅'));
    }
    return;
  }

  // .ascii <text>
  if (body.startsWith('.ascii ')) {
    const text = body.slice(7).trim().slice(0, 20);
    await msg.react('🔤');
    await client.sendMessage(chatId, apexThinking('generating...'));
    try {
      const res = await fetch(`https://artii.herokuapp.com/make?text=${encodeURIComponent(text)}&font=banner`);
      if (!res.ok) throw new Error('failed');
      const ascii = await res.text();
      await client.sendMessage(chatId, apexWrap(`🔤 *ASCII Art*\n\n\`\`\`${ascii}\`\`\``));
    } catch {
      try {
        const result = await askAI(`Generate ASCII art text for the word "${text}" using simple characters. Just the ASCII art, no explanation.`);
        await client.sendMessage(chatId, apexWrap(`🔤 *ASCII Art*\n\n\`\`\`${result}\`\`\``));
      } catch {
        await client.sendMessage(chatId, apexError('could not generate ASCII art'));
      }
    }
    return;
  }

  // .poll <question> | <opt1> | <opt2> [| opt3...]
  if (body.startsWith('.poll ')) {
    const input = body.slice(6).trim();
    const parts = input.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length < 3) {
      await client.sendMessage(chatId, apexError('usage: .poll <question> | <option1> | <option2>\nexample: .poll Best fruit? | Mango | Apple | Banana'));
      return;
    }
    const question = parts[0];
    const options = parts.slice(1);
    const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    const optionText = options.map((o, i) => `${emojis[i]} ${o}`).join('\n');
    await msg.react('📊');
    await client.sendMessage(chatId, apexWrap(
      `📊 *POLL*\n\n❓ ${question}\n\n${optionText}\n\n_React with the number to vote!_`
    ));
    return;
  }
}
