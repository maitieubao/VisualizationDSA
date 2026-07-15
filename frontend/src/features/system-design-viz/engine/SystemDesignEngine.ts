import type { SystemNode, NetworkLink, NetworkPacket } from '../types/system-design-viz.types';
import { PACKET_SPEED, MAX_ACTIVE_PACKETS } from '../types/system-design-viz.types';

export class SystemDesignEngine {
  private nodes: Map<string, SystemNode> = new Map();
  private links: NetworkLink[] = [];
  private packets: NetworkPacket[] = [];
  private lbActiveIndex = 0;
  private packetCounter = 0;

  public registerNode(node: SystemNode): void { this.nodes.set(node.nodeId, node); }
  public getNode(nodeId: string): SystemNode | undefined { return this.nodes.get(nodeId); }
  public getNodes(): SystemNode[] { return Array.from(this.nodes.values()); }
  public registerLink(link: NetworkLink): void { if (!this.links.some(l => l.linkId === link.linkId)) this.links.push(link); }
  public getLinks(): NetworkLink[] { return [...this.links]; }
  public setNodeStatus(nodeId: string, status: SystemNode['status']): void { const node = this.nodes.get(nodeId); if (node) node.status = status; }

  public routeRequestFromLB(lbId: string, packetColor: string): NetworkPacket | null {
    const lbNode = this.nodes.get(lbId);
    if (!lbNode || this.packets.length >= MAX_ACTIVE_PACKETS) return null;

    const connectedHealthyServers = this.links
      .filter((l) => l.sourceId === lbId)
      .map((l) => this.nodes.get(l.targetId))
      .filter((n): n is SystemNode => n !== undefined && n.nodeType === 'WEB_SERVER' && n.status !== 'FAILED');

    if (connectedHealthyServers.length === 0) return null;

    const targetServer = connectedHealthyServers[this.lbActiveIndex % connectedHealthyServers.length];
    this.lbActiveIndex = (this.lbActiveIndex + 1) % connectedHealthyServers.length;

    this.packetCounter++;
    const newPacket: NetworkPacket = {
      packetId: `packet-${this.packetCounter}`,
      sourceId: lbId,
      targetId: targetServer.nodeId,
      progress: 0,
      status: 'IN_TRANSIT',
      packetColor,
    };

    this.packets.push(newPacket);
    targetServer.requestCount++;
    return newPacket;
  }

  public createDirectPacket(sourceId: string, targetId: string, packetColor: string): NetworkPacket | null {
    if (this.packets.length >= MAX_ACTIVE_PACKETS) return null;
    const source = this.nodes.get(sourceId);
    const target = this.nodes.get(targetId);
    if (!source || !target) return null;

    this.packetCounter++;
    const newPacket: NetworkPacket = {
      packetId: `packet-${this.packetCounter}`,
      sourceId,
      targetId,
      progress: 0,
      status: 'IN_TRANSIT',
      packetColor,
    };

    this.packets.push(newPacket);
    return newPacket;
  }

  public updatePacketsProgress(deltaTime: number): void {
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      if (p.status === 'IN_TRANSIT') {
        const target = this.nodes.get(p.targetId);
        if (target && target.status === 'FAILED') {
          p.status = 'DROPPED';
          target.requestCount = Math.max(0, target.requestCount - 1);
          this.packets.splice(i, 1);
          continue;
        }

        p.progress += deltaTime * PACKET_SPEED;
        if (p.progress >= 1.0) {
          p.progress = 1.0;
          p.status = 'ARRIVED';
          const arrivalTarget = this.nodes.get(p.targetId);
          if (arrivalTarget) {
            arrivalTarget.requestCount = Math.max(0, arrivalTarget.requestCount - 1);
          }
          this.packets.splice(i, 1);
        }
      }
    }
  }

  public getPackets(): NetworkPacket[] { return [...this.packets]; }
  public getPacketCount(): number { return this.packets.length; }
  public clear(): void {
    this.nodes.clear();
    this.links = [];
    this.packets = [];
    this.lbActiveIndex = 0;
    this.packetCounter = 0;
  }
}

