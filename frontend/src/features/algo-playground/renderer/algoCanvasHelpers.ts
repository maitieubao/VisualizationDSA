import type { CanvasStateSnapshot, TreeSnapshotNode } from '../../../core/CompilerStepExecutor';

export const COLORS = {
  barDefault: '#6366f1',
  barCompare: '#f59e0b',
  barSwap: '#ef4444',
  barSorted: '#10b981',
  barPruned: 'rgba(99, 102, 241, 0.2)',
  barText: '#e2e8f0',
  nodeDefault: '#334155',
  nodeBorder: '#64748b',
  nodeActive: '#f59e0b',
  nodeVisited: '#10b981',
  nodePruned: 'rgba(51, 65, 85, 0.25)',
  nodeText: '#f8fafc',
  nodeFound: '#fbbf24',
  edgeDefault: '#475569',
  edgeHighlight: '#fbbf24',
  edgeWeightText: '#22d3ee',
  badgeBg: 'rgba(30, 41, 59, 0.85)',
  badgeText: '#cbd5e1',
  rangeActive: 'rgba(251, 191, 36, 0.12)',
  rangePruned: 'rgba(239, 68, 68, 0.08)',
  pointerColors: { L: '#06b6d4', H: '#8b5cf6', M: '#f59e0b', R: '#ef4444', Low: '#06b6d4', High: '#8b5cf6', Mid: '#f59e0b', Left: '#06b6d4', Right: '#ef4444' } as Record<string, string>,
  callStackBg: 'rgba(15, 23, 42, 0.92)',
  callStackBorder: '#334155',
  callStackActive: '#f59e0b',
  legendBg: 'rgba(15, 23, 42, 0.88)',
  legendText: '#94a3b8',
  notFoundBg: 'rgba(239, 68, 68, 0.15)',
  notFoundText: '#ef4444',
  targetBg: 'rgba(6, 182, 212, 0.15)',
  targetText: '#06b6d4',
  depthText: '#a78bfa',
  foundGlow: '#fbbf24',
};

