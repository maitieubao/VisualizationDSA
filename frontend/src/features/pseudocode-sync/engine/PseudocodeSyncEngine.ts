import type { CodeLine, LanguageCode, VariableState } from '../types/pseudocode.types';

export interface AnimationFrameForSync {
  frameIndex: number;
  activeLogicalLineId: string;
  variables: Record<string, string | number>;
}

export class PseudocodeSyncEngine {
  static getPhysicalLineNumber(
    logicalLineId: string,
    language: string,
    codeLanguages: LanguageCode[],
  ): number | null {
    const matched = codeLanguages.find((lang) => lang.language === language);
    const matchedLine = matched?.lines.find((line) => line.logicalId === logicalLineId);
    return matchedLine ? matchedLine.lineNumber : null;
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
