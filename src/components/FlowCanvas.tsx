import { useCallback, useEffect, useState } from 'react';
import {
    ReactFlow,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    BackgroundVariant,
    Panel,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Minus, Plus, Maximize } from 'lucide-react';

import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import LiveNode, { LiveNodeData } from './LiveNode';

interface FlowCanvasProps {
    nodes: Array<{
        id: string;
        artifactId: string;
        title: string;
        htmlContent: string;
        isStreaming: boolean;
        x?: number;
        y?: number;
    }>;
}

const nodeTypes = {
    live: LiveNode,
};

function NavigationControls() {
    const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
    const [zoom, setZoom] = useState(80);

    // Update zoom display
    useEffect(() => {
        const interval = setInterval(() => {
            setZoom(Math.round(getZoom() * 100));
        }, 100);
        return () => clearInterval(interval);
    }, [getZoom]);

    return (
        <Panel position="bottom-center" className="flex items-center gap-1 p-1.5 bg-black/80 border border-white/10 rounded-full shadow-2xl backdrop-blur-md mb-8">
            <button
                onClick={() => zoomOut({ duration: 200 })}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                aria-label="Zoom Out"
            >
                <Minus size={16} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <div className="px-2 text-xs text-slate-400 font-medium min-w-[40px] text-center">
                {zoom}%
            </div>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <button
                onClick={() => zoomIn({ duration: 200 })}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                aria-label="Zoom In"
            >
                <Plus size={16} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <button
                onClick={() => fitView({ duration: 300 })}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                aria-label="Fit View"
            >
                <Maximize size={16} />
            </button>
        </Panel>
    );
}

export function FlowCanvas({ nodes: propNodes }: FlowCanvasProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<LiveNodeData>>([]);
    const [edges, _, onEdgesChange] = useEdgesState([]);

    const updateNodePosition = useMutation(api.nodes.updateNodePosition);

    useEffect(() => {
        console.log('🎨 FlowCanvas received nodes:', propNodes.length);
    }, [propNodes]);

    const onNodeDragStop = useCallback((_: any, node: Node) => {
        if (node.type === 'live') {
            console.log('📌 Node Drag Stop:', node.id, node.position);
            updateNodePosition({
                nodeId: node.id,
                x: node.position.x,
                y: node.position.y,
            });
        }
    }, [updateNodePosition]);

    // Sync props.nodes with local React Flow state
    useEffect(() => {
        setNodes((nds) => {
            // Create a lookup map for existing nodes to preserve their positions
            const ndsMap = new Map(nds.map(n => [n.id, n]));

            // Update existing nodes and add new ones
            const updatedNodes = propNodes.map((node, index) => {
                const existingNode = ndsMap.get(node.id);

                let position = { x: 0, y: 0 };

                if (existingNode) {
                    // Preserve the current position for existing nodes
                    position = existingNode.position;
                } else if (node.x !== undefined && node.y !== undefined) {
                    // Use DB position for newly loaded nodes
                    position = { x: node.x, y: node.y };
                } else {
                    // Default cascade for completely new nodes without DB coords
                    position = {
                        x: (index % 3) * 450,
                        y: Math.floor(index / 3) * 850
                    };
                }

                // If node exists, only update if data actually changed
                if (existingNode) {
                    const dataChanged = 
                        existingNode.data.title !== node.title ||
                        existingNode.data.htmlContent !== node.htmlContent ||
                        existingNode.data.isStreaming !== node.isStreaming;

                    if (!dataChanged) {
                        // Return existing node unchanged to prevent re-renders
                        return existingNode;
                    }

                    // Only update the data, keep everything else the same
                    return {
                        ...existingNode,
                        data: {
                            artifactId: node.artifactId,
                            title: node.title,
                            htmlContent: node.htmlContent,
                            isStreaming: node.isStreaming
                        }
                    };
                }

                // New node
                return {
                    id: node.id,
                    type: 'live',
                    position,
                    dragHandle: '.custom-drag-handle',
                    data: {
                        artifactId: node.artifactId,
                        title: node.title,
                        htmlContent: node.htmlContent,
                        isStreaming: node.isStreaming
                    }
                };
            });

            // Remove nodes that are no longer in propNodes
            return updatedNodes;
        });
    }, [propNodes, setNodes]);

    // Background settings - transparent to show page gradient
    const backgroundStyle = { backgroundColor: 'transparent' };

    return (
        <div className="w-full h-full" style={{ background: 'transparent' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                defaultViewport={{ x: 100, y: 50, zoom: 0.4 }}
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.1}
                maxZoom={2}
                colorMode="dark"
                proOptions={{ hideAttribution: true }}
                style={{ background: 'transparent' }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={1.5}
                    color="rgba(139, 92, 246, 0.08)"
                    style={backgroundStyle}
                />
                <NavigationControls />
            </ReactFlow>
        </div>
    );
}
