<template>
  <div ref="canvasContainer" class="design-patterns-canvas">
    
    <!-- SVG Connections Layer -->
    <svg class="connections-svg" ref="svgRef">
      <!-- Arrows definition -->
      <defs>
        <marker id="arrow-association" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
        <marker id="arrow-dependency" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 M 10 5 L 0 5" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="2,2"/>
        </marker>
        <marker id="arrow-realization" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <polygon points="0,0 10,5 0,10" fill="none" stroke="#cbd5e1" stroke-width="1.5" />
        </marker>
        <marker id="arrow-inheritance" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <polygon points="0,0 10,5 0,10" fill="#cbd5e1" stroke="#cbd5e1" stroke-width="1.5" />
        </marker>
      </defs>

      <!-- Draw Links -->
      <g v-for="link in connectionPaths" :key="link.id">
        <!-- Base line -->
        <path
          :d="link.path"
          :class="['link-line', `link-${link.type}`]"
          :marker-end="`url(#arrow-${link.type})`"
        />
        
        <!-- Strategy Swap Animation -->
        <path v-if="isStrategySwap(link.id)" :d="link.path" class="link-glow swap-glow" />

        <!-- Arrow Flow Animation -->
        <circle v-if="isArrowFlow(link.id)" r="4" class="flow-dot" fill="#06b6d4">
          <animateMotion :path="link.path" dur="1.5s" repeatCount="indefinite" />
        </circle>
        
        <!-- Observer Notify Animation -->
        <path v-if="isNotifyObserver(link.sourceId)" :d="link.path" class="link-glow notify-glow" />
      </g>
    </svg>

    <!-- Node Cards -->
    <div
      v-for="node in store.nodes"
      :key="node.id"
      class="node-wrapper"
      :style="{ left: node.x + 'px', top: node.y + 'px' }"
      @mousedown.stop="startDrag($event, node.id)"
    >
      <div 
        class="dp-class-card" 
        :class="{
          'is-interface': node.type === 'interface',
          'glow-highlight': isHighlightClass(node.id),
          'glow-singleton': isSingletonInstance(node.id)
        }"
      >
        <div class="card-header">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="node.type === 'interface' ? 'bg-accent-purple' : 'bg-accent-cyan'" />
            <span class="text-sm font-bold text-text-primary">{{ node.className }}</span>
            <span v-if="node.type === 'interface'" class="text-[10px] text-accent-purple uppercase tracking-wider ml-1">&lt;&lt;interface&gt;&gt;</span>
          </div>
        </div>
        
        <div class="card-members">
          <div 
            v-for="member in node.members" 
            :key="member.name"
            class="member-row"
            :class="{ 'glow-member': isHighlightMember(node.id, member.name) }"
          >
            <span 
              class="member-icon"
              :class="member.type === 'FIELD' ? 'field-icon' : 'method-icon'"
            >{{ member.type === 'FIELD' ? 'F' : 'M' }}</span>
            <span class="member-name">{{ member.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDesignPatternsStore } from '../store/useDesignPatternsStore';

const store = useDesignPatternsStore();
const canvasContainer = ref<HTMLDivElement | null>(null);

// Dragging Logic
const draggedNodeId = ref<string | null>(null);
const dragStart = ref({ x: 0, y: 0 });
const nodeStart = ref({ x: 0, y: 0 });

function startDrag(e: MouseEvent, nodeId: string) {
  draggedNodeId.value = nodeId;
  dragStart.value = { x: e.clientX, y: e.clientY };
  const node = store.nodes.find(n => n.id === nodeId);
  if (node) nodeStart.value = { x: node.x, y: node.y };
  
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
}

function onDrag(e: MouseEvent) {
  if (!draggedNodeId.value) return;
  const dx = e.clientX - dragStart.value.x;
  const dy = e.clientY - dragStart.value.y;
  
  const node = store.nodes.find(n => n.id === draggedNodeId.value);
  if (node) {
    node.x = nodeStart.value.x + dx;
    node.y = nodeStart.value.y + dy;
  }
}

function stopDrag() {
  draggedNodeId.value = null;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
}

// Connection Paths Logic (Orthogonal or Straight)
const connectionPaths = computed(() => {
  return store.links.map(link => {
    const sourceNode = store.nodes.find(n => n.id === link.sourceId);
    const targetNode = store.nodes.find(n => n.id === link.targetId);
    
    if (!sourceNode || !targetNode) return { ...link, path: '' };

    // Card dimensions roughly 160x100 (can be tweaked)
    const cw = 160; const ch = 100;
    const sx = sourceNode.x + cw / 2;
    const sy = sourceNode.y + ch / 2;
    const tx = targetNode.x + cw / 2;
    const ty = targetNode.y + ch / 2;
    
    // Draw an orthogonal-like line for better diagramming
    let path = '';
    if (Math.abs(sy - ty) < Math.abs(sx - tx)) {
      // Horizontal dominant
      path = `M ${sx} ${sy} C ${(sx+tx)/2} ${sy}, ${(sx+tx)/2} ${ty}, ${tx} ${ty}`;
    } else {
      // Vertical dominant
      path = `M ${sx} ${sy} C ${sx} ${(sy+ty)/2}, ${tx} ${(sy+ty)/2}, ${tx} ${ty}`;
    }

    return { ...link, path };
  });
});

// Animation Checks
function isHighlightClass(id: string) {
  return store.currentAnimation === 'highlight-class' && store.currentAnimationTarget.className === id;
}

function isHighlightMember(id: string, memberName: string) {
  return store.currentAnimation === 'highlight-member' && 
         store.currentAnimationTarget.className === id &&
         store.currentAnimationTarget.memberName === memberName;
}

function isArrowFlow(linkId: string) {
  return store.currentAnimation === 'arrow-flow' && store.currentAnimationTarget.linkId === linkId;
}

function isStrategySwap(linkId: string) {
  return store.currentAnimation === 'strategy-swap' && store.currentAnimationTarget.linkId === linkId;
}

function isNotifyObserver(sourceId: string) {
  return store.currentAnimation === 'notify-observers' && store.currentAnimationTarget.className === sourceId;
}

function isSingletonInstance(id: string) {
  return store.currentAnimation === 'singleton-instance' && store.currentAnimationTarget.className === id;
}
</script>

<style scoped>
.design-patterns-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: rgba(7, 11, 19, 0.4);
  overflow: hidden;
}

