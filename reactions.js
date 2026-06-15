import { apexWrap } from './apexWrap.js';
import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;

const REACTIONS = {
  '.pat':    { emoji: '🥺', text: 'pats', api: 'pat' },
  '.hug':    { emoji: '🤗', text: 'hugs', api: 'hug' },
  '.slap':   { emoji: '👋', text: 'slaps', api: 'slap' },
  '.bite':   { emoji: '😬', text: 'bites', api: 'bite' },
  '.poke':   { emoji: '👉', text: 'pokes', api: 'poke' },
  '.wave':   { emoji: '👋', text: 'waves at', api: 'wave' },
  '.wink':   { emoji: '😉', text: 'winks at', api: 'wink' },
  '.bonk':   { emoji: '🔨', text: 'bonks', api: 'bonk' },
  '.blush':  { emoji: '😊', text: 'blushes at', api: 'blush' },
  '.dance':  { emoji: '🕺', text: 'dances with', api: 'dance' },
  '.happy':  { emoji: '😄', text: 'is happy with', api: 'happy' },
  '.smile':  { emoji: '😊', text: 'smiles at', api: 'smile' },
  '.kill':   { emoji: '💀', text: 'kills', api: 'punch' },
  '.yeet':   { emoji: '🚀', text: 'yeets', api: 'yeet' },
  '.nom':    { emoji: '😋', text: 'noms', api: 'nom' },
  '.waifu':  { emoji: '🌸', text: 'summons a waifu', api: 'waifu' },
};

export const commands = Object.keys(REACTIONS);

export async function handle(msg, body, client) {
  const reaction = REACTIONS[body];
  if (!reaction) return;

  await msg.react(reaction.emoji);

  let senderName = 'Someone';
  let targetName = '';

  try {
    const contact = await msg.getContact();
    senderName = contact.pushname || contact.name || 'Someone';

    if (msg.hasQuotedMsg) {
      const quoted = await msg.getQuotedMessage();
      const targetContact = await client.getContactById(quoted.author || quoted.from);
      targetName = targetContact.pushname || targetContact.name || 'someone';
    }

    const res = await fetch(`https://nekos.best/api/v2/${reaction.api}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://nekos.best/',
        'Origin': 'https://nekos.best'
      }
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const mediaUrl = data?.results?.[0]?.url;

    const text = targetName
      ? `${senderName} ${reaction.text} ${targetName} ${reaction.emoji}`
      : `${senderName} ${reaction.text} ${reaction.emoji}`;

    if (mediaUrl) {
      const media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime: true });
      await client.sendMessage((msg._chatId || msg.from), media, { caption: text });
    } else {
      await client.sendMessage((msg._chatId || msg.from), apexWrap(text));
    }
  } catch (e) {
    console.error('Reaction error:', e.message);
    const text = targetName
      ? `${senderName} ${reaction.text} ${targetName} ${reaction.emoji}`
      : `${senderName} ${reaction.text} ${reaction.emoji}`;
    await client.sendMessage((msg._chatId || msg.from), apexWrap(text));
  }
}