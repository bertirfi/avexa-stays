'use client';

import { useEffect, useRef, useState } from 'react';
import { StylizedMap } from '@/components/locations/StylizedMap';
import { loadGoogleMaps, subscribeMapsAuthFailure, isMapsAuthFailed } from '@/lib/maps/loadGoogleMaps';
import { useCurrency } from '@/components/currency/CurrencyProvider';
import { cn } from '@/lib/cn';
import { BUCHAREST_LANDMARKS, type Landmark } from '@/lib/maps/landmarks';
import type { Property } from '@/types';

interface LocationsMapProps {
  properties: Property[];
  /**
   * When set, only these property ids show pins (dated-search filtering).
   * Markers are built once from `properties`; this just toggles visibility,
   * so clearing the search restores every pin without a map rebuild.
   */
  visibleIds?: string[];
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

// Quiet landmark badges (Airbnb-style POIs). Inline-styled like the pin helpers
// above; muted ink glyph (#57544d) so they read as context, never as a CTA.
const GLYPHS: Record<Landmark['kind'], string> = {
  monument:
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#57544d" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-5 9 5"/><path d="M5 9v8M12 9v8M19 9v8"/><path d="M3 20h18"/></svg>',
  museum:
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#57544d" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 15l4-4 3 3 4-5 5 6"/></svg>',
  park:
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#57544d" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5"/><path d="M12 14v6"/></svg>',
  square:
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="#57544d"><circle cx="7" cy="7" r="2.3"/><circle cx="17" cy="7" r="2.3"/><circle cx="7" cy="17" r="2.3"/><circle cx="17" cy="17" r="2.3"/></svg>',
  station:
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#57544d" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="13" rx="2"/><path d="M6 10h12M8.5 20l-1.5 2M15.5 20l1.5 2"/></svg>',
};

// Badge (white circle + glyph) plus a haloed label. `data-label` lets the zoom
// handler drop labels below zoom 13 without rebuilding the node.
function landmarkInnerHTML(l: Landmark): string {
  const badge =
    'display:grid;place-items:center;width:25px;height:25px;border-radius:9999px;background:#fff;border:1px solid #E6E4DD;box-shadow:0 1px 3px rgba(0,0,0,.14);flex:none';
  const label =
    'font-size:11px;font-weight:500;line-height:1;color:#6b6b66;text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 2px #fff;white-space:nowrap';
  return `<span style="${badge}">${GLYPHS[l.kind]}</span><span data-label style="${label}">${l.name}</span>`;
}

// Light editorial map theme (brand cream/ivory + soft gray-green) — same custom
// styling approach as before, palette inverted to match the site. Dark ink labels
// with light halos keep white/gold pins legible on the pale ground.
const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f0ece2' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4a4740' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f7f4ec' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dbe3d0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a867c' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f6efdd' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#e7dec8' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cdd9df' }] },
];

type MarkerEntry = { overlay: google.maps.OverlayView; el: HTMLButtonElement; hidden: boolean } & (
  | { kind: 'individual'; propertyId: string; name: string; grouped: boolean; priceRon: number; color: string }
  | { kind: 'cluster'; groupIds: string[]; minPriceRon: number; count: number; color: string }
);

function styleMarker(el: HTMLElement, isActive: boolean) {
  const inner = el.firstElementChild as HTMLElement | null;
  if (inner) inner.className = `${PIN_BASE} ${isActive ? PIN_ACTIVE : PIN_INACTIVE}`;
  el.style.zIndex = isActive ? '10' : '1';
}

/**
 * Single source of truth for pin inner-HTML — used both at build time and when
 * the display currency changes, so the markup never drifts between the two.
 * Always renders the inactive style; callers re-apply active state via
 * styleMarker() immediately after (matching the build-time build → applyActive flow).
 */
function pinInnerHTML(color: string, priceLabel: string, count?: number): string {
  const badge = typeof count === 'number' ? COUNT_BADGE(count) : '';
  return `<span class="${PIN_BASE} ${PIN_INACTIVE}">${DOT(color)}${priceLabel}${badge}${CARET}</span>`;
}

