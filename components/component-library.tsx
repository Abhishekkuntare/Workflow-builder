"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Database, Brain, Monitor, Plus } from "lucide-react"

interface ComponentLibraryProps {
  onAddNode: (type: string) => void
}

const workflowComponents = [
  {
    type: "UserQuery",
    name: "User Query",
    description: "Accepts user input and serves as the entry point for workflows",
    icon: MessageCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200",
  },
  {
    type: "KnowledgeBase",
    name: "Knowledge Base",
    description: "Upload documents, extract text, and generate embeddings for context retrieval",
    icon: Database,
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200",
  },
  {
    type: "LLMEngine",
    name: "LLM Engine",
    description: "Process queries using language models like GPT or Gemini with optional context",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200",
  },
  {
    type: "Output",
    name: "Output",
    description: "Display final responses in a chat interface with follow-up capabilities",
    icon: Monitor,
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    borderColor: "border-orange-200",
  },
]

export function ComponentLibrary({ onAddNode }: ComponentLibraryProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Components</h2>
        <p className="text-sm text-muted-foreground mt-1">Drag components to build your workflow</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {workflowComponents.map((component) => {
            const Icon = component.icon
            return (
              <Card
                key={component.type}
                className={`cursor-pointer transition-all duration-200 ${component.bgColor} ${component.borderColor} border-2 hover:shadow-md`}
                onClick={() => onAddNode(component.type)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-md bg-white/80 ${component.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-medium">{component.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs leading-relaxed">{component.description}</CardDescription>
                  <Button size="sm" variant="ghost" className="w-full mt-2 h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Add to Canvas
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Separator className="my-6" />

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-sidebar-foreground">Quick Tips</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Start with a User Query component</p>
            <p>• Connect components with arrows</p>
            <p>• End with an Output component</p>
            <p>• Configure each component after adding</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
