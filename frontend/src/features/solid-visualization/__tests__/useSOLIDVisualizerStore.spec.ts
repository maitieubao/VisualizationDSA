import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSOLIDVisualizerStore } from '../store/useSOLIDVisualizerStore';
import {
  LSP_LASER_DELAY_MS,
  COOL_DOWN_CONFETTI_EVENT,
  GLASS_BREAK_SOUND_EVENT,
} from '../types/solid-visualization.types';

const dispatchedEvents: string[] = [];

vi.stubGlobal('CustomEvent', class MockCustomEvent {
  type: string;
  constructor(type: string) { this.type = type; }
});

vi.stubGlobal('window', {
  dispatchEvent: (event: { type: string }) => {
    dispatchedEvents.push(event.type);
    return true;
  },
});

describe('useSOLIDVisualizerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    dispatchedEvents.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with SRP as active lesson', () => {
      const store = useSOLIDVisualizerStore();
      expect(store.activeLesson).toBe('SRP');
    });

    it('should start with empty class nodes', () => {
      const store = useSOLIDVisualizerStore();
      expect(store.classNodes).toHaveLength(0);
    });

    it('should start with LSP phase IDLE', () => {
      const store = useSOLIDVisualizerStore();
      expect(store.lspPhase).toBe('IDLE');
    });

    it('should start with DIP violating state', () => {
      const store = useSOLIDVisualizerStore();
      expect(store.dipState.isViolatingDIP).toBe(true);
      expect(store.dipState.hasInterfaceInserted).toBe(false);
    });

    it('should start with no diagnostic result', () => {
      const store = useSOLIDVisualizerStore();
      expect(store.lastDiagnosticResult).toBeNull();
    });

    it('should start with isSRPSplit false', () => {
      const store = useSOLIDVisualizerStore();
      expect(store.isSRPSplit).toBe(false);
    });
  });

  describe('initializeDemoData', () => {
    it('should initialize SRP demo with UserManager God Class', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();

      expect(store.classNodes).toHaveLength(1);
      expect(store.classNodes[0].className).toBe('UserManager');
    });

    it('should calculate LCOM4 = 3 for UserManager demo', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();

      expect(store.classNodes[0].cohesionScore).toBe(3);
    });

    it('should mark UserManager as SRP violating', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();

      expect(store.classNodes[0].isViolatingSRP).toBe(true);
    });
  });

  describe('computed properties', () => {
    it('should detect overheated nodes', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();

      expect(store.hasOverheatedNodes).toBe(true);
    });

    it('should list overheated node IDs', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();

      expect(store.overheatedNodeIds).toContain('user-manager-node');
    });

    it('should report total nodes count', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();

      expect(store.totalNodes).toBe(1);
    });

    it('should count SRP violations', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();

      expect(store.srpViolationCount).toBe(1);
    });

    it('should report LSP not transmitting initially', () => {
      const store = useSOLIDVisualizerStore();
      expect(store.isLSPTransmitting).toBe(false);
    });

    it('should report DIP not correct initially', () => {
      const store = useSOLIDVisualizerStore();
      expect(store.isDIPCorrect).toBe(false);
    });

    it('should return correct lesson label for SRP', () => {
      const store = useSOLIDVisualizerStore();
      expect(store.activeLessonLabel).toBe('Single Responsibility');
    });

    it('should return correct lesson label for LSP', () => {
      const store = useSOLIDVisualizerStore();
      store.setLesson('LSP');
      expect(store.activeLessonLabel).toBe('Liskov Substitution');
    });

    it('should return correct lesson label for DIP', () => {
      const store = useSOLIDVisualizerStore();
      store.setLesson('DIP');
      expect(store.activeLessonLabel).toBe('Dependency Inversion');
    });
  });

  describe('setLesson', () => {
    it('should switch active lesson', () => {
      const store = useSOLIDVisualizerStore();
      store.setLesson('LSP');
      expect(store.activeLesson).toBe('LSP');
    });

    it('should reset state when switching lessons', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.setLesson('LSP');

      expect(store.isLspShattered).toBe(false);
      expect(store.lspPhase).toBe('IDLE');
    });

    it('should initialize demo data for the new lesson', () => {
      const store = useSOLIDVisualizerStore();
      store.setLesson('SRP');

      expect(store.classNodes).toHaveLength(1);
      expect(store.classNodes[0].className).toBe('UserManager');
    });
  });

  describe('initializeClassNodes', () => {
    it('should evaluate SRP for all provided nodes', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeClassNodes([
        {
          nodeId: 'test-1',
          className: 'TestClass',
          members: [
            { name: 'f1', type: 'FIELD', accessedFields: [] },
            { name: 'm1', type: 'METHOD', accessedFields: ['f1'] },
            { name: 'm2', type: 'METHOD', accessedFields: ['f1'] },
          ],
          cohesionScore: 0,
          isViolatingSRP: false,
        },
      ]);

      expect(store.classNodes[0].cohesionScore).toBe(1);
      expect(store.classNodes[0].isViolatingSRP).toBe(false);
    });
  });

  describe('triggerSRPSplit', () => {
    it('should split UserManager into 3 specialized classes', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.triggerSRPSplit('user-manager-node');

      expect(store.classNodes).toHaveLength(3);
    });

    it('should create UserRepository after split', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.triggerSRPSplit('user-manager-node');

      expect(store.classNodes.some((n) => n.className === 'UserRepository')).toBe(true);
    });

    it('should create PasswordHasher after split', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.triggerSRPSplit('user-manager-node');

      expect(store.classNodes.some((n) => n.className === 'PasswordHasher')).toBe(true);
    });

    it('should create EmailNotifier after split', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.triggerSRPSplit('user-manager-node');

      expect(store.classNodes.some((n) => n.className === 'EmailNotifier')).toBe(true);
    });

    it('should set all split nodes to cohesionScore 1 (cohesive)', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.triggerSRPSplit('user-manager-node');

      for (const node of store.classNodes) {
        expect(node.cohesionScore).toBe(1);
        expect(node.isViolatingSRP).toBe(false);
      }
    });

    it('should set isSRPSplit to true', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.triggerSRPSplit('user-manager-node');

      expect(store.isSRPSplit).toBe(true);
    });

    it('should set diagnostic result with success message', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.triggerSRPSplit('user-manager-node');

      expect(store.lastDiagnosticResult).toContain('SRP ĐẠT');
    });

    it('should dispatch cool-down confetti event', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.triggerSRPSplit('user-manager-node');

      expect(dispatchedEvents).toContain(COOL_DOWN_CONFETTI_EVENT);
    });

    it('should no longer have overheated nodes after split', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.triggerSRPSplit('user-manager-node');

      expect(store.hasOverheatedNodes).toBe(false);
    });

    it('should do nothing if nodeId not found', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.triggerSRPSplit('non-existent-node');

      expect(store.classNodes).toHaveLength(1);
      expect(store.classNodes[0].className).toBe('UserManager');
    });
  });

  describe('executeLSPSubstitution', () => {
    it('should set phase to TRANSMITTING immediately', () => {
      const store = useSOLIDVisualizerStore();
      store.executeLSPSubstitution(true);

      expect(store.lspPhase).toBe('TRANSMITTING');
      expect(store.isLSPTransmitting).toBe(true);
    });

    it('should shatter after 800ms delay for violation', () => {
      const store = useSOLIDVisualizerStore();
      store.executeLSPSubstitution(true);

      expect(store.isLspShattered).toBe(false);

      vi.advanceTimersByTime(LSP_LASER_DELAY_MS);

      expect(store.isLspShattered).toBe(true);
      expect(store.lspPhase).toBe('SHATTERED');
    });

    it('should set error diagnostic after shatter', () => {
      const store = useSOLIDVisualizerStore();
      store.executeLSPSubstitution(true);
      vi.advanceTimersByTime(LSP_LASER_DELAY_MS);

      expect(store.lastDiagnosticResult).toContain('LISKOV_VIOLATION');
    });

    it('should dispatch glass break sound event after shatter', () => {
      const store = useSOLIDVisualizerStore();
      store.executeLSPSubstitution(true);
      vi.advanceTimersByTime(LSP_LASER_DELAY_MS);

      expect(dispatchedEvents).toContain(GLASS_BREAK_SOUND_EVENT);
    });

    it('should set PASSED phase for valid substitution', () => {
      const store = useSOLIDVisualizerStore();
      store.executeLSPSubstitution(false);

      expect(store.lspPhase).toBe('PASSED');
      expect(store.isLspShattered).toBe(false);
    });

    it('should set success diagnostic for valid substitution', () => {
      const store = useSOLIDVisualizerStore();
      store.executeLSPSubstitution(false);

      expect(store.lastDiagnosticResult).toContain('LSP ĐẠT');
    });

    it('should not be transmitting for valid substitution', () => {
      const store = useSOLIDVisualizerStore();
      store.executeLSPSubstitution(false);

      expect(store.isLSPTransmitting).toBe(false);
    });
  });

  describe('DIP actions', () => {
    it('should insert interface and fix DIP violation', () => {
      const store = useSOLIDVisualizerStore();
      store.insertDIPInterface();

      expect(store.dipState.isViolatingDIP).toBe(false);
      expect(store.dipState.hasInterfaceInserted).toBe(true);
    });

    it('should set success diagnostic after DIP fix', () => {
      const store = useSOLIDVisualizerStore();
      store.insertDIPInterface();

      expect(store.lastDiagnosticResult).toContain('DIP ĐẠT');
    });

    it('should report isDIPCorrect as true after fix', () => {
      const store = useSOLIDVisualizerStore();
      store.insertDIPInterface();

      expect(store.isDIPCorrect).toBe(true);
    });

    it('should reset DIP to violating state', () => {
      const store = useSOLIDVisualizerStore();
      store.insertDIPInterface();
      store.resetDIP();

      expect(store.dipState.isViolatingDIP).toBe(true);
      expect(store.dipState.hasInterfaceInserted).toBe(false);
      expect(store.lastDiagnosticResult).toBeNull();
    });
  });

  describe('resetState', () => {
    it('should clear all state', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.resetState();

      expect(store.classNodes).toHaveLength(0);
      expect(store.isLspShattered).toBe(false);
      expect(store.lspPhase).toBe('IDLE');
      expect(store.dipState.isViolatingDIP).toBe(true);
      expect(store.lastDiagnosticResult).toBeNull();
    });

    it('should clear pending LSP timer', () => {
      const store = useSOLIDVisualizerStore();
      store.executeLSPSubstitution(true);
      store.resetState();

      vi.advanceTimersByTime(LSP_LASER_DELAY_MS);

      expect(store.isLspShattered).toBe(false);
    });
  });

  describe('resetAll', () => {
    it('should reset everything and re-initialize SRP demo', () => {
      const store = useSOLIDVisualizerStore();
      store.setLesson('LSP');
      store.executeLSPSubstitution(true);
      vi.advanceTimersByTime(LSP_LASER_DELAY_MS);

      store.resetAll();

      expect(store.activeLesson).toBe('SRP');
      expect(store.classNodes).toHaveLength(1);
      expect(store.classNodes[0].className).toBe('UserManager');
      expect(store.isLspShattered).toBe(false);
    });
  });

  describe('destroyStore', () => {
    it('should clean up all state', () => {
      const store = useSOLIDVisualizerStore();
      store.initializeDemoData();
      store.destroyStore();

      expect(store.classNodes).toHaveLength(0);
      expect(store.lastDiagnosticResult).toBeNull();
    });
  });
});
