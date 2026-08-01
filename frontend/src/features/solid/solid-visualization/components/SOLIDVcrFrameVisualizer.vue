<template>
  <div class="vcr-visualizer">

    <!-- ─── Principle Badge + Action Type ─── -->
    <div class="vcr-top-bar">
      <div class="principle-pill" :class="principleClass">
        {{ frame.principle.toUpperCase() }}
      </div>
      <div class="action-badge" :class="frame.isViolation ? 'violation' : 'ok'">
        <span class="action-dot" />
        {{ frame.actionType }}
      </div>
      <div v-if="frame.violationDetail" class="violation-pill">
        ⚠ {{ frame.violationDetail }}
      </div>
    </div>

    <!-- ─── Class Nodes Grid ─── -->
    <div class="nodes-section">
      <div class="section-label">Class Architecture</div>
      <div class="nodes-grid">
        <div
          v-for="node in frame.classNodes"
          :key="node.nodeId"
          class="class-card"
          :class="node.isViolating ? 'card-violation' : 'card-ok'"
        >
          <!-- Card Header -->
          <div class="card-header" :class="node.isViolating ? 'header-violation' : 'header-ok'">
            <span class="card-class-name">{{ node.className }}</span>
            <span v-if="node.statusLabel" class="status-label">{{ node.statusLabel }}</span>
            <span v-else class="cohesion-score" :class="node.cohesionScore > 1 ? 'score-bad' : 'score-good'">
              LCOM4: {{ node.cohesionScore.toFixed(1) }}
            </span>
          </div>

          <!-- Members List -->
          <div class="members-list">
            <div
              v-for="member in node.members"
              :key="member.name"
              class="member-row"
              :class="member.memberType === 'FIELD' ? 'member-field' : 'member-method'"
            >
              <span class="member-icon">{{ member.memberType === 'FIELD' ? '▪' : '▸' }}</span>
              <span class="member-name">{{ member.name }}</span>
              <span v-if="member.accessedFields.length" class="member-deps">
                → [{{ member.accessedFields.join(', ') }}]
              </span>
            </div>
          </div>

          <!-- Cohesion indicator bar -->
          <div class="cohesion-bar">
            <div
              class="cohesion-fill"
              :class="node.isViolating ? 'fill-bad' : 'fill-good'"
              :style="{ width: `${Math.min(node.cohesionScore / 4 * 100, 100)}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Metrics Panel ─── -->
    <div v-if="frame.metrics" class="metrics-section">
      <div class="section-label">Chỉ Số Phân Tích</div>
      <div class="metrics-grid">
        <div class="metric-item" :class="frame.metrics.lcom4Score > 1 ? 'metric-bad' : 'metric-good'">
          <div class="metric-value">{{ frame.metrics.lcom4Score.toFixed(1) }}</div>
          <div class="metric-label">LCOM4 Score</div>
        </div>
        <div class="metric-item metric-neutral">
          <div class="metric-value">{{ frame.metrics.responsibilityCount }}</div>
          <div class="metric-label">Trách nhiệm</div>
        </div>
        <div class="metric-item" :class="frame.metrics.couplingLevel === 'HIGH' ? 'metric-bad' : 'metric-good'">
          <div class="metric-value">{{ frame.metrics.couplingLevel }}</div>
          <div class="metric-label">Coupling Level</div>
        </div>
      </div>
    </div>

    <!-- ─── Coupling Dependency SVG Graph ─── -->
    <div v-if="frame.classNodes.length > 1" class="dep-graph-section">
      <div class="section-label">Dependency Flow</div>
      <svg :width="svgW" :height="svgH" class="dep-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="solid-vcr-arrow-ok" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#10b981" fill-opacity="0.9" />
          </marker>
          <marker id="solid-vcr-arrow-bad" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#ef4444" fill-opacity="0.9" />
          </marker>
        </defs>
        <!-- Node circles -->
        <g v-for="(pos, idx) in nodePositions" :key="idx">
          <circle
            :cx="pos.x"
            :cy="pos.y"
            r="28"
            :fill="frame.classNodes[idx]?.isViolating ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.1)'"
            :stroke="frame.classNodes[idx]?.isViolating ? '#ef4444' : '#10b981'"
            stroke-width="1.5"
            stroke-opacity="0.7"
          />
          <text :x="pos.x" :y="pos.y + 1" text-anchor="middle" dominant-baseline="middle" class="node-label-svg">
            {{ shortLabel(frame.classNodes[idx]?.className ?? '') }}
          </text>
        </g>
        <!-- Edges: sequential arrows from node i to i+1 -->
        <g v-for="(pos, idx) in nodePositions.slice(0, -1)" :key="`e-${idx}`">
          <line
            :x1="pos.x + 28" :y1="pos.y"
            :x2="nodePositions[idx + 1].x - 28" :y2="nodePositions[idx + 1].y"
            :stroke="frame.isViolation ? '#ef4444' : '#10b981'"
            stroke-width="1.5"
            stroke-opacity="0.6"
            stroke-dasharray="5,3"
            :marker-end="frame.isViolation ? 'url(#solid-vcr-arrow-bad)' : 'url(#solid-vcr-arrow-ok)'"
          />
        </g>
      </svg>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SOLIDFrameResponse } from '@/features/solid/solid-visualization/services/solidApi';

