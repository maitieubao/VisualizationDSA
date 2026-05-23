import { describe, it, expect } from 'vitest';
import {
  WEB_API_SCENARIO,
  CIRCULAR_DEPENDENCY_SCENARIO,
  CAPTIVE_DEPENDENCY_SCENARIO,
  CLEAN_ARCHITECTURE_SCENARIO,
  ALL_SCENARIOS,
} from '../scenarioData';

describe('scenarioData', () => {
  it('should have 4 scenarios in ALL_SCENARIOS', () => {
    expect(ALL_SCENARIOS).toHaveLength(4);
  });

  describe('WEB_API_SCENARIO', () => {
    it('should have correct scenarioId', () => {
      expect(WEB_API_SCENARIO.scenarioId).toBe('web-api-standard');
    });

    it('should have 4 registrations', () => {
      expect(WEB_API_SCENARIO.registrations).toHaveLength(4);
    });

    it('should have 2 singletons and 2 transients', () => {
      const singletons = WEB_API_SCENARIO.registrations.filter(
        (r) => r.lifetime === 'SINGLETON',
      );
      const transients = WEB_API_SCENARIO.registrations.filter(
        (r) => r.lifetime === 'TRANSIENT',
      );
      expect(singletons).toHaveLength(2);
      expect(transients).toHaveLength(2);
    });

    it('should have SupabaseClient as root singleton with no deps', () => {
      const client = WEB_API_SCENARIO.registrations.find(
        (r) => r.serviceType === 'ISupabaseClient',
      );
      expect(client).toBeDefined();
      expect(client!.lifetime).toBe('SINGLETON');
      expect(client!.dependencies).toHaveLength(0);
    });

    it('should have UserController depending on UserService', () => {
      const ctrl = WEB_API_SCENARIO.registrations.find(
        (r) => r.serviceType === 'IUserController',
      );
      expect(ctrl!.dependencies).toContain('IUserService');
    });
  });

  describe('CIRCULAR_DEPENDENCY_SCENARIO', () => {
    it('should have 2 registrations forming a cycle', () => {
      expect(CIRCULAR_DEPENDENCY_SCENARIO.registrations).toHaveLength(2);
      const a = CIRCULAR_DEPENDENCY_SCENARIO.registrations.find(
        (r) => r.serviceType === 'IServiceA',
      );
      const b = CIRCULAR_DEPENDENCY_SCENARIO.registrations.find(
        (r) => r.serviceType === 'IServiceB',
      );
      expect(a!.dependencies).toContain('IServiceB');
      expect(b!.dependencies).toContain('IServiceA');
    });
  });

  describe('CAPTIVE_DEPENDENCY_SCENARIO', () => {
    it('should have singleton depending on transient', () => {
      const singleton = CAPTIVE_DEPENDENCY_SCENARIO.registrations.find(
        (r) => r.lifetime === 'SINGLETON' && r.dependencies.length > 0,
      );
      expect(singleton).toBeDefined();
      const transientDep = CAPTIVE_DEPENDENCY_SCENARIO.registrations.find(
        (r) => r.serviceType === singleton!.dependencies[0],
      );
      expect(transientDep!.lifetime).toBe('TRANSIENT');
    });
  });

  describe('CLEAN_ARCHITECTURE_SCENARIO', () => {
    it('should have 5 registrations', () => {
      expect(CLEAN_ARCHITECTURE_SCENARIO.registrations).toHaveLength(5);
    });

    it('should have DbContext as singleton', () => {
      const db = CLEAN_ARCHITECTURE_SCENARIO.registrations.find(
        (r) => r.serviceType === 'IDbContext',
      );
      expect(db!.lifetime).toBe('SINGLETON');
    });
  });

  describe('all scenarios have required fields', () => {
    it.each(ALL_SCENARIOS)('$title should have scenarioId, title, description', (scenario) => {
      expect(scenario.scenarioId).toBeTruthy();
      expect(scenario.title).toBeTruthy();
      expect(scenario.description).toBeTruthy();
      expect(scenario.registrations.length).toBeGreaterThan(0);
    });

    it.each(ALL_SCENARIOS)('$title registrations should have required fields', (scenario) => {
      for (const reg of scenario.registrations) {
        expect(reg.serviceType).toBeTruthy();
        expect(reg.implementationType).toBeTruthy();
        expect(['SINGLETON', 'TRANSIENT']).toContain(reg.lifetime);
        expect(Array.isArray(reg.dependencies)).toBe(true);
      }
    });
  });
});
