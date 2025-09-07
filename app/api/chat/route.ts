import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { workflowEngine } from "@/lib/workflow-engine"

export async function POST(request: NextRequest) {
  try {
    const { workflowId, message, sessionId } = await request.json()

    if (!workflowId || !message) {
      return NextResponse.json({ error: "Workflow ID and message are required" }, { status: 400 })
    }

    // Create new session if not provided
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const session = await db.createChatSession(workflowId)
      currentSessionId = session.id
    }

    // Add user message
    await db.addChatMessage(currentSessionId, message, undefined, "user")

    // Get workflow definition
    const workflow = await db.getWorkflow(workflowId)
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    console.log("[v0] Processing message through workflow:", workflow.name)

    // Execute workflow
    const response = await workflowEngine.executeWorkflow(workflow.definition, workflowId, currentSessionId, message)

    // Add assistant response
    await db.addChatMessage(currentSessionId, message, response, "assistant")

    return NextResponse.json({
      response,
      sessionId: currentSessionId,
      workflowStep: "Workflow Complete",
    })
  } catch (error) {
    console.error("Error processing chat message:", error)
    return NextResponse.json(
      {
        error: "Failed to process message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
