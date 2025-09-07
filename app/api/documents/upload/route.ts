import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const workflowId = Number.parseInt(formData.get("workflowId") as string)

    if (!file || !workflowId) {
      return NextResponse.json({ error: "File and workflow ID are required" }, { status: 400 })
    }

    // Read file content
    const buffer = await file.arrayBuffer()
    let content = ""

    // Extract text based on file type
    if (file.type === "application/pdf") {
      // In production, use PyMuPDF or similar for PDF extraction
      content = `[PDF Content] This is a placeholder for PDF text extraction. File: ${file.name}`
    } else if (file.type.startsWith("text/")) {
      content = Buffer.from(buffer).toString("utf-8")
    } else {
      content = `[${file.type}] Binary file content placeholder for ${file.name}`
    }

    // Store document in database
    const document = await db.createDocument(file.name, content, file.type, file.size, workflowId)

    console.log(`[v0] Document uploaded: ${file.name} (${file.size} bytes)`)

    // In production, generate embeddings here
    // await generateEmbeddings(document.id, content);

    return NextResponse.json(
      {
        ...document,
        message: "Document uploaded and processed successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}
