import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, definition } = body

    if (!name || !definition) {
      return NextResponse.json({ error: "Name and definition are required" }, { status: 400 })
    }

    const workflow = await db.createWorkflow({
      name,
      description: description || "",
      definition: JSON.stringify(definition),
      isActive: true,
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("Error creating workflow:", error)
    if (error instanceof Error) {
      if (error.message.includes("MONGODB_URI") || error.message.includes("connection")) {
        return NextResponse.json(
          {
            error: "Database connection failed. Please check MONGODB_URI environment variable.",
          },
          { status: 500 },
        )
      }
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const workflows = await db.getWorkflows()
    return NextResponse.json(workflows)
  } catch (error) {
    console.error("Error fetching workflows:", error)
    return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 })
  }
}
