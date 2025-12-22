import {
  createFileRoute,
  useParams,
  useLocation,
} from "@tanstack/react-router";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { ChatBox } from "../components/ChatBox";
import { useUser } from "@clerk/clerk-react";
import { generateUUID } from "../lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { FlowCanvas } from "../components/FlowCanvas";
import { ThemeToggle } from "../components/ThemeToggle";

export const Route = createFileRoute("/design/$designId")({
  component: DesignPage,
});

function DesignPage() {
  const { designId } = useParams({ from: "/design/$designId" });
  const location = useLocation();
  // @ts-ignore
  const prompt = location.state?.prompt as string | undefined;
  const { isLoaded } = useUser();

  const chatId = useMemo(() => generateUUID(), [designId]);

  const [liveNodes, setLiveNodes] = useState<Map<string, any>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNodeUpdate = useCallback((incomingNodes: Map<string, any>) => {
    // Merge incoming nodes with existing liveNodes (additive update)
    setLiveNodes((prev) => {
      const merged = new Map(prev);
      console.log("🔄 handleNodeUpdate:", {
        incomingCount: incomingNodes.size,
        incomingIds: Array.from(incomingNodes.keys()),
        currentLiveCount: prev.size,
        currentLiveIds: Array.from(prev.keys()),
      });

      incomingNodes.forEach((node, key) => {
        const existing = merged.get(key);
        if (existing) {
          merged.set(key, {
            ...existing,
            ...node,
            x: node.x !== undefined ? node.x : existing.x,
            y: node.y !== undefined ? node.y : existing.y,
          });
        } else {
          console.log("  ✨ Adding NEW live node:", key, "at", {
            x: node.x,
            y: node.y,
          });
          merged.set(key, node);
        }
      });

      console.log("📍 Live nodes after update:", Array.from(merged.keys()));
      return merged;
    });
  }, []);

  const handleGeneratingChange = useCallback((generating: boolean) => {
    setIsGenerating(generating);
  }, []);

  const existingNodes = useQuery(api.nodes.getNodesByDesign, { designId });
  const existingMessages = useQuery(api.messages.getMessages, { designId });

  // Track the latest node count in a ref for accurate position calculation
  const nodeCountRef = useRef(0);
  const liveNodesRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    nodeCountRef.current = existingNodes?.length || 0;
    console.log("📊 Updated nodeCountRef:", nodeCountRef.current);
  }, [existingNodes]);

  useEffect(() => {
    liveNodesRef.current = liveNodes;
  }, [liveNodes]);

  // Clean up liveNodes when they're confirmed in the database
  // Only clean up nodes that are NOT streaming and exist in DB
  useEffect(() => {
    if (!existingNodes) return;

    // Don't clean up while generating
    if (isGenerating) {
      console.log("⏸️ Skipping cleanup - still generating");
      return;
    }

    // Only clean up after generation is complete
    const timeoutId = setTimeout(() => {
      setLiveNodes((prev) => {
        if (prev.size === 0) return prev;

        const updated = new Map(prev);
        let cleaned = false;

        console.log(
          "🧹 Running cleanup check. Live nodes:",
          Array.from(prev.keys()),
          "DB nodes:",
          existingNodes.map((n) => n.nodeId)
        );

        // Remove nodes from liveNodes if they exist in DB and are not streaming
        prev.forEach((node, nodeId) => {
          if (!node.isStreaming) {
            const existsInDb = existingNodes.some(
              (dbNode) => dbNode.nodeId === nodeId
            );
            if (existsInDb) {
              updated.delete(nodeId);
              cleaned = true;
              console.log("🧹 Cleaned up live node (now in DB):", nodeId);
            }
          } else {
            console.log("⏳ Keeping streaming node:", nodeId);
          }
        });

        return cleaned ? updated : prev;
      });
    }, 3000); // Wait 3 seconds after generation completes before cleanup

    return () => clearTimeout(timeoutId);
  }, [existingNodes, isGenerating]);

  const allNodes = useMemo(() => {
    const nodesMap = new Map<string, any>();

    console.log("🔍 Building nodes list:", {
      existingNodesCount: existingNodes?.length || 0,
      liveNodesCount: liveNodes.size,
      existingNodeIds: existingNodes?.map((n) => n.nodeId) || [],
      liveNodeIds: Array.from(liveNodes.keys()),
    });

    // First, add all existing nodes from database
    if (existingNodes) {
      existingNodes.forEach((node) => {
        nodesMap.set(node.nodeId, {
          id: node.nodeId,
          artifactId: node.artifactId,
          title: node.title,
          htmlContent: node.htmlContent,
          isStreaming: false,
          x: node.x,
          y: node.y,
        });
      });
    }

    // Then overlay live nodes (streaming or recently completed)
    liveNodes.forEach((node, nodeId) => {
      const existing = nodesMap.get(nodeId);

      // Merge with existing node if present, otherwise use live node data
      nodesMap.set(nodeId, {
        ...existing,
        ...node,
        id: nodeId,
        // Preserve position from existing if live node doesn't have it
        x:
          node.x !== undefined
            ? node.x
            : (existing?.x ?? (nodesMap.size % 3) * 450),
        y:
          node.y !== undefined
            ? node.y
            : (existing?.y ?? Math.floor(nodesMap.size / 3) * 850),
      });
    });

    const nodes = Array.from(nodesMap.values());
    console.log(
      "📊 Final nodes to render:",
      nodes.length,
      nodes.map((n) => ({
        id: n.id,
        title: n.title,
        streaming: n.isStreaming,
        position: { x: n.x, y: n.y },
      }))
    );

    return nodes;
  }, [existingNodes, liveNodes]);

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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col h-screen w-full bg-linear-to-br from-background via-muted/20 to-background">
        <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/80 backdrop-blur-xl px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="w-px h-6 bg-border mx-2" />
            <span className="font-semibold text-sm text-foreground">
              Design Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              ID: {designId.slice(0, 8)}
            </div>
            <div className="w-px h-6 bg-border mx-2" />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex h-full pt-14">
          <Sidebar
            className="border-r border-sidebar-border shadow-none !top-14 !h-[calc(100svh-3.5rem)] bg-sidebar/60 backdrop-blur-xl"
            style={
              {
                "--sidebar-width": "22rem",
                "--sidebar-width-icon": "3rem",
              } as React.CSSProperties
            }
          >
            <SidebarContent className="p-0 overflow-hidden flex flex-col h-full bg-transparent">
              <ChatBox
                designId={designId}
                chatId={chatId}
                messages={existingMessages}
                initialPrompt={prompt}
                onNodeUpdate={handleNodeUpdate}
                onGeneratingChange={handleGeneratingChange}
                getExistingNodeCount={() => {
                  // Return the count of nodes from DB + live nodes using refs for latest values
                  const dbCount = nodeCountRef.current;
                  const liveCount = liveNodesRef.current.size;
                  const total = Math.max(dbCount, liveCount);
                  console.log("🔢 getExistingNodeCount:", {
                    dbCount,
                    liveCount,
                    returning: total,
                  });
                  return total;
                }}
              />
            </SidebarContent>
          </Sidebar>

          <SidebarInset
            className="flex-1 overflow-hidden relative h-full"
            style={{ background: "transparent" }}
          >
            <div className="absolute inset-0">
              {allNodes.length > 0 ? (
                <FlowCanvas
                  key={`canvas-${allNodes.length}`}
                  nodes={allNodes}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 opacity-30"
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
                    <p className="text-lg text-muted-foreground">
                      No designs yet
                    </p>
                    <p className="text-sm mt-2 text-muted-foreground/60">
                      Start chatting to create your first design
                    </p>
                  </div>
                </div>
              )}
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
