import type { CodeLine, LanguageCode, VariableState } from '../types/pseudocode.types';

export interface AnimationFrameForSync {
  frameIndex: number;
  activeLogicalLineId: string;
  variables: Record<string, string | number>;
}

export class PseudocodeSyncEngine {
  /**
   * PS-011: Trả về DANH SÁCH toàn bộ dòng vật lý ứng với một logicalId trong
   * ngôn ngữ hiện tại. Một logicalId có thể xuất hiện trên nhiều dòng vật lý
   * (vd Java: 3 dòng thực thi SWAP_STEP: `temp = arr[j]`, `arr[j] = arr[j+1]`,
   * `arr[j+1] = temp`) — UI highlight toàn bộ các dòng này, không chỉ dòng đầu.
   */
  static getPhysicalLineNumbers(
    logicalLineId: string,
    language: string,
    codeLanguages: LanguageCode[],
  ): number[] {
    const matched = codeLanguages.find((lang) => lang.language === language);
    if (!matched) return [];
    const lineNumbers: number[] = [];
    for (const line of matched.lines) {
      if (line.logicalId === logicalLineId) lineNumbers.push(line.lineNumber);
    }
    return lineNumbers;
  }

  static getPhysicalLineNumber(
    logicalLineId: string,
    language: string,
    codeLanguages: LanguageCode[],
  ): number | null {
    // PS-016: 1 nguồn lookup duy nhất — dòng đầu tiên trong danh sách khớp.
    const lineNumbers = this.getPhysicalLineNumbers(logicalLineId, language, codeLanguages);
    return lineNumbers.length > 0 ? lineNumbers[0] : null;
  }

  static findFirstFrameIndexForLogicalLine(
    logicalLineId: string,
    frames: AnimationFrameForSync[],
  ): number {
    return frames.findIndex((frame) => frame.activeLogicalLineId === logicalLineId);
  }

  static findAllFrameIndicesForLogicalLine(
    logicalLineId: string,
    frames: AnimationFrameForSync[],
  ): number[] {
    const indices: number[] = [];
    frames.forEach((frame, idx) => {
      if (frame.activeLogicalLineId === logicalLineId) indices.push(idx);
    });
    return indices;
  }

  static transformVariablesForWatch(
    variables: Record<string, string | number>,
  ): VariableState[] {
    return Object.entries(variables)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([name, value]) => ({
        name,
        value: typeof value === 'number' && !Number.isInteger(value)
          ? Number(value.toFixed(2))
          : value,
      }));
  }

  static getOccurrenceCount(
    logicalLineId: string,
    frames: AnimationFrameForSync[],
  ): number {
    return frames.filter((f) => f.activeLogicalLineId === logicalLineId).length;
  }

  static getNextCycleFrameIndex(
    logicalLineId: string,
    currentFrameIndex: number,
    frames: AnimationFrameForSync[],
  ): number {
    const allIndices = this.findAllFrameIndicesForLogicalLine(logicalLineId, frames);
    if (allIndices.length === 0) return -1;
    const nextIdx = allIndices.find((idx) => idx > currentFrameIndex);
    return nextIdx !== undefined ? nextIdx : allIndices[0];
  }

  static findCodeLineByLogicalId(
    logicalLineId: string,
    lines: CodeLine[],
  ): CodeLine | null {
    return lines.find((line) => line.logicalId === logicalLineId) ?? null;
  }
}