function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawLegend(ctx: CanvasRenderingContext2D, w: number, h: number, items: Array<{ color: string; label: string }>, y: number): void {
  const x = w - 12;
  const lineH = 16;
  const maxW = Math.max(...items.map(it => ctx.measureText(it.label).width)) + 24;

  ctx.fillStyle = COLORS.legendBg;
  roundRect(ctx, x - maxW - 8, y, maxW + 16, items.length * lineH + 12, 6);
  ctx.fill();

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = '10px "JetBrains Mono", Consolas, monospace';
  items.forEach((it, i) => {
    ctx.fillStyle = it.color;
    ctx.beginPath();
    ctx.arc(x - 8, y + 8 + i * lineH, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.legendText;
    ctx.fillText(it.label, x - 16, y + 8 + i * lineH);
  });
}

function drawCallStackPanel(ctx: CanvasRenderingContext2D, w: number, h: number, callStack: Array<{ functionName: string; depth: number }>, recursionDepth: number): void {
  const panelW = 180;
  const panelH = Math.min(callStack.length * 22 + 30, h * 0.4);
  const x = 12;
  const y = 12;

  ctx.fillStyle = COLORS.callStackBg;
  roundRect(ctx, x, y, panelW, panelH, 6);
  ctx.fill();
  ctx.strokeStyle = COLORS.callStackBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = COLORS.badgeText;
  ctx.font = 'bold 10px "JetBrains Mono", Consolas, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`CALL STACK (depth: ${recursionDepth})`, x + 8, y + 6);

  ctx.font = '10px "JetBrains Mono", Consolas, monospace';
  callStack.forEach((frame, i) => {
    const fy = y + 26 + i * 22;
    if (fy + 16 > y + panelH) return;
    const isActive = i === callStack.length - 1;
    ctx.fillStyle = isActive ? COLORS.callStackActive : COLORS.badgeText;
    const indent = '| '.repeat(frame.depth);
    ctx.fillText(`${indent}${frame.functionName}()`, x + 8, fy);
    if (isActive) {
      // Tam giác chỉ frame đang xử lý (vẽ path — thay ký tự unicode "←")
      ctx.fillStyle = COLORS.callStackActive;
      ctx.beginPath();
      ctx.moveTo(x + panelW - 22, fy + 1);
      ctx.lineTo(x + panelW - 12, fy + 5);
      ctx.lineTo(x + panelW - 22, fy + 9);
      ctx.closePath();
      ctx.fill();
    }
  });
}

function drawArrayBars(ctx: CanvasRenderingContext2D, w: number, h: number, snapshot: CanvasStateSnapshot, barColors?: string[]): void {
  const array = snapshot.array ?? [];
  if (array.length === 0) return;

  const margin = 32;
  const gap = 3;
  const minVal = Math.min(...array, 0);
  const maxVal = Math.max(...array, 1);
  const span = Math.max(maxVal - minVal, 1);
  const usableW = w - margin * 2;
  const barW = Math.max(2, (usableW - gap * (array.length - 1)) / array.length);
  const usableH = h - margin * 2;
  const baseY = h - margin;
  // Đường baseline 0: số dương dựng lên trên, số âm đâm xuống dưới
  const zeroY = baseY - ((0 - minVal) / span) * usableH;
  const valueFontPx = Math.max(6, Math.min(11, Math.round(barW * 0.5)));
  const indexFontPx = Math.max(5, Math.min(9, Math.round(barW * 0.4)));

  const comparing: number[] = snapshot.comparingIndices ?? [];
  const swapping: number[] = snapshot.swappingIndices ?? [];
  const sorted: number[] = snapshot.highlightedIndices ?? [];
  const searchRng = snapshot.searchRange;
  const foundIdx = snapshot.foundIndex ?? -1;
  const pointers = snapshot.pointers ?? [];
  const regions = snapshot.searchRegions ?? [];

  // Draw search regions (backgrounds behind bars)
  for (const region of regions) {
    if (region.start < 0 || region.end >= array.length) continue;
    const x1 = margin + region.start * (barW + gap) - 2;
    const x2 = margin + region.end * (barW + gap) + barW + 2;
    ctx.fillStyle = region.state === 'active' ? COLORS.rangeActive : COLORS.rangePruned;
    ctx.fillRect(x1, margin - 8, x2 - x1, usableH + 16);
  }

  // Search regions đã tô nền active/pruned — không vẽ thêm bracket kẻ dọc (gây nhiễu)

  for (let i = 0; i < array.length; i++) {
    const v = array[i];
    const top = zeroY - ((v - minVal) / span) * usableH;
    const y = v >= 0 ? top : zeroY;
    const barH = Math.max(3, v >= 0 ? zeroY - top : top - zeroY);
    const x = margin + i * (barW + gap);

    let fill = barColors?.[i] ?? COLORS.barDefault;
    if (!barColors) {
      if (swapping.includes(i)) fill = COLORS.barSwap;
      else if (comparing.includes(i)) fill = COLORS.barCompare;
      else if (sorted.includes(i)) fill = COLORS.barSorted;
    }

    // Dim elements outside search range
    if (searchRng && (i < searchRng.low || i > searchRng.high) && !sorted.includes(i)) {
      fill = COLORS.barPruned;
    }

    // Found state — golden glow
    if (foundIdx === i) {
      fill = COLORS.barSorted;
      ctx.save();
      ctx.shadowColor = COLORS.foundGlow;
      ctx.shadowBlur = 16;
      roundRect(ctx, x, y, barW, barH, 3);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = COLORS.foundGlow;
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, barW, barH, 3);
      ctx.stroke();
    } else {
      roundRect(ctx, x, y, barW, barH, 3);
      ctx.fillStyle = fill;
      ctx.fill();
    }

    // Value label above bar (ẩn khi bar quá hẹp)
    if (barW >= 7 && barH >= 10) {
      ctx.fillStyle = COLORS.barText;
      ctx.font = `${valueFontPx}px "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(String(v), x + barW / 2, y - 4);
    }

    // Index label below bar (ẩn khi bar quá hẹp)
    if (barW >= 5) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = `${indexFontPx}px "JetBrains Mono", Consolas, monospace`;
      ctx.textBaseline = 'top';
      ctx.fillText(String(i), x + barW / 2, baseY + 4);
    }
  }

  // Draw pointer indicators above bars
  for (const ptr of pointers) {
    if (ptr.index < 0 || ptr.index >= array.length) continue;
    const px = margin + ptr.index * (barW + gap) + barW / 2;
    const py = margin - 18;
    const color = COLORS.pointerColors[ptr.label] || ptr.color || COLORS.barCompare;

    // Arrow pointing down
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(px, py + 12);
    ctx.lineTo(px - 5, py);
    ctx.lineTo(px + 5, py);
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(ptr.label, px, py - 2);
  }
}

// ─── Tree rendering with Reingold-Tilford-inspired layout ───

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

    ctx.beginPath();
    ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = nodeStateColor(snapshot, node.id, prunedIds);
    ctx.fill();
    ctx.strokeStyle = pruned ? COLORS.nodePruned : COLORS.nodeBorder;
    ctx.lineWidth = pruned ? 1 : 1.5;
    ctx.stroke();

    ctx.fillStyle = pruned ? 'rgba(248, 250, 252, 0.3)' : COLORS.nodeText;
    ctx.font = `${pruned ? '' : 'bold '}12px "JetBrains Mono", Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(node.value), cx, cy);
  }
}

