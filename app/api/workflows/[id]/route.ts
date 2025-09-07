import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workflowId = Number.parseInt(params.id)

    if (isNaN(workflowId)) {
      return NextResponse.json({ error: "Invalid workflow ID" }, { status: 400 })
    }

    const workflow = await db.getWorkflow(workflowId)

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("Error fetching workflow:", error)
    return NextResponse.json({ error: "Failed to fetch workflow" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workflowId = Number.parseInt(params.id)
    const body = await request.json()

    if (isNaN(workflowId)) {
      return NextResponse.json({ error: "Invalid workflow ID" }, { status: 400 })
    }

    const { name, description, definition, isActive } = body

    const workflow = await db.updateWorkflow(workflowId, {
      name,
      description,
      definition: definition ? JSON.stringify(definition) : undefined,
      isActive,
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("Error updating workflow:", error)
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workflowId = Number.parseInt(params.id)

    if (isNaN(workflowId)) {
      return NextResponse.json({ error: "Invalid workflow ID" }, { status: 400 })
    }

    await db.deleteWorkflow(workflowId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting workflow:", error)
    return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 })
  }
}
