import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Algorithm, AlgorithmMetadata } from '@/features/dsa/dsa-modules/types/algorithm.types';
import { ALGORITHM_CATALOG } from '@/features/dsa/dsa-modules/services/algorithmCatalog';
import { LOCAL_METADATA } from './algorithmLocalMetadata';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export const useAlgorithmStore = defineStore('algorithm', () => {
  const algorithms = ref<Algorithm[]>([]);
  const currentAlgorithm = ref<Algorithm | null>(null);
  const metadata = ref<AlgorithmMetadata | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string>('');
  const searchQuery = ref<string>('');
  const viewMode = ref<'simulation' | 'theory'>('simulation');

  const filteredAlgorithms = computed<Algorithm[]>(() => {
    if (!searchQuery.value.trim()) return algorithms.value;
    const q = searchQuery.value.toLowerCase();
    return algorithms.value.filter(
      (a) => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q),
    );
  });

  const categories = computed<string[]>(() => {
    const cats = new Set(algorithms.value.map((a) => a.category));
    return Array.from(cats);
  });

  async function fetchAlgorithms(): Promise<void> {
    isLoading.value = true;
    error.value = '';
    try {
      const response = await fetch(`${API_BASE}/api/v1/algorithms`);
      if (!response.ok) throw new Error('Không thể tải danh sách thuật toán từ máy chủ.');
      const backendAlgos = await response.json() as Algorithm[];
      
      // Merge frontend catalog with backend to ensure new theory-only algorithms show up
      const backendIds = new Set(backendAlgos.map(a => a.id));
      const missingFromBackend = ALGORITHM_CATALOG.filter(a => !backendIds.has(a.id));
      
      algorithms.value = [...backendAlgos, ...missingFromBackend];
    } catch {
      algorithms.value = ALGORITHM_CATALOG;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadAlgorithmDetails(algoId: string): Promise<void> {
    isLoading.value = true;
    error.value = '';
    const matched = algorithms.value.find((a) => a.id === algoId);
    if (matched) currentAlgorithm.value = matched;
    try {
      const response = await fetch(`${API_BASE}/api/v1/algorithms/${algoId}/metadata`);
      if (!response.ok) throw new Error('Không thể tải siêu dữ liệu chi tiết của giải thuật.');
      metadata.value = await response.json();
    } catch {
      metadata.value = LOCAL_METADATA[algoId] ?? null;
    } finally {
      isLoading.value = false;
    }
  }

  function selectAlgorithm(algo: Algorithm, mode: 'simulation' | 'theory' = 'simulation'): void {
    currentAlgorithm.value = algo;
    metadata.value = LOCAL_METADATA[algo.id] ?? null;
    viewMode.value = mode;
  }

  function clearActive(): void {
    currentAlgorithm.value = null;
    metadata.value = null;
    error.value = '';
    viewMode.value = 'simulation';
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query;
  }

  function setViewMode(mode: 'simulation' | 'theory'): void {
    viewMode.value = mode;
  }

  return {
    algorithms, currentAlgorithm, metadata, isLoading, error, searchQuery, viewMode,
    filteredAlgorithms, categories,
    fetchAlgorithms, loadAlgorithmDetails, selectAlgorithm, clearActive, setSearchQuery, setViewMode,
  };
});
