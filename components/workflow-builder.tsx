"use client"

import type React from "react"
import { useState, useCallback } from "react"
import {
  ReactFlow,
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { ComponentLibrary } from "./component-library"
import { ConfigurationPanel } from "./configuration-panel"
import { WorkflowHeader } from "./workflow-header"
import { WorkflowNode } from "./workflow-node"
import { ChatInterface } from "./chat-interface"
import { Button } from "@/components/ui/button"
import { MessageSquare, Play } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable-panels"

const nodeTypes = {
  workflowNode: WorkflowNode,
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [workflowName, setWorkflowName] = useState("Untitled Workflow")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [currentWorkflowId, setCurrentWorkflowId] = useState<number | null>(null)

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const addNode = useCallback(
    (type: string) => {
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: "workflowNode",
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: {
          componentType: type,
          label: type.replace(/([A-Z])/g, " $1").trim(),
          config: {},
        },
      }
      setNodes((nds) => [...nds, newNode])
    },
    [setNodes],
  )

  const updateNodeConfig = useCallback(
    (nodeId: string, config: any) => {
      setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, config } } : node)))
    },
    [setNodes],
  )

  const validateWorkflow = useCallback(() => {
    // Basic validation: check if workflow has at least one node
    if (nodes.length === 0) {
      alert("Please add at least one component to your workflow.")
      return false
    }

    // Check for required components
    const hasUserQuery = nodes.some((node) => node.data.componentType === "UserQuery")
    const hasOutput = nodes.some((node) => node.data.componentType === "Output")

    if (!hasUserQuery) {
      alert("Workflow must include a User Query component.")
      return false
    }

    if (!hasOutput) {
      alert("Workflow must include an Output component.")
      return false
    }

    return true
  }, [nodes])

  const buildStack = useCallback(async () => {
    if (validateWorkflow()) {
      try {
        const workflowDefinition = {
          nodes: nodes.map((node) => ({
            id: node.id,
            type: node.data.componentType,
            config: node.data.config,
            position: node.position,
          })),
          edges: edges.map((edge) => ({
            source: edge.source,
            target: edge.target,
          })),
        }

        const response = await fetch("/api/workflows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: workflowName,
            description: `Workflow with ${nodes.length} components`,
            definition: workflowDefinition,
          }),
        })

        if (response.ok) {
          const workflow = await response.json()
          setCurrentWorkflowId(workflow.id)
          console.log("[v0] Workflow built successfully with ID:", workflow.id)
          alert("Workflow built successfully! You can now chat with your stack.")
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error("[v0] Error building workflow:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        alert(`Error building workflow: ${errorMessage}`)
      }
    }
  }, [nodes, edges, validateWorkflow, workflowName])

  const openChat = useCallback(() => {
    if (validateWorkflow()) {
      if (!currentWorkflowId) {
        alert("Please build your workflow first before chatting.")
        return
      }
      setIsChatOpen(true)
    }
  }, [validateWorkflow, currentWorkflowId])

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <WorkflowHeader
        workflowName={workflowName}
        onWorkflowNameChange={setWorkflowName}
        onBuildStack={buildStack}
        onOpenChat={openChat}
      />

      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Component Library Panel */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full border-r border-border bg-sidebar">
              <ComponentLibrary onAddNode={addNode} />
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Main Canvas Area */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full relative">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
                className="bg-background"
              >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-30" />
                <Controls className="bg-card border border-border" />
                <MiniMap className="bg-card border border-border" nodeColor="#8b5cf6" maskColor="rgba(0, 0, 0, 0.1)" />
              </ReactFlow>

              {/* Floating Action Buttons */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button onClick={buildStack} className="shadow-lg">
                  <Play className="w-4 h-4 mr-2" />
                  Build Stack
                </Button>
                <Button onClick={openChat} variant="outline" className="shadow-lg bg-transparent">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with Stack
                </Button>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Configuration Panel */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full border-l border-border bg-sidebar">
              <ConfigurationPanel selectedNode={selectedNode} onUpdateConfig={updateNodeConfig} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        workflowId={currentWorkflowId}
        workflowName={workflowName}
      />
    </div>
  )
}
