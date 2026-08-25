// src/components/maps/KakaoMap.jsx
import { useEffect, useRef, useState } from "react";
import {
  Map,
  MapMarker,
  CustomOverlayMap,
  useKakaoLoader,
} from "react-kakao-maps-sdk";
import { fakeRating, fakeReviewCount } from "../../lib/fakeInfo";

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
  const [openInfo, setOpenInfo] = useState(null); // 정보창 열린 장소

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(new kakao.maps.LatLng(camera.lat, camera.lng));
    }
  }, [camera]);

  // 카테고리(단일)가 바뀌면 검색
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
            })),
          );
        } else {
          onPoiFound([]);
        }
      },
      { useMapBounds: true },
    );
  }, [activeCategory]);

  if (loading) return <p>지도 로딩중…</p>;
  if (error) return <p>지도 로드 실패 (키/도메인 확인)</p>;

  const colorOf = (code) =>
    categories.find((c) => c.code === code)?.color ?? "#888";

  return (
    <Map
      center={{ lat: camera.lat, lng: camera.lng }}
      level={3}
      style={{ width: "100%", height: "100%" }}
      onCreate={(map) => {
        mapRef.current = map;
      }}
      onClick={(_, mouseEvent) => {
        const latlng = mouseEvent.latLng;
        onMapClick({ lat: latlng.getLat(), lng: latlng.getLng() });
      }}
    >
      {/* 고정된 핀들 (클릭하면 해제) */}
      {pinnedList.map((p, i) => (
        <MapMarker
          key={`pin-${i}`}
          position={{ lat: p.lat, lng: p.lng }}
          title={p.name}
          onClick={() => onPinClick(p)}
        />
      ))}

      {/* 지금 보고 있는 임시 장소 (아직 고정 안 한 것만) */}
      {selected &&
        !pinnedList.some(
          (p) => p.lat === selected.lat && p.lng === selected.lng,
        ) && (
          <MapMarker
            position={{ lat: selected.lat, lng: selected.lng }}
            title={selected.name}
          />
        )}

      {/* 카테고리 결과 핀 */}
      {poiList.map((p) => (
        <MapMarker
          key={p.id}
          position={{ lat: p.lat, lng: p.lng }}
          title={p.name}
          onClick={() => {
            onPoiClick(p);
            setOpenInfo(p);
          }}
          image={{
            src: `data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="7" fill="${colorOf(
                p.category,
              )}" stroke="white" stroke-width="2"/></svg>`,
            )}`,
            size: { width: 20, height: 20 },
          }}
        />
      ))}

      {/* 정보 카드 (말풍선) */}
      {openInfo && (
        <CustomOverlayMap
          position={{ lat: openInfo.lat, lng: openInfo.lng }}
          yAnchor={1.3}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              width: 220,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              fontSize: 13,
              position: "relative",
            }}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setOpenInfo(null)}
              style={{
                position: "absolute",
                top: 6,
                right: 8,
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 16,
                color: "#999",
              }}
            >
              ×
            </button>

            {/* 이름 (진짜) */}
            <div
              style={{
                fontWeight: "bold",
                marginBottom: 4,
                paddingRight: 16,
              }}
            >
              {openInfo.name}
            </div>

            {/* 별점 (예시) */}
            <div style={{ color: "#f59e0b", marginBottom: 4 }}>
              ★ {fakeRating(openInfo.id)}
              <span style={{ color: "#999", fontSize: 12 }}>
                {" "}
                (리뷰 {fakeReviewCount(openInfo.id)}) · 예시
              </span>
            </div>

            {/* 주소 (진짜) */}
            {openInfo.address && (
              <div style={{ color: "#555", marginBottom: 2 }}>
                📍 {openInfo.address}
              </div>
            )}

            {/* 전화 (진짜) */}
            {openInfo.phone && (
              <div style={{ color: "#555", marginBottom: 6 }}>
                ☎ {openInfo.phone}
              </div>
            )}

            {/* 카카오맵 링크 (진짜) */}
            {openInfo.url && (
              <a
                href={openInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#4f46e5", fontSize: 12 }}
              >
                카카오맵에서 보기 →
              </a>
            )}
          </div>
        </CustomOverlayMap>
      )}
    </Map>
  );
}
