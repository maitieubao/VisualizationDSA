/**
 * scriptLoader — Nạp kịch bản mã nguồn đa ngôn ngữ theo algorithmId.
 */

import type { PseudocodeScript } from '../types/pseudocode.types';
import { bubbleSortScript } from './bubble-sort.pseudocode';

const scriptRegistry: Record<string, PseudocodeScript> = {
  'bubble-sort': bubbleSortScript,
};

export function loadPseudocodeScript(algorithmId: string): PseudocodeScript | null {
  return scriptRegistry[algorithmId] ?? null;
}

export function hasPseudocodeScript(algorithmId: string): boolean {
  return algorithmId in scriptRegistry;
}
