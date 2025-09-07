"use client"

import { useState, useEffect } from "react"
import type { Node } from "@xyflow/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Upload, FileText, Zap } from "lucide-react"

interface ConfigurationPanelProps {
  selectedNode: Node | null
  onUpdateConfig: (nodeId: string, config: any) => void
}

export function ConfigurationPanel({ selectedNode, onUpdateConfig }: ConfigurationPanelProps) {
  const [config, setConfig] = useState<any>({})

  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data.config || {})
    }
  }, [selectedNode])

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    if (selectedNode) {
      onUpdateConfig(selectedNode.id, newConfig)
    }
  }

  const renderUserQueryConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="placeholder" className="text-sm font-medium">
          Input Placeholder
        </Label>
        <Input
          id="placeholder"
          value={config.placeholder || ""}
          onChange={(e) => handleConfigChange("placeholder", e.target.value)}
          placeholder="Enter your question..."
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="maxLength" className="text-sm font-medium">
          Max Input Length
        </Label>
        <Input
          id="maxLength"
          type="number"
          value={config.maxLength || ""}
          onChange={(e) => handleConfigChange("maxLength", Number.parseInt(e.target.value) || 1000)}
          placeholder="1000"
          className="mt-1"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="required" className="text-sm font-medium">
          Required Field
        </Label>
        <Switch
          id="required"
          checked={config.required || false}
          onCheckedChange={(checked) => handleConfigChange("required", checked)}
        />
      </div>
    </div>
  )

  const renderKnowledgeBaseConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Supported File Types</Label>
        <Select value={config.fileTypes || "pdf"} onValueChange={(value) => handleConfigChange("fileTypes", value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select file types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF Only</SelectItem>
            <SelectItem value="text">Text Files</SelectItem>
            <SelectItem value="all">All Document Types</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="chunkSize" className="text-sm font-medium">
          Text Chunk Size
        </Label>
        <Input
          id="chunkSize"
          type="number"
          value={config.chunkSize || ""}
          onChange={(e) => handleConfigChange("chunkSize", Number.parseInt(e.target.value) || 1000)}
          placeholder="1000"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="maxDocuments" className="text-sm font-medium">
          Max Documents
        </Label>
        <Input
          id="maxDocuments"
          type="number"
          value={config.maxDocuments || ""}
          onChange={(e) => handleConfigChange("maxDocuments", Number.parseInt(e.target.value) || 10)}
          placeholder="10"
          className="mt-1"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="autoProcess" className="text-sm font-medium">
          Auto-process uploads
        </Label>
        <Switch
          id="autoProcess"
          checked={config.autoProcess || true}
          onCheckedChange={(checked) => handleConfigChange("autoProcess", checked)}
        />
      </div>
    </div>
  )

  const renderLLMEngineConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">LLM Provider</Label>
        <Select value={config.provider || "openai"} onValueChange={(value) => handleConfigChange("provider", value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select LLM provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI GPT</SelectItem>
            <SelectItem value="gemini">Google Gemini</SelectItem>
            <SelectItem value="claude">Anthropic Claude</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Model</Label>
        <Select value={config.model || "gpt-4"} onValueChange={(value) => handleConfigChange("model", value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="temperature" className="text-sm font-medium">
          Temperature ({config.temperature || 0.7})
        </Label>
        <Input
          id="temperature"
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={config.temperature || 0.7}
          onChange={(e) => handleConfigChange("temperature", Number.parseFloat(e.target.value))}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="systemPrompt" className="text-sm font-medium">
          System Prompt
        </Label>
        <Textarea
          id="systemPrompt"
          value={config.systemPrompt || ""}
          onChange={(e) => handleConfigChange("systemPrompt", e.target.value)}
          placeholder="You are a helpful assistant..."
          className="mt-1 min-h-[80px]"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="useWebSearch" className="text-sm font-medium">
          Enable Web Search
        </Label>
        <Switch
          id="useWebSearch"
          checked={config.useWebSearch || false}
          onCheckedChange={(checked) => handleConfigChange("useWebSearch", checked)}
        />
      </div>
    </div>
  )

  const renderOutputConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Display Format</Label>
        <Select value={config.format || "chat"} onValueChange={(value) => handleConfigChange("format", value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select display format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chat">Chat Interface</SelectItem>
            <SelectItem value="card">Card Layout</SelectItem>
            <SelectItem value="list">List View</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="showTimestamp" className="text-sm font-medium">
          Show Timestamps
        </Label>
        <Switch
          id="showTimestamp"
          checked={config.showTimestamp || true}
          onCheckedChange={(checked) => handleConfigChange("showTimestamp", checked)}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="allowFollowUp" className="text-sm font-medium">
          Allow Follow-up Questions
        </Label>
        <Switch
          id="allowFollowUp"
          checked={config.allowFollowUp || true}
          onCheckedChange={(checked) => handleConfigChange("allowFollowUp", checked)}
        />
      </div>
      <div>
        <Label htmlFor="maxHistory" className="text-sm font-medium">
          Max Chat History
        </Label>
        <Input
          id="maxHistory"
          type="number"
          value={config.maxHistory || ""}
          onChange={(e) => handleConfigChange("maxHistory", Number.parseInt(e.target.value) || 50)}
          placeholder="50"
          className="mt-1"
        />
      </div>
    </div>
  )

  const getComponentIcon = (type: string) => {
    switch (type) {
      case "UserQuery":
        return <Settings className="w-4 h-4" />
      case "KnowledgeBase":
        return <Upload className="w-4 h-4" />
      case "LLMEngine":
        return <Zap className="w-4 h-4" />
      case "Output":
        return <FileText className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  const renderConfigContent = () => {
    if (!selectedNode) return null

    switch (selectedNode.data.componentType) {
      case "UserQuery":
        return renderUserQueryConfig()
      case "KnowledgeBase":
        return renderKnowledgeBaseConfig()
      case "LLMEngine":
        return renderLLMEngineConfig()
      case "Output":
        return renderOutputConfig()
      default:
        return <p className="text-sm text-muted-foreground">No configuration available for this component.</p>
    }
  }

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">Select a component to configure</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Click on a component in the canvas to configure its settings
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-2">
          {getComponentIcon(selectedNode.data.componentType)}
          <h2 className="text-lg font-semibold text-sidebar-foreground">Configuration</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {selectedNode.data.componentType}
          </Badge>
          <span className="text-sm text-muted-foreground">{selectedNode.data.label}</span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Component Settings</CardTitle>
            <CardDescription className="text-sm">
              Configure the behavior and properties of this component
            </CardDescription>
          </CardHeader>
          <CardContent>{renderConfigContent()}</CardContent>
        </Card>

        <Separator className="my-4" />

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-sidebar-foreground">Component Info</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>ID: {selectedNode.id}</p>
            <p>Type: {selectedNode.data.componentType}</p>
            <p>
              Position: ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
