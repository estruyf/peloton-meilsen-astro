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
          throw new Error(`Failed to fetch GPX file: ${response.statusText}`);
        }

        const gpxText = await response.text();

        // Parse GPX
        const parser = new DOMParser();
        const gpxDoc = parser.parseFromString(gpxText, 'text/xml');

        if (gpxDoc.getElementsByTagName('parsererror').length > 0) {
          throw new Error('Invalid GPX file format');
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
          throw new Error('No valid coordinates found in GPX file');
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
          fillColor: '#22c55e',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
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
        setError(err instanceof Error ? err.message : 'Error loading map');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex flex-col gap-3 border-b p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold truncate text-gray-900">{title}</h2>
              {routeStats && (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-primary" aria-hidden={true} />
                    Afstand: {routeStats.distanceKm} km
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleDownloadGpx}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                title="Download GPX"
              >
                <BiDownload className="h-4 w-4" aria-hidden={true} />
                <span>Download</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 relative bg-gray-50">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-gray-600">Loading map...</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-red-600 text-center">
                <p>Error: {error}</p>
              </div>
            </div>
          )}
          <div
            ref={mapContainer}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};
