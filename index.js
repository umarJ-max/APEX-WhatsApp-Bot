import 'dotenv/config';
import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { isOnCooldown, setCooldown, getRemainingCooldown } from './cooldown.js';
import * as aiCmd from './ai.js';
import * as funCmd from './fun.js';
import * as reactionsCmd from './reactions.js';
import * as userCmd from './user.js';
import * as islamCmd from './islam.js';
import * as groupCmd from './group.js';
import * as ownerCmd from './owner.js';
import * as stickerCmd from './sticker.js';
import * as musicCmd from './music.js';
import * as downloaderCmd from './downloader.js';

const { Client, LocalAuth, MessageMedia } = pkg;

const modules = [aiCmd, funCmd, reactionsCmd, userCmd, islamCmd, groupCmd, ownerCmd, stickerCmd, musicCmd, downloaderCmd];

const noCooldown = [
  '.menu', '.help', '.ping', '.info', '.uptime',
  '.shutdown', '.restart', '.broadcast', '.block', '.unblock',
  '.setbio', '.getbio'
];

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('loading_screen', (percent, message) => {
  console.log(`  ⏳ Loading... ${percent}% - ${message}`);
});

client.on('qr', (qr) => {
  console.log('\n  ⬇️  Scan this QR with WhatsApp:');
  console.log('  (Settings → Linked Devices → Link a Device)\n');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('\n  🔐 Authenticated! Setting things up...');
});

client.on('ready', async () => {
  console.log('  ✅ APEX is ready!');
  const owner = process.env.OWNER_NUMBER;
  console.log(`  👤 Owner: ${owner || '⚠️  NOT SET — add OWNER_NUMBER to .env'}`);
  console.log(`  💬 Commands: ${modules.flatMap(m => m.commands).length} loaded\n`);

  try {
    const myId = client.info.wid.user + '@c.us';
    const imgPath = path.join(__dirname, 'Prayer.jpg');
    const media = MessageMedia.fromFilePath(imgPath);
    await client.sendMessage(myId, media, {
      caption:
`⚡ *A P E X — O N L I N E*
─────────────────────

just woke up. ready to go 🖤
ask me anything, I don't sleep.

❯  type *.menu* to get started

─────────────────────
_built by Umar J_`
    });
    console.log('  📨 Startup message sent!');
  } catch (e) {
    console.log('  ⚠️ Startup message failed:', e.message);
  }
});

client.on('disconnected', (reason) => {
  console.log('  ❌ Disconnected:', reason);
});

// Get the real chat ID where the message was sent
// In groups: returns the group ID (e.g. 12345@g.us)
// In DMs: returns the user's ID (e.g. 923...@c.us)
async function getChatId(msg) {
  try {
    const chat = await msg.getChat();
    return chat.id._serialized;
  } catch {
    return msg.from;
  }
}

