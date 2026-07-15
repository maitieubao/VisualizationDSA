import type { ServerNode, HTTPRequest } from '../types/system-sandbox.types';

export function getServerClass(server: ServerNode): string {
  if (server.status === 'FAILED') return 'bg-accent-red/50 border-accent-red/50 text-accent-red';
  if (server.load > 80) return 'bg-accent-yellow/50 border-accent-yellow/50 text-accent-yellow';
  if (server.type === 'LB') return 'bg-sky-950/50 border-sky-700/50 text-sky-400';
  if (server.type === 'WEB') return 'bg-accent-green/50 border-accent-green/50 text-accent-green';
  if (server.type.includes('DB')) return 'bg-accent-purple/50 border-accent-purple/50 text-accent-purple';
  return 'bg-bg-surface border-border-default text-text-secondary';
}

export function getRequestPosition(
  req: HTTPRequest,
  getServer: (id: string) => ServerNode | undefined
): { x: number; y: number } {
  const lb = getServer('lb-1');
  const target = getServer(req.target);
  if (!lb || !target) return { x: 0, y: 0 };
  const startX = lb.position.x + 30;
  const startY = lb.position.y;
  const endX = target.position.x - 30;
  const endY = target.position.y;
  return {
    x: startX + (endX - startX) * req.progress,
    y: startY + (endY - startY) * req.progress,
  };
}
