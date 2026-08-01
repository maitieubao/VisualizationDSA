// ============================================================
// solid-visualization module — Public API
// Phase 2: SOLID Principles Visualizer
// Thermal SRP Cards, Laser Fracture LSP, Neon Flowing DIP
// ============================================================

export { default as SOLIDVisualizerWorkspace } from './components/SOLIDVisualizerWorkspace.vue';
export { default as ThermalClassCard } from './components/ThermalClassCard.vue';
export { default as LaserFractureOverlay } from './components/LaserFractureOverlay.vue';
export { default as NeonFlowingPath } from './components/NeonFlowingPath.vue';
export { default as SRPLessonPanel } from './components/SRPLessonPanel.vue';
export { default as LSPLessonPanel } from './components/LSPLessonPanel.vue';
export { default as DIPLessonPanel } from './components/DIPLessonPanel.vue';

export { LCOMCalculator } from './engine/LCOMCalculator';
export { SOLIDEvaluatorEngine } from './engine/SOLIDEvaluatorEngine';
export { ThermalSparkParticleEngine } from './engine/ThermalSparkParticleEngine';
export { LaserFractureCalculator } from './engine/LaserFractureCalculator';

export { useSOLIDVisualizerStore } from './store/useSOLIDVisualizerStore';

export type {
  SOLIDPrinciple,
  MemberType,
  SRPViolationStatus,
  LSPSubstitutionPhase,
  DIPFlowDirection,
  UMLClassMember,
  SOLIDClassNode,
  SRPEvaluationResult,
  LSPEvaluationResult,
  FireParticle,
  FractureSegment,
  DIPState,
  CoordinatePoint,
} from './types/solid-visualization.types';

export {
  MAX_PARTICLES,
  LSP_LASER_DELAY_MS,
  FRACTURE_SEGMENT_COUNT_MIN,
  FRACTURE_SEGMENT_COUNT_MAX,
  FRACTURE_OFFSET_RANGE,
  PARTICLE_FPS,
  SRP_VIOLATION_THRESHOLD,
  COOL_DOWN_CONFETTI_EVENT,
  GLASS_BREAK_SOUND_EVENT,
} from './types/solid-visualization.types';
