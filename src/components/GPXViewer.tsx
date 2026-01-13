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
        <div className="flex justify-between items-center p-4 border-b gap-4">
          <h2 className="text-lg font-semibold truncate text-gray-900">{title}</h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDownloadGpx}
              className="inline-flex items-center px-3 py-1.5 bg-secondary text-primary text-sm rounded-lg hover:bg-secondary/90 transition-colors"
              title="Download GPX"
            >
              <BiDownload className="h-4 w-4 mr-1" aria-hidden={true} />
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
