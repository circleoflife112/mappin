import { useEffect, useRef } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

export default function KakaoMap({
  camera,
  markers,
  categories,
  activeCategories,
  poiList,
  onPoiFound,
  onMapClick,
  onMarkerClick,
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

  // 활성 카테고리들이 바뀌면 각각 검색해서 합침
  useEffect(() => {
    if (!mapRef.current) return;

    const codes = [...activeCategories];
    if (codes.length === 0) {
      onPoiFound([]);
      return;
    }

    const ps = new kakao.maps.services.Places(mapRef.current);
    let collected = [];
    let done = 0;

    codes.forEach((code) => {
      ps.categorySearch(
        code,
        (data, status) => {
          if (status === kakao.maps.services.Status.OK) {
            collected = collected.concat(
              data.map((d) => ({
                id: d.id,
                lat: +d.y,
                lng: +d.x,
                name: d.place_name,
                category: code, // 어느 카테고리인지 표시 (색 구분용)
              })),
            );
          }
          done += 1;
          if (done === codes.length) {
            onPoiFound(collected); // 다 끝나면 한 번에 반영
          }
        },
        { useMapBounds: true },
      );
    });
  }, [activeCategories]);

  if (loading) return <p>지도 로딩중…</p>;
  if (error) return <p>지도 로드 실패 (키/도메인 확인)</p>;

  // 카테고리 코드 → 색 빠르게 찾기
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
      {/* 목적지 핀 (하나 고정, 기본 마커) */}
      {markers.map((m) => (
        <MapMarker
          key={m.id}
          position={{ lat: m.lat, lng: m.lng }}
          onClick={() => onMarkerClick(m.id)}
        />
      ))}

      {/* 카테고리 결과 핀 (여러 개, 색 구분) */}
      {poiList.map((p) => (
        <MapMarker
          key={p.id}
          position={{ lat: p.lat, lng: p.lng }}
          title={p.name}
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
