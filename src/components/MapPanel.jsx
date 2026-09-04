// src/components/MapPanel.jsx
import { useState, useEffect } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { geocode } from "../lib/geocode";
import { fakeRating, fakeReviewCount } from "../lib/fakeInfo";

const CATEGORIES = [
  { code: "CE7", label: "카페",  icon: "☕", color: "#f97316" },
  { code: "FD6", label: "맛집",  icon: "🍽️", color: "#ef4444" },
  { code: "AT4", label: "공원",  icon: "🌳", color: "#22c55e" },
  { code: "MT1", label: "쇼핑",  icon: "🛍️", color: "#8b5cf6" },
];

const CAT_ICON = { CE7: "☕", FD6: "🍽️", AT4: "🌳", MT1: "🛍️" };

/* ── 장소 카드 ── */
function PlaceCard({ place, isPinned, onPin, onRemove, featured }) {
  const icon = CAT_ICON[place.category] ?? "📍";

  return (
    <div
      className={`mx-3 mb-3 bg-white rounded-2xl border border-gray-100 p-3.5
        ${featured ? "shadow-md" : "shadow-sm"}`}
    >
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + close */}
          <div className="flex justify-between items-start gap-1">
            <p className="font-bold text-gray-900 text-sm leading-snug flex-1 truncate">
              {place.name}
            </p>
            {onRemove && (
              <button
                onClick={onRemove}
                className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs leading-none ml-1"
              >
                ×
              </button>
            )}
          </div>

          {/* Rating */}
          {place.id && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-xs font-semibold text-gray-800">
                {fakeRating(place.id)}
              </span>
              <span className="text-xs text-gray-400">
                ({fakeReviewCount(place.id)}) · 예시
              </span>
            </div>
          )}

          {/* Address */}
          {place.address && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              📍 {place.address}
            </p>
          )}

          {/* Phone */}
          {place.phone && (
            <p className="text-xs text-gray-500 mt-0.5">☎ {place.phone}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <button className="flex-1 bg-orange-500 active:bg-orange-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">
          길찾기
        </button>
        <button
          onClick={onPin}
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-colors
            ${isPinned ? "bg-orange-100 text-orange-500" : "bg-gray-100 text-gray-400"}`}
        >
          {isPinned ? "❤️" : "🤍"}
        </button>
        {place.url ? (
          <a
            href={place.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-lg"
          >
            🔗
          </a>
        ) : (
          <button className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-lg">
            ↗
          </button>
        )}
      </div>
    </div>
  );
}

/* ── 탭 바 ── */
function TabBar() {
  const tabs = [
    { icon: "🗺️", label: "지도", active: true },
    { icon: "🔍", label: "탐색", active: false },
    { icon: "🔖", label: "저장", active: false },
    { icon: "👤", label: "프로필", active: false },
  ];
  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-100 flex justify-around items-center pt-2 pb-5">
      {tabs.map((t) => (
        <button key={t.label} className="flex flex-col items-center gap-0.5 px-4">
          <span className="text-xl">{t.icon}</span>
          <span
            className={`text-[10px] font-medium ${
              t.active ? "text-orange-500" : "text-gray-400"
            }`}
          >
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── 메인 ── */
export default function MapPanel({ MapImpl }) {
  const { coords, status, locate } = useGeolocation();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [pinnedList, setPinnedList] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [poiList, setPoiList] = useState([]);
  const [camera, setCamera] = useState({ lat: 37.5665, lng: 126.978, zoom: 13 });

  const toggleCategory = (code) =>
    setActiveCategory((prev) => (prev === code ? null : code));

  const togglePin = () => {
    if (!selected) return;
    setPinnedList((prev) => {
      const exists = prev.some(
        (p) => p.lat === selected.lat && p.lng === selected.lng
      );
      return exists
        ? prev.filter((p) => !(p.lat === selected.lat && p.lng === selected.lng))
        : [...prev, selected];
    });
  };

  const removePin = (place) =>
    setPinnedList((prev) =>
      prev.filter((p) => !(p.lat === place.lat && p.lng === place.lng))
    );

  useEffect(() => {
    if (coords) setCamera({ ...coords, zoom: 16 });
  }, [coords]);

  const onSearch = async (e) => {
    e.preventDefault();
    const [hit] = await geocode(query);
    if (!hit) return alert("결과 없음");
    setSelected(hit);
    setCamera({ lat: hit.lat, lng: hit.lng, zoom: 16 });
  };

  const isSelectedPinned =
    selected &&
    pinnedList.some((p) => p.lat === selected.lat && p.lng === selected.lng);

  const pinnedNotSelected = pinnedList.filter(
    (p) => !(selected && p.lat === selected.lat && p.lng === selected.lng)
  );

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">

      {/* ── 헤더 ── */}
      <div className="flex-shrink-0 bg-white px-3 pt-10 pb-2 flex items-center gap-2">
        {/* Logo */}
        <div className="flex-shrink-0 border border-gray-300 rounded-full px-3.5 py-1.5">
          <span className="text-sm font-bold text-gray-900 tracking-tight">mappin</span>
        </div>

        {/* Search */}
        <form onSubmit={onSearch} className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="장소 검색"
            className="w-full bg-gray-100 rounded-full pl-9 pr-4 py-2.5 text-sm outline-none
              text-gray-900 placeholder:text-gray-400"
          />
        </form>

        {/* Menu / Locate button */}
        <button
          type="button"
          onClick={locate}
          disabled={status === "loading"}
          className="flex-shrink-0 w-11 h-11 bg-orange-500 active:bg-orange-600
            text-white rounded-full flex items-center justify-center shadow-sm transition-colors"
        >
          {status === "loading" ? (
            <span className="text-xs font-bold">…</span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── 카테고리 필터 칩 ── */}
      <div className="flex-shrink-0 bg-white flex gap-2 px-3 pb-3 no-scrollbar overflow-x-auto">
        {CATEGORIES.map((c) => {
          const on = activeCategory === c.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => toggleCategory(c.code)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border
                text-sm font-medium transition-all duration-150
                ${on
                  ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-700"
                }`}
            >
              <span className="text-base">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 지도 영역 ── */}
      <div className="flex-1 relative overflow-hidden">
        <MapImpl
          camera={camera}
          selected={selected}
          pinnedList={pinnedList}
          categories={CATEGORIES}
          activeCategory={activeCategory}
          poiList={poiList}
          onPoiFound={setPoiList}
          onMapClick={(latlng) => setSelected({ ...latlng, name: "지정한 장소" })}
          onPoiClick={(place) =>
            setSelected({
              lat: place.lat,
              lng: place.lng,
              name: place.name,
              id: place.id,
              phone: place.phone,
              address: place.address,
              url: place.url,
              category: place.category,
            })
          }
          onPinClick={removePin}
        />

        {/* 지도 컨트롤 */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-[400]">
          <button
            onClick={locate}
            className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </button>
          <button className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-600 font-bold text-lg leading-none">
            +
          </button>
          <button className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-600 font-bold text-xl leading-none">
            −
          </button>
        </div>

        {/* 핀 고정 / 해제 버튼 */}
        {selected && (
          <button
            onClick={togglePin}
            className="absolute bottom-4 right-4 z-[400] bg-white text-gray-800
              text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-gray-100
              active:scale-95 transition-transform"
          >
            {isSelectedPinned ? "고정 해제" : "이 장소 고정하기"}
          </button>
        )}
      </div>

      {/* ── 하단 장소 패널 ── */}
      <div
        className="flex-shrink-0 bg-white rounded-t-3xl overflow-y-auto no-scrollbar"
        style={{ maxHeight: "46%", boxShadow: "0 -6px 24px rgba(0,0,0,0.08)" }}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* 패널 헤더 */}
        <div className="flex justify-between items-center px-4 py-2 mb-1">
          <div>
            <p className="font-bold text-gray-900 text-[15px]">근처 장소</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {pinnedList.length > 0
                ? `${pinnedList.length}곳 고정됨`
                : "장소를 눌러 확인하세요"}
            </p>
          </div>
          <button className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
        </div>

        {/* 선택된 장소 카드 (featured) */}
        {selected && (
          <PlaceCard
            place={selected}
            isPinned={isSelectedPinned}
            onPin={togglePin}
            featured
          />
        )}

        {/* 고정된 장소 목록 */}
        {pinnedNotSelected.map((p, i) => (
          <PlaceCard
            key={`${p.lat}-${p.lng}-${i}`}
            place={p}
            isPinned
            onPin={() => removePin(p)}
            onRemove={() => removePin(p)}
          />
        ))}

        {/* 빈 상태 */}
        {!selected && pinnedList.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400">
            지도를 눌러 장소를 선택해 보세요
          </div>
        )}
      </div>

      {/* ── 하단 탭 바 ── */}
      <TabBar />
    </div>
  );
}
