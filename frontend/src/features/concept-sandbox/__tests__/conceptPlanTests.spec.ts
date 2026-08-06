// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const PLAN_DIR = join(__dirname, '../../../../../plan/features');

describe('Concept Sandbox Plan Files (OOP / SOLID / Design Patterns)', () => {
  describe('plan file existence', () => {
    it('OOP concept plan file exists', () => {
      const filePath = join(PLAN_DIR, 'sprint-6/phase2-oop-concept.md');
      expect(existsSync(filePath)).toBe(true);
    });

    it('SOLID principles plan file exists', () => {
      const filePath = join(PLAN_DIR, 'sprint-7/phase2-solid-principles.md');
      expect(existsSync(filePath)).toBe(true);
    });

    it('Design Patterns plan file exists', () => {
      const filePath = join(PLAN_DIR, 'sprint-9/phase2-design-patterns.md');
      expect(existsSync(filePath)).toBe(true);
    });

    it('Master design advanced CS concepts plan file exists', () => {
      const filePath = join(PLAN_DIR, 'master-design/phase2-advanced-cs-concepts.md');
      expect(existsSync(filePath)).toBe(true);
    });
  });

  describe('plan file content validation', () => {
    it('OOP plan file has meaningful content (>500 chars)', () => {
      const filePath = join(PLAN_DIR, 'sprint-6/phase2-oop-concept.md');
      const content = readFileSync(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(500);
    });

    it('SOLID plan file has meaningful content (>500 chars)', () => {
      const filePath = join(PLAN_DIR, 'sprint-7/phase2-solid-principles.md');
      const content = readFileSync(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(500);
    });

    it('Design Patterns plan file has meaningful content (>500 chars)', () => {
      const filePath = join(PLAN_DIR, 'sprint-9/phase2-design-patterns.md');
      const content = readFileSync(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(500);
    });
  });

  describe('plan file structure', () => {
    it('OOP plan contains TypeScript interface definitions', () => {
      const filePath = join(PLAN_DIR, 'sprint-6/phase2-oop-concept.md');
      const content = readFileSync(filePath, 'utf-8');
      expect(content).toMatch(/interface\s+\w+/);
      expect(content).toMatch(/export/);
    });

    it('SOLID plan contains LCOM4 or cohesion analysis', () => {
      const filePath = join(PLAN_DIR, 'sprint-7/phase2-solid-principles.md');
      const content = readFileSync(filePath, 'utf-8');
      expect(content).toMatch(/LCOM4|cohesion|SRP/i);
    });

    it('Design Patterns plan contains Observer pattern specification', () => {
      const filePath = join(PLAN_DIR, 'sprint-9/phase2-design-patterns.md');
      const content = readFileSync(filePath, 'utf-8');
      expect(content).toMatch(/Observer|Subject|notify/i);
    });
  });

  describe('concept types extracted from plan', () => {
    it('OOP AccessModifier type is correctly defined in plan', () => {
      const filePath = join(PLAN_DIR, 'sprint-6/phase2-oop-concept.md');
      const content = readFileSync(filePath, 'utf-8');
      expect(content).toMatch(/'PUBLIC'\s*\|\s*'PRIVATE'\s*\|\s*'PROTECTED'/);
    });

    it('SOLID LCOM4 MethodNode interface has required fields', () => {
      const filePath = join(PLAN_DIR, 'sprint-7/phase2-solid-principles.md');
      const content = readFileSync(filePath, 'utf-8');
      expect(content).toMatch(/MethodNode/);
      expect(content).toMatch(/accessedFields/);
    });

    it('Design Patterns Observer interface has update method', () => {
      const filePath = join(PLAN_DIR, 'sprint-9/phase2-design-patterns.md');
      const content = readFileSync(filePath, 'utf-8');
      expect(content).toMatch(/Observer/);
      expect(content).toMatch(/update\s*\(/);
    });
  });
});

describe('Frontend features directory status', () => {
  const featuresDir = join(__dirname, '../../');

  it('dsa-modules feature directory exists with implementation', () => {
    expect(existsSync(join(featuresDir, 'dsa-modules/components/AlgorithmDashboard.vue'))).toBe(true);
    expect(existsSync(join(featuresDir, 'dsa-modules/components/DSAPlayer.vue'))).toBe(true);
    expect(existsSync(join(featuresDir, 'dsa-modules/components/Legend.vue'))).toBe(true);
    expect(existsSync(join(featuresDir, 'dsa-modules/components/PseudocodeViewer.vue'))).toBe(true);
  });

  it('oop-sandbox feature directory does NOT exist (no code yet)', () => {
    expect(existsSync(join(featuresDir, 'oop-sandbox'))).toBe(false);
  });

  it('solid-sandbox feature directory does NOT exist (no code yet)', () => {
    expect(existsSync(join(featuresDir, 'solid-sandbox'))).toBe(false);
  });

  it('pattern-sandbox feature directory does NOT exist (no code yet)', () => {
    expect(existsSync(join(featuresDir, 'pattern-sandbox'))).toBe(false);
  });

  it('concept-sandbox feature directory exists (created for test housing)', () => {
    expect(existsSync(join(featuresDir, 'concept-sandbox'))).toBe(true);
  });

  it('animation-engine feature directory exists with VCR controls', () => {
    expect(existsSync(join(featuresDir, 'animation-engine/components/AnimationVcrControls.vue'))).toBe(true);
  });
});

describe('Module implementation status summary', () => {
  const featuresDir = join(__dirname, '../../');

  const modules: { name: string; hasCode: boolean; components: string[] }[] = [
    { name: 'dsa-modules', hasCode: true, components: ['AlgorithmDashboard', 'DSAPlayer', 'Legend', 'PseudocodeViewer'] },
    { name: 'oop-sandbox', hasCode: false, components: [] },
    { name: 'solid-sandbox', hasCode: false, components: [] },
    { name: 'pattern-sandbox', hasCode: false, components: [] },
    { name: 'animation-engine', hasCode: true, components: ['AnimationVcrControls'] },
  ];

  it('correctly identifies which modules have code and which are plan-only', () => {
    for (const mod of modules) {
      const dirPath = join(featuresDir, mod.name);
      const dirExists = existsSync(dirPath);

      if (mod.hasCode) {
        expect(dirExists).toBe(true);
      }
    }

    const planOnlyModules = modules.filter((m) => !m.hasCode);
    for (const mod of planOnlyModules) {
      const dirPath = join(featuresDir, mod.name);
      expect(existsSync(dirPath)).toBe(false);
    }
  });

  it('reports module status without errors', () => {
    const status = modules.map((m) => ({
      name: m.name,
      status: m.hasCode ? 'CODE_DONE' : 'SPEC_ONLY',
      componentCount: m.components.length,
    }));

    const codeDone = status.filter((s) => s.status === 'CODE_DONE');
    const specOnly = status.filter((s) => s.status === 'SPEC_ONLY');

    expect(codeDone.length).toBe(2);
    expect(specOnly.length).toBe(3);
  });
});