/** Màu trạng thái của node theo snapshot (dùng chung cho draw + transition). */
function nodeStateColor(snap: CanvasStateSnapshot, id: string, prunedSet?: Set<string>): string {
  const prunedIds = prunedSet ?? new Set(snap.prunedNodeIds ?? []);
  if (prunedIds.has(id)) return COLORS.nodePruned;
  if ((snap.activeIds ?? []).includes(id)) return COLORS.nodeActive;
  if ((snap.visitedIds ?? []).includes(id)) return COLORS.nodeVisited;
  return COLORS.nodeDefault;
}

/** Màu trạng thái của edge theo snapshot (dùng chung cho draw + transition). */
function edgeStateColor(snap: CanvasStateSnapshot, from: string, to: string): string {
  return isEdgeHighlighted(snap.highlightedEdges, from, to) ? COLORS.edgeHighlight : COLORS.edgeDefault;
}

function isEdgeHighlighted(
  highlighted: [string, string][] | undefined,
  from: string,
  to: string,
): boolean {
  if (!highlighted) return false;
  return highlighted.some(([a, b]) => (a === from && b === to) || (a === to && b === from));
}

export function drawGraph(ctx: CanvasRenderingContext2D, w: number, h: number, snapshot: CanvasStateSnapshot): void {
  const nodes = snapshot.graphNodes ?? [];
  const edges = snapshot.graphEdges ?? [];
  if (nodes.length === 0) return;

  const nodeR = 22;
  const distances = snapshot.distances ?? {};

  for (const edge of edges) {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) continue;
    const x1 = fromNode.x * w;
    const y1 = fromNode.y * h;
    const x2 = toNode.x * w;
    const y2 = toNode.y * h;

    const highlighted = isEdgeHighlighted(snapshot.highlightedEdges, edge.from, edge.to);
    ctx.strokeStyle = edgeStateColor(snapshot, edge.from, edge.to);
    ctx.lineWidth = highlighted ? 3 : 1.5;
    if (highlighted) ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (edge.directed) {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const arrowLen = 9;
      ctx.fillStyle = highlighted ? COLORS.edgeHighlight : COLORS.edgeDefault;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - arrowLen * Math.cos(angle - Math.PI / 6), y2 - arrowLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - arrowLen * Math.cos(angle + Math.PI / 6), y2 - arrowLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }

    if (edge.weight !== undefined && edge.weight !== null) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(midX, midY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.edgeWeightText;
      ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(edge.weight), midX, midY);
    }
  }

  for (const node of nodes) {
    const cx = node.x * w;
    const cy = node.y * h;
    ctx.beginPath();
    ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = nodeStateColor(snapshot, node.id);
    ctx.fill();
    ctx.strokeStyle = COLORS.nodeBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = COLORS.nodeText;
    ctx.font = 'bold 13px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, cx, cy);

    const dist = distances[node.id];
    if (dist !== undefined) {
      ctx.fillStyle = COLORS.barCompare;
      ctx.font = '11px "JetBrains Mono", Consolas, monospace';
      ctx.fillText(dist === 999999 ? '∞' : String(dist), cx, cy + nodeR + 14);
    }
  }
}

