import sharp from 'sharp';
import { apexWrap, apexError } from './apexWrap.js';
import pkg from 'whatsapp-web.js';

const { MessageMedia } = pkg;

export const commands = ['.sticker', '.take'];

export async function handle(msg, body, client) {
  const chatId = msg._chatId || msg.from;

  // .sticker — convert image to sticker
  if (body === '.sticker') {
    const target = msg.hasQuotedMsg ? await msg.getQuotedMessage() : msg;
    if (!target.hasMedia) {
      await client.sendMessage(chatId, apexError('send or reply to an image with *.sticker*'));
      return;
    }
    await msg.react('⏳');
    try {
      const media = await target.downloadMedia();
      const buffer = Buffer.from(media.data, 'base64');
      const webp = await sharp(buffer)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp().toBuffer();
      const stickerMedia = new MessageMedia('image/webp', webp.toString('base64'));
      await client.sendMessage(chatId, stickerMedia, { sendMediaAsSticker: true });
      await msg.react('✅');
    } catch (e) {
      console.error('Sticker:', e.message);
      await client.sendMessage(chatId, apexError('could not convert to sticker'));
    }
    return;
  }

  // .take <name> | <author> — reply to a sticker to rename it
  // Usage: .take Cat             → sets pack name to "Cat"
  //        .take Cat | Umar J    → sets pack name + author
  if (body.startsWith('.take ')) {
    if (!msg.hasQuotedMsg) {
      await client.sendMessage(chatId, apexError('reply to a sticker with *.take <name>*'));
      return;
    }

    const quoted = await msg.getQuotedMessage();
    if (!quoted.hasMedia) {
      await client.sendMessage(chatId, apexError('reply to a sticker with *.take <name>*'));
      return;
    }

    const input = body.slice(6).trim();
    const parts = input.split('|').map(s => s.trim());
    const packName = parts[0] || 'APEX';
    const authorName = parts[1] || 'Umar J';

    await msg.react('⏳');
    try {
      const media = await quoted.downloadMedia();
      const buffer = Buffer.from(media.data, 'base64');

      // Convert/resize to proper sticker format
      const webp = await sharp(buffer)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp().toBuffer();

      const stickerMedia = new MessageMedia('image/webp', webp.toString('base64'));
      await client.sendMessage(chatId, stickerMedia, {
        sendMediaAsSticker: true,
        stickerName: packName,
        stickerAuthor: authorName
      });
      await msg.react('✅');
    } catch (e) {
      console.error('Take error:', e.message);
      await client.sendMessage(chatId, apexError('could not rename sticker'));
    }
    return;
  }
}
