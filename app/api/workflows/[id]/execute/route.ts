import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { workflowEngine } from "@/lib/workflow-engine"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Get workflow
    const workflow = await db.getWorkflow(id)
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    // Create temporary session for execution
    const session = await db.createChatSession(id)

    console.log(`[v0] Executing workflow ${workflow.name} with query: ${query}`)

    // Execute workflow
    const response = await workflowEngine.executeWorkflow(workflow.definition, id, session.id, query)

    return NextResponse.json({
      response,
      workflowId: id,
      sessionId: session.id,
      executedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error executing workflow:", error)
    return NextResponse.json(
      {
        error: "Failed to execute workflow",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