const props = defineProps<{ frame: SOLIDFrameResponse }>();

const svgW = 420;
const svgH = 90;

const nodePositions = computed(() => {
  const count = props.frame.classNodes.length;
  if (count === 0) return [];
  const spacing = svgW / (count + 1);
  return props.frame.classNodes.map((_, i) => ({
    x: Math.round(spacing * (i + 1)),
    y: svgH / 2,
  }));
});

const principleClass = computed(() => {
  const map: Record<string, string> = {
    srp: 'pill-srp', ocp: 'pill-ocp', lsp: 'pill-lsp',
    isp: 'pill-isp', dip: 'pill-dip',
  };
  return map[props.frame.principle?.toLowerCase()] ?? 'pill-default';
});

function shortLabel(name: string): string {
  if (name.length <= 6) return name;
  // Take up to 2 capital letters as abbreviation
  const caps = name.replace(/[^A-Z]/g, '');
  return caps.length >= 2 ? caps.slice(0, 3) : name.slice(0, 5);
}
</script>

<style scoped>
.vcr-visualizer {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Top bar ─── */
.vcr-top-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.principle-pill {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid;
}
.pill-srp { color: #f97316; background: rgba(249,115,22,0.12); border-color: rgba(249,115,22,0.4); }
.pill-ocp { color: #06b6d4; background: rgba(6,182,212,0.12); border-color: rgba(6,182,212,0.4); }
.pill-lsp { color: #a78bfa; background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.4); }
.pill-isp { color: #34d399; background: rgba(52,211,153,0.12); border-color: rgba(52,211,153,0.4); }
.pill-dip { color: #fbbf24; background: rgba(251,191,36,0.12); border-color: rgba(251,191,36,0.4); }
.pill-default { color: #94a3b8; background: rgba(148,163,184,0.1); border-color: rgba(148,163,184,0.3); }

.action-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid;
}
.action-badge.violation { color: #ef4444; background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.35); }
.action-badge.ok { color: #10b981; background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.35); }
.action-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.5s infinite;
}
.violation-pill {
  font-size: 10px;
  color: #f97316;
  background: rgba(249,115,22,0.1);
  border: 1px solid rgba(249,115,22,0.3);
  border-radius: 6px;
  padding: 3px 10px;
  flex: 1;
}

/* ─── Sections ─── */
.section-label {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #475569;
  margin-bottom: 8px;
}

/* ─── Class Cards ─── */
.nodes-section, .metrics-section, .dep-graph-section {
  display: flex;
  flex-direction: column;
}

.nodes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.class-card {
  flex: 1;
  min-width: 150px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid;
  transition: all 0.3s ease;
}
.card-ok { border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.05); }
.card-violation { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.07); box-shadow: 0 0 14px rgba(239,68,68,0.15); }

.card-header {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-ok { background: rgba(16,185,129,0.12); }
.header-violation { background: rgba(239,68,68,0.15); }

.card-class-name {
  font-size: 12px;
  font-weight: 700;
  color: #e2e8f0;
  font-family: var(--font-mono);
}
.status-label {
  font-size: 9px;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(255,255,255,0.06);
  padding: 2px 6px;
  border-radius: 4px;
}
.cohesion-score {
  font-size: 9px;
  font-weight: 800;
  font-family: var(--font-mono);
  padding: 2px 6px;
  border-radius: 4px;
}
.score-bad { color: #ef4444; background: rgba(239,68,68,0.15); }
.score-good { color: #10b981; background: rgba(16,185,129,0.12); }

.members-list {
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.member-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-family: var(--font-mono);
  padding: 2px 4px;
  border-radius: 4px;
}
.member-field { color: #7dd3fc; }
.member-method { color: #86efac; }
.member-icon { font-size: 8px; flex-shrink: 0; }
.member-name { font-weight: 700; }
.member-deps { color: #475569; font-size: 9px; }

.cohesion-bar {
  height: 3px;
  background: rgba(255,255,255,0.05);
  border-radius: 0 0 10px 10px;
  overflow: hidden;
}
.cohesion-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}
.fill-bad { background: linear-gradient(90deg, #ef4444, #f97316); }
.fill-good { background: linear-gradient(90deg, #10b981, #06b6d4); }

/* ─── Metrics ─── */
.metrics-grid {
  display: flex;
  gap: 10px;
}
.metric-item {
  flex: 1;
  text-align: center;
  padding: 10px 8px;
  border-radius: 10px;
  border: 1px solid;
}
.metric-good { border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.07); }
.metric-bad { border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.08); }
.metric-neutral { border-color: rgba(6,182,212,0.3); background: rgba(6,182,212,0.06); }
.metric-value {
  font-size: 20px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: #e2e8f0;
  line-height: 1;
}
.metric-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  margin-top: 4px;
}

/* ─── Dependency SVG ─── */
.dep-svg { width: 100%; display: block; }
.node-label-svg {
  font-size: 9px;
  font-family: var(--font-mono);
  font-weight: 800;
  fill: #94a3b8;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
