/**
 * Singleton loader for the Google Maps JavaScript API.
 *
 * Dependency-free: injects the API script exactly once and resolves with the
 * `google.maps` namespace. Returns `null` synchronously when there is no key
 * configured or when called on the server, so callers can fall back to the
 * decorative map without throwing. The key is the same one used by the stay
 * page's Embed map: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
 */

let mapsPromise: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps(): Promise<typeof google.maps> | null {
  if (typeof window === 'undefined') return null;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  if (typeof google !== 'undefined' && google.maps) {
    return Promise.resolve(google.maps);
  }
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise<typeof google.maps>((resolve, reject) => {
    const callbackName = '__avexaGoogleMapsReady';
    (window as unknown as Record<string, () => void>)[callbackName] = () => {
      resolve(google.maps);
    };

    const params = new URLSearchParams({
      key,
      v: 'weekly',
      loading: 'async',
      language: 'en',
      region: 'RO',
      callback: callbackName,
    });

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      mapsPromise = null;
      reject(new Error('Failed to load Google Maps'));
    };
    document.head.appendChild(script);
  });

  return mapsPromise;
}
