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

  const update = useCallback((id, patch) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }, []);

  return { places, add, remove, update };
}
