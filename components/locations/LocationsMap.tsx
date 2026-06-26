'use client';

import { useEffect, useRef, useState } from 'react';
import { StylizedMap } from '@/components/locations/StylizedMap';
import { loadGoogleMaps } from '@/lib/maps/loadGoogleMaps';
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

// Airbnb-style price pill — same look as the decorative map, applied imperatively
// to the overlay nodes so React state still drives the active highlight.
const PIN_BASE =
  'relative flex items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] px-2.5 py-1.5 font-display text-[12.5px] font-bold transition-all duration-200';
const PIN_INACTIVE =
  'border-transparent bg-white text-ink shadow-[0_4px_12px_rgba(0,0,0,.35)] hover:scale-105 hover:bg-gold';
const PIN_ACTIVE =
  'scale-[1.2] border-ink bg-gold text-ink shadow-[0_10px_28px_rgba(0,0,0,.5)]';

// Dark editorial map theme (brand ink + forest greens) to match the brand and
// keep the white/gold pins legible.
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

/**
 * Fan co-located pins out around their shared centroid so each stays clickable
 * (several suites share a building). Stand-alone pins keep their exact spot.
 */
function spreadPositions(items: Property[]): Map<string, google.maps.LatLngLiteral> {
  const groups = new Map<string, Property[]>();
  for (const p of items) {
    const c = p.coordinates;
    if (!c) continue;
    const key = `${c.lat.toFixed(4)},${c.lng.toFixed(4)}`;
    const arr = groups.get(key);
    if (arr) arr.push(p);
    else groups.set(key, [p]);
  }

  const out = new Map<string, google.maps.LatLngLiteral>();
  for (const group of groups.values()) {
    if (group.length === 1) {
      const c = group[0].coordinates!;
      out.set(group[0].id, { lat: c.lat, lng: c.lng });
      continue;
    }
    const lat0 = group.reduce((s, p) => s + p.coordinates!.lat, 0) / group.length;
    const lng0 = group.reduce((s, p) => s + p.coordinates!.lng, 0) / group.length;
    const radius = 0.00032; // ~35m so the cluster reads as one building, still separable
    group.forEach((p, i) => {
      const angle = (2 * Math.PI * i) / group.length - Math.PI / 2;
      const lat = lat0 + radius * Math.sin(angle);
      const lng = lng0 + (radius * Math.cos(angle)) / Math.cos((lat0 * Math.PI) / 180);
      out.set(p.id, { lat, lng });
    });
  }
  return out;
}

function styleMarker(el: HTMLElement, isActive: boolean) {
  const inner = el.firstElementChild as HTMLElement | null;
  if (inner) inner.className = `${PIN_BASE} ${isActive ? PIN_ACTIVE : PIN_INACTIVE}`;
  el.style.zIndex = isActive ? '10' : '1';
}

export function LocationsMap(props: LocationsMapProps) {
  const { variant = 'desktop' } = props;
  const isMobile = variant === 'mobile';
  const [failed, setFailed] = useState(false);

  // Keep latest props in a ref so the imperative overlay closures stay fresh
  // without rebuilding the markers on every render.
  const propsRef = useRef(props);
  propsRef.current = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef(new Map<string, { overlay: google.maps.OverlayView; el: HTMLButtonElement }>());

  // ── Init (once): load the API, then build map + markers when the container
  //    actually has a size (handles hidden→visible for the desktop column and
  //    the mobile overlay). ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | null = null;
    const markers = markersRef.current;

    const pending = loadGoogleMaps();
    if (!pending) {
      setFailed(true);
      return;
    }

    pending
      .then((maps) => {
        if (cancelled) return;
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

          const pinnable = propsRef.current.properties.filter((p) => p.coordinates);
          const positions = spreadPositions(pinnable);
          const bounds = new maps.LatLngBounds();

          for (const property of pinnable) {
            const position = positions.get(property.id);
            if (!position) continue;

            const el = document.createElement('button');
            el.type = 'button';
            el.setAttribute('aria-label', `${property.name} — €${property.rates[0].perNight} per night`);
            el.style.cssText =
              'position:absolute;transform:translate(-50%,-100%);background:none;border:none;padding:0;cursor:pointer;';
            el.innerHTML =
              `<span class="${PIN_BASE} ${PIN_INACTIVE}">` +
              `<span style="display:inline-block;width:6px;height:6px;border-radius:9999px;background:${property.neighborhoodColor}"></span>` +
              `€${property.rates[0].perNight}` +
              `<span class="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-inherit"></span>` +
              `</span>`;

            el.addEventListener('mouseenter', () => propsRef.current.onActivate(property.id));
            el.addEventListener('mouseleave', () => propsRef.current.onClear());
            el.addEventListener('click', (event) => {
              event.stopPropagation();
              const current = propsRef.current;
              current.onActivate(property.id);
              if (current.variant === 'mobile') {
                current.onPinTap?.(property.id);
                return;
              }
              document
                .getElementById(`loc-card-${property.id}`)
                ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            });

            const overlay = new maps.OverlayView();
            overlay.onAdd = function onAdd() {
              this.getPanes()?.overlayMouseTarget.appendChild(el);
            };
            overlay.draw = function draw() {
              const point = this.getProjection()?.fromLatLngToDivPixel(
                new maps.LatLng(position.lat, position.lng),
              );
              if (!point) return;
              el.style.left = `${point.x}px`;
              el.style.top = `${point.y}px`;
            };
            overlay.onRemove = function onRemove() {
              el.remove();
            };
            overlay.setMap(map);

            styleMarker(el, propsRef.current.activeId === property.id);
            markers.set(property.id, { overlay, el });
            bounds.extend(position);
          }

          if (!bounds.isEmpty()) {
            map.fitBounds(bounds, mobile ? 56 : 76);
            maps.event.addListenerOnce(map, 'idle', () => {
              const zoom = map.getZoom();
              if (typeof zoom === 'number' && zoom > 16) map.setZoom(16);
            });
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
      observer?.disconnect();
      markers.forEach(({ overlay }) => overlay.setMap(null));
      markers.clear();
      mapRef.current = null;
    };
    // Mount-once: properties are stable server data; latest handlers come from propsRef.
  }, []);

  // ── Active highlight follows hover / scroll-sync from the list. ───────────
  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => styleMarker(el, id === props.activeId));
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
