'use client';

import { useEffect, useRef, useState } from 'react';
import { StylizedMap } from '@/components/locations/StylizedMap';
import { loadGoogleMaps, subscribeMapsAuthFailure, isMapsAuthFailed } from '@/lib/maps/loadGoogleMaps';
import { cn } from '@/lib/cn';
import type { Property } from '@/types';

interface LocationsMapProps {
  properties: Property[];
  activeId: string | null;
  onActivate: (id: string) => void;
  onClear: () => void;
  /** 'desktop' = sticky right-column box (lg only). 'mobile' = fills a full-screen overlay. */
  variant?: 'desktop' | 'mobile';
  /** Mobile only: tapping a pin surfaces a card popup instead of scrolling. */
  onPinTap?: (id: string) => void;
}

const BUCHAREST_CENTER: google.maps.LatLngLiteral = { lat: 44.4385, lng: 26.0965 };

// At/above this zoom, a building cluster expands into its individual suite pins.
const SPREAD_ZOOM = 16;
// Fan radius (deg lat, ~50m) used to separate suites in the same building once
// the cluster is expanded — readable at SPREAD_ZOOM, honest about the complex.
const FAN_RADIUS = 0.00045;

// Airbnb-style price pill — applied imperatively to overlay nodes so React state
// still drives the active highlight.
const PIN_BASE =
  'relative flex items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] px-2.5 py-1.5 font-display text-[12.5px] font-bold transition-all duration-200';
const PIN_INACTIVE =
  'border-transparent bg-white text-ink shadow-[0_4px_12px_rgba(0,0,0,.35)] hover:scale-105 hover:bg-gold';
const PIN_ACTIVE =
  'scale-[1.2] border-ink bg-gold text-ink shadow-[0_10px_28px_rgba(0,0,0,.5)]';

const DOT = (color: string) =>
  `<span style="display:inline-block;width:6px;height:6px;border-radius:9999px;background:${color}"></span>`;
const CARET = '<span class="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-inherit"></span>';
const COUNT_BADGE = (n: number) =>
  `<span style="display:inline-grid;place-items:center;min-width:16px;height:16px;padding:0 4px;margin-left:1px;border-radius:9999px;background:#191919;color:#fff;font-size:10px;line-height:1">${n}</span>`;

// Dark editorial map theme (brand ink + forest greens) to keep white/gold pins legible.
const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#242824' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9aa39a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1b1f1b' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#2f3b2c' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#343a30' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#7d857b' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3f4636' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#4a5240' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1b2630' }] },
];

type MarkerEntry = { overlay: google.maps.OverlayView; el: HTMLButtonElement } & (
  | { kind: 'individual'; propertyId: string; grouped: boolean }
  | { kind: 'cluster'; groupIds: string[] }
);

function styleMarker(el: HTMLElement, isActive: boolean) {
  const inner = el.firstElementChild as HTMLElement | null;
  if (inner) inner.className = `${PIN_BASE} ${isActive ? PIN_ACTIVE : PIN_INACTIVE}`;
  el.style.zIndex = isActive ? '10' : '1';
}

/**
 * Greedy proximity clustering — groups suites within `thresholdM` metres of a
 * running centroid (same building/complex). Distance-based, so suites ~15m
 * apart never split across a coordinate grid boundary.
 */
function clusterByProximity(items: Property[], thresholdM: number): Property[][] {
  const clusters: { lat: number; lng: number; items: Property[] }[] = [];
  for (const p of items) {
    const c = p.coordinates!;
    let placed = false;
    for (const cl of clusters) {
      const dLat = (c.lat - cl.lat) * 111320;
      const dLng = (c.lng - cl.lng) * 111320 * Math.cos((cl.lat * Math.PI) / 180);
      if (Math.hypot(dLat, dLng) < thresholdM) {
        cl.items.push(p);
        cl.lat = cl.items.reduce((s, q) => s + q.coordinates!.lat, 0) / cl.items.length;
        cl.lng = cl.items.reduce((s, q) => s + q.coordinates!.lng, 0) / cl.items.length;
        placed = true;
        break;
      }
    }
    if (!placed) clusters.push({ lat: c.lat, lng: c.lng, items: [p] });
  }
  return clusters.map((cl) => cl.items);
}