async function handleMessage(msg) {
  const body = msg.body?.trim();
  if (!body) return;

  // Skip bot's own automated sends (fromMe with no author = sent by the script)
  if (msg.fromMe && !msg.author) return;

  const userId = msg.author || msg.from;
  // Get the actual chat to reply to (group ID or DM ID)
  const chatId = await getChatId(msg);

  console.log(`  ▶️  "${body}" | chat:${chatId} | user:${userId}`);

  if (body === '.menu') {
    await msg.react('📋');
    const imgPath = path.join(__dirname, 'Menu.jpg');
    const media = MessageMedia.fromFilePath(imgPath);
    await client.sendMessage(chatId, media, {
      caption:
`🖤 *A P E X — MENU*
─────────────────────

🤖 *AI*
❯ *.ai <question>* — ask anything
❯ *.joke* — get a joke
❯ *.fact* — random fact
❯ *.roast* — roast someone

📥 *Downloaders*
❯ *.fb sd/hd <url>* — Facebook video
❯ *.tiktok <url>* — TikTok no watermark
❯ *.gdrive <url>* — Google Drive file link
❯ *.mediafire <url>* — MediaFire file link

🎵 *Music*
❯ *.play <song name>* — search & send audio
❯ *.ytmp3 <youtube url>* — download exact song by URL

🎉 *Fun*
❯ *.rizz* — pickup line
❯ *.pickupline* — pickup line
❯ *.truth* — truth question
❯ *.dare* — dare challenge
❯ *.fact* — random fact
❯ *.couplepp* — matching couple pics
❯ *.flipcoin* — flip a coin
❯ *.ship <n> & <n>* — compatibility score
❯ *.rate <x>* — rate something
❯ *.quote* — send a quote
❯ *.8ball <question>* — magic 8-ball

🎭 *Reactions*
❯ *.pat* — pat someone
❯ *.hug* — hug someone
❯ *.slap* — slap someone
❯ *.bite* — bite someone
❯ *.poke* — poke someone
❯ *.wave* — wave
❯ *.wink* — wink
❯ *.bonk* — bonk someone
❯ *.blush* — blush
❯ *.dance* — dance
❯ *.happy* — send happiness
❯ *.smile* — smile
❯ *.kill* — kill someone
❯ *.yeet* — yeet someone
❯ *.nom* — nom someone
_(reply to someone's msg to target them)_

🕌 *Islam*
❯ *.quran* — random verse
❯ *.dua* — supplication
❯ *.surah <number>* — get a surah
❯ *.prayertime <city>* — prayer times

🎨 *Sticker*
❯ *.sticker* — send/reply to an image

👥 *Group* _(group admins only)_
❯ *.tagall* — mention everyone
❯ *.kick* — remove a member
❯ *.promote* — promote admin
❯ *.demote* — demote admin
❯ *.invite* — create invite link
❯ *.opengroup* — open group chat
❯ *.closegroup* — close group chat

👤 *User*
❯ *.ping* — check bot latency
❯ *.uptime* — show uptime
❯ *.info* — show bot info

❯ *.help* — contact owner
─────────────────────
_15s cooldown per command_`
    });
    return;
  }

  if (body === '.help') {
    await msg.react('👋');
    try {
      const ownerNum = process.env.OWNER_NUMBER;
      const ownerContact = await client.getContactById(`${ownerNum}@c.us`);
      await client.sendMessage(chatId, ownerContact);
      await client.sendMessage(chatId,
`🖤 *A P E X — SUPPORT*
─────────────────────

got a question? hit up the owner 👆

─────────────────────
_APEX by Umar J_`
      );
    } catch {
      await client.sendMessage(chatId,
`🖤 *A P E X — SUPPORT*
─────────────────────

got a question about the bot?
hit up the owner 👇

📱 *WhatsApp:* +92 316 6392586

─────────────────────
_APEX by Umar J_`
      );
    }
    return;
  }
  const allCommands = modules.flatMap(m => m.commands);
  const isKnownCommand = allCommands.some(cmd => body === cmd || body.startsWith(cmd + ' '));
  if (!isKnownCommand) return;

  const skipCooldown = noCooldown.some(cmd => body === cmd || body.startsWith(cmd + ' '));
  if (!skipCooldown) {
    if (isOnCooldown(userId)) {
      const remaining = getRemainingCooldown(userId);
      await client.sendMessage(chatId, `⏱️ *chill for ${remaining}s* — APEX has a cooldown 🖤`);
      return;
    }
    setCooldown(userId);
  }

  // Pass chatId into msg so all modules use the correct chat
  msg._chatId = chatId;

  for (const mod of modules) {
    const match = mod.commands.some(cmd => body === cmd || body.startsWith(cmd + ' '));
    if (match) {
      try { await mod.handle(msg, body, client); }
      catch (err) { console.error('  ❌ Error:', err.message); }
      return;
    }
  }
}

const processedIds = new Set();
function wrap(msg) {
  const id = msg.id._serialized;
  if (processedIds.has(id)) return;
  processedIds.add(id);
  setTimeout(() => processedIds.delete(id), 10000);
  handleMessage(msg);
}
client.on('message', wrap);
client.on('message_create', wrap);

console.log('\n  🚀 Initializing APEX...\n');
client.initialize();
