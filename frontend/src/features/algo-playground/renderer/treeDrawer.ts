import type { CanvasStateSnapshot, TreeSnapshotNode } from '../../../core/CompilerStepExecutor';
import { COLORS } from './colors';
import { lerpColor } from './geometry';
import { nodeStateColor } from './nodeStates';

function findNode(nodes: TreeSnapshotNode[], id: string | null): TreeSnapshotNode | null {
  if (id === null) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
  }
  return null;
}

interface TreeLayout {
  positions: Map<string, { x: number; y: number }>;
  maxDepth: number;
  totalSlots: number;
  marginTop: number;
  nodeR: number;
  px: (x: number) => number;
  py: (y: number) => number;
}

function computeTreeLayout(nodes: TreeSnapshotNode[], w: number, h: number, hasCallStack: boolean): TreeLayout {
  const positions = new Map<string, { x: number; y: number }>();
  let counter = 0;
  let maxDepth = 0;

  // In-order positioning (improved spacing)
  const MAX_TREE_DEPTH = 60;
  const assign = (node: TreeSnapshotNode | null, depth: number): void => {
    if (!node) return;
    if (depth > MAX_TREE_DEPTH) return; // chống đệ quy sâu trên cây suy biến
    maxDepth = Math.max(maxDepth, depth);
    const left = findNode(nodes, node.leftId);
    assign(left, depth + 1);
    positions.set(node.id, { x: counter, y: depth });
    counter++;
    const right = findNode(nodes, node.rightId);
    assign(right, depth + 1);
  };
  assign(nodes[0], 0);

  const marginX = 50;
  const marginTop = hasCallStack ? 100 : 50;
  const marginBot = 40;
  const levelH = maxDepth > 0 ? (h - marginTop - marginBot) / maxDepth : h - marginTop - marginBot;
  const totalSlots = counter || 1;
  // Co node lại khi cây sâu/nhiều node để tránh chồng lấn
  const slotPx = (w - marginX * 2) / totalSlots;
  const nodeR = Math.min(18, Math.max(5, slotPx * 0.4, levelH * 0.35));
  const px = (x: number): number => marginX + ((x + 0.5) / totalSlots) * (w - marginX * 2);
  const py = (y: number): number => marginTop + y * levelH;

  return { positions, maxDepth, totalSlots, marginTop, nodeR, px, py };
}

export function drawTree(ctx: CanvasRenderingContext2D, w: number, h: number, snapshot: CanvasStateSnapshot): void {
  const nodes = snapshot.treeNodes ?? [];
  if (nodes.length === 0) return;

  const prunedIds = new Set(snapshot.prunedNodeIds ?? []);
  const layout = computeTreeLayout(nodes, w, h, (snapshot.callStack?.length ?? 0) > 0);
  const { positions, nodeR, px, py } = layout;

  const isPruned = (id: string): boolean => prunedIds.has(id);

  // Draw edges first (dim pruned branches)
  for (const node of nodes) {
    const pos = positions.get(node.id);
    if (!pos) continue;
    for (const childId of [node.leftId, node.rightId]) {
      if (childId === null) continue;
      const childPos = positions.get(childId);
      if (!childPos) continue;
      const pruned = isPruned(node.id) || isPruned(childId);
      ctx.strokeStyle = pruned ? COLORS.nodePruned : COLORS.edgeDefault;
      ctx.lineWidth = pruned ? 1 : 1.5;
      if (pruned) ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px(pos.x), py(pos.y));
      ctx.lineTo(px(childPos.x), py(childPos.y));
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Draw nodes
  for (const node of nodes) {
    const pos = positions.get(node.id);
    if (!pos) continue;
    const cx = px(pos.x);
    const cy = py(pos.y);
    const pruned = prunedIds.has(node.id);
    const isFound = snapshot.searchFound === true && (snapshot.activeIds ?? []).includes(node.id);

    ctx.beginPath();
    ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = nodeStateColor(snapshot, node.id, prunedIds);
    if (isFound) {
      // Golden glow cho node tìm thấy
      ctx.save();
      ctx.shadowColor = COLORS.foundGlow;
      ctx.shadowBlur = 16;
    }
    ctx.fill();
    if (isFound) ctx.restore();
    ctx.strokeStyle = isFound ? COLORS.foundGlow : pruned ? COLORS.nodePruned : COLORS.nodeBorder;
    ctx.lineWidth = isFound ? 2.5 : pruned ? 1 : 1.5;
    ctx.stroke();

    ctx.fillStyle = pruned ? COLORS.nodePruned : COLORS.nodeText;
    ctx.font = `${pruned ? '' : 'bold '}12px "JetBrains Mono", Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(node.value), cx, cy);
  }
}

/**
 * Vẽ tree với nội suy trạng thái (màu node/edge) giữa prev và curr.
 * Cấu trúc cây được giả định ổn định giữa các frame (id node là khóa).
 */
export function drawTreeTransition(ctx: CanvasRenderingContext2D, w: number, h: number, prev: CanvasStateSnapshot, curr: CanvasStateSnapshot, t: number): void {
  const nodes = curr.treeNodes ?? [];
  if (nodes.length === 0) return;

  const layout = computeTreeLayout(nodes, w, h, (curr.callStack?.length ?? 0) > 0);
  const { positions, nodeR, px, py } = layout;

  for (const node of nodes) {
    const pos = positions.get(node.id);
    if (!pos) continue;
    for (const childId of [node.leftId, node.rightId]) {
      if (childId === null) continue;
      const childPos = positions.get(childId);
      if (!childPos) continue;
      const fromPruned = (prev.prunedNodeIds ?? []).includes(node.id) || (prev.prunedNodeIds ?? []).includes(childId);
      const toPruned = (curr.prunedNodeIds ?? []).includes(node.id) || (curr.prunedNodeIds ?? []).includes(childId);
      const fromColor = fromPruned ? COLORS.nodePruned : COLORS.edgeDefault;
      const toColor = toPruned ? COLORS.nodePruned : COLORS.edgeDefault;
      ctx.strokeStyle = lerpColor(fromColor, toColor, t);
      ctx.lineWidth = toPruned ? 1 : 1.5;
      ctx.setLineDash(toPruned ? [4, 4] : []);
      ctx.beginPath();
      ctx.moveTo(px(pos.x), py(pos.y));
      ctx.lineTo(px(childPos.x), py(childPos.y));
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  for (const node of nodes) {
    const pos = positions.get(node.id);
    if (!pos) continue;
    const cx = px(pos.x);
    const cy = py(pos.y);
    const pruned = (curr.prunedNodeIds ?? []).includes(node.id);
    ctx.beginPath();
    ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = lerpColor(nodeStateColor(prev, node.id), nodeStateColor(curr, node.id), t);
    ctx.fill();
    ctx.strokeStyle = pruned ? COLORS.nodePruned : COLORS.nodeBorder;
    ctx.lineWidth = pruned ? 1 : 1.5;
    ctx.stroke();
    ctx.fillStyle = pruned ? COLORS.nodePruned : COLORS.nodeText;
    ctx.font = `${pruned ? '' : 'bold '}12px "JetBrains Mono", Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(node.value), cx, cy);
  }
}
