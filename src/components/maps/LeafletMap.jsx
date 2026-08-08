// src/components/maps/LeafletMap.jsx
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../lib/leafletSetup";

function Bridge({ camera, onMapClick }) {
  const map = useMap();
  useMapEvents({
    click: (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  useEffect(() => {
    map.flyTo([camera.lat, camera.lng], camera.zoom, { duration: 1 });
  }, [camera, map]);
  return null;
}

export default function LeafletMap({
  camera,
  markers,
  onMapClick,
  onMarkerClick,
}) {
  return (
    <MapContainer
      center={[camera.lat, camera.lng]}
      zoom={camera.zoom}
      minZoom={6}
      maxBounds={[
        [33.0, 124.5], // 남서쪽 (제주 아래)
        [39.5, 132.0], // 북동쪽 (독도 위)
      ]}
      maxBoundsViscosity={1.0}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          eventHandlers={{ click: () => onMarkerClick(m.id) }}
        />
      ))}
      <Bridge camera={camera} onMapClick={onMapClick} />
    </MapContainer>
  );
}
