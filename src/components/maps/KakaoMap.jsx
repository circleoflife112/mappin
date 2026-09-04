// src/components/maps/KakaoMap.jsx
import { useEffect, useRef } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

/* ── 커스텀 핀 SVG ── */
const makePinSvg = (fill = "#F97316", inner = "white") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
    <path d="M15 0C6.716 0 0 6.716 0 15c0 10 15 23 15 23S30 25 30 15C30 6.716 23.284 0 15 0z" fill="${fill}"/>
    <circle cx="15" cy="15" r="5.5" fill="${inner}"/>
  </svg>`;

const PIN_SELECTED = {
  src: `data:image/svg+xml;utf8,${encodeURIComponent(makePinSvg("#F97316"))}`,
  size: { width: 30, height: 38 },
  options: { offset: { x: 15, y: 38 } },
};

const PIN_PINNED = {
  src: `data:image/svg+xml;utf8,${encodeURIComponent(makePinSvg("#EA580C"))}`,
  size: { width: 30, height: 38 },
  options: { offset: { x: 15, y: 38 } },
};

const makePoiDot = (color) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22">
      <circle cx="11" cy="11" r="8" fill="${color}" stroke="white" stroke-width="2.5"/>
    </svg>`
  )}`;

export default function KakaoMap({
  camera,
  selected,
  pinnedList,
  categories,
  activeCategory,
  poiList,
  onPoiFound,
  onMapClick,
  onPoiClick,
  onPinClick,
}) {
  const mapRef = useRef(null);
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JS_KEY,
    libraries: ["services"],
  });

  /* 카메라 이동 */
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(new kakao.maps.LatLng(camera.lat, camera.lng));
    }
  }, [camera]);

  /* 카테고리 검색 */
  useEffect(() => {
    if (!mapRef.current) return;
    if (!activeCategory) {
      onPoiFound([]);
      return;
    }
    const ps = new kakao.maps.services.Places(mapRef.current);
    ps.categorySearch(
      activeCategory,
      (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          onPoiFound(
            data.map((d) => ({
              id: d.id,
              lat: +d.y,
              lng: +d.x,
              name: d.place_name,
              category: activeCategory,
              phone: d.phone || "",
              address: d.road_address_name || d.address_name || "",
              url: d.place_url || "",
              categoryName: d.category_name || "",
            }))
          );
        } else {
          onPoiFound([]);
        }
      },
      { useMapBounds: true }
    );
  }, [activeCategory]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">지도 로딩 중…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-red-400 text-sm">지도 로드 실패 (키/도메인 확인)</p>
      </div>
    );
  }

  const colorOf = (code) =>
    categories.find((c) => c.code === code)?.color ?? "#888";

  return (
    <Map
      center={{ lat: camera.lat, lng: camera.lng }}
      level={3}
      style={{ width: "100%", height: "100%" }}
      onCreate={(map) => { mapRef.current = map; }}
      onClick={(_, mouseEvent) => {
        const latlng = mouseEvent.latLng;
        onMapClick({ lat: latlng.getLat(), lng: latlng.getLng() });
      }}
    >
      {/* 고정된 핀들 — 진한 오렌지, 클릭 시 해제 */}
      {pinnedList.map((p, i) => (
        <MapMarker
          key={`pin-${i}`}
          position={{ lat: p.lat, lng: p.lng }}
          title={p.name}
          image={PIN_PINNED}
          onClick={() => onPinClick(p)}
        />
      ))}

      {/* 임시 선택 핀 (아직 고정 전) — 밝은 오렌지 */}
      {selected &&
        !pinnedList.some(
          (p) => p.lat === selected.lat && p.lng === selected.lng
        ) && (
          <MapMarker
            position={{ lat: selected.lat, lng: selected.lng }}
            title={selected.name}
            image={PIN_SELECTED}
          />
        )}

      {/* 카테고리 POI 결과 — 컬러 도트 */}
      {poiList.map((p) => (
        <MapMarker
          key={p.id}
          position={{ lat: p.lat, lng: p.lng }}
          title={p.name}
          image={{
            src: makePoiDot(colorOf(p.category)),
            size: { width: 22, height: 22 },
          }}
          onClick={() => onPoiClick(p)}
        />
      ))}
    </Map>
  );
}
