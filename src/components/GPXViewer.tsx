import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BiDownload } from 'react-icons/bi';
import('leaflet/dist/leaflet.css');

export interface IGPXViewerProps {
  gpxUrl: string;
  title: string;
  onClose: () => void;
}

export const GPXViewer: React.FunctionComponent<IGPXViewerProps> = ({
  gpxUrl,
  title,
  onClose,
}: React.PropsWithChildren<IGPXViewerProps>) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeStats, setRouteStats] = useState<{ distanceKm: number; points: number } | null>(null);

  const handleDownloadGpx = React.useCallback(() => {
    const a = document.createElement('a');
    a.href = gpxUrl;
    a.download = `${title || 'route'}.gpx`;
    a.click();
  }, [gpxUrl, title]);

  const closeButton = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      try {
        // Initialize map with a default location
        map.current = L.map(mapContainer.current!).setView([50.5, 4.5], 8);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map.current);

        // Fetch GPX file
        const response = await fetch(gpxUrl);
        if (!response.ok) {
          throw new Error(`GPX-bestand kon niet geladen worden (${response.status})`);
        }

        const gpxText = await response.text();

        // Parse GPX
        const parser = new DOMParser();
        const gpxDoc = parser.parseFromString(gpxText, 'text/xml');

        if (gpxDoc.getElementsByTagName('parsererror').length > 0) {
          throw new Error('Ongeldig GPX-bestand');
        }

        // Extract track points
        const coordinates: [number, number][] = [];

        const haversineKm = (a: [number, number], b: [number, number]) => {
          const toRad = (deg: number) => (deg * Math.PI) / 180;
          const R = 6371; // km
          const dLat = toRad(b[0] - a[0]);
          const dLon = toRad(b[1] - a[1]);
          const lat1 = toRad(a[0]);
          const lat2 = toRad(b[0]);
          const h =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          return 2 * R * Math.asin(Math.sqrt(h));
        };

        // Get track points
        const trkpts = gpxDoc.getElementsByTagName('trkpt');
        for (let i = 0; i < trkpts.length; i++) {
          const lat = parseFloat(trkpts[i].getAttribute('lat') || '0');
          const lon = parseFloat(trkpts[i].getAttribute('lon') || '0');
          if (lat !== 0 && lon !== 0) {
            coordinates.push([lat, lon]);
          }
        }

        // If no track points, try waypoints
        if (coordinates.length === 0) {
          const wpts = gpxDoc.getElementsByTagName('wpt');
          for (let i = 0; i < wpts.length; i++) {
            const lat = parseFloat(wpts[i].getAttribute('lat') || '0');
            const lon = parseFloat(wpts[i].getAttribute('lon') || '0');
            if (lat !== 0 && lon !== 0) {
              coordinates.push([lat, lon]);
            }
          }
        }

        if (coordinates.length < 2) {
          throw new Error('Geen route gevonden in het GPX-bestand');
        }

        // Compute simple stats
        let totalKm = 0;
        for (let i = 1; i < coordinates.length; i++) {
          totalKm += haversineKm(coordinates[i - 1], coordinates[i]);
        }
        setRouteStats({ distanceKm: Number(totalKm.toFixed(1)), points: coordinates.length });

        // Draw the route
        L.polyline(coordinates, {
          color: '#002b3a',
          weight: 5,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map.current);

        // Add start marker
        L.circleMarker(coordinates[0], {
          radius: 8,
          fillColor: '#d4ff3f',
          color: '#002b3a',
          weight: 3,
          opacity: 1,
          fillOpacity: 1,
        })
          .addTo(map.current)
          .bindPopup('Start');

        // Add finish marker
        L.circleMarker(coordinates[coordinates.length - 1], {
          radius: 8,
          fillColor: '#ef4444',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        })
          .addTo(map.current)
          .bindPopup('Finish');

        // Fit map to bounds
        const bounds = L.latLngBounds(coordinates);
        setTimeout(() => {
          if (map.current) {
            map.current.invalidateSize();
            map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
          }
        }, 100);

        setLoading(false);
      } catch (err) {
        console.error('Map error:', err);
        setError(err instanceof Error ? err.message : 'Kaart kon niet geladen worden');
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [gpxUrl]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-stretch justify-center bg-ink-900/80 backdrop-blur-sm md:items-center md:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gpx-title"
        className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-paper-50 shadow-2xl md:h-[82vh] md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 bg-ink p-4 text-paper md:p-5">
          <div className="min-w-0">
            <p className="eyebrow text-signal">Route</p>
            <h2 id="gpx-title" className="mt-1 truncate text-lg font-bold md:text-xl">{title}</h2>
            {routeStats && (
              <p className="mt-1 text-sm text-paper/70">
                Afstand <strong className="text-paper">{routeStats.distanceKm} km</strong>
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadGpx}
              className="inline-flex items-center gap-2 rounded-full bg-signal px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-signal-600"
              title="Download GPX"
            >
              <BiDownload className="h-4 w-4" aria-hidden={true} />
              <span>GPX</span>
            </button>
            <button
              ref={closeButton}
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-paper/20 text-2xl leading-none text-paper transition-colors hover:border-paper"
              aria-label="Sluiten"
            >
              ×
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-paper-200">
          {loading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center">
              <div className="rounded-full bg-paper-50 px-4 py-2 text-sm font-medium text-ink shadow">Kaart laden…</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center p-6">
              <div role="alert" className="max-w-sm rounded-2xl bg-paper-50 p-5 text-center text-red-700 shadow">
                <p>{error}</p>
                <p className="mt-2 text-sm text-ink/60">Je kan het bestand wel nog downloaden.</p>
              </div>
            </div>
          )}
          <div ref={mapContainer} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
};