// ═══════════════════════════════════════════
// Transition rendering (nội suy màu trạng thái giữa 2 frame cho tree/graph)
// ═══════════════════════════════════════════

function parseHexColor(hex: string): { r: number; g: number; b: number; a: number } {
  if (hex.startsWith('rgb')) {
    const m = hex.match(/[\d.]+/g);
    return {
      r: +(m?.[0] ?? 0),
      g: +(m?.[1] ?? 0),
      b: +(m?.[2] ?? 0),
      a: m?.[3] !== undefined ? +m[3] : 1,
    };
  }
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
    a: 1,
  };
}

function lerpColorHex(from: string, to: string, t: number): string {
  if (from === to) return from;
  const f = parseHexColor(from);
  const g = parseHexColor(to);
  const r = Math.round(f.r + (g.r - f.r) * t);
  const gg = Math.round(f.g + (g.g - f.g) * t);
  const b = Math.round(f.b + (g.b - f.b) * t);
  const a = f.a + (g.a - f.a) * t;
  // Giữ alpha: màu rgba (vd pruned 0.2) không được "đặc cứng" khi lerp
  if (f.a < 1 || g.a < 1) {
    return `rgba(${r},${gg},${b},${a.toFixed(2)})`;
  }
  return `rgb(${r},${gg},${b})`;
}

/**
 * Vẽ tree với nội suy trạng thái (màu node/edge) giữa prev và curr.
 * Cấu trúc cây được giả định ổn định giữa các frame (id node là khóa).
 */
