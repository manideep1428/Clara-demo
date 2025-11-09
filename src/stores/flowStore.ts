import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Node, Edge } from '@xyflow/react';
import type { ImageNodeData } from '../components/ImageNode';

interface FlowState {
  nodes: Node<ImageNodeData>[];
  edges: Edge[];
  setNodes: (nodes: Node<ImageNodeData>[] | ((nodes: Node<ImageNodeData>[]) => Node<ImageNodeData>[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  updateNode: (nodeId: string, data: Partial<ImageNodeData>) => void;
  addNode: (node: Node<ImageNodeData>) => void;
  addEdge: (edge: Edge) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  clearFlow: () => void;
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set) => ({
      nodes: [],
      edges: [],
      
      setNodes: (nodes) => set((state) => ({
        nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes
      })),
      
      setEdges: (edges) => set((state) => ({
        edges: typeof edges === 'function' ? edges(state.edges) : edges
      })),
      
      updateNode: (nodeId, data) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...data } }
              : node
          ),
        })),
      
      addNode: (node) =>
        set((state) => ({
          nodes: [...state.nodes, node],
        })),
      
      addEdge: (edge) =>
        set((state) => ({
          edges: [...state.edges, edge],
        })),
      
      removeNode: (nodeId) =>
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          edges: state.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
        })),
      
      removeEdge: (edgeId) =>
        set((state) => ({
          edges: state.edges.filter((edge) => edge.id !== edgeId),
        })),
      
      clearFlow: () => set({ nodes: [], edges: [] }),
    }),
    {
      name: 'flow-storage', // localStorage key
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
    }
  )
);
