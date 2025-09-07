"use client"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Database, Brain, Monitor, Settings } from "lucide-react"

const componentIcons = {
  UserQuery: MessageCircle,
  KnowledgeBase: Database,
  LLMEngine: Brain,
  Output: Monitor,
}

const componentColors = {
  UserQuery: "bg-blue-100 border-blue-300 text-blue-800",
  KnowledgeBase: "bg-green-100 border-green-300 text-green-800",
  LLMEngine: "bg-purple-100 border-purple-300 text-purple-800",
  Output: "bg-orange-100 border-orange-300 text-orange-800",
}

export function WorkflowNode({ data, selected }: NodeProps) {
  const Icon = componentIcons[data.componentType as keyof typeof componentIcons] || Settings
  const colorClass =
    componentColors[data.componentType as keyof typeof componentColors] || "bg-gray-100 border-gray-300 text-gray-800"

  return (
    <Card
      className={`min-w-[180px] p-3 ${selected ? "ring-2 ring-primary" : ""} transition-all duration-200 hover:shadow-md`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-primary border-2 border-background" />

      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-md ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-medium text-sm text-foreground">{data.label}</span>
      </div>

      <div className="text-xs text-muted-foreground mb-2">{data.componentType}</div>

      {Object.keys(data.config || {}).length > 0 && (
        <Badge variant="secondary" className="text-xs">
          Configured
        </Badge>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-primary border-2 border-background" />
    </Card>
  )
}
