// src/components/MapPanel.jsx
import { useState, useEffect } from "react";
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
  const { coords, status, locate } = useGeolocation();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null); // 지정만 한 임시 장소
  const [pinned, setPinned] = useState(null); // 고정한 장소
  const [activeCategory, setActiveCategory] = useState(null); // 카테고리 하나
  const [poiList, setPoiList] = useState([]);
  const [camera, setCamera] = useState({
    lat: 37.5665,
    lng: 126.978,
    zoom: 13,
  });

  const toggleCategory = (code) => {
    setActiveCategory((prev) => (prev === code ? null : code));
  };

  const togglePin = () => {
    if (pinned) {
      setPinned(null); // 이미 고정돼 있으면 해제
    } else if (selected) {
      setPinned(selected); // 지정한 장소를 고정
    }
  };

  useEffect(() => {
    if (coords) setCamera({ ...coords, zoom: 16 });
  }, [coords]);

  const onSearch = async (e) => {
    e.preventDefault();
    const [hit] = await geocode(query);
    if (!hit) return alert("결과 없음");
    setSelected(hit);
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
        {/* 이 장소 핀하기 */}
        <div style={{ padding: "0 8px 8px" }}>
          <button
            type="button"
            onClick={togglePin}
            disabled={!selected && !pinned}
            style={{
              padding: "6px 12px",
              background: pinned ? "#333" : "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: selected || pinned ? "pointer" : "not-allowed",
              opacity: selected || pinned ? 1 : 0.5,
            }}
          >
            {pinned ? "핀 해제" : "이 장소 핀하기"}
          </button>
        </div>

        {/* 카테고리 필터 */}
        <div
          style={{
            padding: "0 8px 8px",
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {CATEGORIES.map((c) => {
            const on = activeCategory === c.code;
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
      </div>

      <div style={{ flex: 1 }}>
        <MapImpl
          camera={camera}
          selected={selected}
          pinned={pinned}
          categories={CATEGORIES}
          activeCategory={activeCategory}
          poiList={poiList}
          onPoiFound={setPoiList}
          onMapClick={(latlng) =>
            setSelected({ ...latlng, name: "지정한 장소" })
          }
          onPoiClick={(place) =>
            setSelected({ lat: place.lat, lng: place.lng, name: place.name })
          }
        />
      </div>
    </div>
  );
}
