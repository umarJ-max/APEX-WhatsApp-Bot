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
  '.kill':   { emoji: '💀', text: 'kills', api: 'kill' },
  '.yeet':   { emoji: '🚀', text: 'yeets', api: 'yeet' },
  '.nom':    { emoji: '😋', text: 'noms', api: 'nom' },
};

export const commands = Object.keys(REACTIONS);

export async function handle(msg, body, client) {
  const reaction = REACTIONS[body];
  if (!reaction) return;

  await msg.react(reaction.emoji);

  try {
    // Get sender name
    const contact = await msg.getContact();
    const senderName = contact.pushname || contact.name || 'Someone';

    // Get quoted/mentioned target name
    let targetName = '';
    if (msg.hasQuotedMsg) {
      const quoted = await msg.getQuotedMessage();
      const targetContact = await client.getContactById(quoted.author || quoted.from);
      targetName = targetContact.pushname || targetContact.name || 'someone';
    }

    // Fetch GIF from nekos.best API (free, no auth)
    const res = await fetch(`https://nekos.best/api/v2/${reaction.api}`);
    const data = await res.json();
    const gifUrl = data?.results?.[0]?.url;

    const text = targetName
      ? `${senderName} ${reaction.text} ${targetName} ${reaction.emoji}`
      : `${senderName} ${reaction.text} ${reaction.emoji}`;

    if (gifUrl) {
      const media = await MessageMedia.fromUrl(gifUrl, { unsafeMime: true });
      await client.sendMessage((msg._chatId || msg.from), media, { caption: text });
    } else {
      await client.sendMessage((msg._chatId || msg.from), apexWrap(text));
    }
  } catch (e) {
    console.error('Reaction error:', e.message);
    await msg.react(reaction.emoji);
  }
}
