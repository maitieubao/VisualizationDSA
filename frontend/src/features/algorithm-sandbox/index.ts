// ============================================================
// algorithm-sandbox module — Public API
// Cấu trúc sau khi chuẩn hóa FSD:
//   components/ — Vue components
//   engine/     — Logic thuần túy (không phụ thuộc UI)
//   algorithms/ — Frame generators
//   composables/— Vue composables
//   renderers/  — Canvas render helpers
//   types/      — TypeScript interfaces
// ============================================================

// ── Components (Public) ────────────────────────────────────────
export { default as AlgorithmCanvas }    from './components/AlgorithmCanvas.vue';
export { default as ArrayBarVisualizer } from './components/ArrayBarVisualizer.vue';
export { default as CustomInputPanel }   from './components/CustomInputPanel.vue';
export { default as SortingDetailPanel } from './components/SortingDetailPanel.vue';

// ── Engine (Internal utilities, exported for cross-feature use) ─
export { PseudocodeSyncer }              from './engine/PseudocodeSyncer';
export { MonacoGutterClickInterceptor }  from './engine/MonacoGutterClickInterceptor';
export { MonacoLineSyncerCoordinator }   from './engine/MonacoLineSyncerCoordinator';
export { CustomInputParser }             from './engine/CustomInputParser';
export { ForceDirectedLayout }           from './engine/ForceDirectedLayout';
