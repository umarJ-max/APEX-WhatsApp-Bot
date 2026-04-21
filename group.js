import { apexWrap, apexError } from './apexWrap.js';
import { isOwnerOrAdmin, isGroup } from './permissions.js';

// In-memory antilink enabled groups (resets on bot restart)
const antilinkGroups = new Set();

const LINK_REGEX = /(https?:\/\/|www\.)|chat\.whatsapp\.com/i;

export const commands = ['.tagall', '.everyone', '.kick', '.promote', '.demote', '.invite', '.opengroup', '.closegroup', '.groupinfo', '.antilink on', '.antilink off', '.antilink'];

export async function handleAntilink(msg, client) {
  try {
    const chat = await msg.getChat();
    if (!chat.isGroup) return;
    if (!antilinkGroups.has(chat.id._serialized)) return;

    const body = msg.body || '';
    if (!LINK_REGEX.test(body)) return;

    // Don't delete admins' messages
    // Resolve sender — @lid needs contact lookup to get real number
    const senderRaw = msg.author || msg.from;
    let senderNum = senderRaw.replace(/@c\.us|@g\.us|@lid/gi, '').split(':')[0];
    if (senderRaw.endsWith('@lid')) {
      try {
        const contact = await client.getContactById(senderRaw);
        if (contact?.number) senderNum = contact.number;
      } catch {}
    }
    const participant = chat.participants?.find(p => p.id.user === senderNum);
    if (participant?.isAdmin || participant?.isSuperAdmin) return;

    await msg.delete(true);
    await client.sendMessage(chat.id._serialized,
      apexWrap(`🔗 @${senderNum} links are not allowed here.`),
      { mentions: [sender] }
    );
  } catch (e) {
    console.error('Antilink error:', e.message);
  }
}

export async function handle(msg, body, client) {
  const chatId = msg._chatId || msg.from;

  if (!(await isGroup(msg))) {
    await client.sendMessage(chatId, apexError('this command only works in groups'));
    return;
  }

  // .groupinfo — no admin required
  if (body === '.groupinfo') {
    try {
      await msg.react('📋');
      const chat = await client.getChatById(chatId);
      const admins = chat.participants
        .filter(p => p.isAdmin || p.isSuperAdmin)
        .map(p => `👑 @${p.id.user}`)
        .join('\n');
      const created = chat.groupMetadata?.creation
        ? new Date(chat.groupMetadata.creation * 1000).toLocaleDateString()
        : 'Unknown';
      await client.sendMessage(chatId, apexWrap(
        `📋 *Group Info*\n\n` +
        `📛 *Name:* ${chat.name}\n` +
        `👥 *Members:* ${chat.participants.length}\n` +
        `📅 *Created:* ${created}\n` +
        `📝 *Description:*\n${chat.description || 'No description'}\n\n` +
        `👑 *Admins:*\n${admins}`
      ));
    } catch (e) {
      await client.sendMessage(chatId, apexError('could not fetch group info'));
    }
    return;
  }

  const allowed = await isOwnerOrAdmin(msg, client);
  if (!allowed) {
    await msg.react('🔒');
    await client.sendMessage(chatId, apexError('admins only 🔒'));
    return;
  }

  const chat = await client.getChatById(chatId);

  if (body === '.tagall' || body === '.everyone') {
    await msg.react('📢');
    const mentions = chat.participants.map(p => p.id._serialized);
    const mentionText = chat.participants.map(p => `@${p.id.user}`).join(' ');
    await client.sendMessage(chatId, `📢 *Attention everyone!*\n\n${mentionText}`, { mentions });
    return;
  }

  if (body === '.kick') {
    if (!msg.hasQuotedMsg) { await client.sendMessage(chatId, apexError('reply to someone to kick them')); return; }
    try {
      await msg.react('👢');
      const quoted = await msg.getQuotedMessage();
      await chat.removeParticipants([quoted.author || quoted.from]);
      await client.sendMessage(chatId, apexWrap('👢 Removed from group.'));
    } catch { await client.sendMessage(chatId, apexError('could not kick. am I an admin here?')); }
    return;
  }

  if (body === '.promote') {
    if (!msg.hasQuotedMsg) { await client.sendMessage(chatId, apexError('reply to someone to promote them')); return; }
    try {
      await msg.react('⭐');
      const quoted = await msg.getQuotedMessage();
      await chat.promoteParticipants([quoted.author || quoted.from]);
      await client.sendMessage(chatId, apexWrap('⭐ Promoted to admin!'));
    } catch { await client.sendMessage(chatId, apexError('could not promote. am I an admin here?')); }
    return;
  }

  if (body === '.demote') {
    if (!msg.hasQuotedMsg) { await client.sendMessage(chatId, apexError('reply to someone to demote them')); return; }
    try {
      await msg.react('🔽');
      const quoted = await msg.getQuotedMessage();
      await chat.demoteParticipants([quoted.author || quoted.from]);
      await client.sendMessage(chatId, apexWrap('🔽 Demoted from admin.'));
    } catch { await client.sendMessage(chatId, apexError('could not demote. am I an admin here?')); }
    return;
  }

  if (body === '.invite') {
    try {
      await msg.react('🔗');
      const link = await chat.getInviteCode();
      await client.sendMessage(chatId, apexWrap(`🔗 *Invite Link*\n\nhttps://chat.whatsapp.com/${link}`));
    } catch { await client.sendMessage(chatId, apexError('could not get invite link')); }
    return;
  }

  if (body === '.opengroup') {
    try {
      await msg.react('🔓');
      await chat.setMessagesAdminsOnly(false);
      await client.sendMessage(chatId, apexWrap('🔓 Group is now open.'));
    } catch { await client.sendMessage(chatId, apexError('could not open group')); }
    return;
  }

  if (body === '.closegroup') {
    try {
      await msg.react('🔒');
      await chat.setMessagesAdminsOnly(true);
      await client.sendMessage(chatId, apexWrap('🔒 Group locked — admins only.'));
    } catch { await client.sendMessage(chatId, apexError('could not lock group')); }
    return;
  }

  if (body === '.antilink' || body === '.antilink on' || body === '.antilink off') {
    if (body === '.antilink off' || (body === '.antilink' && antilinkGroups.has(chatId))) {
      antilinkGroups.delete(chatId);
      await msg.react('✅');
      await client.sendMessage(chatId, apexWrap('🔗 Antilink *disabled*. Links are allowed.'));
    } else {
      antilinkGroups.add(chatId);
      await msg.react('🔒');
      await client.sendMessage(chatId, apexWrap('🔗 Antilink *enabled*. Links will be auto-deleted.'));
    }
    return;
  }
}
