/**
 * Renders a JSON-LD structured-data script tag.
 * Server component — safe to embed in any server-rendered page.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so no string value (e.g. a future FAQ answer containing
      // "</script>") can break out of this script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
