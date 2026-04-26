import { apexWrap, apexThinking, apexError } from './apexWrap.js';
import { askAI } from './ai.js';
import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;

const DAVID = 'https://apis.davidcyril.name.ng';

export const commands = ['.translate', '.tts', '.calc', '.remind', '.lyrics', '.news', '.crypto', '.meme', '.weather'];

export async function handle(msg, body, client) {
  const chatId = msg._chatId || msg.from;

  // .weather <city>
  if (body.startsWith('.weather ')) {
    const city = body.slice(9).trim();
    const key = process.env.WEATHER_API_KEY;
    if (!key) { await client.sendMessage(chatId, apexError('WEATHER_API_KEY not set in .env')); return; }
    await msg.react('🌤️');
    await client.sendMessage(chatId, apexThinking('checking the skies...'));
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`);
      const d = await res.json();
      if (d.cod !== 200) throw new Error('not found');
      const temp = Math.round(d.main.temp);
      const feels = Math.round(d.main.feels_like);
      const desc = d.weather[0].description;
      const humidity = d.main.humidity;
      const wind = d.wind.speed;
      const icon = weatherEmoji(d.weather[0].id);
      await client.sendMessage(chatId, apexWrap(
        `${icon} *${d.name}, ${d.sys.country}*\n\n` +
        `🌡️ Temp: *${temp}°C* (feels ${feels}°C)\n` +
        `🌥️ Sky: *${desc}*\n` +
        `💧 Humidity: *${humidity}%*\n` +
        `💨 Wind: *${wind} m/s*`
      ));
    } catch {
      await client.sendMessage(chatId, apexError(`city not found: "${city}"`));
    }
    return;
  }

  // .translate <lang> <text>
  if (body.startsWith('.translate ')) {
    const parts = body.slice(11).trim().split(' ');
    if (parts.length < 2) {
      await client.sendMessage(chatId, apexError('usage: .translate <lang> <text>\nexample: .translate urdu Hello how are you'));
      return;
    }
    const lang = parts[0];
    const text = parts.slice(1).join(' ');
    await msg.react('🌐');
    await client.sendMessage(chatId, apexThinking('translating...'));
    try {
      const result = await askAI(`Translate this text to ${lang}. Reply with ONLY the translation, nothing else:\n"${text}"`);
      await client.sendMessage(chatId, apexWrap(`🌐 *Translation to ${lang}*\n\n${result}`));
    } catch {
      await client.sendMessage(chatId, apexError('translation failed'));
    }
    return;
  }

  // .calc <expression>
  if (body.startsWith('.calc ')) {
    const expr = body.slice(6).trim();
    await msg.react('🔢');
    try {
      const result = Function(`"use strict"; return (${expr})`)();
      if (result === undefined || result === null) throw new Error('invalid');
      await client.sendMessage(chatId, apexWrap(`🔢 *Calculator*\n\n${expr} = *${result}*`));
    } catch {
      await client.sendMessage(chatId, apexError('invalid expression\nexample: .calc 25 * 4 + 10'));
    }
    return;
  }

  // .remind <minutes> <message>
  if (body.startsWith('.remind ')) {
    const parts = body.slice(8).trim().split(' ');
    const mins = parseInt(parts[0]);
    const reminderMsg = parts.slice(1).join(' ');
    if (!mins || mins < 1 || !reminderMsg) {
      await client.sendMessage(chatId, apexError('usage: .remind <minutes> <message>\nexample: .remind 10 call mama'));
      return;
    }
    await msg.react('⏰');
    await client.sendMessage(chatId, apexWrap(`⏰ Got it! I'll remind you in *${mins} minute${mins > 1 ? 's' : ''}* 🖤`));
    setTimeout(async () => {
      try { await client.sendMessage(chatId, apexWrap(`⏰ *REMINDER*\n\n${reminderMsg}`)); } catch {}
    }, mins * 60 * 1000);
    return;
  }

  // .crypto <coin>
  if (body.startsWith('.crypto ')) {
    const coin = body.slice(8).trim().toLowerCase();
    await msg.react('💰');
    await client.sendMessage(chatId, apexThinking('fetching price...'));
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coin)}&vs_currencies=usd&include_24hr_change=true`);
      const data = await res.json();
      const info = data[coin];
      if (!info) throw new Error('not found');
      const price = info.usd.toLocaleString();
      const change = info.usd_24h_change?.toFixed(2);
      const changeEmoji = parseFloat(change) >= 0 ? '📈' : '📉';
      await client.sendMessage(chatId, apexWrap(
        `💰 *${coin.toUpperCase()}*\n\n💵 Price: *$${price}*\n${changeEmoji} 24h Change: *${change}%*`
      ));
    } catch {
      await client.sendMessage(chatId, apexError('coin not found\nexample: .crypto bitcoin'));
    }
    return;
  }

  // .news [category]
  // categories: trending, entertainment, sports, tech, world, aljazeera, bbc
  if (body === '.news' || body.startsWith('.news ')) {
    const cat = body.slice(5).trim().toLowerCase() || 'trending';
    const valid = ['trending', 'entertainment', 'sports', 'tech', 'world', 'aljazeera', 'bbc'];
    const endpoint = valid.includes(cat) ? cat : 'trending';
    await msg.react('📰');
    await client.sendMessage(chatId, apexThinking('fetching headlines...'));
    try {
      const res = await fetch(`${DAVID}/news/${endpoint}`);
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      const articles = Array.isArray(data) ? data : (data.articles || data.news || data.data || []);
      if (!articles.length) throw new Error('no articles');
      const headlines = articles.slice(0, 5).map((a, i) => `${i + 1}. ${a.title || a.headline || a}`).join('\n\n');
      await client.sendMessage(chatId, apexWrap(`📰 *${endpoint.toUpperCase()} News*\n\n${headlines}`));
    } catch {
      try {
        const news = await askAI(`Give me 5 ${endpoint} news headlines. Numbered list only.`);
        await client.sendMessage(chatId, apexWrap(`📰 *${endpoint.toUpperCase()} News*\n\n${news}`));
      } catch {
        await client.sendMessage(chatId, apexError('could not fetch news'));
      }
    }
    return;
  }

  // .meme
  if (body === '.meme') {
    await msg.react('😂');
    try {
      // Fetch from Reddit listing (more reliable than random.json)
      const subs = ['memes', 'dankmemes'];
      const sub = subs[Math.floor(Math.random() * subs.length)];
      const r = await fetch(`https://www.reddit.com/r/${sub}.json?limit=50&t=day`, {
        headers: { 'User-Agent': 'APEX-Bot/2.0' }
      });
      if (!r.ok) throw new Error('reddit failed');
      const rd = await r.json();
      const posts = rd?.data?.children?.filter(p => {
        const u = p?.data?.url || '';
        return (u.endsWith('.jpg') || u.endsWith('.jpeg') || u.endsWith('.png') || u.endsWith('.webp')) && !p.data.over_18;
      });
      if (!posts || posts.length === 0) throw new Error('no image posts');
      const post = posts[Math.floor(Math.random() * posts.length)].data;
      const media = await MessageMedia.fromUrl(post.url, { unsafeMime: true });
      await client.sendMessage(chatId, media, { caption: apexWrap(`😂 *${post.title}*`) });
    } catch (e) {
      console.error('Meme error:', e.message);
      await client.sendMessage(chatId, apexError('meme machine broke 😅 try again'));
    }
    return;
  }

  // .lyrics <song> [| artist]
  // example: .lyrics faded | Alan Walker
  if (body.startsWith('.lyrics ')) {
    const input = body.slice(8).trim();
    const parts = input.split('|').map(s => s.trim());
    const song = parts[0];
    const artist = parts[1] || '';
    const songEnc = encodeURIComponent(song);
    const artistEnc = encodeURIComponent(artist);
    await msg.react('🎵');
    await client.sendMessage(chatId, apexThinking('searching lyrics...'));
    try {
      const urls = [
        `${DAVID}/lyrics2?t=${songEnc}${artist ? '&a=' + artistEnc : ''}`,
        `${DAVID}/lyrics?t=${songEnc}${artist ? '&a=' + artistEnc : ''}`,
        `${DAVID}/lyrics3?song=${songEnc}`
      ];
      let found = null;
      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json = await res.json();
          // API returns: { creator, title, artist, lyrics }
          if (json?.lyrics) { found = json; break; }
        } catch {}
      }
      if (!found) throw new Error('no lyrics');
      const trimmed = found.lyrics.length > 3000
        ? found.lyrics.slice(0, 3000) + '\n\n_...trimmed_'
        : found.lyrics;
      await client.sendMessage(chatId, apexWrap(
        `🎵 *${found.title || song}*${found.artist ? ' — ' + found.artist : ''}\n\n${trimmed}`
      ));
    } catch {
      await client.sendMessage(chatId, apexError('lyrics not found\ntry: .lyrics faded | Alan Walker'));
    }
    return;
  }

  // .tts <text>
  if (body.startsWith('.tts ')) {
    const text = body.slice(5).trim();
    const voice = null;
    if (!text) {
      await client.sendMessage(chatId, apexError('usage: .tts <text>'));
      return;
    }
    await msg.react('🔊');
    try {
      let media;
      // Always use speechma — returns raw MP3 directly, no redirect issues
      // voice defaults to Andrew (confirmed working), user can override with | voicename
      const selectedVoice = voice || 'Andrew';
      const url = `${DAVID}/tools/speechma?text=${encodeURIComponent(text.slice(0, 300))}&voice=${encodeURIComponent(selectedVoice)}&pitch=1&rate=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('speechma failed: ' + res.status);
      const buffer = Buffer.from(await res.arrayBuffer());
      console.log('TTS bytes:', buffer.length, 'content-type:', res.headers.get('content-type'));
      if (buffer.length < 500) throw new Error('audio too small: ' + buffer.length);
      media = new MessageMedia('audio/mpeg', buffer.toString('base64'), 'voice.mp3');
      await client.sendMessage(chatId, media);
    } catch (e) {
      console.error('TTS error:', e.message);
      await client.sendMessage(chatId, apexError('tts failed: ' + e.message));
    }
    return;
  }
}

function weatherEmoji(id) {
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800) return '☀️';
  if (id > 800) return '⛅';
  return '🌤️';
}
