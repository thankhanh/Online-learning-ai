# KIẾN TRÚC AI CHATBOT & TẠO ĐỀ THI TỰ ĐỘNG

> Dự án Online Learning AI sử dụng kiến trúc **Hybrid RAG** (Local + Cloud) để vận hành 2 tính năng AI chính: **Chatbot hỏi đáp** và **Tạo đề thi tự động** từ tài liệu PDF.

---

## 1. TỔNG QUAN KIẾN TRÚC

```
PDF Tài liệu ──► Ollama LOCAL (nomic-embed-text) ──► MongoDB Atlas Vector Search
                        ↑ Embedding (nhẹ, bảo mật)

Câu hỏi User ──► Ollama LOCAL (embed query) ──► MongoDB (tìm context) ──► Groq CLOUD (sinh câu trả lời)
                                                                              ↑ LLM Generation (nhanh, miễn phí)
```

| Thành phần | Công cụ | Chạy ở đâu | Vai trò |
|---|---|---|---|
| **Embedding** | Ollama + `nomic-embed-text` | Local (máy cá nhân) | Biến text → vector, tìm kiếm ngữ nghĩa |
| **Vector DB** | MongoDB Atlas Vector Search | Cloud (Atlas) | Lưu trữ & truy vấn vector |
| **LLM Generation** | Groq API + `llama-3.3-70b` | Cloud (Groq) | Sinh câu trả lời / đề thi |

**Tại sao Hybrid?**
- ⚡ **Nhanh**: Groq phản hồi < 2 giây (chip LPU chuyên dụng)
- 🔒 **Bảo mật**: PDF không rời máy local, chỉ gửi context nhỏ lên Cloud  
- 💻 **Nhẹ**: Máy 4GB RAM chạy được (không cần GPU rời)
- 💰 **Miễn phí**: Groq free tier, không cần thẻ tín dụng

---

## 2. HAI TÍNH NĂNG AI

### 2.1. Chatbot Hỏi Đáp (`/api/ai/ask`)
- Sinh viên đặt câu hỏi → Hệ thống tìm 5 đoạn text liên quan từ tài liệu → Groq sinh câu trả lời bám sát nội dung.
- **File code**: `backend/src/services/ai/aiService.js`

### 2.2. Tạo Đề Thi Tự Động (`/api/quiz/generate`)
- Giảng viên bấm tạo đề → Hệ thống lấy 10 đoạn text từ tài liệu → Groq sinh 10 câu trắc nghiệm (JSON).
- **File code**: `backend/src/services/ai/quizService.js`
- **Output mẫu**:
```json
{
  "quiz": [
    {
      "question": "Giao thức HTTP hoạt động ở tầng nào trong mô hình OSI?",
      "options": ["Tầng Vật lý", "Tầng Mạng", "Tầng Vận chuyển", "Tầng Ứng dụng"],
      "answer": "Tầng Ứng dụng"
    }
  ]
}
```


## 3. CÀI ĐẶT & CHẠY (DÀNH CHO TEAM)

### 3.1. Cài đặt phần mềm yêu cầu
- **Node.js** v18+: https://nodejs.org
- **Ollama**: https://ollama.com/download

### 3.3. Cài đặt project
```bash
# Pull model embedding (chỉ lần đầu, ~270MB)
ollama pull nomic-embed-text

# Cài dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 3.5. Chạy hệ thống (3 terminal)
```bash
ollama serve                      # Terminal 1 — Ollama server
cd backend && npm run dev         # Terminal 2 — Backend (port 5000)
cd frontend && npm run dev        # Terminal 3 — Frontend (port 5173)
```

