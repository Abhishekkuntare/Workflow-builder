import { db } from "./database"

export interface WorkflowComponent {
  id: string
  type: "UserQuery" | "KnowledgeBase" | "LLMEngine" | "Output"
  config: any
  position: { x: number; y: number }
}

export interface WorkflowEdge {
  source: string
  target: string
}

export interface WorkflowDefinition {
  nodes: WorkflowComponent[]
  edges: WorkflowEdge[]
}

export interface ExecutionContext {
  workflowId: number
  sessionId: number
  userQuery: string
  currentData: any
  executionLog: Array<{
    componentId: string
    componentType: string
    input: any
    output: any
    executionTime: number
  }>
}

export class WorkflowEngine {
  private async executeUserQuery(component: WorkflowComponent, context: ExecutionContext): Promise<any> {
    const startTime = Date.now()

    // User Query component simply passes through the user input
    const output = {
      query: context.userQuery,
      timestamp: new Date().toISOString(),
      config: component.config,
    }

    const executionTime = Date.now() - startTime

    // Log execution
    await db.logExecution(
      context.workflowId,
      context.sessionId,
      "UserQuery",
      { query: context.userQuery },
      output,
      executionTime,
    )

    context.executionLog.push({
      componentId: component.id,
      componentType: "UserQuery",
      input: { query: context.userQuery },
      output,
      executionTime,
    })

    return output
  }

  private async executeKnowledgeBase(component: WorkflowComponent, context: ExecutionContext): Promise<any> {
    const startTime = Date.now()

    try {
      // Get documents for this workflow
      const documents = await db.getDocumentsByWorkflow(context.workflowId)

      if (documents.length === 0) {
        const output = {
          context: "",
          message: "No documents found in knowledge base",
          documentsCount: 0,
        }

        const executionTime = Date.now() - startTime
        await db.logExecution(
          context.workflowId,
          context.sessionId,
          "KnowledgeBase",
          context.currentData,
          output,
          executionTime,
        )

        return output
      }

      // Simple text search for relevant context (in production, use vector embeddings)
      const query = context.currentData?.query || context.userQuery
      const relevantDocs = documents.filter((doc) => doc.content.toLowerCase().includes(query.toLowerCase()))

      const contextText = relevantDocs
        .slice(0, 3) // Limit to top 3 documents
        .map((doc) => `Document: ${doc.filename}\n${doc.content.substring(0, 1000)}`)
        .join("\n\n")

      const output = {
        context: contextText,
        relevantDocuments: relevantDocs.length,
        totalDocuments: documents.length,
        query: query,
      }

      const executionTime = Date.now() - startTime
      await db.logExecution(
        context.workflowId,
        context.sessionId,
        "KnowledgeBase",
        context.currentData,
        output,
        executionTime,
      )

      context.executionLog.push({
        componentId: component.id,
        componentType: "KnowledgeBase",
        input: context.currentData,
        output,
        executionTime,
      })

      return output
    } catch (error) {
      console.error("KnowledgeBase execution error:", error)
      const output = {
        context: "",
        error: "Failed to retrieve knowledge base context",
        message: error instanceof Error ? error.message : "Unknown error",
      }

      const executionTime = Date.now() - startTime
      await db.logExecution(
        context.workflowId,
        context.sessionId,
        "KnowledgeBase",
        context.currentData,
        output,
        executionTime,
        "error",
        output.message,
      )

      return output
    }
  }

