// src/components/MapPanel.jsx
import { useState, useEffect } from "react";
import { usePlaces } from "../hooks/usePlaces";
import { useGeolocation } from "../hooks/useGeolocation";
import { geocode } from "../lib/geocode";

const CATEGORIES = [
  { code: "CE7", label: "카페" },
  { code: "FD6", label: "맛집" },
  { code: "CS2", label: "편의점" },
  { code: "PM9", label: "약국" },
  { code: "SW8", label: "지하철" },
];

export default function MapPanel({ MapImpl }) {
  const { places, set } = usePlaces([
    { id: "1", lat: 37.5665, lng: 126.978, name: "서울시청" },
  ]);
  const { coords, status, locate } = useGeolocation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(null); // ✅ 함수 안으로
  const [poiList, setPoiList] = useState([]); // ✅ 함수 안으로
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
    set(hit);
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

      {/* ✅ 버튼 div를 return 안, 검색 폼 아래로 */}
      <div
        style={{
          padding: "0 8px 8px",
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => setCategory(category === c.code ? null : c.code)}
            style={{
              padding: "4px 10px",
              background: category === c.code ? "#333" : "#eee",
              color: category === c.code ? "#fff" : "#333",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        <MapImpl
          camera={camera}
          markers={places}
          category={category}
          poiList={poiList}
          onPoiFound={setPoiList}
          onMapClick={(latlng) => set({ ...latlng, name: "새 장소" })}
          onMarkerClick={() => {}}
        />
      </div>
    </div>
  );
}
