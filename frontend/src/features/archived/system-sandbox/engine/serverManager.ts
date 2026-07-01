import type { ServerNode } from '../types/system-sandbox.types';

export class ServerManager {
  public servers: Map<string, ServerNode> = new Map();

  public addServer(
    id: string,
    name: string,
    type: ServerNode['type'],
    position: { x: number; y: number }
  ): ServerNode {
    const server: ServerNode = {
      id,
      name,
      type,
      status: 'HEALTHY',
      load: 0,
      requestCount: 0,
      position,
    };
    this.servers.set(id, server);
    return server;
  }

  public failServer(serverId: string): void {
    const server = this.servers.get(serverId);
    if (server) {
      server.status = 'FAILED';
      server.load = 100;
    }
  }

  public recoverServer(serverId: string): void {
    const server = this.servers.get(serverId);
    if (server) {
      server.status = 'HEALTHY';
      server.load = 0;
      server.requestCount = 0;
    }
  }

  public getAllServers(): ServerNode[] {
    return Array.from(this.servers.values());
  }

  public getLoadBalancer(): ServerNode | undefined {
    return this.getAllServers().find((s) => s.type === 'LB');
  }

  public getWebServers(): ServerNode[] {
    return this.getAllServers().filter((s) => s.type === 'WEB');
  }

  public getPrimaryDB(): ServerNode | undefined {
    return this.getAllServers().find((s) => s.type === 'DB_PRIMARY');
  }

  public getReplicaDB(): ServerNode | undefined {
    return this.getAllServers().find((s) => s.type === 'DB_REPLICA');
  }
}
