export function apexWrap(content) {
  return `🖤 *A P E X*\n─────────────────────\n\n${content}\n\n─────────────────────`;
}

export function apexThinking(text = 'on it...') {
  return `⏳ *${text}*\n_give me a sec_ 🖤`;
}

export function apexError(text = 'something broke. try again.') {
  return `🖤 *A P E X*\n${text}`;
}
