import { createFileRoute, useParams, useSearch } from '@tanstack/react-router'

export const Route = createFileRoute('/design/$designId')({
  component: Flow,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      new: (search.new as boolean) || false,
    };
  },
})

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodeDrag,
  type DefaultEdgeOptions,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ImageNode, { type ImageNodeData } from '../components/ImageNode';
import CustomEdge from '../components/CustomEdge';
import { ImagePromptSidebar } from '../components/ImagePromptSidebar';
import { FlowToolbar } from '../components/FlowToolbar';
import { useFlowStore } from '../stores/flowStore';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { nanoid } from 'nanoid';

// Sample images from online sources
const sampleImages = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=400',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400',
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400',
];

const initialNodes: Node<ImageNodeData>[] = [
  { 
    id: '1', 
    data: { 
      label: 'Start Image', 
      imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400' 
    }, 
    position: { x: 100, y: 100 }, 
    type: 'imageNode' 
  },
  { 
    id: '2', 
    data: { 
      label: 'Generated Image', 
      imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400' 
    }, 
    position: { x: 100, y: 400 }, 
    type: 'imageNode' 
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2',
    type: 'custom',
    animated: true,
  }
];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
  type: 'custom',
  style: {
    strokeWidth: 2,
    stroke: '#6b7280',
  },
};

const nodeTypes = {
  imageNode: ImageNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log('drag event', node.data);
};

function Flow() {
  const { designId } = useParams({ from: '/design/$designId' });
  const { new: isNew } = useSearch({ from: '/design/$designId' });
  
  // Get nodes and edges from Zustand store
  const { nodes, edges, setNodes, setEdges } = useFlowStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [panOnDrag, setPanOnDrag] = useState(false);
  const pendingNodeId = useRef<string | null>(null);
  const connectingNodeId = useRef<string | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Convex mutations and queries
  const createDesign = useMutation(api.designs.createDesign);
  const updateDesign = useMutation(api.designs.updateDesign);
  const getDesign = useQuery(api.designs.getDesign, isNew ? "skip" : { designId });

  const handleToolChange = (tool: 'select' | 'hand') => {
    setPanOnDrag(tool === 'hand');
  };

  // Initialize design - load from Convex or create new
  useEffect(() => {
    if (isNew) {
      // New design - use initial nodes
      setNodes(initialNodes);
      setEdges(initialEdges);
      
      // Save to Convex
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      createDesign({
        designId,
        userId: user.email || 'anonymous',
        name: 'Untitled Design',
        nodes: JSON.stringify(initialNodes),
        edges: JSON.stringify(initialEdges),
      });
    } else if (getDesign) {
      // Load existing design from Convex
      setNodes(getDesign.nodes);
      setEdges(getDesign.edges);
    }
  }, [isNew, getDesign]);

  // Auto-save to Convex when nodes or edges change
  useEffect(() => {
    if (!isNew && nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        updateDesign({
          designId,
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(edges),
        }).catch(console.error);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, designId, isNew]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onConnectStart = useCallback((_: any, { nodeId }: any) => {
    // Store which node we're connecting from
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = (event.target as Element).classList.contains('react-flow__pane');

      if (targetIsPane) {
        // Get the position where the user dropped the connection
        const position = screenToFlowPosition({
          x: (event as MouseEvent).clientX,
          y: (event as MouseEvent).clientY,
        });

        // Create a blank loading node immediately
        const id = nanoid();
        const newNode: Node<ImageNodeData> = {
          id,
          type: 'imageNode',
          position,
          data: {
            label: 'New Image',
            isLoading: true,
          },
        };

        setNodes((nds) => nds.concat(newNode));
        
        // Create edge from source to new node
        setEdges((eds) =>
          eds.concat({
            id: `${connectingNodeId.current}-${id}`,
            source: connectingNodeId.current!,
            target: id,
          })
        );
        
        // Store the node ID for later update
        pendingNodeId.current = id;
        
        // Open sidebar to ask for prompt
        setIsSidebarOpen(true);
      }
      
      // Reset connecting node
      connectingNodeId.current = null;
    },
    [screenToFlowPosition, setNodes, setEdges],
  );

  const handleGenerateImage = useCallback(
    (prompt: string) => {
      if (!pendingNodeId.current) return;
      
      setIsGenerating(true);
      
      // Simulate image generation with a delay
      setTimeout(() => {
        if (!pendingNodeId.current) return;

        // Get random image from sample images (simulating generation)
        const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];

        // Update the blank node with the generated image
        setNodes((nds) =>
          nds.map((node) =>
            node.id === pendingNodeId.current
              ? {
                  ...node,
                  data: {
                    label: prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''),
                    imageUrl: randomImage,
                    isLoading: false,
                  },
                }
              : node
          )
        );

        // Reset state
        setIsGenerating(false);
        setIsSidebarOpen(false);
        pendingNodeId.current = null;
      }, 2000); // 2 second delay to simulate generation
    },
    [setNodes],
  );

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeDrag={onNodeDrag}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        panOnDrag={panOnDrag}
        selectionOnDrag={!panOnDrag}
        panOnScroll={panOnDrag}
        zoomOnScroll={!panOnDrag}
        zoomOnPinch
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
      />
      
      <FlowToolbar onToolChange={handleToolChange} />
      
      <ImagePromptSidebar
        isOpen={isSidebarOpen}
        onClose={() => {
          // If user closes without generating, remove the blank node
          if (pendingNodeId.current) {
            setNodes((nds) => nds.filter((n) => n.id !== pendingNodeId.current));
            setEdges((eds) => eds.filter((e) => e.target !== pendingNodeId.current));
          }
          setIsSidebarOpen(false);
          pendingNodeId.current = null;
        }}
        onGenerate={handleGenerateImage}
        isGenerating={isGenerating}
      />
    </div>
  );
}