.connections-svg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 1;
}

.link-line {
  fill: none;
  stroke-width: 2;
  transition: all 0.3s ease;
}

.link-association { stroke: #94a3b8; }
.link-dependency { stroke: #64748b; stroke-dasharray: 5,5; }
.link-realization { stroke: #cbd5e1; stroke-dasharray: 4,4; }
.link-inheritance { stroke: #cbd5e1; }

.link-glow {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  filter: blur(4px);
}

.swap-glow {
  stroke: #a855f7;
  animation: strokeDash 1s linear infinite;
  stroke-dasharray: 10 10;
}

.notify-glow {
  stroke: #06b6d4;
  animation: strokeDash 0.5s linear infinite;
  stroke-dasharray: 15 15;
}

@keyframes strokeDash {
  to { stroke-dashoffset: -20; }
}

.node-wrapper {
  position: absolute;
  z-index: 10;
  cursor: grab;
  user-select: none;
}
.node-wrapper:active {
  cursor: grabbing;
}

.dp-class-card {
  width: max-content;
  min-width: 160px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.2s ease;
}

.dp-class-card.is-interface {
  border-top: 3px solid #a855f7;
}
.dp-class-card:not(.is-interface) {
  border-top: 3px solid #06b6d4;
}

.card-header {
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
}

.card-members {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.member-icon {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
}
.field-icon { background: rgba(234, 179, 8, 0.2); color: #eab308; }
.method-icon { background: rgba(6, 182, 212, 0.2); color: #06b6d4; }
.member-name { color: #cbd5e1; }

/* === Animations === */
.glow-highlight {
  border-color: #eab308 !important;
  box-shadow: 0 0 20px rgba(234, 179, 8, 0.4), inset 0 0 10px rgba(234, 179, 8, 0.2) !important;
  transform: scale(1.05);
}

.glow-singleton {
  border-color: #ec4899 !important;
  box-shadow: 0 0 30px rgba(236, 72, 153, 0.5), inset 0 0 15px rgba(236, 72, 153, 0.2) !important;
  animation: pulse-pink 1.5s infinite alternate;
}

@keyframes pulse-pink {
  from { filter: drop-shadow(0 0 5px rgba(236,72,153,0.4)); }
  to { filter: drop-shadow(0 0 15px rgba(236,72,153,0.8)); }
}

.glow-member {
  background: rgba(234, 179, 8, 0.2);
  transform: translateX(4px);
  color: #fff;
}
</style>
