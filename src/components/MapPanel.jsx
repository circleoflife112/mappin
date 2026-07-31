// src/components/MapPanel.jsx
import { useState, useEffect } from "react";
import { usePlaces } from "../hooks/usePlaces";
import { useGeolocation } from "../hooks/useGeolocation";
import { geocode } from "../lib/geocode";

export default function MapPanel({ MapImpl }) {
  const { places, add, remove } = usePlaces([
    { id: "1", lat: 37.5665, lng: 126.978, name: "서울시청" },
  ]);
  const { coords, status, locate } = useGeolocation();
  const [query, setQuery] = useState("");
  const [camera, setCamera] = useState({
    lat: 37.5665,
    lng: 126.978,
    zoom: 13,
  });

  useEffect(() => {
    if (coords) setCamera({ ...coords, zoom: 16 });
  }, [coords]);

  const onSearch = async (e) => {
    e.preventDefault();
    const [hit] = await geocode(query);
    if (!hit) return alert("결과 없음");
    add(hit);
    setCamera({ lat: hit.lat, lng: hit.lng, zoom: 16 });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <form onSubmit={onSearch} style={{ padding: 8, display: "flex", gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="장소 검색"
          style={{ flex: 1 }}
        />
        <button type="submit">검색</button>
        <button type="button" onClick={locate} disabled={status === "loading"}>
          {status === "loading" ? "찾는 중…" : "내 위치"}
        </button>
      </form>

      <div style={{ flex: 1 }}>
        <MapImpl
          camera={camera}
          markers={places}
          onMapClick={(latlng) => add({ ...latlng, name: "새 장소" })}
          onMarkerClick={(id) => remove(id)}
        />
      </div>
    </div>
  );
}
