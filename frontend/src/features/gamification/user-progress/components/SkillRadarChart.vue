<template>
  <div class="skill-radar-chart">
    <h3 class="chart-title">
      Phân Tích Năng Lực Cốt Lõi
    </h3>
    <div class="chart-container">
      <Radar v-if="isMounted" :data="chartData" :options="chartOptions" />
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
  Legend
} from 'chart.js';
import { useAuthStore } from '@/features/auth/store/useAuthStore';


ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const authStore = useAuthStore();
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});


const distribution = computed(() => {
  const level = authStore.userLevel || 1;
  const base = Math.min(100, 30 + level * 5);
  
  const hash = (authStore.userName || 'Guest').length;
  
  return [
    Math.min(100, base + (hash % 5) * 5),           
    Math.min(100, base - 10 + (hash % 3) * 5),      
    Math.min(100, base - 5 + (hash % 4) * 5),       
    Math.min(100, base + 10 - (hash % 2) * 5),      
    Math.min(100, base - 15 + (hash % 6) * 5)       
  ];
});

const chartData = computed(() => ({
  labels: ['Sắp xếp', 'Đồ thị', 'OOP', 'SOLID', 'Design Patterns'],
  datasets: [
    {
      label: 'Độ thông thạo',
      backgroundColor: 'rgba(99, 102, 241, 0.25)', 
      borderColor: '#6366f1',
      pointBackgroundColor: '#a855f7',             
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#a855f7',
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
      angleLines: { 
        color: 'rgba(255, 255, 255, 0.1)',
        lineWidth: 1
      },
      grid: { 
        color: 'rgba(255, 255, 255, 0.1)',
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
        min: 0,
        max: 100,
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
        label: function(context: any) {
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

.chart-title::before {
  content: '';
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
</style>
