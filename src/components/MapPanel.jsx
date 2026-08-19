// src/components/MapPanel.jsx
import { useState, useEffect } from "react";
import { usePlaces } from "../hooks/usePlaces";
import { useGeolocation } from "../hooks/useGeolocation";
import { geocode } from "../lib/geocode";

const CATEGORIES = [
  { code: "CE7", label: "카페", color: "#8b5cf6" },
  { code: "FD6", label: "맛집", color: "#ef4444" },
  { code: "CS2", label: "편의점", color: "#3b82f6" },
  { code: "PM9", label: "약국", color: "#10b981" },
  { code: "SW8", label: "지하철", color: "#f59e0b" },
];

export default function MapPanel({ MapImpl }) {
  const { places, set } = usePlaces([
    { id: "1", lat: 37.5665, lng: 126.978, name: "서울시청" },
  ]);
  const { coords, status, locate } = useGeolocation();
  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState(new Set());
  const [poiList, setPoiList] = useState([]); // ✅ 함수 안으로
  const [camera, setCamera] = useState({
    lat: 37.5665,
    lng: 126.978,
    zoom: 13,
  });

  const toggleCategory = (code) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

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
        {CATEGORIES.map((c) => {
          const on = activeCategories.has(c.code);
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => toggleCategory(c.code)}
              style={{
                padding: "4px 10px",
                background: on ? c.color : "#eee",
                color: on ? "#fff" : "#333",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }}>
        <MapImpl
          camera={camera}
          markers={places}
          categories={CATEGORIES}
          activeCategories={activeCategories}
          poiList={poiList}
          onPoiFound={setPoiList}
          onMapClick={(latlng) => set({ ...latlng, name: "새 장소" })}
          onMarkerClick={() => {}}
        />
      </div>
    </div>
  );
}
