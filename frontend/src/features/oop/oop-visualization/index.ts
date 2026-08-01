// ============================================================
// oop-visualization module — Public API
// Redesigned: Animation-driven OOP learning visualization
// ============================================================

export { default as OOPConceptsVisualizerWorkspace } from './components/OOPConceptsVisualizerWorkspace.vue';
export { default as UMLClassCard } from './components/UMLClassCard.vue';
export { default as AccessModifierPadlock } from './components/AccessModifierPadlock.vue';

export { useOOPVisualizerStore } from './store/useOOPVisualizerStore';

export type {
  AccessModifier,
  MemberType,
  ClassMember,
  ClassDefinition,
} from './types/oop-visualization.types';
