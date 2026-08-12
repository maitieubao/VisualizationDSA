import type { SortFrame, SortHighlights } from "../types/sorting.types";

// CC-009: ánh xạ bước thuật toán → dòng vật lý + logicalId (giả định khối mã CountingSort
// được nạp vào Monaco: line 1 = hàm, line 3 = đếm tần suất, line 4 = prefix sum, line 5 = dựng output)
const LINE_FUNC_DECL = 1;
const LINE_COUNT_STEP = 3;
const LINE_ACCUMULATE_STEP = 4;
const LINE_OUTPUT_STEP = 5;

function mkHighlights(
  sorted: number[],
  extras: Partial<SortHighlights> = {}
): SortHighlights {
  return { compare: [], swap: [], sorted: [...sorted], ...extras };
}

// SV-008 (EC-022): min/max 1 pass thay Math.min/max(...arr) — mảng lớn không RangeError
function minMax(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 0 };
  let min = values[0];
  let max = values[0];
  for (let i = 1; i < values.length; i++) {
    const v = values[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}

export function generateCountingSortFrames(arr: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  let stepIndex = 0;

  const currentArray = [...arr];
  const arrayStateWithIds = currentArray.map((val, idx) => ({
    id: idx,
    value: val,
  }));

  // Miền đếm: dịch chuyển toàn bộ giá trị về >= 0 để chữ số luôn hợp lệ [0..9]
  const { min: minVal, max: maxVal } = minMax(currentArray);
  const offset = minVal < 0 ? -minVal : 0;
  const shiftedMax = maxVal + offset;

  const output: Array<number | null> = Array(currentArray.length).fill(null);
  const outputIds: Array<{ id: number; value: number } | null> = Array(currentArray.length).fill(null);

  const count = Array(10).fill(0);

  // Góc nhìn chính: phần tử đã đặt vào output chiếm vị trí ổn định,
  // phần chưa đặt được "nén" giữ nguyên thứ tự — đảm bảo id luôn duy nhất
  const mergedView = (): { arrayState: number[]; arrayStateWithIds: Array<{ id: number; value: number }> } => {
    const placed: Array<{ id: number; value: number }> = [];
    for (const item of outputIds) {
      if (item) placed.push(item);
    }
    const placedIds = new Set(placed.map((e) => e.id));
    const remaining = arrayStateWithIds.filter((e) => !placedIds.has(e.id));

    const result: Array<{ id: number; value: number }> = [];
    for (let i = 0; i < currentArray.length; i++) {
      result.push(i < placed.length ? placed[i] : remaining[i - placed.length]);
    }
    return { arrayState: result.map((e) => e.value), arrayStateWithIds: result };
  };

  const emit = (
    desc: string,
    step: "count" | "accumulate" | "output",
    place: number,
    comp: [number, number] | null,
    useMerged: boolean,
    vars: Record<string, string | number>,
    lineNumber: number,
    activeLogicalLineId: string,
    highlightExtras: Partial<SortHighlights> = {}
  ) => {
    frames.push({
      stepIndex: stepIndex++,
      arrayState: useMerged ? mergedView().arrayState : [...currentArray],
      arrayStateWithIds: useMerged ? mergedView().arrayStateWithIds : [...arrayStateWithIds],
      comparingIndices: comp,
      pivotIndex: null,
      swappedIndices: null,
      sortedIndices: [],
      description: desc,
      algorithm: "counting",
      countArray: [...count],
      countingStep: step,
      activeDigitPlace: place,
      inputArray: [...currentArray],
      inputArrayWithIds: [...arrayStateWithIds],
      outputArray: [...output],
      outputArrayWithIds: [...outputIds],
      variables: vars,
      lineNumber,
      activeLogicalLineId,
      highlights: mkHighlights([], highlightExtras),
    });
  };

  frames.push({
    stepIndex: stepIndex++,
    arrayState: [...currentArray],
    arrayStateWithIds: [...arrayStateWithIds],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [],
    description: "Khởi tạo Counting Sort. Sắp xếp ổn định theo từng hàng chữ số (LSD): Count → Prefix Sum → Output cho từng hàng, từ hàng đơn vị đến hàng cao nhất.",
    algorithm: "counting",
    countArray: Array(10).fill(0),
    countingStep: "count",
    activeDigitPlace: 1,
    inputArray: [...currentArray],
    inputArrayWithIds: [...arrayStateWithIds],
    outputArray: [...output],
    outputArrayWithIds: [...outputIds],
    variables: { phase: "init", i: "-", digit: "-", countVal: 0, outputIdx: "-", place: 1 },
    lineNumber: LINE_FUNC_DECL,
    activeLogicalLineId: "FUNC_DECL",
    highlights: mkHighlights([]),
  });

  for (let exp = 1; Math.floor(shiftedMax / exp) > 0; exp *= 10) {
    count.fill(0);
    const placeLabel = exp === 1 ? "đơn vị" : exp === 10 ? "chục" : exp === 100 ? "trăm" : `10^${Math.log10(exp)}`;

    const digitOf = (val: number): number => Math.floor((val + offset) / exp) % 10;

    // ── Pass 1: Đếm tần suất ──
    for (let i = 0; i < currentArray.length; i++) {
      const val = currentArray[i];
      const digit = digitOf(val);
      count[digit]++;

      emit(
        `Đếm phần tử A[${i}] = ${val} (hàng ${placeLabel}: chữ số ${digit}). Tăng Count[${digit}] lên ${count[digit]}.`,
        "count",
        exp,
        [i, digit],
        false,
        { phase: "count", i, digit, countVal: count[digit], outputIdx: "-", place: exp },
        LINE_COUNT_STEP,
        "COUNT_STEP",
        { compare: [i, digit] }
      );
    }

    // ── Pass 2: Cộng dồn (Prefix Sum) ──
    emit(
      `Bắt đầu pha Prefix Sum cho hàng ${placeLabel}. Cộng lũy kế trái → phải để tìm vị trí kết thúc của từng nhóm chữ số.`,
      "accumulate",
      exp,
      null,
      false,
      { phase: "accumulate", i: "-", digit: "-", countVal: "-", outputIdx: "-", place: exp },
      LINE_ACCUMULATE_STEP,
      "ACCUMULATE_STEP"
    );

    for (let j = 1; j < count.length; j++) {
      const prev = count[j - 1];
      count[j] += prev;

      emit(
        `Cộng dồn: Count[${j}] += Count[${j - 1}] → nhóm chữ số ${j} kết thúc tại vị trí ${count[j]}.`,
        "accumulate",
        exp,
        [j - 1, j],
        false,
        { phase: "accumulate", i: j, digit: "-", countVal: count[j], outputIdx: "-", place: exp },
        LINE_ACCUMULATE_STEP,
        "ACCUMULATE_STEP",
        { compare: [j - 1, j] }
      );
    }

    // ── Pass 3: Dựng output (duyệt phải → trái giữ Stable) ──
    emit(
      `Bắt đầu dựng mảng kết quả hàng ${placeLabel}. Duyệt Input từ PHẢI qua TRÁI để giữ nguyên thứ tự phần tử trùng (Stable Sort).`,
      "output",
      exp,
      null,
      false,
      { phase: "output", i: "-", digit: "-", countVal: "-", outputIdx: "-", place: exp },
      LINE_OUTPUT_STEP,
      "OUTPUT_STEP"
    );

    for (let i = currentArray.length - 1; i >= 0; i--) {
      const val = currentArray[i];
      const digit = digitOf(val);
      count[digit]--;
      const outputIdx = count[digit];

      output[outputIdx] = val;
      outputIds[outputIdx] = arrayStateWithIds[i];

      emit(
        `Đưa A[${i}] = ${val} vào Output[${outputIdx}] (chữ số ${digit}). Giảm Count[${digit}] xuống ${count[digit]}.`,
        "output",
        exp,
        [i, outputIdx],
        true,
        { phase: "output", i, digit, countVal: count[digit], outputIdx, place: exp },
        LINE_OUTPUT_STEP,
        "OUTPUT_STEP",
        { assign: [outputIdx] }
      );
    }

    // Kết thúc pass: mảng hiện tại = output vừa dựng, chuẩn bị pass hàng tiếp theo
    for (let i = 0; i < currentArray.length; i++) {
      currentArray[i] = output[i] ?? currentArray[i];
      arrayStateWithIds[i] = outputIds[i] ?? arrayStateWithIds[i];
      output[i] = null;
      outputIds[i] = null;
    }
  }

  const finalSortedIndices = Array.from({ length: currentArray.length }, (_, k) => k);
  frames.push({
    stepIndex: stepIndex++,
    arrayState: [...currentArray],
    arrayStateWithIds: [...arrayStateWithIds],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: finalSortedIndices,
    description: "Counting Sort hoàn tất! Mảng đã được sắp xếp tăng dần ổn định qua tất cả các hàng chữ số.",
    algorithm: "counting",
    countArray: Array(10).fill(0),
    countingStep: "output",
    activeDigitPlace: 1,
    inputArray: [...currentArray],
    inputArrayWithIds: [...arrayStateWithIds],
    outputArray: [...currentArray],
    outputArrayWithIds: [...arrayStateWithIds],
    variables: { phase: "done", i: "-", digit: "-", countVal: "-", outputIdx: "-", place: "-" },
    lineNumber: LINE_FUNC_DECL,
    activeLogicalLineId: "FUNC_DECL",
    highlights: mkHighlights(finalSortedIndices),
  });

  return frames;
}
