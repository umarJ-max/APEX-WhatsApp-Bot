import { apexWrap, apexError } from './apexWrap.js';
import { isOwnerOrAdmin } from './permissions.js';

// In-memory store for group rules and welcome/goodbye settings
const groupRules = new Map();
const welcomeEnabled = new Set();
const goodbyeEnabled = new Set();

export const commands = ['.welcome', '.goodbye', '.rules', '.setrules', '.delrules'];

// Called from index.js on group_join and group_leave events
export async function handleWelcome(notification, client) {
  try {
    const chat = await notification.getChat();
    if (!welcomeEnabled.has(chat.id._serialized)) return;
    const contact = await notification.getContact();
    const name = contact.pushname || contact.name || contact.number || 'Someone';
    await client.sendMessage(chat.id._serialized, apexWrap(
      `👋 *Welcome, ${name}!*\n\n` +
      `Glad to have you here 🖤\n` +
      `Type *.menu* to see what I can do.` +
      (groupRules.has(chat.id._serialized) ? `\n\n📋 *Group Rules:*\n${groupRules.get(chat.id._serialized)}` : '')
    ));
  } catch (e) { console.error('Welcome error:', e.message); }
}

export async function handleGoodbye(notification, client) {
  try {
    const chat = await notification.getChat();
    if (!goodbyeEnabled.has(chat.id._serialized)) return;
    const contact = await notification.getContact();
    const name = contact.pushname || contact.name || 'Someone';
    await client.sendMessage(chat.id._serialized, apexWrap(`👋 *${name} has left the group.*\n\nTake care 🖤`));
  } catch (e) { console.error('Goodbye error:', e.message); }
}

export async function handle(msg, body, client) {
  const chatId = msg._chatId || msg.from;

  // Check admin for toggle commands
  const adminRequired = ['.welcome', '.goodbye', '.setrules', '.delrules'];
  if (adminRequired.some(c => body === c || body.startsWith(c + ' '))) {
    const allowed = await isOwnerOrAdmin(msg, client);
    if (!allowed) {
      await msg.react('🔒');
      await client.sendMessage(chatId, apexError('admins only 🔒'));
      return;
    }
  }

  // .welcome — toggle welcome messages
  if (body === '.welcome') {
    if (welcomeEnabled.has(chatId)) {
      welcomeEnabled.delete(chatId);
      await msg.react('✅');
      await client.sendMessage(chatId, apexWrap('👋 Welcome messages *disabled*.'));
    } else {
      welcomeEnabled.add(chatId);
      await msg.react('✅');
      await client.sendMessage(chatId, apexWrap('👋 Welcome messages *enabled*. New members will be greeted 🖤'));
    }
    return;
  }

  // .goodbye — toggle goodbye messages
  if (body === '.goodbye') {
    if (goodbyeEnabled.has(chatId)) {
      goodbyeEnabled.delete(chatId);
      await msg.react('✅');
      await client.sendMessage(chatId, apexWrap('👋 Goodbye messages *disabled*.'));
    } else {
      goodbyeEnabled.add(chatId);
      await msg.react('✅');
      await client.sendMessage(chatId, apexWrap('👋 Goodbye messages *enabled*. Leaving members will be seen off 🖤'));
    }
    return;
  }

  // .setrules <rules text>
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
      await client.sendMessage(chatId, apexError('no rules set for this group\nadmins can set rules with *.setrules <text>*'));
      return;
    }
    await msg.react('📋');
    await client.sendMessage(chatId, apexWrap(`📋 *Group Rules*\n\n${rules}`));
    return;
  }
}