  private async executeLLMEngine(component: WorkflowComponent, context: ExecutionContext): Promise<any> {
    const startTime = Date.now()

    try {
      const config = component.config || {}
      const provider = config.provider || "openai"
      const model = config.model || "gpt-4"
      const temperature = config.temperature || 0.7
      const systemPrompt = config.systemPrompt || "You are a helpful assistant."

      // Build the prompt
      const userQuery = context.currentData?.query || context.userQuery
      const knowledgeContext = context.currentData?.context || ""

      let prompt = userQuery
      if (knowledgeContext) {
        prompt = `Context from knowledge base:\n${knowledgeContext}\n\nUser question: ${userQuery}\n\nPlease answer the question based on the provided context.`
      }

      // Simulate LLM API call (replace with actual API integration)
      const response = await this.callLLMAPI(provider, model, systemPrompt, prompt, temperature)

      const output = {
        response: response,
        model: model,
        provider: provider,
        prompt: prompt,
        hasContext: !!knowledgeContext,
        contextLength: knowledgeContext.length,
      }

      const executionTime = Date.now() - startTime
      await db.logExecution(
        context.workflowId,
        context.sessionId,
        "LLMEngine",
        context.currentData,
        output,
        executionTime,
      )

      context.executionLog.push({
        componentId: component.id,
        componentType: "LLMEngine",
        input: context.currentData,
        output,
        executionTime,
      })

      return output
    } catch (error) {
      console.error("LLMEngine execution error:", error)
      const output = {
        response: "I apologize, but I encountered an error processing your request. Please try again.",
        error: "LLM execution failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }

      const executionTime = Date.now() - startTime
      await db.logExecution(
        context.workflowId,
        context.sessionId,
        "LLMEngine",
        context.currentData,
        output,
        executionTime,
        "error",
        output.message,
      )

      return output
    }
  }

  private async executeOutput(component: WorkflowComponent, context: ExecutionContext): Promise<any> {
    const startTime = Date.now()

    // Output component formats and returns the final response
    const config = component.config || {}
    const showTimestamp = config.showTimestamp !== false
    const format = config.format || "chat"

    let finalResponse = context.currentData?.response || "No response generated"

    if (showTimestamp) {
      finalResponse += `\n\n_Generated at ${new Date().toLocaleTimeString()}_`
    }

    const output = {
      finalResponse: finalResponse,
      format: format,
      executionSummary: {
        totalSteps: context.executionLog.length,
        totalExecutionTime: context.executionLog.reduce((sum, log) => sum + log.executionTime, 0),
        componentsUsed: context.executionLog.map((log) => log.componentType),
      },
    }

    const executionTime = Date.now() - startTime
    await db.logExecution(context.workflowId, context.sessionId, "Output", context.currentData, output, executionTime)

    context.executionLog.push({
      componentId: component.id,
      componentType: "Output",
      input: context.currentData,
      output,
      executionTime,
    })

    return output
  }

  private async callLLMAPI(
    provider: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
  ): Promise<string> {
    // Simulate API call - replace with actual LLM integration
    console.log(`[v0] Calling ${provider} ${model} with temperature ${temperature}`)
    console.log(`[v0] System prompt: ${systemPrompt}`)
    console.log(`[v0] User prompt: ${userPrompt}`)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Return a simulated response
    return `This is a simulated response from ${model}. In a real implementation, this would be the actual LLM response to: "${userPrompt.substring(0, 100)}..."`
  }

  public async executeWorkflow(
    workflowDefinition: WorkflowDefinition,
    workflowId: number,
    sessionId: number,
    userQuery: string,
  ): Promise<string> {
    const context: ExecutionContext = {
      workflowId,
      sessionId,
      userQuery,
      currentData: null,
      executionLog: [],
    }

    try {
      // Build execution order based on workflow edges
      const executionOrder = this.buildExecutionOrder(workflowDefinition)

      console.log(`[v0] Executing workflow with ${executionOrder.length} components`)

      // Execute components in order
      for (const componentId of executionOrder) {
        const component = workflowDefinition.nodes.find((n) => n.id === componentId)
        if (!component) continue

        console.log(`[v0] Executing component: ${component.type} (${componentId})`)

        switch (component.type) {
          case "UserQuery":
            context.currentData = await this.executeUserQuery(component, context)
            break
          case "KnowledgeBase":
            context.currentData = await this.executeKnowledgeBase(component, context)
            break
          case "LLMEngine":
            context.currentData = await this.executeLLMEngine(component, context)
            break
          case "Output":
            context.currentData = await this.executeOutput(component, context)
            break
        }
      }

      // Return the final response
      return context.currentData?.finalResponse || context.currentData?.response || "Workflow completed successfully"
    } catch (error) {
      console.error("[v0] Workflow execution error:", error)
      throw new Error(`Workflow execution failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private buildExecutionOrder(workflow: WorkflowDefinition): string[] {
    // Simple topological sort to determine execution order
    const nodes = workflow.nodes
    const edges = workflow.edges

    // Find the starting node (UserQuery with no incoming edges)
    const incomingEdges = new Map<string, string[]>()
    const outgoingEdges = new Map<string, string[]>()

    // Initialize maps
    nodes.forEach((node) => {
      incomingEdges.set(node.id, [])
      outgoingEdges.set(node.id, [])
    })

    // Build edge maps
    edges.forEach((edge) => {
      incomingEdges.get(edge.target)?.push(edge.source)
      outgoingEdges.get(edge.source)?.push(edge.target)
    })

    // Find starting nodes (no incoming edges)
    const startNodes = nodes.filter((node) => incomingEdges.get(node.id)?.length === 0)

    if (startNodes.length === 0) {
      // If no clear start, use UserQuery as default
      const userQueryNode = nodes.find((n) => n.type === "UserQuery")
      return userQueryNode ? [userQueryNode.id] : nodes.map((n) => n.id)
    }

    // Simple BFS traversal
    const visited = new Set<string>()
    const order: string[] = []
    const queue = [...startNodes.map((n) => n.id)]

    while (queue.length > 0) {
      const currentId = queue.shift()!
      if (visited.has(currentId)) continue

      visited.add(currentId)
      order.push(currentId)

      // Add connected nodes to queue
      const connected = outgoingEdges.get(currentId) || []
      connected.forEach((nodeId) => {
        if (!visited.has(nodeId)) {
          queue.push(nodeId)
        }
      })
    }

    // Add any remaining nodes
    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        order.push(node.id)
      }
    })

    return order
  }
}

export const workflowEngine = new WorkflowEngine()
