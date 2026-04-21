import { apexWrap, apexError } from './apexWrap.js';
import pkg from 'whatsapp-web.js';

const { MessageMedia } = pkg;
const BASE = 'https://apis.davidcyril.name.ng';

export const commands = ['.play', '.ytmp3'];

export async function handle(msg, body, client) {
  if (body.startsWith('.ytmp3 ')) {
    const url = body.slice(7).trim();
    if (!url) {
      await client.sendMessage((msg._chatId || msg.from), apexError('usage: *.ytmp3 <youtube url>*'));
      return;
    }
    await msg.react('⏬');
    let data;
    try {
      const res = await fetch(`${BASE}/download/ytmp3?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (!json.success || !json.result?.download_url) throw new Error('no result');
      data = json.result;
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError('could not download — check the URL'));
      return;
    }
    try {
      const thumb = await fetch(data.thumbnail);
      const thumbBuf = Buffer.from(await thumb.arrayBuffer());
      const thumbMedia = new MessageMedia('image/jpeg', thumbBuf.toString('base64'));
      await client.sendMessage((msg._chatId || msg.from), thumbMedia, {
        caption: apexWrap(`🎵 *${data.title}*\n\n⏱️ Duration: ${data.duration || 'N/A'}\n🎧 Format: mp3\n\n_sending audio..._`)
      });
      const audio = await fetch(data.download_url);
      const audioBuf = Buffer.from(await audio.arrayBuffer());
      const audioMedia = new MessageMedia('audio/mpeg', audioBuf.toString('base64'), `${data.title}.mp3`);
      await client.sendMessage((msg._chatId || msg.from), audioMedia, { sendAudioAsVoice: false });
      await msg.react('✅');
    } catch (e) {
      console.error('ytmp3:', e.message);
      await client.sendMessage((msg._chatId || msg.from), apexError('failed to send audio'));
    }
    return;
  }

  const query = body.slice(5).trim();
  if (!query) {
    await client.sendMessage((msg._chatId || msg.from), apexError('usage: *.play <song name>*'));
    return;
  }

  await msg.react('🎵');

  let data;
  try {
    const res = await fetch(`${BASE}/play?query=${encodeURIComponent(query)}`);
    const json = await res.json();
    if (!json.status || !json.result?.download_url) throw new Error('no result');
    data = json.result;
  } catch {
    await client.sendMessage((msg._chatId || msg.from), apexError('could not find that song'));
    return;
  }

  try {
    // send thumbnail + details first
    const thumb = await fetch(data.thumbnail);
    const thumbBuf = Buffer.from(await thumb.arrayBuffer());
    const thumbMedia = new MessageMedia('image/jpeg', thumbBuf.toString('base64'));
    await client.sendMessage((msg._chatId || msg.from), thumbMedia, {
      caption: apexWrap(
        `🎵 *${data.title}*\n\n` +
        `⏱️ Duration: ${data.duration}\n` +
        `👁️ Views: ${Number(data.views).toLocaleString()}\n` +
        `📅 Published: ${data.published}\n\n` +
        `_downloading audio..._`
      )
    });

    // send audio
    const audio = await fetch(data.download_url);
    const audioBuf = Buffer.from(await audio.arrayBuffer());
    const audioMedia = new MessageMedia('audio/mpeg', audioBuf.toString('base64'), `${data.title}.mp3`);
    await client.sendMessage((msg._chatId || msg.from), audioMedia, { sendAudioAsVoice: false });
    await msg.react('✅');
  } catch (e) {
    console.error('Play:', e.message);
    await client.sendMessage((msg._chatId || msg.from), apexError('failed to send audio'));
  }
}
