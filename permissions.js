export async function isOwner(msg, client) {
  const ownerNumber = process.env.OWNER_NUMBER?.trim();
  if (!ownerNumber) return false;
  const raw = msg.author || msg._data?.author || msg.from;
  let senderNumber = raw.replace(/@c\.us|@g\.us|@lid/gi, '').split(':')[0].trim();

  if (raw.endsWith('@lid')) {
    try {
      const contact = await client.getContactById(raw);
      if (contact?.number) senderNumber = contact.number;
    } catch {}
  }

  return senderNumber === ownerNumber;
}

export async function isAdmin(msg, client) {
  try {
    const chat = await msg.getChat();
    if (!chat.isGroup) return false;
    const raw = msg.author || msg._data?.author || msg.from;
    let senderNumber = raw.replace(/@c\.us|@g\.us|@lid/gi, '').split(':')[0].trim();

    // if lid format, resolve to real phone number
    if (raw.endsWith('@lid')) {
      try {
        const contact = await client.getContactById(raw);
        if (contact?.number) senderNumber = contact.number;
      } catch {}
    }

    const participant = chat.participants?.find(p => p.id.user === senderNumber);
    return participant?.isAdmin === true || participant?.isSuperAdmin === true;
  } catch (e) {
    console.error('isAdmin error:', e.message);
    return false;
  }
}

export async function isGroup(msg) {
  try {
    const chat = await msg.getChat();
    return chat.isGroup === true;
  } catch {
    return false;
  }
}

export async function isOwnerOrAdmin(msg, client) {
  if (await isOwner(msg, client)) return true;
  return await isAdmin(msg, client);
}
