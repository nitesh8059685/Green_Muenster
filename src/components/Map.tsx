import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';

interface MapProps {
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  fromLocation?: string;
  toLocation?: string;
  // routeGeometry is ORS encoded polyline string
  routeGeometry?: string | null;
}

export default function Map({
  fromLat,
  fromLng,
  toLat,
  toLng,
  fromLocation,
  toLocation,
  routeGeometry,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([51.9625, 7.6251], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Remove old markers and polylines (but keep the tile layer)
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add start marker
    if (fromLat && fromLng) {
      const fromMarker = L.marker([fromLat, fromLng], {
        title: fromLocation || 'Start',
        icon: L.icon({
          iconUrl:
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      }).bindPopup(fromLocation || 'Start Location');
      fromMarker.addTo(map);
    }

    // Add end marker
    if (toLat && toLng) {
      const toMarker = L.marker([toLat, toLng], {
        title: toLocation || 'Destination',
        icon: L.icon({
          iconUrl:
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      }).bindPopup(toLocation || 'Destination');
      toMarker.addTo(map);
    }

    // Draw ORS route from encoded polyline string
    if (routeGeometry) {
      // decode: [[lat, lng], [lat, lng], ...]
      const decoded = polyline.decode(routeGeometry) as [number, number][];
      const latlngs = decoded.map(([lat, lng]) => [lat, lng]) as [number, number][];

      const poly = L.polyline(latlngs, {
        color: 'green',
        weight: 4,
        opacity: 0.7,
      }).addTo(map);

      map.fitBounds(poly.getBounds(), { padding: [50, 50] });
    } else if (fromLat && fromLng) {
      map.setView([fromLat, fromLng], 14);
    }
  }, [fromLat, fromLng, toLat, toLng, routeGeometry, fromLocation, toLocation]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-96 rounded-lg overflow-hidden shadow-md border border-gray-300"
      style={{ minHeight: '400px' }}
    />
  );
}
