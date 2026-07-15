import type { ServerNode, HTTPRequest, DBReplicationEvent, SmokeParticle } from '../types/system-sandbox.types';
import { ServerManager } from './serverManager';
import { RequestManager } from './requestManager';
import { SmokeManager } from './smokeManager';

export class LoadBalancerEngine {
  private serverMgr = new ServerManager();
  private requestMgr = new RequestManager();
  private smokeMgr = new SmokeManager();
  private replicationQueue: DBReplicationEvent[] = [];
  private particleCounter = 0;

  public initializeInfrastructure(): void {
    this.serverMgr.servers.clear();
    this.requestMgr.clear();
    this.replicationQueue = [];
    this.smokeMgr.clear();

    this.serverMgr.addServer('lb-1', 'LoadBalancer-1', 'LB', { x: 100, y: 150 });
    this.serverMgr.addServer('web-1', 'WebServer-1', 'WEB', { x: 300, y: 80 });
    this.serverMgr.addServer('web-2', 'WebServer-2', 'WEB', { x: 300, y: 150 });
    this.serverMgr.addServer('web-3', 'WebServer-3', 'WEB', { x: 300, y: 220 });
    this.serverMgr.addServer('db-primary', 'DB-Primary', 'DB_PRIMARY', { x: 500, y: 120 });
    this.serverMgr.addServer('db-replica', 'DB-Replica', 'DB_REPLICA', { x: 500, y: 180 });
  }

  public simulateRequest(sourceId: string = 'client'): HTTPRequest | null {
    const lb = this.serverMgr.getLoadBalancer();
    const webServers = this.serverMgr.getWebServers();
    return this.requestMgr.simulateRequest(lb, webServers, sourceId);
  }

  public updateRequests(deltaTime: number): void {
    this.requestMgr.updateRequests(deltaTime);
  }

  public createSmoke(serverId: string, intensity: number = 50): void {
    const server = this.serverMgr.servers.get(serverId);
    this.smokeMgr.createSmoke(server, intensity);
  }

  public updateSmoke(deltaTime: number): void {
    this.smokeMgr.updateSmoke(deltaTime);
  }

  public failServer(serverId: string): void {
    this.serverMgr.failServer(serverId);
    this.createSmoke(serverId, 80);
  }

  public recoverServer(serverId: string): void {
    this.serverMgr.recoverServer(serverId);
  }

  public simulateReplication(delayMs: number): void {
    const primary = this.serverMgr.getPrimaryDB();
    const replica = this.serverMgr.getReplicaDB();
    if (!primary || !replica) return;

    this.particleCounter++;
    const event: DBReplicationEvent = {
      id: `repl-${this.particleCounter}`,
      from: primary.id,
      to: replica.id,
      delay: delayMs,
      data: { timestamp: Date.now() },
      timestamp: Date.now(),
    };

    this.replicationQueue.push(event);
    setTimeout(() => {
      const idx = this.replicationQueue.findIndex((e) => e.id === event.id);
      if (idx > -1) this.replicationQueue.splice(idx, 1);
    }, delayMs);
  }

  public getAllServers(): ServerNode[] { return this.serverMgr.getAllServers(); }
  public getActiveRequests(): HTTPRequest[] { return this.requestMgr.getActiveRequests(); }
  public getSmokeParticles(): SmokeParticle[] { return this.smokeMgr.getSmokeParticles(); }
  public getReplicationEvents(): DBReplicationEvent[] { return [...this.replicationQueue]; }

  public reset(): void {
    this.serverMgr.servers.clear();
    this.requestMgr.clear();
    this.smokeMgr.clear();
    this.replicationQueue = [];
    this.particleCounter = 0;
  }
}

export default LoadBalancerEngine;
