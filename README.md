# 🎓 Online Learning & Real-time Exam System with AI Tutor

<div align="center">

![Project Screenshot](docs/screenshot.png)

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19.x-blue?logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://mongodb.com)
[![LangChain](https://img.shields.io/badge/LangChain.js-1.x-orange)](https://js.langchain.com)
[![GROQ](https://img.shields.io/badge/GROQ-Llama_3.3_70B-purple)](https://groq.com)
[![License](https://img.shields.io/badge/License-ISC-blue)](LICENSE)

**Nền tảng học trực tuyến tích hợp AI — Virtual Classroom · Online Exam · AI Tutor RAG**

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng nổi bật](#-tính-năng-nổi-bật)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Tech Stack](#-tech-stack)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cài đặt & Khởi chạy](#-cài-đặt--khởi-chạy)
- [API Reference](#-api-reference)
- [Vai trò nhóm](#-vai-trò-nhóm)

---

## 🌟 Giới thiệu

**Online Learning AI** là một nền tảng học trực tuyến toàn diện (All-in-one), được xây dựng theo kiến trúc **Monolithic Modular**, kết hợp đồng thời 3 hệ thống lớn:

1. **Virtual Classroom** — Lớp học ảo thời gian thực, hỗ trợ WebRTC P2P video, chat, giơ tay phát biểu và chia sẻ màn hình.  
2. **Online Exam System** — Hệ thống thi trực tuyến có chấm điểm tự động, giám sát gian lận thời gian thực qua Socket.io.  
3. **AI Tutor (Hybrid RAG)** — Gia sư AI trả lời câu hỏi từ tài liệu giảng dạy, sinh đề thi tự động bằng mô hình Llama 3.3 70B qua GROQ API.

---

## ✨ Tính năng nổi bật

### 🏫 Virtual Classroom
- **WebRTC P2P** (Mesh architecture) — Video conference đa người dùng không cần server media
- **Real-time Chat** — Nhắn tin trong lớp qua Socket.io
- **Chia sẻ màn hình** — Giảng viên/sinh viên trình chiếu trực tiếp
- **Giơ tay phát biểu** — Cơ chế Hand Raise thời gian thực
- **Pin Screen** — Ghim màn hình bất kỳ

### 📝 Online Exam
- **Trắc nghiệm & Tự luận** — Hỗ trợ cả hai dạng câu hỏi
- **Server-side Timer** — Đồng hồ đếm ngược phía server chống gian lận
- **Anti-cheat Monitoring** — Phát hiện chuyển tab, mất focus, copy/paste
- **Auto-submit** — Tự động nộp bài khi vi phạm vượt giới hạn (`maxViolations`)
- **Sinh đề thi tự động** — AI tạo câu hỏi từ tài liệu học tập
- **Nhắc nhở lịch thi** — Cron Job tự động gửi thông báo trước 24h

### 🤖 AI Tutor (Hybrid RAG Architecture)
- **Ingest tài liệu PDF** — Giảng viên tải lên, AI xử lý và vector hóa cục bộ
- **Embedding nội bộ** — Ollama (`nomic-embed-text`) chạy local, không rò rỉ dữ liệu
- **Vector Search** — MongoDB Atlas Vector Search (HNSW index, Cosine Similarity)
- **Sinh câu trả lời** — GROQ API (`llama-3.3-70b-versatile`) — nhanh và chính xác
- **Chat History** — Lưu lịch sử hội thoại AI trên MongoDB
- **Filter theo lớp** — Câu trả lời đúng ngữ cảnh môn học đang học

### 👤 Quản lý người dùng & Phân quyền
- **3 vai trò**: `student`, `lecturer`, `admin`
- **JWT Authentication** — Xác thực qua Header `x-auth-token`
- **Upload Avatar** — Hỗ trợ ảnh đại diện (jpeg, jpg, png, gif, webp)
- **Đổi mật khẩu** — API bảo mật có xác thực mật khẩu cũ
- **Admin Panel** — Quản lý người dùng, danh mục môn học

### 🔔 Hệ thống thông báo
- Thông báo realtime qua Socket.io
- Đọc/xóa từng thông báo hoặc toàn bộ
- Cron Job nhắc nhở lịch thi 24h trước

---

## 🏗 Kiến trúc hệ thống

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  Landing · Dashboard · Classroom · Exam · AI Chat · Admin    │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP REST + Socket.io
┌─────────────────────────▼────────────────────────────────────┐
│              BACKEND (Node.js + Express + Socket.io)          │
│                                                              │
│  Routes → Controllers → Models (Mongoose)                    │
│  Auth · Classroom · Exam · Material · AI · Notification      │
│  Quiz · User · Category · Dashboard                          │
│                                                              │
│  ┌───────────────┐    ┌──────────────────────────────────┐   │
│  │  Socket Layer │    │         AI Service Layer          │   │
│  │ classroomSock │    │  ragPipeline.js   aiService.js   │   │
│  │ examSocket    │    │  quizService.js                  │   │
│  └───────────────┘    └──────────────────────────────────┘   │
│                                  │           │               │
└──────────────────────────────────┼───────────┼───────────────┘
                                   │           │
                      ┌────────────▼─┐  ┌──────▼───────────────┐
                      │  GROQ Cloud  │  │  Ollama (Local)       │
                      │ Llama-3.3-70B│  │  nomic-embed-text     │
                      │ (Generation) │  │  (Embedding/Vectors)  │
                      └──────────────┘  └──────────────────────┘
                                                   │
                      ┌────────────────────────────▼─────────────┐
                      │            MongoDB Atlas                   │
                      │  Primary DB · AI Vector DB (vectors col.) │
                      └──────────────────────────────────────────┘
```

### RAG Pipeline (Hybrid)

```
PDF Upload ──► Text Extract ──► Chunk Split (500 chars / 100 overlap)
    ──► Ollama Embedding (nomic-embed-text) ──► MongoDB Atlas Vector Store
    
User Question ──► Ollama Embedding ──► Vector Similarity Search (Top 10)
    ──► Inject Context ──► GROQ API (Llama-3.3-70B) ──► Answer
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, React Router 7, Bootstrap 5, Framer Motion |
| **WebRTC** | Simple-Peer, Socket.io-client |
| **Backend** | Node.js 20, Express 5 |
| **Database** | MongoDB Atlas (Mongoose 8) |
| **AI - Generation** | GROQ API · Llama-3.3-70B-versatile |
| **AI - Embedding** | Ollama · nomic-embed-text (Local) |
| **AI - Orchestration** | LangChain.js (`@langchain/groq`, `@langchain/ollama`, `@langchain/mongodb`) |
| **Vector Store** | MongoDB Atlas Vector Search (HNSW) |
| **Auth** | JWT (`jsonwebtoken`), bcryptjs |
| **Security** | Helmet.js, CORS |
| **File Upload** | Multer (PDF, Images) |
| **Realtime** | Socket.io 4.x |
| **Scheduler** | node-cron |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Cấu trúc dự án

```
Online-learning-ai/
├── backend/
│   ├── index.js                  # Entry point
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js             # MongoDB connection (Atlas/Local)
│   │   ├── controllers/
│   │   │   ├── aiController.js   # Xử lý AI chat & ingest
│   │   │   ├── authController.js # Đăng ký, đăng nhập, profile, avatar
│   │   │   ├── categoryController.js
│   │   │   ├── classroomController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── examController.js
│   │   │   ├── materialController.js
│   │   │   ├── notificationController.js
│   │   │   ├── quizController.js # AI auto-generate exam
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   ├── AIChat.js         # Lịch sử chat AI
│   │   │   ├── Category.js       # Danh mục môn học
│   │   │   ├── Classroom.js      # Lớp học
│   │   │   ├── Exam.js           # Bài thi (MCQ + Essay)
│   │   │   ├── Material.js       # Tài liệu học tập
│   │   │   ├── Message.js        # Tin nhắn chat lớp học
│   │   │   ├── Notification.js   # Thông báo hệ thống
│   │   │   ├── Result.js         # Kết quả bài thi
│   │   │   ├── StudyProgress.js  # Tiến độ học tập
│   │   │   └── User.js           # Người dùng (3 roles)
│   │   ├── routes/               # Express Routers (10 modules)
│   │   ├── services/
│   │   │   └── ai/
│   │   │       ├── aiService.js      # AI Q&A (GROQ + RAG)
│   │   │       ├── quizService.js    # AI Quiz Generation
│   │   │       └── ragPipeline.js    # Embedding + Vector Store
│   │   ├── socket/
│   │   │   ├── classroomSocket.js    # WebRTC signaling + Chat
│   │   │   └── examSocket.js         # Anti-cheat monitoring
│   │   ├── middleware/
│   │   │   └── authMiddleware.js     # JWT verify + Role authorize
│   │   └── cronJobs.js               # Nhắc nhở lịch thi 24h
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Root routing (10+ routes)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx / Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Profile.jsx
│   │   ├── features/
│   │   │   ├── student/
│   │   │   │   ├── VirtualClassroom.jsx  # WebRTC + Screen share
│   │   │   │   ├── ExamRoom.jsx          # Phòng thi + Anti-cheat
│   │   │   │   ├── ExamList.jsx          # Danh sách bài thi
│   │   │   │   ├── LearningCenter.jsx    # Trung tâm học tập + AI Chat
│   │   │   │   └── StudentSchedule.jsx   # Lịch học
│   │   │   ├── lecturer/
│   │   │   │   ├── ClassroomManagement.jsx
│   │   │   │   ├── ExamManagement.jsx    # Tạo đề + AI Generate
│   │   │   │   └── DocumentManagement.jsx
│   │   │   └── admin/
│   │   │       ├── UserManagement.jsx
│   │   │       └── CategoryManagement.jsx
│   │   ├── components/           # UI components dùng chung
│   │   ├── context/              # React Context (Auth...)
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # Axios API calls
│   │   └── utils/                # Helpers
│   └── Dockerfile
├── docs/
│   ├── AI_ALGORITHMS_SUMMARY.md
│   ├── HYBRID_RAG_ARCHITECTURE.md
│   ├── ERD.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── screenshot.png
├── docker-compose.yml
└── README.md
```

---

## 🚀 Cài đặt & Khởi chạy

### Yêu cầu hệ thống

| Công cụ | Phiên bản |
|---------|-----------|
| Node.js | ≥ 20.19 |
| npm | ≥ 10.x |
| MongoDB | Atlas (hoặc Local) |
| Ollama | Latest |
| Docker | (Tuỳ chọn) |

### Bước 1: Clone & Cài đặt

```bash
git clone https://github.com/thankhanh/Online-learning-ai.git
cd Online-learning-ai
```

### Bước 2: Cấu hình biến môi trường

Tạo file **`backend/.env`**:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=Online-learning-ai
MONGO_URI_AI=mongodb+srv://<ai_user>:<password>@<cluster>.mongodb.net/?appName=Cluster0
JWT_SECRET=your_very_strong_jwt_secret
OLLAMA_URL=http://127.0.0.1:11434
GROQ_API_KEY=your_groq_api_key_from_console.groq.com
```

Tạo file **`frontend/.env`**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

> **Lấy GROQ API Key miễn phí** tại: [console.groq.com](https://console.groq.com)

### Bước 3: Khởi động Ollama & tải model Embedding

```bash
# Cài Ollama tại https://ollama.com rồi chạy:
ollama pull nomic-embed-text
ollama serve
```

### Bước 4: Chạy Backend

```bash
cd backend
npm install --legacy-peer-deps
npm run dev
# Server khởi động tại http://localhost:5000
```

### Bước 5: Chạy Frontend

```bash
cd frontend
npm install
npm run dev
# App chạy tại http://localhost:5173
```

---

### 🐳 Chạy bằng Docker Compose (Khuyến nghị)

```bash
# Build và khởi chạy toàn bộ stack
docker-compose up --build

# Các services:
# Frontend  → http://localhost:5173
# Backend   → http://localhost:5000
# MongoDB   → localhost:27017
# Ollama    → http://localhost:11434
```

---

## 📡 API Reference

### 🔐 Authentication — `/api/auth`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/login` | Đăng nhập, nhận JWT | ❌ |
| POST | `/logout` | Đăng xuất | ✅ |
| GET | `/me` | Lấy thông tin người dùng hiện tại | ✅ |
| PUT | `/profile` | Cập nhật profile (displayName...) | ✅ |
| PUT | `/change-password` | Đổi mật khẩu | ✅ |
| POST | `/upload-avatar` | Tải lên ảnh đại diện | ✅ |

### 🏫 Classroom — `/api/classrooms`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/` | Danh sách lớp học | ✅ |
| GET | `/:id` | Chi tiết lớp học | ✅ |
| POST | `/` | Tạo lớp học mới | 👨‍🏫 Lecturer |
| PUT | `/:id` | Cập nhật lớp học | 👨‍🏫 Lecturer |
| DELETE | `/:id` | Xóa lớp học | 👨‍🏫 Lecturer |
| POST | `/join` | Sinh viên tham gia lớp | 👨‍🎓 Student |
| GET | `/:id/progress` | Tiến độ học tập | 👨‍🎓 Student |

### 📝 Exam — `/api/exams`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/` | Danh sách bài thi | ✅ |
| GET | `/:id` | Chi tiết bài thi | ✅ |
| POST | `/` | Tạo bài thi mới | 👨‍🏫 Lecturer |
| PUT | `/:id` | Cập nhật bài thi | 👨‍🏫 Lecturer |
| DELETE | `/:id` | Xóa bài thi | 👨‍🏫 Lecturer |
| POST | `/:id/submit` | Nộp bài thi | 👨‍🎓 Student |
| GET | `/stats/me` | Thống kê kết quả sinh viên | 👨‍🎓 Student |
| GET | `/stats/lecturer` | Thống kê của giảng viên | 👨‍🏫 Lecturer |

### 🤖 AI Tutor — `/api/ai`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/ask` | Đặt câu hỏi cho AI (RAG) | ✅ |
| GET | `/history` | Lịch sử chat AI | ✅ |
| POST | `/upload` | Tải lên & ingest tài liệu PDF | ✅ |
| POST | `/ingest` | Alias của `/upload` | ✅ |

### 🎲 Quiz Generation — `/api/quiz`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/generate` | AI tạo đề thi từ tài liệu | 👨‍🏫 Lecturer |

---

## 👥 Vai trò nhóm

| Họ tên | MSSV | Vai trò | Phụ trách |
|--------|------|---------|-----------|
| **Hà Thanh Khánh** | 3122410178 | Leader / DB / Admin | Quản lý nhóm, thiết kế Database, triển khai hệ thống |
| **Hà Văn Hưng** | 3122410159 | AI Engineer | RAG Pipeline, GROQ Integration, AI Quiz Generation |
| **Nguyễn Thị Mai Trinh** | 3122410428 | Backend Engineer | REST API, Socket.io, Auth, Business Logic |
| **Lữ Thị Cẩm Tri** | 3122410419 | Frontend Engineer | React UI, WebRTC, UX/UI Responsive |

---

## 📚 Tài liệu kỹ thuật

Chi tiết kỹ thuật nằm trong thư mục [`docs/`](docs/):

- [`AI_ALGORITHMS_SUMMARY.md`](docs/AI_ALGORITHMS_SUMMARY.md) — Giải thích thuật toán RAG
- [`HYBRID_RAG_ARCHITECTURE.md`](docs/HYBRID_RAG_ARCHITECTURE.md) — Kiến trúc Hybrid AI
- [`ERD.md`](docs/ERD.md) — Entity Relationship Diagram
- [`DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) — Hướng dẫn triển khai production

---

<div align="center">
  <sub>Built with ❤️ · Online Learning AI Team · 2025</sub>
</div>

---

## Online Learning & Real-time Exam System with Local AI Tutor

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19.x-blue?logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://mongodb.com)
[![GROQ](https://img.shields.io/badge/GROQ-Llama_3.3_70B-purple)](https://groq.com)

</div>

### 1. Introduction

This project builds an **all-in-one online learning platform** combining real-time virtual classrooms, an anti-cheat exam system, and a **Hybrid RAG AI Tutor**. The AI uses GROQ Cloud (Llama-3.3-70B) for answer generation and Ollama (nomic-embed-text) locally for secure document embedding — ensuring data privacy while delivering high-speed, accurate responses.

### 2. Objectives

* Real-time virtual classroom (WebRTC P2P, Screen Share, Chat, Hand Raise)
* Secure online exam system with anti-cheat monitoring via Socket.io
* Self-hosted document vectorization (Ollama) + Cloud generation (GROQ API)
* Role-based access control: Student, Lecturer, Admin
* AI auto-generate exam questions from uploaded PDF materials

### 3. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Bootstrap 5, Framer Motion |
| Backend | Node.js 20, Express 5, Socket.io |
| Database | MongoDB Atlas (Primary + Vectors) |
| AI Generation | GROQ API — Llama-3.3-70B-versatile |
| AI Embedding | Ollama — nomic-embed-text (Local) |
| Orchestration | LangChain.js |
| Auth | JWT + bcryptjs |
| Containerization | Docker & Docker Compose |

### 4. System Modules

#### 4.1 Virtual Classroom
* WebRTC P2P video conferencing (Mesh) via Simple-Peer
* Real-time chat, hand raise, screen sharing, pin screen
* Socket.io signaling server for WebRTC offer/answer exchange

#### 4.2 AI Tutor — Hybrid RAG
* Lecturer uploads PDF → Ollama embeds locally → stored in MongoDB Atlas Vector Search
* Student asks question → vector retrieved → sent to GROQ (Llama-3.3-70B) → contextual answer
* AI Quiz Service: auto-generates multiple-choice exam from lecture materials

#### 4.3 Online Exam & Anti-cheat
* MCQ + Essay types, server-side timer, auto-submit on violations
* Anti-cheat: tab switch detection, focus loss, copy/paste restriction
* Exam reminder Cron Job notifies students 24h before exam start

### 5. RAG Pipeline

```
PDF Upload → Text Extract → Chunk (500 chars) → Ollama Embed → MongoDB Atlas Vectors
User Query → Ollama Embed → Similarity Search (Top 10) → GROQ Llama-3.3-70B → Answer
```

### 6. Installation

```bash
# Clone
git clone https://github.com/thankhanh/Online-learning-ai.git

# Backend .env
PORT=5000 | MONGO_URI | MONGO_URI_AI | JWT_SECRET | OLLAMA_URL | GROQ_API_KEY

# Ollama
ollama pull nomic-embed-text && ollama serve

# Backend
cd backend && npm install --legacy-peer-deps && npm run dev

# Frontend
cd frontend && npm install && npm run dev

# Or Docker
docker-compose up --build
```

### 7. Team Roles

| Name | Student ID | Role | Responsibility |
|------|-----------|------|---------------|
| **Hà Thanh Khánh** | 3122410178 | Leader / DB / Admin | Project management, database design, deployment |
| **Hà Văn Hưng** | 3122410159 | AI Engineer | RAG pipeline, GROQ integration, quiz generation |
| **Nguyễn Thị Mai Trinh** | 3122410428 | Backend Engineer | REST API, Socket.io, auth, business logic |
| **Lữ Thị Cẩm Tri** | 3122410419 | Frontend Engineer | React UI, WebRTC integration, UX |