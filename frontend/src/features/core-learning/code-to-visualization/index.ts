// ============================================================
// code-to-visualization module — Public API
// ============================================================

export { default as CodeWorkspace } from './components/CodeWorkspace.vue';
export { default as MonacoEditorPanel } from './components/MonacoEditorPanel.vue';
export { default as CompilerConsole } from './components/CompilerConsole.vue';
export { useLiveCompilerStore } from './store/useLiveCompilerStore';
export { compileAndInstrument } from './engine/ASTInstrumentationEngine';
export {
  executeInSandbox,
  terminateActiveSession,
} from './engine/WorkerLifecycleCoordinator';
export type {
  LiveFrameDTO,
  CompilationResult,
  ConsoleLogEntry,
  WorkerPayload,
  WorkerResponse,
} from './types/compiler.types';
