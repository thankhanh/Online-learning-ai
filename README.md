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
