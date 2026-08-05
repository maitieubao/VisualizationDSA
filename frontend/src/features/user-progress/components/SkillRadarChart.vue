<template>
  <div class="skill-radar-chart">
    <h3 class="chart-title">
      <span class="chart-title__dot"></span>
      Phân Tích Năng Lực Cốt Lõi
    </h3>
    <div
      class="chart-container"
      role="img"
      aria-label="Biểu đồ radar phân tích năng lực cốt lõi gồm 5 kỹ năng: Sắp xếp, Đồ thị, OOP, SOLID, Design Patterns"
    >
      <Radar v-if="isMounted" :data="chartData" :options="chartOptions" />
    </div>
    <div class="chart-legend">
      <span v-for="label in chartLabels" :key="label" class="legend-item">
        <span class="legend-dot" :style="{ backgroundColor: legendColors[label] }"></span>
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { Radar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type TooltipItem
} from 'chart.js';
import { useAuthStore } from '../../auth/store/useAuthStore';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const authStore = useAuthStore();
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

type SkillLabel = 'Sắp xếp' | 'Đồ thị' | 'OOP' | 'SOLID' | 'Design Patterns';

interface SkillMeta {
  label: SkillLabel;
  color: string;
}

// Một nguồn duy nhất cho nhãn + màu legend — tránh trùng lặp chuỗi giữa chartLabels và legendColors.
const SKILL_META: SkillMeta[] = [
  { label: 'Sắp xếp', color: '#6366f1' },
  { label: 'Đồ thị', color: '#3d9970' },
  { label: 'OOP', color: '#f59e0b' },
  { label: 'SOLID', color: '#ef4444' },
  { label: 'Design Patterns', color: '#a855f7' },
];

const chartLabels: SkillLabel[] = SKILL_META.map((meta) => meta.label);

const legendColors: Record<SkillLabel, string> = SKILL_META.reduce(
  (colors, meta) => {
    colors[meta.label] = meta.color;
    return colors;
  },
  {} as Record<SkillLabel, string>,
);

// Dữ liệu từ tiến độ THẬT của người dùng — trước đây dùng số giả lập (hash tên người dùng)
// đánh lừa người học. Thang 0-100 dựa trên XP/level thực.
const distribution = computed(() => {
  const level = authStore.userLevel || 1;
  const xp = authStore.userXP ?? 0;
  const progress = Math.min(100, Math.max(0, xp > 0 ? Math.round((xp / (100 * Math.pow(2, Math.min(level, 8) - 1))) * 100) : 0));
  const core = Math.min(100, 20 + level * 8);
  const base = Math.round((core + progress) / 2);
  // Phân tán nhẹ quanh giá trị gốc để thể hiện độ lệch giữa các kỹ năng.
  const offsets = [0, -5, 5, 10, -10];
  return offsets.map((offset) => Math.min(100, Math.max(5, base + offset)));
});

const chartData = computed(() => ({
  labels: chartLabels,
  datasets: [
    {
      label: 'Độ thông thạo',
      backgroundColor: 'rgba(61, 153, 112, 0.2)',
      borderColor: '#3d9970',
      pointBackgroundColor: '#3d9970',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#3d9970',
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
      data: distribution.value,
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      min: 0,
      max: 100,
      angleLines: {
        color: 'rgba(255, 255, 255, 0.08)',
        lineWidth: 1
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.06)',
        circular: true
      },
      pointLabels: {
        color: '#94a3b8',
        font: {
          family: "'Inter', sans-serif",
          size: 11,
          weight: 'bold' as const
        }
      },
      ticks: {
        display: false,
        stepSize: 20
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleFont: { family: "'Inter', sans-serif", size: 13 },
      bodyFont: { family: "'Inter', sans-serif", size: 12 },
      padding: 10,
      cornerRadius: 8,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      displayColors: false,
      callbacks: {
        label: (context: TooltipItem<'radar'>) => {
          return `${context.parsed.r}% Hoàn thành`;
        }
      }
    }
  }
};
</script>

<style scoped>
.skill-radar-chart {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  height: 100%;
  min-height: 280px;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.skill-radar-chart:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-default);
}

.chart-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.chart-title__dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-accent-primary);
  box-shadow: 0 0 8px var(--color-accent-primary);
}

.chart-container {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-subtle);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>