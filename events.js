import { apexWrap, apexError } from './apexWrap.js';
import { isOwnerOrAdmin } from './permissions.js';

const groupRules = new Map();
const welcomeEnabled = new Set();
const goodbyeEnabled = new Set();

export const commands = [
  '.welcome on', '.welcome off', '.welcome',
  '.goodbye on', '.goodbye off', '.goodbye',
  '.rules', '.setrules', '.delrules'
];

export async function handleWelcome(notification, client) {
  try {
    const chat = await notification.getChat();
    if (!welcomeEnabled.has(chat.id._serialized)) return;
    // Get name safely
    let name = 'New Member';
    try {
      const contact = await notification.getContact();
      name = contact?.pushname || contact?.name || contact?.number || 'New Member';
    } catch {}
    const rules = groupRules.has(chat.id._serialized)
      ? `\n\n📋 *Group Rules:*\n${groupRules.get(chat.id._serialized)}`
      : '';
    await client.sendMessage(chat.id._serialized,
`👋 *Welcome to the group, ${name}!*

We're glad to have you here 🖤
Feel free to introduce yourself.
Type *.menu* to see what I can do.${rules}`
    );
  } catch (e) { console.error('Welcome error:', e.message); }
}

export async function handleGoodbye(notification, client) {
  try {
    const chat = await notification.getChat();
    if (!goodbyeEnabled.has(chat.id._serialized)) return;
    let name = 'A member';
    try {
      const contact = await notification.getContact();
      name = contact?.pushname || contact?.name || contact?.number || 'A member';
    } catch {}
    await client.sendMessage(chat.id._serialized,
`👋 *${name} has left the group.*

Take care, hope to see you again 🖤`
    );
  } catch (e) { console.error('Goodbye error:', e.message); }
}

export async function handle(msg, body, client) {
  const chatId = msg._chatId || msg.from;

  const adminRequired = ['.welcome', '.welcome on', '.welcome off', '.goodbye', '.goodbye on', '.goodbye off', '.setrules', '.delrules'];
  if (adminRequired.includes(body)) {
    const allowed = await isOwnerOrAdmin(msg, client);
    if (!allowed) {
      await msg.react('🔒');
      await client.sendMessage(chatId, apexError('admins only 🔒'));
      return;
    }
  }

  // .welcome on/off
  if (body === '.welcome on' || body === '.welcome off' || body === '.welcome') {
    if (body === '.welcome on' || (body === '.welcome' && !welcomeEnabled.has(chatId))) {
      welcomeEnabled.add(chatId);
      await msg.react('✅');
      await client.sendMessage(chatId, apexWrap('👋 Welcome messages *ON* 🖤'));
    } else {
      welcomeEnabled.delete(chatId);
      await msg.react('✅');
      await client.sendMessage(chatId, apexWrap('👋 Welcome messages *OFF*'));
    }
    return;
  }

  // .goodbye on/off
  if (body === '.goodbye on' || body === '.goodbye off' || body === '.goodbye') {
    if (body === '.goodbye on' || (body === '.goodbye' && !goodbyeEnabled.has(chatId))) {
      goodbyeEnabled.add(chatId);
      await msg.react('✅');
      await client.sendMessage(chatId, apexWrap('👋 Goodbye messages *ON* 🖤'));
    } else {
      goodbyeEnabled.delete(chatId);
      await msg.react('✅');
      await client.sendMessage(chatId, apexWrap('👋 Goodbye messages *OFF*'));
    }
    return;
  }

  // .setrules
  if (body.startsWith('.setrules ')) {
    const rules = body.slice(10).trim();
    groupRules.set(chatId, rules);
    await msg.react('✅');
    await client.sendMessage(chatId, apexWrap('📋 Group rules have been set!'));
    return;
  }

  // .delrules
  if (body === '.delrules') {
    groupRules.delete(chatId);
    await msg.react('✅');
    await client.sendMessage(chatId, apexWrap('📋 Group rules cleared.'));
    return;
  }

  // .rules — anyone can view
  if (body === '.rules') {
    const rules = groupRules.get(chatId);
    if (!rules) {
      await client.sendMessage(chatId, apexError('no rules set\nadmins can set rules with *.setrules <text>*'));
      return;
    }
    await msg.react('📋');
    await client.sendMessage(chatId, apexWrap(`📋 *Group Rules*\n\n${rules}`));
    return;
  }
}
