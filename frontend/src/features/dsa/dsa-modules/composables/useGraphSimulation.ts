import { ref, reactive, onUnmounted, type Ref } from 'vue';

interface GraphNode {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GraphEdge {
  from: number;
  to: number;
  weight: number;
}

interface ForceGraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  running: boolean;
}

export function useGraphSimulation() {
  const state = reactive<ForceGraphState>({
    nodes: [],
    edges: [],
    width: 800,
    height: 600,
    running: false,
  });

  let animFrameId: number | null = null;
  let lastTime = 0;

  const DEFAULTS = {
    repulsion: 4000,
    attraction: 0.05,
    idealLength: 150,
    damping: 0.85,
    centerGravity: 0.01,
    maxVelocity: 5,
    minDistance: 30,
  };

  function computeInitialGridPositions(nodes: GraphNode[], width: number, height: number): void {
  const n = nodes.length;
  if (n === 0) return;
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const cellW = Math.min((width - 60) / Math.max(cols, 1), 200);
  const cellH = Math.min((height - 60) / Math.max(rows, 1), 160);
  const offsetX = (width - cellW * cols) / 2;
  const offsetY = (height - cellH * rows) / 2;
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    nodes[i].x = offsetX + col * cellW + cellW / 2;
    nodes[i].y = offsetY + row * cellH + cellH / 2;
    nodes[i].vx = 0;
    nodes[i].vy = 0;
  }
}

function computeForces(deltaTime: number): void {
  const { nodes, edges } = state;
  const n = nodes.length;
  if (n === 0) return;

  const dt = Math.min(deltaTime, 32) / 16.67;

  
  const cx = state.width / 2;
  const cy = state.height / 2;
  const gravityStrength = n < 10 ? 0.02 : 0.01;
  for (const node of nodes) {
    node.vx += (cx - node.x) * gravityStrength * dt;
    node.vy += (cy - node.y) * gravityStrength * dt;
  }

  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const distSq = dx * dx + dy * dy;
      const minDist = 80;
      if (distSq < minDist * minDist && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = DEFAULTS.repulsion * (1 - dist / minDist) / dist;
        const fx = (dx / dist) * force * dt;
        const fy = (dy / dist) * force * dt;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }
  }

  
  for (const edge of edges) {
    const from = nodes.find(n => n.id === edge.from);
    const to = nodes.find(n => n.id === edge.to);
    if (!from || !to) continue;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const weightFactor = Math.max(edge.weight ?? 1, 0.5);
    const idealLen = DEFAULTS.idealLength * (1 + weightFactor * 0.3);
    const displacement = dist - idealLen;
    const force = DEFAULTS.attraction * displacement * weightFactor;
    const fx = (dx / Math.max(dist, 1)) * force * dt;
    const fy = (dy / Math.max(dist, 1)) * force * dt;
    from.vx += fx;
    from.vy += fy;
    to.vx -= fx;
    to.vy -= fy;
  }

  
  for (const node of nodes) {
    node.vx *= DEFAULTS.damping;
    node.vy *= DEFAULTS.damping;

    const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
    if (speed > DEFAULTS.maxVelocity) {
      node.vx = (node.vx / speed) * DEFAULTS.maxVelocity;
      node.vy = (node.vy / speed) * DEFAULTS.maxVelocity;
    }

    node.x += node.vx;
    node.y += node.vy;

    const margin = 35;
    node.x = Math.max(margin, Math.min(state.width - margin, node.x));
    node.y = Math.max(margin, Math.min(state.height - margin, node.y));
  }
}

  function simulationLoop(timestamp: number): void {
    if (!state.running) return;

    const deltaTime = lastTime ? timestamp - lastTime : 16;
    lastTime = timestamp;

    computeForces(deltaTime);
    animFrameId = requestAnimationFrame(simulationLoop);
  }

  function start(): void {
    if (state.running) return;
    state.running = true;
    lastTime = 0;
    animFrameId = requestAnimationFrame(simulationLoop);
  }

  function stop(): void {
    state.running = false;
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  function reset(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number): void {
    stop();
    computeInitialGridPositions(nodes, width, height);
    state.nodes = nodes.map(n => ({ ...n, vx: 0, vy: 0 }));
    state.edges = [...edges];
    state.width = width;
    state.height = height;
    start();
  }

  function destroy(): void {
    stop();
    state.nodes = [];
    state.edges = [];
  }

  return {
    state,
    start,
    stop,
    reset,
    destroy,
  };
}