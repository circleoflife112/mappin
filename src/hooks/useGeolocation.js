// src/hooks/useGeolocation.js
import { useState, useCallback } from "react";

export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  const locate = useCallback(() => {
    if (!navigator.geolocation) return setStatus("error");
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("done");
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  return { coords, status, locate };
}
