import { OOPReflectionEngine } from './OOPReflectionEngine';

export function registerDefaultOOPClasses(): void {
  OOPReflectionEngine.registerClass({
    className: 'Shape',
    members: [
      { name: 'x', type: 'FIELD', accessModifier: 'PUBLIC' },
      { name: 'y', type: 'FIELD', accessModifier: 'PUBLIC' },
      { name: 'color', type: 'FIELD', accessModifier: 'PROTECTED' },
      { name: 'area', type: 'METHOD', accessModifier: 'PUBLIC' },
      { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC' },
    ],
  });

  OOPReflectionEngine.registerClass({
    className: 'Circle',
    parentClass: 'Shape',
    members: [
      { name: 'radius', type: 'FIELD', accessModifier: 'PRIVATE' },
      { name: 'pi', type: 'FIELD', accessModifier: 'PRIVATE', value: 3.14 },
      { name: 'area', type: 'METHOD', accessModifier: 'PUBLIC', isOverridden: true },
      { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC', isOverridden: true },
    ],
  });

  OOPReflectionEngine.registerClass({
    className: 'Rectangle',
    parentClass: 'Shape',
    members: [
      { name: 'width', type: 'FIELD', accessModifier: 'PRIVATE' },
      { name: 'height', type: 'FIELD', accessModifier: 'PRIVATE' },
      { name: 'area', type: 'METHOD', accessModifier: 'PUBLIC', isOverridden: true },
      { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC', isOverridden: true },
    ],
  });
}
