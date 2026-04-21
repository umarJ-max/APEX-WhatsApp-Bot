import { apexWrap, apexError } from './apexWrap.js';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const startTime = Date.now();

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

export const commands = ['.ping', '.uptime', '.info'];

export async function handle(msg, body, client) {

  // .ping
  if (body === '.ping') {
    await msg.react('🏓');
    const start = Date.now();
    const imgPath = path.join(__dirname, 'Prayer.jpg');
    const media = MessageMedia.fromFilePath(imgPath);
    const latency = Date.now() - start;
    await client.sendMessage((msg._chatId || msg.from), media, {
      caption:
`⚡ *A P E X — O N L I N E*
─────────────────────

System check complete! 🖤 I'm online — what's on your mind today?

⚡ Latency: *${latency}ms*

❯  type *.menu* to get started

─────────────────────
_built by Umar J_`
    });
    return;
  }

  // .uptime
  if (body === '.uptime') {
    await msg.react('⏱️');
    const uptime = formatUptime(Date.now() - startTime);
    const mem = process.memoryUsage();
    await client.sendMessage((msg._chatId || msg.from), apexWrap(
      `⏱️ *Uptime*\n\n🕐 Running for: *${uptime}*\n💾 Memory: *${formatBytes(mem.heapUsed)}* used`
    ));
    return;
  }

  // .info
  if (body === '.info') {
    await msg.react('ℹ️');
    const uptime = formatUptime(Date.now() - startTime);
    const mem = process.memoryUsage();
    const platform = os.platform();
    const nodeVersion = process.version;
    await client.sendMessage((msg._chatId || msg.from), apexWrap(
      `ℹ️ *APEX Info*\n\n🤖 Bot: *APEX*\n👨‍💻 Owner: *Umar J*\n⏱️ Uptime: *${uptime}*\n💾 Memory: *${formatBytes(mem.heapUsed)}*\n🖥️ Platform: *${platform}*\n🟢 Node: *${nodeVersion}*\n\n_type .menu to see commands_`
    ));
    return;
  }
}
