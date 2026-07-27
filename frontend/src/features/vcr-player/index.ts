// ============================================================
// vcr-player module — Public API
// Tất cả import từ bên ngoài phải đi qua file này
// ============================================================

export { useVcrStore, type VcrBaseFrame } from './store/useVcrStore';
export { default as VcrControlPanel } from './components/VcrControlPanel.vue';
export { default as VcrDockBar } from './components/VcrDockBar.vue';
