import { useEffect, useRef } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

export default function KakaoMap({
  camera,
  selected,
  pinnedList,
  categories,
  activeCategory,
  poiList,
  onPoiFound,
  onMapClick,
  onPoiClick, // pinned → pinnedList
}) {
  const mapRef = useRef(null);
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JS_KEY,
    libraries: ["services"],
  });

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
      {/* 고정된 핀들 (여러 개, 기본 마커) */}
      {pinnedList.map((p, i) => (
        <MapMarker
          key={`pin-${i}`}
          position={{ lat: p.lat, lng: p.lng }}
          title={p.name}
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
          onClick={() => onPoiClick(p)}
          image={{
            src: `data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="7" fill="${colorOf(p.category)}" stroke="white" stroke-width="2"/></svg>`,
            )}`,
            size: { width: 20, height: 20 },
          }}
        />
      ))}
    </Map>
  );
}
