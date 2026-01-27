## Online Learning & Real-time Exam System with Local AI Tutor

### 1. Introduction

This project focuses on building an **All-in-one online learning platform** that combines real-time virtual classrooms with a strict online examination system. The key highlight is the integration of a **self-hosted AI Tutor** using Retrieval-Augmented Generation (RAG), capable of understanding teaching materials instantly and assisting lecturers during live classes. The system is designed to run efficiently on limited hardware such as personal laptops or small servers.

### 2. Objectives

* Build a real-time virtual classroom similar to Google Meet
* Integrate a secure online exam system with basic anti-cheating mechanisms
* Deploy a local AI Tutor that can read and answer questions from learning materials
* Ensure full data privacy with no external AI APIs

### 3. Technology Stack

* **Frontend**: ReactJS (Vite), Socket.io-client, Simple-Peer (WebRTC)
* **Backend**: Node.js, ExpressJS
* **Database**: MongoDB
* **AI Engine**:

  * Runtime: Ollama (Local)
  * Model: Qwen-2.5-1.5B
  * Orchestration: LangChain.js
* **Architecture**: Monolithic Modular

### 4. System Modules

#### 4.1 Virtual Classroom

* WebRTC P2P video conferencing (Mesh architecture)
* Real-time chat using Socket.io
* Hand raise and screen sharing

#### 4.2 AI Tutor (Self-hosted RAG)

* Lecturer uploads PDF/Slide materials
* AI processes and understands documents locally
* Students ask questions and receive contextual answers
* No data leaves the internal system

#### 4.3 Online Exam & Monitoring

* Multiple choice and essay exams
* Server-side countdown timer
* Detect tab switching, focus loss, copy/paste
* Auto-submit when violations exceed limit

### 5. AI Algorithm (RAG Pipeline)

1. **Text Splitting**: Recursive Character Text Splitting
2. **Embedding**: nomic-embed-text
3. **Vector Search**: HNSW index
4. **Similarity Matching**: Cosine Similarity
5. **Answer Generation**: Transformer-based Qwen model

### 6. Practical Significance

* Zero cost for external AI APIs
* Full data privacy for exams and teaching materials
* Optimized performance with client-side video and local AI processing

### 7. Team Roles

* Backend Engineer
* Frontend Engineer
* AI Engineer
* Leader / Database / Admin

---

# docs/ROLE_BACKEND.md

## Role: Backend Engineer

### Responsibilities

* Build REST APIs using ExpressJS
* Handle authentication, authorization, and role management
* Implement real-time communication with Socket.io
* Manage exam logic, timing, and violation logging

### Out of Scope

* UI/UX implementation
* AI model training or prompt design

### Deliverables

* API endpoints
* Database models
* Socket.io server logic

---

# docs/ROLE_FRONTEND.md

## Role: Frontend Engineer

### Responsibilities

* Build UI using ReactJS (Vite)
* Implement WebRTC P2P video calling with Simple-Peer
* Develop exam interface and real-time chat
* Detect cheating behaviors via Browser APIs

### Out of Scope

* Backend business logic
* AI processing or vector storage

### Deliverables

* React components and pages
* WebRTC and Socket.io client integration

---

# docs/ROLE_AI.md

## Role: AI Engineer

### Responsibilities

* Setup Ollama local runtime
* Integrate Qwen-2.5-1.5B model
* Build RAG pipeline using LangChain.js
* Handle document parsing, embedding, and retrieval

### Out of Scope

* UI or frontend logic
* Exam or user management logic

### Deliverables

* AI service APIs
* RAG pipeline implementation
* Prompt templates and configs

---

# docs/ROLE_LEADER.md

## Role: Team Leader / DB / Admin

### Responsibilities

* Define system architecture and data flow
* Design MongoDB schemas
* Manage GitHub, branches, and pull requests
* Assign tasks and track progress via Lark
* Review code and ensure alignment with project scope

### Out of Scope

* Deep implementation of FE, BE, or AI modules

### Deliverables

* System documentation
* Database schema design
* Weekly task plans and reviews

---

# docs/WORKFLOW.md

## Overall System Flow

### Learning Flow

Login → Join Class → WebRTC Video + Chat → AI Tutor Q&A

### AI Flow

Upload Material → Text Split → Embedding → Vector Store → Query → Answer

### Exam Flow

Start Exam → Timer Start → Monitor Violations → Submit → Save Result

---

# docs/ANTIGRAVITY_PROMPT_GUIDE.md

## Base Prompt Template

```
You are a senior software engineer.

Project:
Online Learning & Real-time Exam System with Self-hosted AI Tutor.

My role:
<ROLE>

Current task:
<TASK>

Rules:
- Only focus on this task
- Do not design the full system
- Follow the README strictly
```

## Usage Rules

* One role, one task, one prompt
* No vague or large-scope prompts
* Always reference README before prompting AI
