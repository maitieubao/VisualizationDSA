import type { CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { COLORS } from './colors';

/** Màu trạng thái của node theo snapshot (dùng chung cho draw + transition). */
export function nodeStateColor(snap: CanvasStateSnapshot, id: string, prunedSet?: Set<string>): string {
  const prunedIds = prunedSet ?? new Set(snap.prunedNodeIds ?? []);
  if (prunedIds.has(id)) return COLORS.nodePruned;
  // BST: khi searchFound=true, node đang active chính là node được tìm thấy
  if (snap.searchFound === true && (snap.activeIds ?? []).includes(id)) return COLORS.nodeFound;
  if ((snap.activeIds ?? []).includes(id)) return COLORS.nodeActive;
  if ((snap.visitedIds ?? []).includes(id)) return COLORS.nodeVisited;
  return COLORS.nodeDefault;
}

/** Màu trạng thái của edge theo snapshot (dùng chung cho draw + transition). */
export function edgeStateColor(snap: CanvasStateSnapshot, from: string, to: string): string {
  return isEdgeHighlighted(snap.highlightedEdges, from, to) ? COLORS.edgeHighlight : COLORS.edgeDefault;
}

export function isEdgeHighlighted(
  highlighted: [string, string][] | undefined,
  from: string,
  to: string,
): boolean {
  if (!highlighted) return false;
  return highlighted.some(([a, b]) => (a === from && b === to) || (a === to && b === from));
}
