/**
 * useCollaborativeGraphStore — CRDT-powered collaborative graph state sync.
 *
 * Binds graph node/edge arrays to a Yjs shared document (Y.Doc) so that
 * multiple users editing the same graph see real-time convergent updates
 * without conflicts. Uses Y.Array<NodeDTO> and Y.Array<EdgeDTO> as the
 * shared data structures.
 *
 * Architecture:
 *   Y.Doc  ←→  WebTransportClient (network layer)
 *     ↕
 *   Pinia refs (reactive Vue state)
 */

import { defineStore } from 'pinia';
import { ref, shallowRef, readonly, watch } from 'vue';
import * as Y from 'yjs';

// ── Shared Types ─────────────────────────────────────────────────────────────

export interface CollabNodeDTO {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  /** Peer ID of the user currently dragging this node (null = free) */
  lockedBy: string | null;
}

export interface CollabEdgeDTO {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export interface CollabAwareness {
  peerId: string;
  userName: string;
  cursorX: number;
  cursorY: number;
  color: string;
  isActive: boolean;
}

// ── Constants ────────────────────────────────────────────────────────────────

const PEER_COLORS = [
  '#34d399', '#60a5fa', '#f472b6', '#fbbf24',
  '#a78bfa', '#fb923c', '#2dd4bf', '#f87171',
] as const;

function generatePeerId(): string {
  return `peer_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useCollaborativeGraphStore = defineStore('collaborativeGraph', () => {
  // ── Y.Doc shared document ──
  const ydoc = shallowRef(new Y.Doc());
  const yNodes = ydoc.value.getArray<CollabNodeDTO>('graph-nodes');
  const yEdges = ydoc.value.getArray<CollabEdgeDTO>('graph-edges');

  // ── Local reactive state (synced from Y.Doc) ──
  const nodes = ref<CollabNodeDTO[]>([]);
  const edges = ref<CollabEdgeDTO[]>([]);
  const peers = ref<CollabAwareness[]>([]);
  const isConnected = ref(false);
  const isSyncing = ref(false);

  // ── Local peer identity ──
  const localPeerId = generatePeerId();
  const localPeerColor = PEER_COLORS[
    Math.abs(localPeerId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % PEER_COLORS.length
  ];

  // ── Y.Doc → Vue reactive sync ──

  function syncNodesFromYDoc(): void {
    nodes.value = yNodes.toArray();
  }

  function syncEdgesFromYDoc(): void {
    edges.value = yEdges.toArray();
  }

  yNodes.observe(() => { syncNodesFromYDoc(); });
  yEdges.observe(() => { syncEdgesFromYDoc(); });

  // ── CRDT Operations (conflict-free by design) ──

  function addNode(x: number, y: number, label?: string): CollabNodeDTO {
    const node: CollabNodeDTO = {
      id: `cnode_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: label ?? String.fromCharCode(65 + (yNodes.length % 26)),
      x,
      y,
      radius: 20,
      lockedBy: null,
    };
    ydoc.value.transact(() => {
      yNodes.push([node]);
    });
    return node;
  }

  function addEdge(fromId: string, toId: string, weight = 1): CollabEdgeDTO | null {
    if (fromId === toId) return null;
    const existing = yEdges.toArray().some(
      e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId),
    );
    if (existing) return null;

    const edge: CollabEdgeDTO = {
      id: `cedge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      from: fromId,
      to: toId,
      weight,
    };
    ydoc.value.transact(() => {
      yEdges.push([edge]);
    });
    return edge;
  }

  function removeNode(nodeId: string): void {
    ydoc.value.transact(() => {
      // Remove edges connected to this node
      const edgeIndices: number[] = [];
      yEdges.toArray().forEach((e, i) => {
        if (e.from === nodeId || e.to === nodeId) edgeIndices.push(i);
      });
      // Delete in reverse to preserve indices
      for (let i = edgeIndices.length - 1; i >= 0; i--) {
        yEdges.delete(edgeIndices[i], 1);
      }
      // Remove the node
      const nodeIdx = yNodes.toArray().findIndex(n => n.id === nodeId);
      if (nodeIdx !== -1) yNodes.delete(nodeIdx, 1);
    });
  }

  function removeEdge(edgeId: string): void {
    ydoc.value.transact(() => {
      const idx = yEdges.toArray().findIndex(e => e.id === edgeId);
      if (idx !== -1) yEdges.delete(idx, 1);
    });
  }

  /**
   * Move a node by acquiring a lock, updating position, then releasing.
   * The lock prevents other peers from simultaneously moving the same node.
   */
  function moveNode(nodeId: string, x: number, y: number): void {
    ydoc.value.transact(() => {
      const arr = yNodes.toArray();
      const idx = arr.findIndex(n => n.id === nodeId);
      if (idx === -1) return;

      const node = arr[idx];
      if (node.lockedBy !== null && node.lockedBy !== localPeerId) return;

      const updated: CollabNodeDTO = { ...node, x, y, lockedBy: localPeerId };
      yNodes.delete(idx, 1);
      yNodes.insert(idx, [updated]);
    });
  }

  function releaseNodeLock(nodeId: string): void {
    ydoc.value.transact(() => {
      const arr = yNodes.toArray();
      const idx = arr.findIndex(n => n.id === nodeId);
      if (idx === -1) return;

      const node = arr[idx];
      if (node.lockedBy !== localPeerId) return;

      const updated: CollabNodeDTO = { ...node, lockedBy: null };
      yNodes.delete(idx, 1);
      yNodes.insert(idx, [updated]);
    });
  }

  function updateEdgeWeight(edgeId: string, weight: number): void {
    ydoc.value.transact(() => {
      const arr = yEdges.toArray();
      const idx = arr.findIndex(e => e.id === edgeId);
      if (idx === -1) return;

      const updated: CollabEdgeDTO = { ...arr[idx], weight };
      yEdges.delete(idx, 1);
      yEdges.insert(idx, [updated]);
    });
  }

  // ── Awareness (cursor positions, peer presence) ──

  function updateLocalAwareness(cursorX: number, cursorY: number): void {
    const existing = peers.value.findIndex(p => p.peerId === localPeerId);
    const awareness: CollabAwareness = {
      peerId: localPeerId,
      userName: `User ${localPeerId.substring(5, 9)}`,
      cursorX,
      cursorY,
      color: localPeerColor,
      isActive: true,
    };
    if (existing !== -1) {
      peers.value[existing] = awareness;
    } else {
      peers.value.push(awareness);
    }
  }

  // ── Document lifecycle ──

  /**
   * Apply a remote Y.Doc state update (received from WebTransportClient).
   * This is the integration point between the CRDT layer and the network layer.
   */
  function applyRemoteUpdate(update: Uint8Array): void {
    isSyncing.value = true;
    Y.applyUpdate(ydoc.value, update);
    isSyncing.value = false;
  }

  /**
   * Register a callback to receive local document updates for broadcasting.
   * The callback fires whenever the local user mutates the Y.Doc.
   */
  function onLocalUpdate(callback: (update: Uint8Array) => void): () => void {
    const handler = (update: Uint8Array, origin: unknown) => {
      // Only broadcast updates originating from local transactions
      if (origin !== 'remote') {
        callback(update);
      }
    };
    ydoc.value.on('update', handler);
    return () => { ydoc.value.off('update', handler); };
  }

  /**
   * Get full document state for initial sync with new peers.
   */
  function getFullState(): Uint8Array {
    return Y.encodeStateAsUpdate(ydoc.value);
  }

  /**
   * Reset the collaborative document (e.g., when leaving a session).
   */
  function resetDocument(): void {
    ydoc.value.transact(() => {
      yNodes.delete(0, yNodes.length);
      yEdges.delete(0, yEdges.length);
    });
    peers.value = [];
    isConnected.value = false;
  }

  return {
    // State (readonly to prevent direct mutation — use CRDT ops)
    nodes: readonly(nodes),
    edges: readonly(edges),
    peers: readonly(peers),
    isConnected: readonly(isConnected),
    isSyncing: readonly(isSyncing),
    localPeerId,
    localPeerColor,

    // CRDT operations
    addNode,
    addEdge,
    removeNode,
    removeEdge,
    moveNode,
    releaseNodeLock,
    updateEdgeWeight,

    // Awareness
    updateLocalAwareness,

    // Document sync (for WebTransportClient integration)
    applyRemoteUpdate,
    onLocalUpdate,
    getFullState,
    resetDocument,
  };
});