/** Build a positioned price-pin overlay with the given HTML + handlers. */
function makeMarker(
  maps: typeof google.maps,
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  innerHTML: string,
  ariaLabel: string,
  handlers: { onEnter?: () => void; onLeave?: () => void; onClick: (e: MouseEvent) => void },
): { overlay: google.maps.OverlayView; el: HTMLButtonElement } {
  const el = document.createElement('button');
  el.type = 'button';
  el.setAttribute('aria-label', ariaLabel);
  el.style.cssText = 'position:absolute;transform:translate(-50%,-100%);background:none;border:none;padding:0;cursor:pointer;';
  el.innerHTML = innerHTML;
  if (handlers.onEnter) el.addEventListener('mouseenter', handlers.onEnter);
  if (handlers.onLeave) el.addEventListener('mouseleave', handlers.onLeave);
  el.addEventListener('click', handlers.onClick);

  const overlay = new maps.OverlayView();
  overlay.onAdd = function onAdd() {
    this.getPanes()?.overlayMouseTarget.appendChild(el);
  };
  overlay.draw = function draw() {
    const point = this.getProjection()?.fromLatLngToDivPixel(new maps.LatLng(position.lat, position.lng));
    if (!point) return;
    el.style.left = `${point.x}px`;
    el.style.top = `${point.y}px`;
  };
  overlay.onRemove = function onRemove() {
    el.remove();
  };
  overlay.setMap(map);
  return { overlay, el };
}

