// src/hooks/usePlaces.js
import { useState, useCallback } from "react";

export function usePlaces(initial = []) {
  const [places, setPlaces] = useState(initial);

  const add = useCallback((p) => {
    setPlaces((prev) => [...prev, { id: crypto.randomUUID(), ...p }]);
  }, []);

  const remove = useCallback((id) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const set = useCallback((p) => {
    setPlaces([{ id: crypto.randomUUID(), ...p }]); // 배열을 새 마커 하나로 교체
  }, []);

  return { places, add, set, remove, set };
}
