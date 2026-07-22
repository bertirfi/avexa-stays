/**
 * Renders a JSON-LD structured-data script tag.
 * Server component — safe to embed in any server-rendered page.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
