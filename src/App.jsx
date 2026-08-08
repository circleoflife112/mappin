// src/App.jsx
import MapPanel from "./components/MapPanel";
import KakaoMap from "./components/maps/KakaoMap";

export default function App() {
  return <MapPanel MapImpl={KakaoMap} />;
}
