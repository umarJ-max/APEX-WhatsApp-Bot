import sharp from 'sharp';
import { apexError } from './apexWrap.js';
import pkg from 'whatsapp-web.js';

const { MessageMedia } = pkg;

export const commands = ['.sticker'];

export async function handle(msg, body, client) {
  const target = msg.hasQuotedMsg ? await msg.getQuotedMessage() : msg;

  if (!target.hasMedia) {
    await client.sendMessage((msg._chatId || msg.from), apexError('send or reply to an image with *.sticker*'));
    return;
  }

  await msg.react('⏳');
  try {
    const media = await target.downloadMedia();
    const buffer = Buffer.from(media.data, 'base64');
    const webp = await sharp(buffer).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp().toBuffer();
    const stickerMedia = new MessageMedia('image/webp', webp.toString('base64'));
    await client.sendMessage((msg._chatId || msg.from), stickerMedia, { sendMediaAsSticker: true });
    await msg.react('✅');
  } catch (e) {
    console.error('Sticker:', e.message);
    await client.sendMessage((msg._chatId || msg.from), apexError('could not convert to sticker'));
  }
}
