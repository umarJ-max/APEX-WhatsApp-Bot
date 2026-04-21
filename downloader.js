import { apexWrap, apexError } from './apexWrap.js';
import pkg from 'whatsapp-web.js';

const { MessageMedia } = pkg;
const BASE = 'https://apis.davidcyril.name.ng';

export const commands = ['.fb', '.tiktok', '.gdrive', '.mediafire'];

export async function handle(msg, body, client) {
  const cmd = body.split(' ')[0];

  // ─── FACEBOOK ───────────────────────────────────────────
  if (cmd === '.fb') {
    const parts = body.split(' ');
    const quality = parts[1]?.toLowerCase();
    const url = parts[2];
    if (!quality || !url || !['sd', 'hd'].includes(quality)) {
      await client.sendMessage((msg._chatId || msg.from), apexError('usage: *.fb sd <url>* or *.fb hd <url>*'));
      return;
    }
    await msg.react('⏳');
    let data;
    try {
      const res = await fetch(`${BASE}/facebook?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (!json.success || !json.result?.downloads) throw new Error();
      data = json.result;
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError('could not fetch that video — check the URL'));
      return;
    }
    const chosen = data.downloads[quality];
    if (!chosen?.url) {
      await client.sendMessage((msg._chatId || msg.from), apexError(`${quality.toUpperCase()} not available for this video`));
      return;
    }
    try {
      const buf = Buffer.from(await (await fetch(chosen.url)).arrayBuffer());
      const media = new MessageMedia('video/mp4', buf.toString('base64'), `fb_${quality}.mp4`);
      await client.sendMessage((msg._chatId || msg.from), media, {
        caption: apexWrap(`📥 *${data.title?.trim() || 'Facebook Video'}*\n🎬 Quality: ${chosen.quality}`)
      });
      await msg.react('✅');
    } catch (e) {
      console.error('FB:', e.message);
      await client.sendMessage((msg._chatId || msg.from), apexError('failed to send video'));
    }
    return;
  }

  // ─── TIKTOK ─────────────────────────────────────────────
  if (cmd === '.tiktok') {
    const url = body.slice(8).trim();
    if (!url) {
      await client.sendMessage((msg._chatId || msg.from), apexError('usage: *.tiktok <url>*'));
      return;
    }
    await msg.react('⏳');
    let data;
    try {
      const res = await fetch(`${BASE}/download/tiktokv4?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (!json.success || !json.results?.no_watermark) throw new Error();
      data = json.results;
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError('could not fetch that TikTok — check the URL'));
      return;
    }
    try {
      const buf = Buffer.from(await (await fetch(data.no_watermark)).arrayBuffer());
      const media = new MessageMedia('video/mp4', buf.toString('base64'), 'tiktok.mp4');
      await client.sendMessage((msg._chatId || msg.from), media, {
        caption: apexWrap('📥 *TikTok Video* — no watermark ✨')
      });
      await msg.react('✅');
    } catch (e) {
      console.error('TikTok:', e.message);
      await client.sendMessage((msg._chatId || msg.from), apexError('failed to send video'));
    }
    return;
  }

  // ─── GOOGLE DRIVE ────────────────────────────────────────
  if (cmd === '.gdrive') {
    const url = body.slice(7).trim();
    if (!url) {
      await client.sendMessage((msg._chatId || msg.from), apexError('usage: *.gdrive <url>*'));
      return;
    }
    await msg.react('⏳');
    try {
      const res = await fetch(`${BASE}/gdrive?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (!json.success) throw new Error();
      await msg.react('✅');
      await client.sendMessage((msg._chatId || msg.from), apexWrap(
        `📁 *${json.name}*\n\n` +
        `📦 Size: ${json.size}\n` +
        `🗂️ Type: ${json.mimeType}\n\n` +
        `🔗 *Download Link:*\n${json.download_link}`
      ));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError('could not fetch that Drive link'));
    }
    return;
  }

  // ─── MEDIAFIRE ───────────────────────────────────────────
  if (cmd === '.mediafire') {
    const url = body.slice(10).trim();
    if (!url) {
      await client.sendMessage((msg._chatId || msg.from), apexError('usage: *.mediafire <url>*'));
      return;
    }
    await msg.react('⏳');
    try {
      const res = await fetch(`${BASE}/mediafire?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (!json.downloadLink) throw new Error();
      await msg.react('✅');
      await client.sendMessage((msg._chatId || msg.from), apexWrap(
        `📁 *${json.fileName}*\n\n` +
        `📦 Size: ${json.size}\n` +
        `🗂️ Type: ${json.mimeType}\n\n` +
        `🔗 *Download Link:*\n${json.downloadLink}`
      ));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError('could not fetch that MediaFire link'));
    }
    return;
  }
}
