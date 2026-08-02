













import { defineStore } from 'pinia';
import { ref, shallowRef, readonly, watch } from 'vue';
import * as Y from 'yjs';



export interface CollabNodeDTO {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  
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



const PEER_COLORS = [
  '#34d399', '#60a5fa', '#f472b6', '#fbbf24',
  '#a78bfa', '#fb923c', '#2dd4bf', '#f87171',
] as const;

function generatePeerId(): string {
  return `peer_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}



export const useCollaborativeGraphStore = defineStore('collaborativeGraph', () => {
  
  const ydoc = shallowRef(new Y.Doc());
  const yNodes = ydoc.value.getArray<CollabNodeDTO>('graph-nodes');
  const yEdges = ydoc.value.getArray<CollabEdgeDTO>('graph-edges');

  
  const nodes = ref<CollabNodeDTO[]>([]);
  const edges = ref<CollabEdgeDTO[]>([]);
  const peers = ref<CollabAwareness[]>([]);
  const isConnected = ref(false);
  const isSyncing = ref(false);

  
  const localPeerId = generatePeerId();
  const localPeerColor = PEER_COLORS[
    Math.abs(localPeerId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % PEER_COLORS.length
  ];

  

  function syncNodesFromYDoc(): void {
    nodes.value = yNodes.toArray();
  }

  function syncEdgesFromYDoc(): void {
    edges.value = yEdges.toArray();
  }

  yNodes.observe(() => { syncNodesFromYDoc(); });
  yEdges.observe(() => { syncEdgesFromYDoc(); });

  

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
      
      const edgeIndices: number[] = [];
      yEdges.toArray().forEach((e, i) => {
        if (e.from === nodeId || e.to === nodeId) edgeIndices.push(i);
      });
      
      for (let i = edgeIndices.length - 1; i >= 0; i--) {
        yEdges.delete(edgeIndices[i], 1);
      }
      
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

  

  



  function applyRemoteUpdate(update: Uint8Array): void {
    isSyncing.value = true;
    Y.applyUpdate(ydoc.value, update);
    isSyncing.value = false;
  }

  



  function onLocalUpdate(callback: (update: Uint8Array) => void): () => void {
    const handler = (update: Uint8Array, origin: unknown) => {
      
      if (origin !== 'remote') {
        callback(update);
      }
    };
    ydoc.value.on('update', handler);
    return () => { ydoc.value.off('update', handler); };
  }

  


  function getFullState(): Uint8Array {
    return Y.encodeStateAsUpdate(ydoc.value);
  }

  


  function resetDocument(): void {
    ydoc.value.transact(() => {
      yNodes.delete(0, yNodes.length);
      yEdges.delete(0, yEdges.length);
    });
    peers.value = [];
    isConnected.value = false;
  }

  return {
    
    nodes: readonly(nodes),
    edges: readonly(edges),
    peers: readonly(peers),
    isConnected: readonly(isConnected),
    isSyncing: readonly(isSyncing),
    localPeerId,
    localPeerColor,

    
    addNode,
    addEdge,
    removeNode,
    removeEdge,
    moveNode,
    releaseNodeLock,
    updateEdgeWeight,

    
    updateLocalAwareness,

    
    applyRemoteUpdate,
    onLocalUpdate,
    getFullState,
    resetDocument,
  };
});
