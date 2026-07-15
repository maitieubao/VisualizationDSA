import { registrations } from './diState';
import type { CycleDetectionResult } from './diTypes';

export function detectCycles(): CycleDetectionResult {
  const visited = new Map<string, 'WHITE' | 'GRAY' | 'BLACK'>();
  const recursionStack: string[] = [];

  registrations.forEach((_, name) => visited.set(name, 'WHITE'));

  const dfs = (node: string): string[] | null => {
    visited.set(node, 'GRAY');
    recursionStack.push(node);

    const reg = registrations.get(node);
    if (reg) {
      for (const dep of reg.dependencies) {
        if (!registrations.has(dep)) continue;
        const status = visited.get(dep);
        if (status === 'GRAY') {
          const idx = recursionStack.indexOf(dep);
          return [...recursionStack.slice(idx), dep];
        }
        if (status === 'WHITE') {
          const cycle = dfs(dep);
          if (cycle) return cycle;
        }
      }
    }

    visited.set(node, 'BLACK');
    recursionStack.pop();
    return null;
  };

  for (const [name, status] of visited) {
    if (status === 'WHITE') {
      const cycle = dfs(name);
      if (cycle) {
        return {
          hasCycle: true,
          cycle,
          message: `PHỤ THUỘC VÒNG LẶP PHÁT HIỆN: ${cycle.join(' → ')}`,
        };
      }
    }
  }

  return { hasCycle: false, cycle: null, message: 'Không phát hiện cyclic dependencies' };
}
