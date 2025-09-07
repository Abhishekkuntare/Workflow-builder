🧩 Intelligent Workflow Builder

A full-stack no-code/low-code web application that lets users visually build and interact with intelligent workflows.

Users can drag & drop components (User Query, Knowledge Base, LLM Engine, Output) to define workflows, then chat with the system. The workflow processes queries using embeddings, vector search, LLMs, and optionally web search.

🚀 Tech Stack

Frontend: React.js + React Flow + Tailwind

Backend: FastAPI

Database: MongoDB (stores workflow configs, documents metadata, chat logs)

Vector Store: ChromaDB

Embeddings: OpenAI Embeddings, Gemini embeddings

LLMs: OpenAI GPT, Gemini

Web Search Tool: SerpAPI / Brave API

Text Extraction: PyMuPDF

Containerization: Docker

(Optional) Orchestration: Kubernetes (minikube / GKE / EKS)

📦 Features

Drag & drop workflow builder with React Flow

Four core components:

User Query Component – entry point for queries

KnowledgeBase Component – upload PDFs, extract text, embed, store in Chroma

LLM Engine Component – generate responses with GPT/Gemini, optional web search

Output Component – chat interface with history

Workflow validation and execution

Chat with the workflow

Document upload and retrieval

Real-time embeddings + context injection into LLM

Extensible design (add new components easily)

🗂️ Project Structure
intelligent-workflow-builder/
│── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── routes/
│   │   │   ├── documents.py     # Upload / manage docs
│   │   │   ├── workflows.py     # Save / load workflow definitions
│   │   │   ├── chat.py          # Run workflow + chat
│   │   ├── services/
│   │   │   ├── embeddings.py    # Generate embeddings
│   │   │   ├── chromadb.py      # ChromaDB vector store
│   │   │   ├── llm.py           # GPT / Gemini integration
│   │   └── db.py                # MongoDB connection
│   ├── Dockerfile
│   └── requirements.txt
│
│── frontend/
│   ├── src/
│   │   ├── components/          # React Flow nodes, Chat UI
│   │   ├── pages/               # Main builder page
│   │   ├── api/                 # API hooks
│   │   └── App.js
│   ├── Dockerfile
│   └── package.json
│
│── docker-compose.yml
│── README.md

⚙️ Setup Instructions
1️⃣ Clone the repo
git clone https://github.com/your-username/intelligent-workflow-builder.git
cd intelligent-workflow-builder

2️⃣ Backend Setup (FastAPI + MongoDB + ChromaDB)
Create .env inside backend/:
MONGO_URI=mongodb://localhost:27017
MONGO_DB=workflow_builder
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key

Install dependencies:
cd backend
pip install -r requirements.txt

Run backend:
uvicorn app.main:app --reload --port 8000

3️⃣ Frontend Setup (React)
cd frontend
npm install
npm run dev


Frontend runs at: http://localhost:3000

4️⃣ Docker (Optional)

Run everything with Docker Compose:

docker-compose up --build


This spins up:

FastAPI backend (port 8000)

React frontend (port 3000)

MongoDB (port 27017)

ChromaDB container

5️⃣ Kubernetes Deployment (Optional)

For minikube or cloud clusters:

kubectl apply -f k8s/

🔍 API Endpoints

POST /documents/upload – Upload and process a PDF

POST /workflow/run – Execute the current workflow

POST /chat/query – Send a query and get a response

GET /workflows – List saved workflows

POST /workflows – Save a workflow definition

📊 Optional Monitoring

Prometheus + Grafana → metrics & dashboards

ELK Stack → centralized logging

📹 Demo

👉 (Add Loom/YT screen recording here)

🏗️ Future Extensions

User authentication & roles

Multiple LLM providers

Workflow templates & marketplace

Streaming responses