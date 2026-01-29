# 🔄 SYSTEM WORKFLOWS

This document visualizes the core processes of the **Online Learning & AI Tutor** system.

---

## 1. 🎓 Learning & Virtual Classroom Flow
Mô tả quy trình giảng viên mở lớp, sinh viên tham gia và tương tác.

```mermaid
sequenceDiagram
    participant L as Giảng viên (Lecturer)
    participant S as Sinh viên (Student)
    participant B as Backend (Socket.io)
    participant AI as AI Tutor (Local RAG)

    L->>B: Tạo/Mở lớp học
    B-->>L: Cấp mã phòng/Socket ID
    S->>B: Join lớp học (Socket join)
    
    rect rgb(240, 240, 240)
        Note over L,S: WebRTC Mesh Architecture
        L->>S: P2P Stream (Video/Mic)
        S->>L: P2P Stream (Video/Mic)
    end

    S->>B: Gửi câu hỏi Chat/AI
    B->>AI: Chuyển câu hỏi (RAG Pipeline)
    AI-->>B: Trả lời từ Qwen (Context-aware)
    B->>S: Hiển thị câu trả lời trên Chat
```

---

## 2. 🤖 AI Tutor RAG Pipeline
Quy trình xử lý tài liệu nội bộ (Local) không cần API bên ngoài.

```mermaid
graph TD
    A[Giảng viên upload PDF/Slide] --> B{AI Engine}
    B --> C[Text Splitting: Recursive Character]
    C --> D[Embedding: nomic-embed-text]
    D --> E[(Vector Store: HNSW/Memory)]
    
    F[Sinh viên hỏi câu hỏi] --> G[Similarity Search]
    E -.-> G
    G --> H[Retrieve Context]
    H --> I[LLM: Qwen-2.5-1.5B]
    I --> J[Trả lời chính xác theo tài liệu]
```

---

## 3. 📝 Secure Exam Flow
Quy trình thi trực tuyến với các cơ chế chống gian lận (Anti-cheat).

```mermaid
graph LR
    Start[Bắt đầu thi] --> Timer[Server Timer Start]
    Timer --> FE[Hiển thị giao diện thi]
    
    subgraph Anti-Cheat Monitoring
        FE --> V1[Detect Tab Switch]
        FE --> V2[Detect Focus Loss]
        FE --> V3[Disable Context Menu]
    end
    
    V1 & V2 --> Signal[Gửi Socket: violation]
    Signal --> Log[Backend: Save to Result Model]
    
    Log --> Check{Violation > Limit?}
    Check -- Yes --> AutoSub[Auto Submit]
    Check -- No --> Continue[Tiếp tục thi]
    
    Continue --> ManualSub[Sinh viên nộp bài]
    ManualSub & AutoSub --> End[Lưu kết quả & Đóng phòng]
```

---

## 4. 📂 Data Relationship (Quick View)
- **User** sở hữu **Classroom**.
- **Classroom** chứa nhiều **Material** & **Exam**.
- **Exam** sinh ra nhiều **Result** (gồm Score & List Violations).
