import { apexWrap, apexError } from './apexWrap.js';
import pkg from 'whatsapp-web.js';
import playdl from 'play-dl';

const { MessageMedia } = pkg;
const UNIVERSAL_API = 'https://ahm7xmakki.com/api/alldl';

export const commands = ['.play', '.ytmp3'];

async function fetchAudioFromUrl(youtubeUrl) {
  const res = await fetch(`${UNIVERSAL_API}?url=${encodeURIComponent(youtubeUrl)}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  if (!data.success || !data.mediaInfo) throw new Error('no media info returned');
  const audioUrl = data.mediaInfo.audioUrl || data.mediaInfo.videoUrl;
  if (!audioUrl) throw new Error('no audio URL in response');
  return audioUrl;
}

export async function handle(msg, body, client) {
  const to = msg._chatId || msg.from;

  // ── .ytmp3 <youtube url> ──────────────────────────
  if (body.startsWith('.ytmp3 ')) {
    const url = body.slice(7).trim();
    if (!url) {
      await client.sendMessage(to, apexError('usage: *.ytmp3 <youtube url>*'));
      return;
    }

    await msg.react('⏬');

    try {
      // Get video info
      const info = await playdl.video_info(url);
      const details = info.video_details;
      const title = details.title || 'Unknown';
      const duration = details.durationRaw || 'N/A';
      const views = details.views ? Number(details.views).toLocaleString() : 'N/A';
      const thumbnail = details.thumbnails?.[0]?.url;

      // Send thumbnail
      if (thumbnail && thumbnail.startsWith('http')) {
        try {
          const thumbBuf = Buffer.from(await (await fetch(thumbnail)).arrayBuffer());
          const thumbMedia = new MessageMedia('image/jpeg', thumbBuf.toString('base64'));
          await client.sendMessage(to, thumbMedia, {
            caption: apexWrap(`🎵 *${title}*\n\n⏱️ Duration: ${duration}\n👁️ Views: ${views}\n\n_fetching audio..._`)
          });
        } catch { /* skip thumbnail silently */ }
      }

      // Fetch and send audio
      const audioUrl = await fetchAudioFromUrl(url);
      const audioBuf = Buffer.from(await (await fetch(audioUrl)).arrayBuffer());
      const audioMedia = new MessageMedia('audio/mpeg', audioBuf.toString('base64'), `${title}.mp3`);
      await client.sendMessage(to, audioMedia, { sendAudioAsVoice: false });
      await msg.react('✅');

    } catch (e) {
      console.error('ytmp3:', e.message);
      await client.sendMessage(to, apexError('could not download — check the URL'));
    }
    return;
  }

  // ── .play <song name> ─────────────────────────────
  const query = body.slice(5).trim();
  if (!query) {
    await client.sendMessage(to, apexError('usage: *.play <song name>*'));
    return;
  }

  await msg.react('🎵');

  try {
    // Search YouTube
    const results = await playdl.search(query, { limit: 1 });
    if (!results || results.length === 0) throw new Error('no results found');

    const video = results[0];
    const title = video.title || 'Unknown';
    const duration = video.durationRaw || 'N/A';
    const views = video.views ? Number(video.views).toLocaleString() : 'N/A';
    const videoUrl = video.url;

    console.log(`🎵 Found: ${title} | ${videoUrl}`);

    // Send thumbnail
    try {
      const thumbnail = video.thumbnails?.[0]?.url;
      if (thumbnail && thumbnail.startsWith('http')) {
        const thumbBuf = Buffer.from(await (await fetch(thumbnail)).arrayBuffer());
        const thumbMedia = new MessageMedia('image/jpeg', thumbBuf.toString('base64'));
        await client.sendMessage(to, thumbMedia, {
          caption: apexWrap(
            `🎵 *${title}*\n\n` +
            `⏱️ Duration: ${duration}\n` +
            `👁️ Views: ${views}\n\n` +
            `_fetching audio..._`
          )
        });
      }
    } catch { /* skip thumbnail silently */ }

    // Fetch and send audio
    const audioUrl = await fetchAudioFromUrl(videoUrl);
    const audioBuf = Buffer.from(await (await fetch(audioUrl)).arrayBuffer());
    const audioMedia = new MessageMedia('audio/mpeg', audioBuf.toString('base64'), `${title}.mp3`);
    await client.sendMessage(to, audioMedia, { sendAudioAsVoice: false });
    await msg.react('✅');

  } catch (e) {
    console.error('Play:', e.message);
    await client.sendMessage(to, apexError('could not find or play that song'));
  }
}