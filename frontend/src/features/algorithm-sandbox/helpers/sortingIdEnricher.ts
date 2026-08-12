import type { SortFrame } from '../types/sorting.types';

// Counter cục bộ theo batch: id chỉ cần duy nhất trong một lần chạy animation,
// không cần (và không nên) giữ ở module scope — tránh trôi vô hạn qua nhiều lần chạy.
const FALLBACK_ID_BASE = 10000;

export function enrichFramesWithIds(frames: SortFrame[]): void {
  if (frames.length === 0) return;

  if (frames[0].arrayStateWithIds && frames[0].arrayStateWithIds.length > 0) return;

  let fallbackIdCounter = FALLBACK_ID_BASE;
  const nextId = (): number => fallbackIdCounter++;

  const n = frames[0].arrayState.length;
  const initialIds = Array.from({ length: n }, (_, i) => i);
  frames[0].arrayStateWithIds = frames[0].arrayState.map((val, idx) => ({
    id: initialIds[idx],
    value: val
  }));

  for (let k = 1; k < frames.length; k++) {
    const prevFrame = frames[k - 1];
    const currFrame = frames[k];
    const currArr = currFrame.arrayState;
    const prevItems = [...prevFrame.arrayStateWithIds!];

    // Sự kiện hoán vị (bubble/quick/heap): hoán đổi identity theo đúng vị trí đã swap
    // → giữ nguyên identity chính xác ngay cả khi phần tử trùng giá trị
    const swap = currFrame.swappedIndices;
    if (
      swap &&
      currFrame.algorithm !== 'merge' &&
      swap[0] !== swap[1] &&
      swap[0] >= 0 && swap[0] < prevItems.length &&
      swap[1] >= 0 && swap[1] < prevItems.length
    ) {
      const next = [...prevItems];
      const temp = next[swap[0]];
      next[swap[0]] = next[swap[1]];
      next[swap[1]] = temp;
      currFrame.arrayStateWithIds = next;
      continue;
    }

    // SV-009 (EC-009): Map value → danh sách vị trí (đã sắp xếp tăng dần) — mỗi phần tử
    // tìm ứng viên gần nhất bằng binary search O(log k) thay vì quét toàn bộ O(n).
    // Semantics giữ nguyên greedy nearest-value: khoảng cách |j - i| nhỏ nhất;
    // bằng điểm → chọn vị trí LỚN hơn (khớp vòng lặp j tăng dần của bản cũ).
    const positionsByValue = new Map<number, number[]>();
    prevItems.forEach((item, j) => {
      const list = positionsByValue.get(item.value);
      if (list) list.push(j);
      else positionsByValue.set(item.value, [j]);
    });

    const currIds: number[] = [];

    for (let i = 0; i < currArr.length; i++) {
      const list = positionsByValue.get(currArr[i]);
      if (!list || list.length === 0) {
        currIds.push(nextId());
        continue;
      }

      // Binary search: vị trí chèn đầu tiên (list[lo] >= i)
      let lo = 0;
      let hi = list.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (list[mid] < i) lo = mid + 1;
        else hi = mid;
      }

      let cand = -1;
      let candDist = Infinity;
      if (lo < list.length) {
        cand = lo;
        candDist = list[lo] - i;
      }
      if (lo - 1 >= 0) {
        const d = i - list[lo - 1];
        // Bằng khoảng cách → ưu tiên vị trí lớn hơn (lo) như bản cũ
        if (d < candDist || (d === candDist && lo - 1 > cand)) {
          cand = lo - 1;
          candDist = d;
        }
      }

      // cand luôn >= 0 khi list không rỗng (lo hoặc lo-1 đều hợp lệ), nhưng
      // giữ guard để TS/JS an toàn tuyệt đối
      const matchIdx = list[cand];
      if (matchIdx === undefined) {
        currIds.push(nextId());
        continue;
      }
      list.splice(cand, 1);
      currIds.push(prevItems[matchIdx].id);
    }

    currFrame.arrayStateWithIds = currArr.map((val, idx) => ({
      id: currIds[idx],
      value: val
    }));
  }
}
