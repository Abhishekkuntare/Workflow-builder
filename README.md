# 🧠 Intelligent Workflow Builder

A full-stack **no-code / low-code** web application that enables users to visually construct and interact with **intelligent workflows**. Using drag-and-drop components, users define a flow that processes input through embeddings, vector search, LLMs, and optional web search, returning results in a chat interface.

---

##  Live Demo

Explore the fully functional live version here:

> **Live App:** https://workflow-builder-flame.vercel.app/

---

## Tech Stack

- **Frontend:** React.js + React Flow + Tailwind CSS  
- **Backend:** FastAPI (Python)  
- **Database:** MongoDB (stores documents metadata, workflow definitions, chat logs)  
- **Vector Store:** ChromaDB  
- **Embeddings:** OpenAI Embeddings, Gemini Embeddings  
- **LLMs:** OpenAI GPT, Google Gemini  
- **Web Search:** SerpAPI or Brave Search  
- **Text Extraction:** PyMuPDF  
- **Containerization:** Docker + Docker Compose  
- **(Optional) Orchestration:** Kubernetes (minikube / GKE / EKS)  
- **(Optional) Monitoring & Logging:** Prometheus + Grafana, ELK Stack

---

## Repo Structure

workflow-builder/
├── backend/
│ ├── app/
│ │ ├── main.py # FastAPI entrypoint
│ │ ├── routes/
│ │ │ ├── documents.py # Upload & document processing
│ │ │ ├── workflows.py # Save / retrieve workflow definitions
│ │ │ ├── chat.py # Workflow execution & chat endpoint
│ │ ├── services/
│ │ │ ├── embeddings.py # Embedding logic
│ │ │ ├── chromadb.py # Vector store integration
│ │ │ ├── llm.py # LLM orchestration
│ │ ├── db.py # MongoDB connection (e.g., via Motor or PyMongo)
│ ├── Dockerfile
│ └── requirements.txt
├── frontend/
│ ├── src/
│ │ ├── components/ # React Flow nodes, builder UI, ChatModal
│ │ ├── api/ # API utilities (axios)
│ │ └── App.jsx
│ ├── Dockerfile
│ └── package.json
├── docker-compose.yml
└── README.md


---

##  Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Abhishekkuntare/Workflow-builder
cd intelligent-workflow-builder

GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_open_api_key
NODE_ENV=development
MONGODB_URI=your_mongodb_api_key

Install Dependencies & Run

cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

3. Frontend Setup
cd ../frontend
npm install
npm run dev

4. (Optional) Docker Compose

Run the entire stack with one command:
docker-compose up --build

API Endpoints

POST /documents/upload – Upload and process documents (PDFs → text → embeddings)

POST /workflows – Save workflow definitions

GET /workflows/{id} – Retrieve a saved workflow

POST /chat – Execute the workflow; returns the answer + execution trace

Live Demo

Check out the fully deployed application:
https://workflow-builder-flame.vercel.app/