import type { HTTPRequest, ServerNode } from '../types/system-sandbox.types';

export class RequestManager {
  public requests: Map<string, HTTPRequest> = new Map();
  private roundRobinIndex = 0;
  private particleCounter = 0;

  public simulateRequest(lb: ServerNode | undefined, webServers: ServerNode[], sourceId: string = 'client'): HTTPRequest | null {
    if (!lb) return null;
    const healthyServers = webServers.filter((s) => s.status !== 'FAILED');
    if (healthyServers.length === 0) return null;

    const targetServer = healthyServers[this.roundRobinIndex % healthyServers.length];
    this.roundRobinIndex++;
    this.particleCounter++;

    const request: HTTPRequest = {
      id: `req-${this.particleCounter}`,
      source: sourceId,
      target: targetServer.id,
      progress: 0,
      status: 'IN_FLIGHT',
      color: this.getRequestColor(targetServer.id),
    };

    this.requests.set(request.id, request);
    targetServer.requestCount++;
    targetServer.load = Math.min(100, targetServer.load + 5);
    return request;
  }

  public updateRequests(deltaTime: number): void {
    for (const request of this.requests.values()) {
      if (request.status === 'IN_FLIGHT') {
        request.progress += deltaTime * 0.002;
        if (request.progress >= 1) {
          request.status = 'ARRIVED';
          request.progress = 1;
          setTimeout(() => {
            this.requests.delete(request.id);
          }, 500);
        }
      }
    }
  }

  public getActiveRequests(): HTTPRequest[] {
    return Array.from(this.requests.values()).filter((r) => r.status === 'IN_FLIGHT');
  }

  public getRequestColor(serverId: string): string {
    const colors: Record<string, string> = {
      'web-1': '#22c55e',
      'web-2': '#3b82f6',
      'web-3': '#f59e0b',
    };
    return colors[serverId] || '#22c55e';
  }

  public clear(): void {
    this.requests.clear();
    this.roundRobinIndex = 0;
    this.particleCounter = 0;
  }
}
