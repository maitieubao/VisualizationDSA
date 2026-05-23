import { describe, it, expect, beforeEach } from 'vitest';
import { IoCContainerSimulator } from '../IoCContainerSimulator';

describe('IoCContainerSimulator', () => {
  let simulator: IoCContainerSimulator;

  beforeEach(() => {
    simulator = new IoCContainerSimulator();
  });

  describe('register', () => {
    it('should register a service with correct properties', () => {
      simulator.register('ILogger', 'ConsoleLogger', 'SINGLETON', []);
      const regs = simulator.getRegistrations();
      expect(regs['ILogger']).toBeDefined();
      expect(regs['ILogger'].implementationType).toBe('ConsoleLogger');
      expect(regs['ILogger'].lifetime).toBe('SINGLETON');
      expect(regs['ILogger'].dependencies).toEqual([]);
    });

    it('should register multiple services', () => {
      simulator.register('ILogger', 'ConsoleLogger', 'SINGLETON', []);
      simulator.register('IRepo', 'SqlRepo', 'TRANSIENT', ['ILogger']);
      const regs = simulator.getRegistrations();
      expect(Object.keys(regs)).toHaveLength(2);
    });

    it('should overwrite registration with same serviceType', () => {
      simulator.register('ILogger', 'ConsoleLogger', 'SINGLETON', []);
      simulator.register('ILogger', 'FileLogger', 'TRANSIENT', []);
      const regs = simulator.getRegistrations();
      expect(regs['ILogger'].implementationType).toBe('FileLogger');
      expect(regs['ILogger'].lifetime).toBe('TRANSIENT');
    });
  });

  describe('resolve', () => {
    it('should resolve a service with no dependencies', () => {
      simulator.register('ILogger', 'ConsoleLogger', 'SINGLETON', []);
      const instance = simulator.resolve('ILogger');
      expect(instance._type).toBe('ConsoleLogger');
      expect(instance._lifetime).toBe('SINGLETON');
      expect(instance._injectedDependencies).toHaveLength(0);
    });

    it('should resolve transient with dependencies', () => {
      simulator.register('ILogger', 'ConsoleLogger', 'SINGLETON', []);
      simulator.register('IService', 'MyService', 'TRANSIENT', ['ILogger']);
      const instance = simulator.resolve('IService');
      expect(instance._type).toBe('MyService');
      expect(instance._injectedDependencies).toHaveLength(1);
      expect(instance._injectedDependencies[0]._type).toBe('ConsoleLogger');
    });

    it('should reuse singleton instance across resolves', () => {
      simulator.register('IRepo', 'SqlRepo', 'SINGLETON', []);
      simulator.register('IServiceA', 'ServiceA', 'TRANSIENT', ['IRepo']);
      simulator.register('IServiceB', 'ServiceB', 'TRANSIENT', ['IRepo']);

      const a = simulator.resolve('IServiceA');
      const b = simulator.resolve('IServiceB');

      expect(a._injectedDependencies[0]).toBe(b._injectedDependencies[0]);
    });

    it('should create new transient instance each time', () => {
      simulator.register('IService', 'MyService', 'TRANSIENT', []);
      const s1 = simulator.resolve('IService');
      const s2 = simulator.resolve('IService');
      expect(s1).not.toBe(s2);
      expect(s1._type).toBe('MyService');
      expect(s2._type).toBe('MyService');
    });

    it('should throw CircularDependencyException', () => {
      simulator.register('IServiceA', 'ServiceA', 'TRANSIENT', ['IServiceB']);
      simulator.register('IServiceB', 'ServiceB', 'TRANSIENT', ['IServiceA']);

      expect(() => simulator.resolve('IServiceA')).toThrow(
        'CircularDependencyException',
      );
    });

    it('should throw ServiceNotRegisteredException', () => {
      expect(() => simulator.resolve('INonExistent')).toThrow(
        'ServiceNotRegisteredException',
      );
    });

    it('should resolve deep dependency chain', () => {
      simulator.register('IClient', 'SupabaseClient', 'SINGLETON', []);
      simulator.register('IRepo', 'UserRepo', 'SINGLETON', ['IClient']);
      simulator.register('IService', 'UserService', 'TRANSIENT', ['IRepo']);
      simulator.register('IController', 'UserCtrl', 'TRANSIENT', ['IService']);

      const ctrl = simulator.resolve('IController');
      expect(ctrl._type).toBe('UserCtrl');
      expect(ctrl._injectedDependencies[0]._type).toBe('UserService');
      expect(ctrl._injectedDependencies[0]._injectedDependencies[0]._type).toBe('UserRepo');
      expect(
        ctrl._injectedDependencies[0]._injectedDependencies[0]._injectedDependencies[0]._type,
      ).toBe('SupabaseClient');
    });
  });

  describe('getResolutionSteps', () => {
    it('should return empty array before resolve', () => {
      expect(simulator.getResolutionSteps()).toEqual([]);
    });

    it('should record INSTANTIATE step for leaf service', () => {
      simulator.register('ILogger', 'ConsoleLogger', 'SINGLETON', []);
      simulator.resolve('ILogger');
      const steps = simulator.getResolutionSteps();
      expect(steps).toHaveLength(1);
      expect(steps[0].type).toBe('INSTANTIATE');
      expect(steps[0].serviceType).toBe('ILogger');
    });

    it('should record LOOKUP/INJECT/INSTANTIATE for dependency chain', () => {
      simulator.register('IRepo', 'SqlRepo', 'SINGLETON', []);
      simulator.register('IService', 'MyService', 'TRANSIENT', ['IRepo']);
      simulator.resolve('IService');
      const steps = simulator.getResolutionSteps();

      const types = steps.map((s) => s.type);
      expect(types).toContain('LOOKUP');
      expect(types).toContain('INJECT');
      expect(types).toContain('INSTANTIATE');
    });

    it('should record RETRIEVE_SINGLETON on second resolve', () => {
      simulator.register('IRepo', 'SqlRepo', 'SINGLETON', []);
      simulator.register('IServiceA', 'ServiceA', 'TRANSIENT', ['IRepo']);
      simulator.register('IServiceB', 'ServiceB', 'TRANSIENT', ['IRepo']);

      simulator.resolve('IServiceA');
      simulator.resolve('IServiceB');

      const steps = simulator.getResolutionSteps();
      const retrieveSteps = steps.filter(
        (s) => s.type === 'RETRIEVE_SINGLETON',
      );
      expect(retrieveSteps.length).toBeGreaterThanOrEqual(1);
      expect(retrieveSteps[0].serviceType).toBe('IRepo');
    });

    it('should clear steps correctly', () => {
      simulator.register('ILogger', 'ConsoleLogger', 'SINGLETON', []);
      simulator.resolve('ILogger');
      expect(simulator.getResolutionSteps().length).toBeGreaterThan(0);
      simulator.clearSteps();
      expect(simulator.getResolutionSteps()).toHaveLength(0);
    });
  });

  describe('getSingletonVault', () => {
    it('should return empty vault initially', () => {
      expect(Object.keys(simulator.getSingletonVault())).toHaveLength(0);
    });

    it('should store singleton after resolve', () => {
      simulator.register('ILogger', 'ConsoleLogger', 'SINGLETON', []);
      simulator.resolve('ILogger');
      const vault = simulator.getSingletonVault();
      expect(vault['ILogger']).toBeDefined();
      expect(vault['ILogger']._type).toBe('ConsoleLogger');
    });

    it('should not store transient in vault', () => {
      simulator.register('IService', 'MyService', 'TRANSIENT', []);
      simulator.resolve('IService');
      const vault = simulator.getSingletonVault();
      expect(vault['IService']).toBeUndefined();
    });
  });

  describe('buildResolutionTree', () => {
    it('should return null for unregistered service', () => {
      const tree = simulator.buildResolutionTree('INonExistent');
      expect(tree).toBeNull();
    });

    it('should build leaf node for service with no deps', () => {
      simulator.register('ILogger', 'ConsoleLogger', 'SINGLETON', []);
      const tree = simulator.buildResolutionTree('ILogger');
      expect(tree).not.toBeNull();
      expect(tree!.serviceType).toBe('ILogger');
      expect(tree!.children).toHaveLength(0);
    });

    it('should build tree with children for deps', () => {
      simulator.register('ILogger', 'ConsoleLogger', 'SINGLETON', []);
      simulator.register('IService', 'MyService', 'TRANSIENT', ['ILogger']);
      const tree = simulator.buildResolutionTree('IService');
      expect(tree!.serviceType).toBe('IService');
      expect(tree!.children).toHaveLength(1);
      expect(tree!.children[0].serviceType).toBe('ILogger');
    });

    it('should assign x/y coordinates to nodes', () => {
      simulator.register('ILogger', 'ConsoleLogger', 'SINGLETON', []);
      simulator.register('IService', 'MyService', 'TRANSIENT', ['ILogger']);
      const tree = simulator.buildResolutionTree('IService');
      expect(tree!.x).toBeGreaterThan(0);
      expect(tree!.y).toBeGreaterThan(0);
      expect(tree!.children[0].x).toBeGreaterThan(0);
      expect(tree!.children[0].y).toBeGreaterThan(tree!.y);
    });

    it('should return null for circular dependency', () => {
      simulator.register('IA', 'A', 'TRANSIENT', ['IB']);
      simulator.register('IB', 'B', 'TRANSIENT', ['IA']);
      const tree = simulator.buildResolutionTree('IA');
      expect(tree).toBeNull();
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      simulator.register('ILogger', 'ConsoleLogger', 'SINGLETON', []);
      simulator.resolve('ILogger');
      simulator.reset();

      expect(Object.keys(simulator.getRegistrations())).toHaveLength(0);
      expect(Object.keys(simulator.getSingletonVault())).toHaveLength(0);
      expect(simulator.getResolutionSteps()).toHaveLength(0);
      expect(simulator.getResolutionTree()).toBeNull();
    });
  });

  describe('detectCircularDependency (static)', () => {
    it('should detect no cycle in valid graph', () => {
      const regs = {
        ILogger: {
          serviceType: 'ILogger',
          implementationType: 'Logger',
          lifetime: 'SINGLETON' as const,
          dependencies: [],
        },
        IService: {
          serviceType: 'IService',
          implementationType: 'Service',
          lifetime: 'TRANSIENT' as const,
          dependencies: ['ILogger'],
        },
      };
      const result = IoCContainerSimulator.detectCircularDependency(
        'IService',
        regs,
      );
      expect(result.hasCycle).toBe(false);
    });

    it('should detect direct cycle A→B→A', () => {
      const regs = {
        IA: {
          serviceType: 'IA',
          implementationType: 'A',
          lifetime: 'TRANSIENT' as const,
          dependencies: ['IB'],
        },
        IB: {
          serviceType: 'IB',
          implementationType: 'B',
          lifetime: 'TRANSIENT' as const,
          dependencies: ['IA'],
        },
      };
      const result = IoCContainerSimulator.detectCircularDependency('IA', regs);
      expect(result.hasCycle).toBe(true);
      expect(result.cyclePath.length).toBeGreaterThan(0);
    });

    it('should detect indirect cycle A→B→C→A', () => {
      const regs = {
        IA: {
          serviceType: 'IA',
          implementationType: 'A',
          lifetime: 'TRANSIENT' as const,
          dependencies: ['IB'],
        },
        IB: {
          serviceType: 'IB',
          implementationType: 'B',
          lifetime: 'TRANSIENT' as const,
          dependencies: ['IC'],
        },
        IC: {
          serviceType: 'IC',
          implementationType: 'C',
          lifetime: 'TRANSIENT' as const,
          dependencies: ['IA'],
        },
      };
      const result = IoCContainerSimulator.detectCircularDependency('IA', regs);
      expect(result.hasCycle).toBe(true);
    });
  });

  describe('checkCaptiveDependency (static)', () => {
    it('should return false when no captive dependency', () => {
      const regs = {
        ILogger: {
          serviceType: 'ILogger',
          implementationType: 'Logger',
          lifetime: 'SINGLETON' as const,
          dependencies: [],
        },
        IService: {
          serviceType: 'IService',
          implementationType: 'Service',
          lifetime: 'TRANSIENT' as const,
          dependencies: ['ILogger'],
        },
      };
      const result = IoCContainerSimulator.checkCaptiveDependency(regs);
      expect(result.hasCaptive).toBe(false);
    });

    it('should detect singleton holding transient', () => {
      const regs = {
        IContext: {
          serviceType: 'IContext',
          implementationType: 'HttpContext',
          lifetime: 'TRANSIENT' as const,
          dependencies: [],
        },
        IAppService: {
          serviceType: 'IAppService',
          implementationType: 'AppService',
          lifetime: 'SINGLETON' as const,
          dependencies: ['IContext'],
        },
      };
      const result = IoCContainerSimulator.checkCaptiveDependency(regs);
      expect(result.hasCaptive).toBe(true);
      expect(result.singletonType).toBe('IAppService');
      expect(result.transientType).toBe('IContext');
    });
  });

  describe('Web API Standard Scenario (Integration)', () => {
    beforeEach(() => {
      simulator.register('ISupabaseClient', 'SupabaseClient', 'SINGLETON', []);
      simulator.register('IUserRepository', 'SupabaseUserRepository', 'SINGLETON', ['ISupabaseClient']);
      simulator.register('IUserService', 'UserService', 'TRANSIENT', ['IUserRepository']);
      simulator.register('IUserController', 'UserController', 'TRANSIENT', ['IUserService']);
    });

    it('should resolve UserController with full dependency chain', () => {
      const ctrl = simulator.resolve('IUserController');
      expect(ctrl._type).toBe('UserController');
      expect(ctrl._lifetime).toBe('TRANSIENT');

      const svc = ctrl._injectedDependencies[0];
      expect(svc._type).toBe('UserService');

      const repo = svc._injectedDependencies[0];
      expect(repo._type).toBe('SupabaseUserRepository');

      const client = repo._injectedDependencies[0];
      expect(client._type).toBe('SupabaseClient');
    });

    it('should create exactly 2 singletons', () => {
      simulator.resolve('IUserController');
      const vault = simulator.getSingletonVault();
      expect(Object.keys(vault)).toHaveLength(2);
      expect(vault['ISupabaseClient']).toBeDefined();
      expect(vault['IUserRepository']).toBeDefined();
    });

    it('should reuse singletons on second resolve', () => {
      const ctrl1 = simulator.resolve('IUserController');
      simulator.clearSteps();
      const ctrl2 = simulator.resolve('IUserController');

      const repo1 = ctrl1._injectedDependencies[0]._injectedDependencies[0];
      const repo2 = ctrl2._injectedDependencies[0]._injectedDependencies[0];
      expect(repo1).toBe(repo2);

      const steps = simulator.getResolutionSteps();
      const retrieveSteps = steps.filter((s) => s.type === 'RETRIEVE_SINGLETON');
      expect(retrieveSteps.length).toBeGreaterThanOrEqual(1);
    });

    it('should generate resolution tree with 4 nodes', () => {
      const tree = simulator.buildResolutionTree('IUserController');
      expect(tree).not.toBeNull();
      expect(tree!.serviceType).toBe('IUserController');

      let nodeCount = 0;
      const count = (n: typeof tree): void => {
        if (!n) return;
        nodeCount++;
        n.children.forEach(count);
      };
      count(tree);
      expect(nodeCount).toBe(4);
    });
  });
});
