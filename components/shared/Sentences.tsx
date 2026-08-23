import { splitSentences } from '@/lib/text';

/**
 * Renders multi-sentence copy with each sentence on its own line ("punct și de
 * la capăt" — site-wide client requirement). Drop-in inside any <p>/<span>:
 * single-sentence text renders unchanged.
 */
export function Sentences({ text }: { text: string }) {
  const parts = splitSentences(text);
  if (parts.length <= 1) return <>{text}</>;
  return (
    <>
      {parts.map((sentence, i) => (
        <span key={i} className="block">
          {sentence}
        </span>
      ))}
    </>
  );
}
