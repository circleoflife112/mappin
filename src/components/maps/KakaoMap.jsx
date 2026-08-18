import { useEffect, useRef, useState } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

export default function KakaoMap({
  camera,
  markers,
  category,
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

  // 카테고리가 바뀌면 현재 지도 범위 안에서 검색
  useEffect(() => {
    if (!mapRef.current) return;
    if (!category) {
      onPoiFound([]); // 카테고리 끄면 결과 비움
      return;
    }
    const ps = new kakao.maps.services.Places(mapRef.current);
    ps.categorySearch(
      category,
      (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          onPoiFound(
            data.map((d) => ({
              id: d.id,
              lat: +d.y,
              lng: +d.x,
              name: d.place_name,
            })),
          );
        } else {
          onPoiFound([]);
        }
      },
      { useMapBounds: true }, // 현재 지도 화면 범위로 제한
    );
  }, [category]);

  if (loading) return <p>지도 로딩중…</p>;
  if (error) return <p>지도 로드 실패 (키/도메인 확인)</p>;

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
      {/* 내가 지정한 핀 (하나 유지) */}
      {markers.map((m) => (
        <MapMarker
          key={m.id}
          position={{ lat: m.lat, lng: m.lng }}
          onClick={() => onMarkerClick(m.id)}
        />
      ))}

      {/* 카테고리 검색 결과 핀 (여러 개) */}
      {poiList.map((p) => (
        <MapMarker
          key={p.id}
          position={{ lat: p.lat, lng: p.lng }}
          image={{
            src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
            size: { width: 28, height: 40 },
          }}
          title={p.name}
        />
      ))}
    </Map>
  );
}
