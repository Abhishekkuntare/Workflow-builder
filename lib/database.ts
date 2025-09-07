import { MongoClient, type Db, type Collection, ObjectId } from "mongodb"

// MongoDB connection
let client: MongoClient
let databaseConnection: Db

const connectToDatabase = async (): Promise<Db> => {
  if (databaseConnection) {
    return databaseConnection
  }

  try {
    client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/workflow-builder")
    await client.connect()
    databaseConnection = client.db("workflow-builder")
    console.log("Connected to MongoDB")
    return databaseConnection
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

export interface Workflow {
  _id?: ObjectId
  id?: string
  name: string
  description?: string
  definition: any // JSON workflow structure
  created_at: Date
  updated_at: Date
  isActive: boolean
}

export interface Document {
  _id?: ObjectId
  id?: string
  filename: string
  content: string
  file_type: string
  file_size: number
  upload_date: Date
  workflow_id: string
}

export interface ChatSession {
  _id?: ObjectId
  id?: string
  workflow_id: string
  created_at: Date
}

export interface ChatMessage {
  _id?: ObjectId
  id?: string
  session_id: string
  message: string
  response?: string
  message_type: "user" | "assistant"
  created_at: Date
}

export interface ExecutionLog {
  _id?: ObjectId
  id?: string
  workflow_id: string
  session_id: string
  component_type: string
  input_data: any
  output_data: any
  execution_time_ms: number
  status: "success" | "error" | "pending"
  error_message?: string
  created_at: Date
}

// Database operations
export const database = {
  // Workflow operations
  async createWorkflow(data: {
    name: string
    description: string
    definition: string
    isActive: boolean
  }): Promise<Workflow> {
    const db = await connectToDatabase()
    const workflows: Collection<Workflow> = db.collection("workflows")

    const workflow: Workflow = {
      name: data.name,
      description: data.description,
      definition: JSON.parse(data.definition),
      isActive: data.isActive,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await workflows.insertOne(workflow)
    return { ...workflow, _id: result.insertedId, id: result.insertedId.toString() }
  },

  async getWorkflows(): Promise<Workflow[]> {
    const db = await connectToDatabase()
    const workflows: Collection<Workflow> = db.collection("workflows")
    const result = await workflows.find({}).sort({ created_at: -1 }).toArray()
    return result.map((w) => ({ ...w, id: w._id?.toString() }))
  },

  async getWorkflow(id: string): Promise<Workflow | null> {
    const db = await connectToDatabase()
    const workflows: Collection<Workflow> = db.collection("workflows")
    const result = await workflows.findOne({ _id: new ObjectId(id) })
    return result ? { ...result, id: result._id?.toString() } : null
  },

  async getAllWorkflows(): Promise<Workflow[]> {
    return this.getWorkflows()
  },

  async updateWorkflow(id: string, name: string, description: string, definition: any): Promise<Workflow> {
    const db = await connectToDatabase()
    const workflows: Collection<Workflow> = db.collection("workflows")

    const result = await workflows.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          description,
          definition,
          updated_at: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result) throw new Error("Workflow not found")
    return { ...result, id: result._id?.toString() }
  },

  async deleteWorkflow(id: string): Promise<void> {
    const db = await connectToDatabase()
    const workflows: Collection<Workflow> = db.collection("workflows")
    await workflows.deleteOne({ _id: new ObjectId(id) })
  },

  // Document operations
  async createDocument(
    filename: string,
    content: string,
    fileType: string,
    fileSize: number,
    workflowId: string,
  ): Promise<Document> {
    const db = await connectToDatabase()
    const documents: Collection<Document> = db.collection("documents")

    const document: Document = {
      filename,
      content,
      file_type: fileType,
      file_size: fileSize,
      workflow_id: workflowId,
      upload_date: new Date(),
    }

    const result = await documents.insertOne(document)
    return { ...document, _id: result.insertedId, id: result.insertedId.toString() }
  },

  async getDocumentsByWorkflow(workflowId: string): Promise<Document[]> {
    const db = await connectToDatabase()
    const documents: Collection<Document> = db.collection("documents")
    const result = await documents.find({ workflow_id: workflowId }).toArray()
    return result.map((d) => ({ ...d, id: d._id?.toString() }))
  },

  // Chat operations
  async createChatSession(workflowId: string): Promise<ChatSession> {
    const db = await connectToDatabase()
    const sessions: Collection<ChatSession> = db.collection("chat_sessions")

    const session: ChatSession = {
      workflow_id: workflowId,
      created_at: new Date(),
    }

    const result = await sessions.insertOne(session)
    return { ...session, _id: result.insertedId, id: result.insertedId.toString() }
  },

  async addChatMessage(
    sessionId: string,
    message: string,
    response?: string,
    messageType: "user" | "assistant" = "user",
  ): Promise<ChatMessage> {
    const db = await connectToDatabase()
    const messages: Collection<ChatMessage> = db.collection("chat_messages")

    const chatMessage: ChatMessage = {
      session_id: sessionId,
      message,
      response,
      message_type: messageType,
      created_at: new Date(),
    }

    const result = await messages.insertOne(chatMessage)
    return { ...chatMessage, _id: result.insertedId, id: result.insertedId.toString() }
  },

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const db = await connectToDatabase()
    const messages: Collection<ChatMessage> = db.collection("chat_messages")
    const result = await messages.find({ session_id: sessionId }).sort({ created_at: 1 }).toArray()
    return result.map((m) => ({ ...m, id: m._id?.toString() }))
  },

  // Execution log operations
  async logExecution(
    workflowId: string,
    sessionId: string,
    componentType: string,
    inputData: any,
    outputData: any,
    executionTimeMs: number,
    status: "success" | "error" | "pending" = "success",
    errorMessage?: string,
  ): Promise<ExecutionLog> {
    const db = await connectToDatabase()
    const logs: Collection<ExecutionLog> = db.collection("execution_logs")

    const log: ExecutionLog = {
      workflow_id: workflowId,
      session_id: sessionId,
      component_type: componentType,
      input_data: inputData,
      output_data: outputData,
      execution_time_ms: executionTimeMs,
      status,
      error_message: errorMessage,
      created_at: new Date(),
    }

    const result = await logs.insertOne(log)
    return { ...log, _id: result.insertedId, id: result.insertedId.toString() }
  },
}

// Export for backward compatibility
export const db = database
export default database
