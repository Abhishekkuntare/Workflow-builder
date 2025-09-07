"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, FolderOpen, Settings, Play, MessageSquare } from "lucide-react"

interface WorkflowHeaderProps {
  workflowName: string
  onWorkflowNameChange: (name: string) => void
  onBuildStack: () => void
  onOpenChat: () => void
}

export function WorkflowHeader({ workflowName, onWorkflowNameChange, onBuildStack, onOpenChat }: WorkflowHeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">Workflow Builder</h1>
        <div className="w-px h-6 bg-border" />
        <Input
          value={workflowName}
          onChange={(e) => onWorkflowNameChange(e.target.value)}
          className="w-64 h-8 text-sm"
          placeholder="Enter workflow name..."
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <FolderOpen className="w-4 h-4 mr-2" />
          Open
        </Button>
        <Button variant="ghost" size="sm">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <div className="w-px h-6 bg-border mx-2" />
        <Button onClick={onBuildStack} size="sm">
          <Play className="w-4 h-4 mr-2" />
          Build Stack
        </Button>
        <Button onClick={onOpenChat} variant="outline" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
