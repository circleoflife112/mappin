// src/components/MapView.jsx
import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../lib/leafletSetup";

// 지도 클릭 이벤트는 자식 컴포넌트에서 훅으로 받습니다
function ClickHandler({ onAdd }) {
  useMapEvents({
    click(e) {
      onAdd({
        id: crypto.randomUUID(),
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        name: "새 장소",
      });
    },
  });
  return null;
}

// 외부 state로 지도를 움직이는 명령형 브리지
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 16, { duration: 1 });
  }, [target, map]);
  return null;
}

export default function MapView() {
  const [markers, setMarkers] = useState([
    { id: "1", lat: 37.5665, lng: 126.978, name: "서울시청" },
  ]);
  const [target, setTarget] = useState(null);
  const [query, setQuery] = useState("");

  const addMarker = (m) => setMarkers((prev) => [...prev, m]);

  const locateMe = () => {
    if (!navigator.geolocation) return alert("위치 기능 미지원");
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setTarget({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => alert("위치 실패: " + err.message),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const [hit] = await fetch(url).then((r) => r.json());
    if (!hit) return alert("결과 없음");
    const found = { lat: +hit.lat, lng: +hit.lon };
    setTarget(found);
    addMarker({ id: crypto.randomUUID(), ...found, name: hit.display_name });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <form onSubmit={search} style={{ padding: 8, display: "flex", gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="장소 검색"
          style={{ flex: 1 }}
        />
        <button type="submit">검색</button>
        <button type="button" onClick={locateMe}>
          내 위치
        </button>
      </form>

      <div style={{ flex: 1 }}>
        <MapContainer center={[37.5665, 126.978]} zoom={13} scrollWheelZoom>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lng]}>
              <Popup>{m.name}</Popup>
            </Marker>
          ))}
          <ClickHandler onAdd={addMarker} />
          <FlyTo target={target} />
        </MapContainer>
      </div>
    </div>
  );
}
