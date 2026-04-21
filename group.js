import { apexWrap, apexError } from './apexWrap.js';
import { isOwnerOrAdmin, isGroup } from './permissions.js';

export const commands = ['.tagall', '.everyone', '.kick', '.promote', '.demote', '.invite', '.opengroup', '.closegroup'];

export async function handle(msg, body, client) {
  if (!(await isGroup(msg))) {
    await client.sendMessage((msg._chatId || msg.from), apexError('this command only works in groups'));
    return;
  }
  const allowed = await isOwnerOrAdmin(msg, client);
  if (!allowed) {
    await msg.react('🔒');
    await client.sendMessage((msg._chatId || msg.from), apexError('admins only 🔒'));
    return;
  }

  const chat = await client.getChatById((msg._chatId || msg.from));

  if (body === '.tagall' || body === '.everyone') {
    await msg.react('📢');
    const participants = chat.participants;
    const mentions = participants.map(p => p.id._serialized);
    const mentionText = participants.map(p => `@${p.id.user}`).join(' ');
    await client.sendMessage((msg._chatId || msg.from), `📢 *Attention everyone!*\n\n${mentionText}`, { mentions });
    return;
  }

  if (body === '.kick') {
    if (!msg.hasQuotedMsg) { await client.sendMessage((msg._chatId || msg.from), apexError('reply to someone to kick them')); return; }
    try {
      await msg.react('👢');
      const quoted = await msg.getQuotedMessage();
      await chat.removeParticipants([quoted.author || quoted.from]);
      await client.sendMessage((msg._chatId || msg.from), apexWrap('👢 Removed from group.'));
    } catch { await client.sendMessage((msg._chatId || msg.from), apexError('could not kick. am I an admin here?')); }
    return;
  }

  if (body === '.promote') {
    if (!msg.hasQuotedMsg) { await client.sendMessage((msg._chatId || msg.from), apexError('reply to someone to promote them')); return; }
    try {
      await msg.react('⭐');
      const quoted = await msg.getQuotedMessage();
      await chat.promoteParticipants([quoted.author || quoted.from]);
      await client.sendMessage((msg._chatId || msg.from), apexWrap('⭐ Promoted to admin!'));
    } catch { await client.sendMessage((msg._chatId || msg.from), apexError('could not promote. am I an admin here?')); }
    return;
  }

  if (body === '.demote') {
    if (!msg.hasQuotedMsg) { await client.sendMessage((msg._chatId || msg.from), apexError('reply to someone to demote them')); return; }
    try {
      await msg.react('🔽');
      const quoted = await msg.getQuotedMessage();
      await chat.demoteParticipants([quoted.author || quoted.from]);
      await client.sendMessage((msg._chatId || msg.from), apexWrap('🔽 Demoted from admin.'));
    } catch { await client.sendMessage((msg._chatId || msg.from), apexError('could not demote. am I an admin here?')); }
    return;
  }

  if (body === '.invite') {
    try {
      await msg.react('🔗');
      const link = await chat.getInviteCode();
      await client.sendMessage((msg._chatId || msg.from), apexWrap(`🔗 *Invite Link*\n\nhttps://chat.whatsapp.com/${link}`));
    } catch { await client.sendMessage((msg._chatId || msg.from), apexError('could not get invite link')); }
    return;
  }

  if (body === '.opengroup') {
    try {
      await msg.react('🔓');
      await chat.setMessagesAdminsOnly(false);
      await client.sendMessage((msg._chatId || msg.from), apexWrap('🔓 Group is now open.'));
    } catch { await client.sendMessage((msg._chatId || msg.from), apexError('could not open group')); }
    return;
  }

  if (body === '.closegroup') {
    try {
      await msg.react('🔒');
      await chat.setMessagesAdminsOnly(true);
      await client.sendMessage((msg._chatId || msg.from), apexWrap('🔒 Group locked — admins only.'));
    } catch { await client.sendMessage((msg._chatId || msg.from), apexError('could not lock group')); }
    return;
  }
}
