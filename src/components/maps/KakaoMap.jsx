// src/components/maps/KakaoMap.jsx
import { useEffect, useRef } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

export default function KakaoMap({
  camera,
  markers,
  onMapClick,
  onMarkerClick,
}) {
  const mapRef = useRef(null);

  console.log("KEY:", import.meta.env.VITE_KAKAO_JS_KEY);
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_JS_KEY,
    libraries: ["services"],
  });

  // 외부 camera 상태가 바뀌면 지도 이동 (Leaflet의 Bridge 역할)
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(new kakao.maps.LatLng(camera.lat, camera.lng));
    }
  }, [camera]);

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
      {markers.map((m) => (
        <MapMarker
          key={m.id}
          position={{ lat: m.lat, lng: m.lng }}
          onClick={() => onMarkerClick(m.id)}
        />
      ))}
    </Map>
  );
}