export function LocationsMap(props: LocationsMapProps) {
  const { variant = 'desktop' } = props;
  const isMobile = variant === 'mobile';
  const [failed, setFailed] = useState(false);

  // Latest props in a ref so imperative overlay closures stay fresh without
  // rebuilding markers on every render.
  const propsRef = useRef(props);
  propsRef.current = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef(new Map<string, MarkerEntry>());

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | null = null;
    const markers = markersRef.current;

    const pending = loadGoogleMaps();
    if (!pending) {
      setFailed(true);
      return;
    }

    // Referrer/auth failures don't reject the loader — Google paints its own
    // error box. Catch them and fall back to the decorative map instead.
    const unsubscribe = subscribeMapsAuthFailure(() => {
      if (!cancelled) setFailed(true);
    });

    pending
      .then((maps) => {
        if (cancelled) return;
        if (isMapsAuthFailed()) {
          setFailed(true);
          return;
        }
        const container = containerRef.current;
        if (!container) return;

        const build = () => {
          if (mapRef.current) {
            maps.event.trigger(mapRef.current, 'resize');
            return;
          }
          if (container.clientWidth === 0 || container.clientHeight === 0) return;

          const mobile = propsRef.current.variant === 'mobile';
          const map = new maps.Map(container, {
            center: BUCHAREST_CENTER,
            zoom: 14,
            minZoom: 11,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: !mobile,
            clickableIcons: false,
            gestureHandling: mobile ? 'greedy' : 'cooperative',
            backgroundColor: '#242824',
            styles: MAP_STYLE,
          });
          mapRef.current = map;

          // Group suites by proximity (same building/complex within ~70m).
          // Require rates[0] too: a bad Supabase content row with empty rates[]
          // would otherwise throw in this loop and drop the whole map to fallback.
          const pinnable = propsRef.current.properties.filter((p) => p.coordinates && p.rates[0]);
          const groups = clusterByProximity(pinnable, 70);

          const bounds = new maps.LatLngBounds();

          const individualMarker = (p: Property, position: google.maps.LatLngLiteral, grouped: boolean) => {
            const html =
              `<span class="${PIN_BASE} ${PIN_INACTIVE}">${DOT(p.neighborhoodColor)}€${p.rates[0].perNight}${CARET}</span>`;
            const { overlay, el } = makeMarker(maps, map, position, html, `${p.name} — €${p.rates[0].perNight} per night`, {
              onEnter: () => propsRef.current.onActivate(p.id),
              onLeave: () => propsRef.current.onClear(),
              onClick: (event) => {
                event.stopPropagation();
                const current = propsRef.current;
                current.onActivate(p.id);
                if (current.variant === 'mobile') {
                  current.onPinTap?.(p.id);
                  return;
                }
                document.getElementById(`loc-card-${p.id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
              },
            });
            markers.set(`i:${p.id}`, { overlay, el, kind: 'individual', propertyId: p.id, grouped });
          };

          for (const group of groups) {
            if (group.length === 1) {
              const c = group[0].coordinates!;
              const position = { lat: c.lat, lng: c.lng };
              individualMarker(group[0], position, false);
              bounds.extend(position);
              continue;
            }

            // Cluster centroid + a single collapsed pin shown at low zoom.
            const lat0 = group.reduce((s, p) => s + p.coordinates!.lat, 0) / group.length;
            const lng0 = group.reduce((s, p) => s + p.coordinates!.lng, 0) / group.length;
            const centroid = { lat: lat0, lng: lng0 };
            const minPrice = Math.min(...group.map((p) => p.rates[0].perNight));
            const groupIds = group.map((p) => p.id);

            const clusterHtml =
              `<span class="${PIN_BASE} ${PIN_INACTIVE}">${DOT(group[0].neighborhoodColor)}€${minPrice}${COUNT_BADGE(group.length)}${CARET}</span>`;
            const cluster = makeMarker(maps, map, centroid, clusterHtml, `${group.length} suites from €${minPrice} per night`, {
              onClick: (event) => {
                event.stopPropagation();
                map.panTo(centroid);
                map.setZoom(SPREAD_ZOOM);
              },
            });
            markers.set(`c:${lat0.toFixed(5)},${lng0.toFixed(5)}`, { overlay: cluster.overlay, el: cluster.el, kind: 'cluster', groupIds });
            bounds.extend(centroid);

            // Individual suites fanned around the centroid, hidden until expanded.
            group.forEach((p, i) => {
              const angle = (2 * Math.PI * i) / group.length - Math.PI / 2;
              const position = {
                lat: lat0 + FAN_RADIUS * Math.sin(angle),
                lng: lng0 + (FAN_RADIUS * Math.cos(angle)) / Math.cos((lat0 * Math.PI) / 180),
              };
              individualMarker(p, position, true);
            });
          }

          const applyZoomVisibility = () => {
            const zoom = map.getZoom() ?? 14;
            const expanded = zoom >= SPREAD_ZOOM;
            markers.forEach((entry) => {
              if (entry.kind === 'cluster') entry.el.style.display = expanded ? 'none' : '';
              else if (entry.grouped) entry.el.style.display = expanded ? '' : 'none';
            });
          };

          const applyActive = () => {
            const activeId = propsRef.current.activeId;
            markers.forEach((entry) => {
              const active =
                entry.kind === 'cluster' ? entry.groupIds.includes(activeId ?? '') : entry.propertyId === activeId;
              styleMarker(entry.el, active);
            });
          };

          maps.event.addListener(map, 'zoom_changed', applyZoomVisibility);

          if (!bounds.isEmpty()) {
            map.fitBounds(bounds, mobile ? 56 : 76);
            maps.event.addListenerOnce(map, 'idle', () => {
              const zoom = map.getZoom();
              if (typeof zoom === 'number' && zoom > 16) map.setZoom(16);
              applyZoomVisibility();
              applyActive();
            });
          } else {
            applyZoomVisibility();
            applyActive();
          }
        };

        observer = new ResizeObserver(build);
        observer.observe(container);
        build();
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      unsubscribe();
      observer?.disconnect();
      if (mapRef.current && typeof google !== 'undefined') {
        google.maps.event.clearInstanceListeners(mapRef.current);
      }
      markers.forEach(({ overlay }) => overlay.setMap(null));
      markers.clear();
      mapRef.current = null;
    };
    // Mount-once: properties are stable server data; latest handlers come from propsRef.
  }, []);

  // Active highlight follows hover / scroll-sync from the list (cluster lights
  // up when any of its suites is active).
  useEffect(() => {
    const activeId = props.activeId;
    markersRef.current.forEach((entry) => {
      const active =
        entry.kind === 'cluster' ? entry.groupIds.includes(activeId ?? '') : entry.propertyId === activeId;
      styleMarker(entry.el, active);
    });
  }, [props.activeId]);

  if (failed) return <StylizedMap {...props} />;

  return (
    <div
      className={cn(
        isMobile
          ? 'relative h-full w-full overflow-hidden bg-[#242824]'
          : 'relative m-3 ml-0 hidden overflow-hidden rounded-[20px] border-l border-gray-line bg-[#242824] lg:sticky lg:top-20 lg:block lg:h-[calc(100dvh-5rem)]',
      )}
    >
      <div ref={containerRef} className="absolute inset-0" role="application" aria-label="Map of AVEXA stays in Bucharest City Center" />
    </div>
  );
}
