// src/lib/geocode.js
export async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
  const rows = await fetch(url).then((r) => r.json());
  return rows.map((r) => ({
    lat: +r.lat,
    lng: +r.lon,
    name: r.display_name,
  }));
}
