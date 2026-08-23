/**
 * Split copy into sentences for line-per-sentence rendering (client requirement:
 * every sentence starts on a new line, site-wide). Splits after . ! ? followed
 * by whitespace; keeps the punctuation with its sentence.
 */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
