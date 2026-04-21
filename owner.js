import { apexWrap, apexError, apexThinking } from './apexWrap.js';
import { isOwner } from './permissions.js';

export const commands = ['.shutdown', '.restart', '.block', '.unblock', '.setbio', '.getbio', '.broadcast'];

export async function handle(msg, body, client) {
  if (!(await isOwner(msg, client))) {
    await msg.react('🔒');
    await client.sendMessage(msg.to, apexError('owner only command 🔒'));
    return;
  }

  if (body === '.shutdown') {
    await msg.react('🔴');
    await client.sendMessage(msg.to, apexWrap('🔴 *APEX shutting down...*'));
    setTimeout(() => process.exit(0), 2000);
    return;
  }

  if (body === '.restart') {
    await msg.react('🔄');
    await client.sendMessage(msg.to, apexWrap('🔄 *Restarting APEX...*'));
    setTimeout(() => process.exit(1), 2000);
    return;
  }

  if (body === '.block') {
    if (!msg.hasQuotedMsg) { await client.sendMessage(msg.to, apexError('reply to someone to block them')); return; }
    try {
      await msg.react('🚫');
      const quoted = await msg.getQuotedMessage();
      const contact = await client.getContactById(quoted.author || quoted.from);
      await contact.block();
      await client.sendMessage(msg.to, apexWrap('🚫 Contact blocked.'));
    } catch { await client.sendMessage(msg.to, apexError('could not block')); }
    return;
  }

  if (body === '.unblock') {
    if (!msg.hasQuotedMsg) { await client.sendMessage(msg.to, apexError('reply to someone to unblock them')); return; }
    try {
      await msg.react('✅');
      const quoted = await msg.getQuotedMessage();
      const contact = await client.getContactById(quoted.author || quoted.from);
      await contact.unblock();
      await client.sendMessage(msg.to, apexWrap('✅ Contact unblocked.'));
    } catch { await client.sendMessage(msg.to, apexError('could not unblock')); }
    return;
  }

  if (body.startsWith('.setbio ')) {
    const bio = body.slice(8).trim();
    if (!bio) return;
    try {
      await msg.react('✏️');
      await client.setStatus(bio);
      await client.sendMessage(msg.to, apexWrap(`✏️ Bio updated:\n_${bio}_`));
    } catch { await client.sendMessage(msg.to, apexError('could not update bio')); }
    return;
  }

  if (body === '.getbio') {
    try {
      await msg.react('ℹ️');
      const me = await client.getContactById(client.info.wid._serialized);
      await client.sendMessage(msg.to, apexWrap(`ℹ️ *Bio:* _${me.statusMute || 'none'}_`));
    } catch { await client.sendMessage(msg.to, apexError('could not get bio')); }
    return;
  }

  if (body.startsWith('.broadcast ')) {
    const text = body.slice(11).trim();
    if (!text) return;
    await msg.react('📡');
    await client.sendMessage(msg.to, apexThinking('broadcasting...'));
    try {
      const chats = await client.getChats();
      let sent = 0;
      for (const chat of chats) {
        try { await chat.sendMessage(`📡 *Broadcast*\n\n${text}`); sent++; await new Promise(r => setTimeout(r, 1000)); } catch {}
      }
      await client.sendMessage(msg.to, apexWrap(`📡 Sent to *${sent}* chats.`));
    } catch { await client.sendMessage(msg.to, apexError('broadcast failed')); }
    return;
  }
}