function drawTreeTransition(ctx: CanvasRenderingContext2D, w: number, h: number, prev: CanvasStateSnapshot, curr: CanvasStateSnapshot, t: number): void {
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
      ctx.strokeStyle = lerpColorHex(fromColor, toColor, t);
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
    ctx.fillStyle = lerpColorHex(nodeStateColor(prev, node.id), nodeStateColor(curr, node.id), t);
    ctx.fill();
    ctx.strokeStyle = pruned ? COLORS.nodePruned : COLORS.nodeBorder;
    ctx.lineWidth = pruned ? 1 : 1.5;
    ctx.stroke();
    ctx.fillStyle = pruned ? 'rgba(248, 250, 252, 0.3)' : COLORS.nodeText;
    ctx.font = `${pruned ? '' : 'bold '}12px "JetBrains Mono", Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(node.value), cx, cy);
  }
}

/**
 * Vẽ graph với nội suy trạng thái giữa prev và curr (vị trí node cố định).
 */
function drawGraphTransition(ctx: CanvasRenderingContext2D, w: number, h: number, prev: CanvasStateSnapshot, curr: CanvasStateSnapshot, t: number): void {
  const nodes = curr.graphNodes ?? [];
  const edges = curr.graphEdges ?? [];
  if (nodes.length === 0) return;

  const nodeR = 22;
  const distances = curr.distances ?? {};

  for (const edge of edges) {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) continue;
    const x1 = fromNode.x * w;
    const y1 = fromNode.y * h;
    const x2 = toNode.x * w;
    const y2 = toNode.y * h;

    const highlighted = isEdgeHighlighted(curr.highlightedEdges, edge.from, edge.to);
    ctx.strokeStyle = lerpColorHex(edgeStateColor(prev, edge.from, edge.to), edgeStateColor(curr, edge.from, edge.to), t);
    ctx.lineWidth = highlighted ? 3 : 1.5;
    ctx.setLineDash(highlighted ? [6, 4] : []);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (edge.directed) {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const arrowLen = 9;
      ctx.fillStyle = highlighted ? COLORS.edgeHighlight : COLORS.edgeDefault;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - arrowLen * Math.cos(angle - Math.PI / 6), y2 - arrowLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - arrowLen * Math.cos(angle + Math.PI / 6), y2 - arrowLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }

    if (edge.weight !== undefined && edge.weight !== null) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(midX, midY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.edgeWeightText;
      ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(edge.weight), midX, midY);
    }
  }

  for (const node of nodes) {
    const cx = node.x * w;
    const cy = node.y * h;
    ctx.beginPath();
    ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = lerpColorHex(nodeStateColor(prev, node.id), nodeStateColor(curr, node.id), t);
    ctx.fill();
    ctx.strokeStyle = COLORS.nodeBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = COLORS.nodeText;
    ctx.font = 'bold 13px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, cx, cy);

    const dist = distances[node.id];
    if (dist !== undefined) {
      ctx.fillStyle = COLORS.barCompare;
      ctx.font = '11px "JetBrains Mono", Consolas, monospace';
      ctx.fillText(dist === 999999 ? '∞' : String(dist), cx, cy + nodeR + 14);
    }
  }
}

/**
 * Vẽ frame với nội suy nếu snapshot là tree/graph; trả về true nếu đã xử lý.
 * Dùng cho transition giữa 2 frame (t ∈ [0,1]) — nếu không phải tree/graph trả về false
 * để engine fallback về pipeline array.
 */
export function drawPlaybackFrameTransition(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  prev: CanvasStateSnapshot,
  curr: CanvasStateSnapshot,
  t: number,
): boolean {
  const treeNodes = curr.treeNodes ?? [];
  const graphNodes = curr.graphNodes ?? [];
  if (treeNodes.length === 0 && graphNodes.length === 0) return false;

  clearCanvas(ctx, w, h);
  if (treeNodes.length > 0) {
    drawTreeTransition(ctx, w, h, prev, curr, t);
  } else {
    drawGraphTransition(ctx, w, h, prev, curr, t);
  }
  drawSnapshotOverlays(ctx, w, h, curr);
  return true;
}

function drawBadge(ctx: CanvasRenderingContext2D, x: number, y: number, label: string): void {
  ctx.fillStyle = COLORS.badgeBg;
  const textW = ctx.measureText(label).width;
  roundRect(ctx, x, y, textW + 16, 22, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.badgeText;
  ctx.font = '11px "JetBrains Mono", Consolas, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 8, y + 11);
}

export function drawQueueStackBadges(ctx: CanvasRenderingContext2D, w: number, h: number, snapshot: CanvasStateSnapshot): void {
  const queue = snapshot.queueIds ?? [];
  const stack = snapshot.stackIds ?? [];
  let offset = 0;
  if (queue.length > 0) {
    drawBadge(ctx, 12, h - 34, 'Queue: ' + queue.join(' → '));
    offset += ctx.measureText('Queue: ' + queue.join(' → ')).width + 24;
  }
  if (stack.length > 0) {
    drawBadge(ctx, 12 + offset, h - 34, 'Stack: ' + stack.join(' | '));
  }
}

function drawTargetBadge(ctx: CanvasRenderingContext2D, w: number, h: number, target: number, found: boolean): void {
  const label = found ? `Found: ${target}` : `Target: ${target}`;
  const bg = found ? COLORS.barSorted : COLORS.targetBg;
  const textColor = found ? '#fff' : COLORS.targetText;
  const iconW = found ? 14 : 0;
  const textW = ctx.measureText(label).width;
  const x = 12;
  const y = 12;
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, textW + 20 + iconW, 24, 6);
  ctx.fill();
  if (found) {
    // Dấu check vẽ bằng path vector (thay ký tự unicode "✓")
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 12);
    ctx.lineTo(x + 13, y + 15);
    ctx.lineTo(x + 18, y + 9);
    ctx.stroke();
  }
  ctx.fillStyle = textColor;
  ctx.font = 'bold 12px "JetBrains Mono", Consolas, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 10 + iconW, y + 12);
}

function drawComparisonCounter(ctx: CanvasRenderingContext2D, w: number, count: number, y: number): void {
  const label = `Comparisons: ${count}`;
  const textW = ctx.measureText(label).width;
  const x = w - textW - 24;
  ctx.fillStyle = COLORS.badgeBg;
  roundRect(ctx, x, y, textW + 16, 22, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.barCompare;
  ctx.font = '11px "JetBrains Mono", Consolas, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 8, y + 11);
}

function drawDepthBadge(ctx: CanvasRenderingContext2D, w: number, depth: number, y: number): void {
  const label = `Depth: ${depth}`;
  const textW = ctx.measureText(label).width;
  const x = w - textW - 24;
  ctx.fillStyle = COLORS.badgeBg;
  roundRect(ctx, x, y, textW + 16, 22, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.depthText;
  ctx.font = 'bold 11px "JetBrains Mono", Consolas, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 8, y + 11);
}

function drawNotFoundOverlay(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const label = 'Not Found';
  ctx.font = 'bold 18px "JetBrains Mono", Consolas, monospace';
  const textW = ctx.measureText(label).width;
  const boxW = textW + 64;
  const boxH = 36;
  const x = (w - boxW) / 2;
  const y = h - 60;

  ctx.fillStyle = COLORS.notFoundBg;
  roundRect(ctx, x, y, boxW, boxH, 8);
  ctx.fill();
  ctx.strokeStyle = COLORS.notFoundText;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Dấu X vẽ bằng path vector (thay ký tự unicode "✕")
  ctx.strokeStyle = COLORS.notFoundText;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 22, y + 13);
  ctx.lineTo(x + 32, y + 23);
  ctx.moveTo(x + 32, y + 13);
  ctx.lineTo(x + 22, y + 23);
  ctx.stroke();

  ctx.fillStyle = COLORS.notFoundText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w / 2 + 10, y + boxH / 2);
}

/** Vẽ các overlay trạng thái (badge/counter/callstack/legend...) — dùng chung cho frame tĩnh và transition. */
export function drawSnapshotOverlays(ctx: CanvasRenderingContext2D, w: number, h: number, snapshot: CanvasStateSnapshot): void {
  drawQueueStackBadges(ctx, w, h, snapshot);

  // Target badge
  if (snapshot.searchTarget !== undefined) {
    drawTargetBadge(ctx, w, h, snapshot.searchTarget, snapshot.searchFound === true);
  }

  // ── Các badge góc trên-phải xếp dọc (tránh chồng nhau) ──
  let topRightY = 12;

  // Comparison counter
  if (snapshot.comparisonCount !== undefined && snapshot.comparisonCount > 0) {
    drawComparisonCounter(ctx, w, snapshot.comparisonCount, topRightY);
    topRightY += 22 + 8;
  }

  // Depth badge — ẩn khi đã có call stack panel (panel đã hiển thị depth trong header)
  if (snapshot.recursionDepth !== undefined && snapshot.recursionDepth > 0
    && !(snapshot.callStack && snapshot.callStack.length > 0)) {
    drawDepthBadge(ctx, w, snapshot.recursionDepth, topRightY);
    topRightY += 22 + 8;
  }

  // Not found overlay
  if (snapshot.searchFound === false && snapshot.searchRange) {
    const rng = snapshot.searchRange;
    if (rng.low > rng.high) {
      drawNotFoundOverlay(ctx, w, h);
    }
  }

  // Call stack panel (góc trên-trái — không đè lên badge phải)
  if (snapshot.callStack && snapshot.callStack.length > 0) {
    drawCallStackPanel(ctx, w, h, snapshot.callStack, snapshot.recursionDepth ?? 0);
  }

  // Legend — chỉ hiển thị khi có trạng thái tìm kiếm đặc biệt (found/pruned)
  if (snapshot.searchTarget !== undefined) {
    const legendItems: Array<{ color: string; label: string }> = [
      { color: COLORS.barDefault, label: 'Default' },
      { color: COLORS.barCompare, label: 'Comparing' },
    ];
    if (snapshot.searchFound) legendItems.push({ color: COLORS.barSorted, label: 'Found' });
    else legendItems.push({ color: COLORS.barPruned, label: 'Pruned' });
    if (w > 300) {
      drawLegend(ctx, w, h, legendItems, topRightY);
    }
  }
}

export function drawPlaybackFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  snapshot: CanvasStateSnapshot,
  barColors?: string[],
): void {
  clearCanvas(ctx, w, h);
  const treeNodes = snapshot.treeNodes ?? [];
  const graphNodes = snapshot.graphNodes ?? [];

  if (treeNodes.length > 0) {
    drawTree(ctx, w, h, snapshot);
  } else if (graphNodes.length > 0) {
    drawGraph(ctx, w, h, snapshot);
  } else {
    drawArrayBars(ctx, w, h, snapshot, barColors);
  }

  drawSnapshotOverlays(ctx, w, h, snapshot);
}
