import { apexWrap, apexError } from './apexWrap.js';
import { isOwnerOrAdmin, isGroup } from './permissions.js';

const warnings = new Map();
const warnEnabled = new Set();
const MAX_WARNS = 3;

function getWarns(groupId, userId) {
  if (!warnings.has(groupId)) warnings.set(groupId, new Map());
  return warnings.get(groupId).get(userId) || 0;
}
function addWarn(groupId, userId) {
  if (!warnings.has(groupId)) warnings.set(groupId, new Map());
  const count = getWarns(groupId, userId) + 1;
  warnings.get(groupId).set(userId, count);
  return count;
}
function clearWarn(groupId, userId) {
  if (!warnings.has(groupId)) return;
  warnings.get(groupId).delete(userId);
}

export const commands = ['.warn on', '.warn off', '.warn', '.warnings', '.clearwarn'];

export async function handle(msg, body, client) {
  const chatId = msg._chatId || msg.from;

  if (!(await isGroup(msg))) {
    await client.sendMessage(chatId, apexError('this command only works in groups'));
    return;
  }

  const allowed = await isOwnerOrAdmin(msg, client);
  if (!allowed) {
    await msg.react('🔒');
    await client.sendMessage(chatId, apexError('admins only 🔒'));
    return;
  }

  // .warn on/off
  if (body === '.warn on' || body === '.warn off') {
    if (body === '.warn on') {
      warnEnabled.add(chatId);
      await msg.react('✅');
      await client.sendMessage(chatId, apexWrap('⚠️ Warn system *ON* — admins can now warn members 🖤'));
    } else {
      warnEnabled.delete(chatId);
      await msg.react('✅');
      await client.sendMessage(chatId, apexWrap('⚠️ Warn system *OFF*'));
    }
    return;
  }

  // .warn — reply to warn someone
  if (body === '.warn') {
    if (!warnEnabled.has(chatId)) {
      await client.sendMessage(chatId, apexError('warn system is off\nuse *.warn on* to enable it'));
      return;
    }
    if (!msg.hasQuotedMsg) {
      await client.sendMessage(chatId, apexError('reply to someone\'s message to warn them'));
      return;
    }
    try {
      const quoted = await msg.getQuotedMessage();
      const targetId = quoted.author || quoted.from;
      const targetNum = targetId.replace(/@c\.us|@g\.us|@lid/gi, '').split(':')[0];
      const count = addWarn(chatId, targetId);
      await msg.react('⚠️');
      if (count >= MAX_WARNS) {
        await client.sendMessage(chatId, apexWrap(
          `⚠️ @${targetNum} reached *${MAX_WARNS}/${MAX_WARNS} warnings* and has been removed.`
        ), { mentions: [targetId] });
        try {
          const chat = await client.getChatById(chatId);
          await chat.removeParticipants([targetId]);
          clearWarn(chatId, targetId);
        } catch {
          await client.sendMessage(chatId, apexError('could not kick — am I an admin?'));
        }
      } else {
        await client.sendMessage(chatId, apexWrap(
          `⚠️ @${targetNum} has been warned.\n\n*${count}/${MAX_WARNS} warnings*\n_${MAX_WARNS - count} more will result in removal._`
        ), { mentions: [targetId] });
      }
    } catch (e) {
      await client.sendMessage(chatId, apexError('could not warn'));
    }
    return;
  }

  // .warnings — check someone's warn count
  if (body === '.warnings') {
    if (!msg.hasQuotedMsg) {
      await client.sendMessage(chatId, apexError('reply to someone\'s message to check their warnings'));
      return;
    }
    try {
      const quoted = await msg.getQuotedMessage();
      const targetId = quoted.author || quoted.from;
      const targetNum = targetId.replace(/@c\.us|@g\.us|@lid/gi, '').split(':')[0];
      const count = getWarns(chatId, targetId);
      await msg.react('📋');
      await client.sendMessage(chatId, apexWrap(
        `📋 *Warnings for @${targetNum}*\n\n${count === 0 ? 'Clean record ✅' : `*${count}/${MAX_WARNS}* warnings`}`
      ), { mentions: [targetId] });
    } catch {
      await client.sendMessage(chatId, apexError('could not fetch warnings'));
    }
    return;
  }

  // .clearwarn
  if (body === '.clearwarn') {
    if (!msg.hasQuotedMsg) {
      await client.sendMessage(chatId, apexError('reply to someone\'s message to clear their warnings'));
      return;
    }
    try {
      const quoted = await msg.getQuotedMessage();
      const targetId = quoted.author || quoted.from;
      const targetNum = targetId.replace(/@c\.us|@g\.us|@lid/gi, '').split(':')[0];
      clearWarn(chatId, targetId);
      await msg.react('✅');
      await client.sendMessage(chatId, apexWrap(`✅ Warnings cleared for @${targetNum}`), { mentions: [targetId] });
    } catch {
      await client.sendMessage(chatId, apexError('could not clear warnings'));
    }
    return;
  }
}
