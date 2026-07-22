/**
 * Singleton loader for the Google Maps JavaScript API.
 *
 * Dependency-free: injects the API script exactly once and resolves with the
 * `google.maps` namespace. Returns `null` synchronously when there is no key
 * configured or when called on the server, so callers can fall back to the
 * decorative map without throwing. The key is the same one used by the stay
 * page's Embed map: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
 *
 * Auth/referrer failures (e.g. RefererNotAllowedMapError) don't fire the
 * script's `onerror` — the script loads fine and Google paints its own error
 * box into the map div. Google calls `window.gm_authFailure` instead, so we
 * hook it and let subscribers fall back to the decorative map gracefully.
 */

let mapsPromise: Promise<typeof google.maps> | null = null;
let authFailed = false;
const authSubscribers = new Set<() => void>();

/** True once Google has reported an auth/referrer failure for the key. */
export function isMapsAuthFailed(): boolean {
  return authFailed;
}

/** Subscribe to Google Maps auth/referrer failure. Returns an unsubscribe fn. */
export function subscribeMapsAuthFailure(callback: () => void): () => void {
  authSubscribers.add(callback);
  return () => authSubscribers.delete(callback);
}

export function loadGoogleMaps(): Promise<typeof google.maps> | null {
  if (typeof window === 'undefined') return null;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  if (typeof google !== 'undefined' && google.maps) {
    return Promise.resolve(google.maps);
  }
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise<typeof google.maps>((resolve, reject) => {
    const win = window as unknown as Record<string, () => void>;

    const callbackName = '__avexaGoogleMapsReady';
    win[callbackName] = () => {
      resolve(google.maps);
    };

    // Must be defined before the API script evaluates so Google can call it.
    win.gm_authFailure = () => {
      authFailed = true;
      authSubscribers.forEach((cb) => cb());
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