/** Shared aria-label text — kept alongside pinInnerHTML so build + rewrite never drift. */
function pinAriaLabel(priceLabel: string, name?: string, count?: number): string {
  if (typeof count === 'number') return `${count} suites from ${priceLabel} per night`;
  return `${name} — ${priceLabel} per night`;
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

/**
 * Landmark overlay — same OverlayView mechanism as makeMarker, but a plain,
 * never-clickable div (pointer-events:none) pinned below the price pins so it
 * can never steal a tap meant for a listing.
 */
function makeLandmark(
  maps: typeof google.maps,
  map: google.maps.Map,
  l: Landmark,
): { overlay: google.maps.OverlayView; el: HTMLDivElement } {
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;display:flex;align-items:center;gap:5px;transform:translate(-50%,-50%);pointer-events:none;z-index:0';
  el.innerHTML = landmarkInnerHTML(l);

  const overlay = new maps.OverlayView();
  overlay.onAdd = function onAdd() {
    // overlayLayer sits under overlayMouseTarget (where the price pins live).
    this.getPanes()?.overlayLayer.appendChild(el);
  };
  overlay.draw = function draw() {
    const point = this.getProjection()?.fromLatLngToDivPixel(new maps.LatLng(l.lat, l.lng));
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
  const { currency, format } = useCurrency();

  // Latest props in a ref so imperative overlay closures stay fresh without
  // rebuilding markers on every render.
  const propsRef = useRef(props);
  propsRef.current = props;

  // Latest formatter in a ref — read at marker-build time (initial mount) and
  // by the currency-change effect below. Never triggers a rebuild itself.
  const formatRef = useRef(format);
  formatRef.current = format;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef(new Map<string, MarkerEntry>());
  // Latest zoom-visibility applier — set inside build(), called by the
  // visibleIds sync below so hidden flags take effect immediately.
  const applyVisibilityRef = useRef<() => void>(() => {});

  /**
   * Sync marker `hidden` flags with props.visibleIds (search filtering).
   * Clusters shrink honestly: count badge + "from" price are recomputed from
   * the visible members only (groupIds/count/minPriceRon stay the full-set
   * originals so clearing the search restores them).
   */
  const syncVisibleMarkers = () => {
    const markers = markersRef.current;
    if (markers.size === 0) return;
    const ids = propsRef.current.visibleIds;
    const visibleSet = ids == null ? null : new Set(ids);
    const activeId = propsRef.current.activeId;

    markers.forEach((entry) => {
      if (entry.kind === 'individual') entry.hidden = visibleSet ? !visibleSet.has(entry.propertyId) : false;
    });
    markers.forEach((entry) => {
      if (entry.kind !== 'cluster') return;
      const visible = visibleSet ? entry.groupIds.filter((id) => visibleSet.has(id)) : entry.groupIds;
      entry.hidden = visible.length === 0;
      if (visible.length === 0) return;
      const prices = visible
        .map((id) => markers.get(`i:${id}`))
        .filter((e): e is Extract<MarkerEntry, { kind: 'individual' }> => !!e && e.kind === 'individual')
        .map((e) => e.priceRon);
      const label = formatRef.current(Math.min(...prices));
      entry.el.innerHTML = pinInnerHTML(entry.color, label, visible.length);
      entry.el.setAttribute('aria-label', pinAriaLabel(label, undefined, visible.length));
      styleMarker(entry.el, entry.groupIds.includes(activeId ?? ''));
    });
    applyVisibilityRef.current();
  };
  const landmarksRef = useRef<{ overlay: google.maps.OverlayView; el: HTMLDivElement; minZoom?: number }[]>([]);

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | null = null;
    const markers = markersRef.current;
    const landmarks = landmarksRef.current;

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
            // Airbnb-style: plain scroll/pinch zooms the map directly (no Ctrl).
            gestureHandling: 'greedy',
            backgroundColor: '#f0ece2',
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
            const priceRon = p.rates[0].perNight;
            const label = formatRef.current(priceRon);
            const html = pinInnerHTML(p.neighborhoodColor, label);
            const { overlay, el } = makeMarker(maps, map, position, html, pinAriaLabel(label, p.name), {
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
            markers.set(`i:${p.id}`, {
              overlay,
              el,
              hidden: false,
              kind: 'individual',
              propertyId: p.id,
              name: p.name,
              grouped,
              priceRon,
              color: p.neighborhoodColor,
            });
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
            const minPriceRon = Math.min(...group.map((p) => p.rates[0].perNight));
            const groupIds = group.map((p) => p.id);
            const clusterColor = group[0].neighborhoodColor;

            const clusterLabel = formatRef.current(minPriceRon);
            const clusterHtml = pinInnerHTML(clusterColor, clusterLabel, group.length);
            const cluster = makeMarker(
              maps,
              map,
              centroid,
              clusterHtml,
              pinAriaLabel(clusterLabel, undefined, group.length),
              {
                onClick: (event) => {
                  event.stopPropagation();
                  map.panTo(centroid);
                  map.setZoom(SPREAD_ZOOM);
                },
              },
            );
            markers.set(`c:${lat0.toFixed(5)},${lng0.toFixed(5)}`, {
              overlay: cluster.overlay,
              el: cluster.el,
              hidden: false,
              kind: 'cluster',
              groupIds,
              minPriceRon,
              count: group.length,
              color: clusterColor,
            });
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

          // Landmarks render once; zoom only toggles their visibility (below).
          for (const l of BUCHAREST_LANDMARKS) {
            const { overlay, el } = makeLandmark(maps, map, l);
            landmarks.push({ overlay, el, minZoom: l.minZoom });
          }

          const applyZoomVisibility = () => {
            const zoom = map.getZoom() ?? 14;
            const expanded = zoom >= SPREAD_ZOOM;
            markers.forEach((entry) => {
              if (entry.kind === 'cluster') entry.el.style.display = !entry.hidden && !expanded ? '' : 'none';
              else if (entry.grouped) entry.el.style.display = !entry.hidden && expanded ? '' : 'none';
              else entry.el.style.display = entry.hidden ? 'none' : '';
            });
            // Hide minZoom landmarks when too far out; drop all labels below 13
            // to keep the map calm (badges stay).
            const showLabels = zoom >= 13;
            landmarks.forEach(({ el, minZoom }) => {
              el.style.display = minZoom && zoom < minZoom ? 'none' : '';
              const labelEl = el.querySelector<HTMLElement>('[data-label]');
              if (labelEl) labelEl.style.display = showLabels ? '' : 'none';
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
          applyVisibilityRef.current = applyZoomVisibility;

          if (!bounds.isEmpty()) {
            map.fitBounds(bounds, mobile ? 56 : 76);
            maps.event.addListenerOnce(map, 'idle', () => {
              const zoom = map.getZoom();
              if (typeof zoom === 'number' && zoom > 16) map.setZoom(16);
              // Sync applies the current search filter, then zoom visibility.
              syncVisibleMarkers();
              applyActive();
            });
          } else {
            syncVisibleMarkers();
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
      landmarks.forEach(({ overlay }) => overlay.setMap(null));
      landmarks.length = 0;
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

  // Currency switch: markers are built once on mount, so when the display
  // currency changes we rewrite each marker's price text/aria-label in place
  // (pure display — priceRon/minPriceRon never change) using the same
  // pinInnerHTML template used at build time, then re-apply the active style
  // so the highlighted pin doesn't flash back to inactive markup.
  useEffect(() => {
    const activeId = propsRef.current.activeId;
    markersRef.current.forEach((entry) => {
      if (entry.kind === 'individual') {
        const label = format(entry.priceRon);
        entry.el.innerHTML = pinInnerHTML(entry.color, label);
        entry.el.setAttribute('aria-label', pinAriaLabel(label, entry.name));
      } else {
        const label = format(entry.minPriceRon);
        entry.el.innerHTML = pinInnerHTML(entry.color, label, entry.count);
        entry.el.setAttribute('aria-label', pinAriaLabel(label, undefined, entry.count));
      }
      const active =
        entry.kind === 'cluster' ? entry.groupIds.includes(activeId ?? '') : entry.propertyId === activeId;
      styleMarker(entry.el, active);
    });
    // Re-apply search filtering — the rewrite above restored full-set cluster labels.
    syncVisibleMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  // Search filtering: toggle pin visibility whenever the visible id set changes.
  const visibleKey = props.visibleIds?.join(',') ?? '*';
  useEffect(() => {
    syncVisibleMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey]);

  if (failed) return <StylizedMap {...props} />;

  return (
    <div
      className={cn(
        isMobile
          ? 'relative h-full w-full overflow-hidden bg-cream'
          : 'relative hidden overflow-hidden rounded-[20px] border border-gray-line bg-cream lg:sticky lg:top-20 lg:mr-4 lg:ml-3 lg:block lg:h-[calc(100dvh-6rem)]',
      )}
    >
      <div ref={containerRef} className="absolute inset-0" role="application" aria-label="Map of AVEXA stays in Bucharest City Center" />
    </div>
  );
}
