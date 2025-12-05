import { createFileRoute, useParams, useSearch } from '@tanstack/react-router'

export const Route = createFileRoute('/design/$designId')({
  component: DesignPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      new: (search.new as boolean) || false,
      prompt: (search.prompt as string) || '',
    };
  },
})

import { useMemo, useState, useCallback } from 'react';
import { ChatBox } from '../components/ChatBox'
import { useUser } from '@clerk/clerk-react';
import { generateUUID } from '../lib/utils';
import LiveNode from '../components/LiveNode';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { LiveNode as LiveNodeType } from '../hooks/useChat';
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from '../components/ui/sidebar';

function DesignPage() {
  const { designId } = useParams({ from: '/design/$designId' });
  const { prompt } = useSearch({ from: '/design/$designId' });
  const { isLoaded } = useUser();

  // Generate a stable chatId for this design session
  const chatId = useMemo(() => generateUUID(), [designId]);

  // State for live nodes
  const [liveNodes, setLiveNodes] = useState<Map<string, LiveNodeType>>(new Map());

  // Load existing nodes from Convex
  const existingNodes = useQuery(api.nodes.getNodesByDesign, { designId });

  // Handle live node updates from chat
  const handleNodeUpdate = useCallback((node: LiveNodeType) => {
    console.log('🔄 Node update received:', node.id, 'streaming:', node.isStreaming);
    setLiveNodes(prev => {
      const updated = new Map(prev);
      updated.set(node.id, node);
      return updated;
    });
  }, []);

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Combine live nodes with existing nodes
  const allNodes = useMemo(() => {
    const nodes: LiveNodeType[] = [];
    
    // Add existing nodes from Convex
    if (existingNodes) {
      existingNodes.forEach(node => {
        // Skip if we have a live version
        if (!liveNodes.has(node.nodeId)) {
          nodes.push({
            id: node.nodeId,
            artifactId: node.artifactId,
            title: node.title,
            htmlContent: node.htmlContent,
            isStreaming: false,
          });
        }
      });
    }
    
    // Add live nodes
    liveNodes.forEach(node => nodes.push(node));
    
    console.log('📊 Total nodes to render:', nodes.length, 'Live:', liveNodes.size, 'Existing:', existingNodes?.length || 0);
    
    return nodes;
  }, [existingNodes, liveNodes]);

  return (
    <div className="pt-14">
      <SidebarProvider defaultOpen={true}>
        <Sidebar 
          collapsible="offcanvas"
          className="top-14 h-[calc(100vh-3.5rem)]"
          style={{ '--sidebar-width': '60rem' } as React.CSSProperties}
        >
          <SidebarContent>
            <ChatBox 
              designId={designId} 
              initialPrompt={prompt} 
              chatId={chatId}
              onNodeUpdate={handleNodeUpdate}
            />
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset>
          {allNodes.length > 0 ? (
            <div className="p-6 flex flex-wrap gap-6 min-h-screen">
              {allNodes.map(node => (
                <LiveNode
                  key={node.id}
                  id={node.id}
                  title={node.title}
                  htmlContent={node.htmlContent}
                  isStreaming={node.isStreaming}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center text-muted-foreground">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg">No designs yet</p>
                <p className="text-sm mt-2">Start chatting to create your first design</p>
              </div>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}