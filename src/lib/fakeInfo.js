// src/lib/fakeInfo.js
// ⚠️ 예시(가짜) 데이터입니다. 실제 별점/리뷰가 아니에요.
// 나중에 진짜 리뷰 API를 붙이면 이 파일을 교체하면 됩니다.

// 문자열 id를 숫자 씨앗으로 (같은 id면 항상 같은 값)
function seedFrom(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) % 100000;
  }
  return h;
}

export function fakeRating(id) {
  const seed = seedFrom(id);
  // 3.0 ~ 5.0 사이 별점 (소수 첫째자리)
  const rating = 3.0 + (seed % 21) / 10;
  return rating.toFixed(1);
}

export function fakeReviewCount(id) {
  const seed = seedFrom(id);
  // 10 ~ 509 사이 리뷰 수
  return 10 + (seed % 500);
}
