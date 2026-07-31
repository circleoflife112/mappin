// src/App.jsx
import MapPanel from "./components/MapPanel";
import LeafletMap from "./components/maps/LeafletMap";

export default function App() {
  return <MapPanel MapImpl={LeafletMap} />;
}
