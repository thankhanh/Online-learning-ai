# KIẾN TRÚC HYBRID RAG TỐI ƯU: LOCAL EMBEDDING + CLOUD LLM GENERATION

> **Phiên bản**: 2.0 — Cập nhật 02/04/2026  
> **Mục tiêu**: Xây dựng hệ thống Chatbot AI cho ứng dụng Online Learning đạt 3 tiêu chí: **NHANH – CHÍNH XÁC – MIỄN PHÍ**, chạy được trên mọi máy tính cá nhân (không yêu cầu GPU rời).

---

## 1. BỐI CẢNH VÀ VẤN ĐỀ

### 1.1. Thiết lập cũ (100% Local — Ollama)
- Sử dụng Ollama xử lý **cả hai** tác vụ: Embedding (Vector hoá) và Generation (Sinh văn bản) bằng model `qwen2.5:1.5b`.
- **Vấn đề nghiêm trọng**: Tác vụ Generation (LLM sinh câu trả lời) ngốn cực kỳ nhiều tài nguyên → CPU chạy 100%, RAM tràn, thời gian phản hồi có thể lên tới **vài phút** trên máy không có GPU rời mạnh.
- Model `qwen2.5:1.5b` quá nhỏ (1.5 tỉ tham số) → Khả năng hiểu ngữ cảnh và trả lời bằng Tiếng Việt rất hạn chế, hay bịa thông tin (hallucination).

### 1.2. Yêu cầu (Phương án 2)
| Tiêu chí | Yêu cầu |
|---|---|
| **Tốc độ** | Phản hồi dưới 2-3 giây |
| **Độ chính xác** | Trả lời bám sát nội dung tài liệu, không bịa |
| **Phần cứng** | Máy bất kỳ (4GB RAM+) đều chạy được |
| **Chi phí** | 100% miễn phí, không cần thẻ tín dụng |
| **Bảo mật** | Tài liệu gốc không bị rò rỉ ra Internet |

---

## 2. GIẢI PHÁP: KIẾN TRÚC HYBRID (LOCAL + CLOUD)

### 2.1. Nguyên tắc cốt lõi
Tách biệt 2 tiến trình của RAG Pipeline:

```
┌──────────────────────────────────────────────────────────────────────┐
│                         KIẾN TRÚC HYBRID RAG                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │         PHẦN 1: EMBEDDING (Chạy LOCAL — MÁY CÁ NHÂN)       │     │
│  │                                                              │     │
│  │  PDF Tài liệu ──► Ollama (nomic-embed-text) ──► MongoDB    │     │
│  │                                                  Atlas      │     │
│  │  ✅ Tài liệu KHÔNG rời khỏi máy tính                       │     │
│  │  ✅ Embedding model rất nhẹ (~270MB RAM)                    │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │         PHẦN 2: GENERATION (Gọi CLOUD — GROQ API)           │     │
│  │                                                              │     │
│  │  Câu hỏi + Context ──► Groq API (Llama 3.3 70B) ──► Trả   │     │
│  │                                                      lời    │     │
│  │  ⚡ Tốc độ: ~800 tokens/giây (chip LPU chuyên dụng)        │     │
│  │  🧠 Model 70B tham số: Thông minh, hiểu TV tốt             │     │
│  │  💰 Miễn phí: Không cần thẻ tín dụng                       │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2. Luồng xử lý chi tiết

#### Luồng 1: Nạp tài liệu (Ingest) — Chạy LOCAL
```
Giảng viên upload PDF
    ↓
Node.js Backend đọc file PDF (pdf-parse)
    ↓
Chia nhỏ văn bản (RecursiveCharacterTextSplitter)
    • chunkSize: 500 ký tự (↓ từ 1000 để tăng độ chính xác)
    • chunkOverlap: 100 ký tự (↓ từ 200 vì chunk nhỏ hơn)
    ↓
Chuyển từng chunk thành Vector bằng Ollama LOCAL (nomic-embed-text)
    ↓
Lưu Vector vào MongoDB Atlas Vector Search
```

> **Bảo mật**: File PDF chỉ rời dạng nguyên gốc khi được biến thành ma trận số (vector). Không ai có thể phục hồi nội dung gốc từ vector.

#### Luồng 2: Hỏi đáp (QA Chat) — LOCAL + CLOUD
```
Sinh viên đặt câu hỏi: "Giải phương trình bậc hai như nào?"
    ↓
[LOCAL] Ollama biến câu hỏi thành Vector
    ↓
[CLOUD DB] MongoDB Atlas tìm Top 5 đoạn văn bản liên quan nhất
    ↓
[BACKEND] Node.js ghép: Câu hỏi + 5 đoạn Context → Prompt
    ↓
[CLOUD AI] Gửi Prompt lên Groq API (Llama 3.3 70B)
    ↓
[CLOUD AI] Groq sinh câu trả lời (< 1 giây)
    ↓
Trả kết quả về Chatbox Frontend
```

---

## 3. TẠI SAO CHỌN GROQ? (SO SÁNH CÁC NỀN TẢNG MIỄN PHÍ)

| Tiêu chí | **Groq** ✅ | Cerebras | Cloudflare Workers AI | Together AI |
|---|---|---|---|---|
| **Tốc độ** | ⚡ Cực nhanh (LPU) — TTFT < 100ms | ⚡⚡ Nhanh nhất (throughput) | 🐢 Chậm hơn | 🐢 Trung bình |
| **Model 70B miễn phí** | ✅ Llama 3.3 70B | ✅ Llama 3.3 70B | ❌ Chỉ có model nhỏ | ✅ Nhưng limit thấp |
| **Free Tier** | 14,400 req/ngày (8B) — 1,000 req/ngày (70B) | 1M tokens/ngày | 10,000 neurons/ngày | Dynamic limits |
| **Cần thẻ tín dụng** | ❌ Không | ❌ Không | ❌ Không | ❌ Không |
| **Langchain SDK** | ✅ `@langchain/groq` | ❌ Cần tự viết wrapper | ❌ Cần tự viết wrapper | ✅ Có hỗ trợ |
| **Tính ổn định** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Hỗ trợ TV (Tiếng Việt)** | ✅ Tốt (Llama 3.3) | ✅ Tốt | ⚠️ Model nhỏ → kém | ✅ Tốt |

**Kết luận**: Groq là lựa chọn tối ưu nhất vì:
1. **Tốc độ TTFT (Time To First Token) ổn định nhất** — quan trọng cho chatbot interactive
2. **Có sẵn @langchain/groq** — tích hợp vào codebase hiện tại chỉ thay đổi 3-5 dòng
3. **Model Llama 3.3 70B miễn phí** — thông minh gấp ~47 lần model qwen2.5:1.5b hiện tại
4. **Free tier dư dả** cho đồ án (1,000 request/ngày với model 70B)

> **Phương án dự phòng (Fallback)**: Nếu Groq gặp sự cố hoặc hết quota, có thể fallback sang **Cerebras** (cũng miễn phí, OpenAI-compatible API) chỉ bằng cách đổi `baseURL` và `apiKey`.

---

## 4. CÁC TỐI ƯU NÂNG CAO (TĂNG ĐỘ CHÍNH XÁC)

Ngoài việc đổi nền tảng LLM, để chatbot trả lời **chính xác hơn**, cần tối ưu cả phần Retrieval (tìm kiếm context).

### 4.1. Tối ưu Chunking Strategy
**Hiện tại (Cũ)**:
```javascript
chunkSize: 1000,    // Quá lớn → AI nhận được context dài, dễ bị "lạc"
chunkOverlap: 200,
```

**Đề xuất (Mới)**:
```javascript
chunkSize: 500,     // Chunk nhỏ hơn → Mỗi chunk tập trung vào 1 ý → Tìm kiếm chính xác hơn
chunkOverlap: 100,  // Giảm tương ứng
```

**Lý do**: Nghiên cứu RAG 2025-2026 chỉ ra rằng chunk nhỏ hơn (300-600 ký tự) giúp retrieval chính xác hơn với tài liệu giáo dục, vì mỗi chunk sẽ chứa đúng 1 khái niệm thay vì trộn lẫn nhiều ý.

### 4.2. Tối ưu Prompt Engineering
**Hiện tại (Cũ)** — Prompt quá đơn giản:
```
Bạn là một trợ lý học tập thông minh. Sử dụng ngữ cảnh dưới đây...
```

**Đề xuất (Mới)** — Prompt có cấu trúc rõ ràng, ép model bám sát context:
```
Bạn là một giáo sư, trợ lý học tập chuyên nghiệp.

QUY TẮC BẮT BUỘC:
1. CHỈ trả lời dựa trên Ngữ cảnh bên dưới. KHÔNG bịa thông tin.
2. Nếu Ngữ cảnh không đủ, hãy nói rõ "Tài liệu không đề cập đến vấn đề này" 
   rồi mới bổ sung kiến thức chung (nếu có).
3. Trả lời bằng Tiếng Việt, ngắn gọn, rõ ràng, có cấu trúc (dùng bullet point khi cần).
4. Trích dẫn nội dung cụ thể từ Ngữ cảnh để minh chứng.

Ngữ cảnh:
{context}

Câu hỏi: {question}
```

### 4.3. Cơ chế Fallback khi Groq bị Rate Limit
Khi vượt quá giới hạn miễn phí (HTTP 429), backend cần xử lý graceful:

```javascript
// Chiến lược: Groq (Primary) → Cerebras (Fallback) → Ollama Local (Last Resort)
try {
    response = await groqModel.invoke(prompt);
} catch (error) {
    if (error.status === 429) {
        console.warn("⚠️ Groq rate limited. Falling back to Cerebras...");
        response = await cerebrasModel.invoke(prompt); // Backup miễn phí
    }
}
```

### 4.4. Model được khuyến nghị

| Tác vụ | Model | Nền tảng | RAM cần | Ghi chú |
|---|---|---|---|---|
| **Embedding** | `nomic-embed-text` | Ollama (Local) | ~270MB | Giữ nguyên, rất nhẹ |
| **Chat QA** | `llama-3.3-70b-versatile` | Groq (Cloud) | 0 (Cloud) | Thông minh nhất, miễn phí |
| **Quiz Generation** | `llama-3.3-70b-versatile` | Groq (Cloud) | 0 (Cloud) | Output JSON ổn định |
| **Fallback Chat** | `llama-3.3-70b` | Cerebras (Cloud) | 0 (Cloud) | Dự phòng khi Groq hết quota |

---

## 5. HƯỚNG DẪN TRIỂN KHAI

### Bước 1: Tạo tài khoản Groq (2 phút)
1. Truy cập: https://console.groq.com
2. Đăng nhập bằng Gmail (không cần thẻ tín dụng)
3. Vào **API Keys** → Create New Key → Copy key

### Bước 2: Cài đặt thư viện
```bash
cd backend
npm install @langchain/groq
```

### Bước 3: Cấu hình biến môi trường
Thêm vào file `backend/.env`:
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Bước 4: Cập nhật `aiService.js`
```javascript
const { ChatGroq } = require('@langchain/groq');
const ragPipeline = require('./ragPipeline');
const fs = require('fs').promises;

class AIService {
    constructor() {
        // ✅ Thay Ollama Local bằng Groq Cloud cho phần Generation
        this.model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.3-70b-versatile",  // 70 tỉ tham số, miễn phí
            temperature: 0.1,                   // Giảm hallucination tối đa
            maxRetries: 2,
        });
    }

    async processDocument(filePath, metadata = {}) {
        // ✅ Giữ nguyên — Embedding vẫn chạy LOCAL qua Ollama
        const decodedPath = decodeURIComponent(filePath);
        const fileBuffer = await fs.readFile(decodedPath);
        const isPdf = decodedPath.toLowerCase().endsWith('.pdf');
        return await ragPipeline.ingestDocument(fileBuffer, metadata, isPdf);
    }

    async askQuestion(question, filter = {}) {
        // Bước 1: Tìm context từ MongoDB (qua Ollama Embedding LOCAL)
        const context = await ragPipeline.retrieveContext(question, filter);

        // Bước 2: Gửi lên Groq Cloud để sinh câu trả lời
        const prompt = `Bạn là một giáo sư, trợ lý học tập chuyên nghiệp.

QUY TẮC BẮT BUỘC:
1. CHỈ trả lời dựa trên Ngữ cảnh bên dưới. KHÔNG bịa thông tin.
2. Nếu Ngữ cảnh không đủ, hãy nói rõ "Tài liệu không đề cập đến vấn đề này" rồi mới bổ sung kiến thức chung.
3. Trả lời bằng Tiếng Việt, ngắn gọn, rõ ràng, có cấu trúc.
4. Trích dẫn nội dung cụ thể từ Ngữ cảnh để minh chứng.

Ngữ cảnh:
${context}

Câu hỏi: ${question}
Trả lời:`;

        const response = await this.model.invoke(prompt);
        return response;
    }
}

module.exports = new AIService();
```

### Bước 5: Cập nhật `quizService.js` (Tương tự)
```javascript
const { ChatGroq } = require('@langchain/groq');
// ... thay thế Ollama bằng ChatGroq với cùng config
```

### Bước 6: Giảm chunk size trong `ragPipeline.js`
```javascript
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,     // Giảm từ 1000
    chunkOverlap: 100,  // Giảm từ 200
});
```

---

## 6. GIỚI HẠN VÀ LƯU Ý

### 6.1. Rate Limits của Groq Free Tier
| Model | Requests/phút | Requests/ngày | Tokens/ngày |
|---|---|---|---|
| `llama-3.3-70b-versatile` | 30 | 1,000 | 100,000 |
| `llama-3.1-8b-instant` | 30 | 14,400 | 500,000 |

→ Với đồ án demo, **1,000 request/ngày** là quá đủ. Nếu cần nhiều hơn, chuyển sang model `8b-instant` (vẫn rất tốt, 14,400 req/ngày).

### 6.2. Dữ liệu gửi lên Groq
- Chỉ có **câu hỏi** + **5 đoạn text nhỏ** (mỗi đoạn ~500 ký tự) được gửi lên Groq.
- File PDF gốc **KHÔNG BAO GIỜ** rời khỏi máy Local.
- Groq cam kết: Dữ liệu API **không được dùng để train model** (trên free tier).

### 6.3. Yêu cầu phần cứng tối thiểu (sau khi áp dụng Hybrid)
| Thành phần | Yêu cầu |
|---|---|
| CPU | Bất kỳ (i3 trở lên) |
| RAM | 4GB+ (Ollama Embedding chỉ tốn ~270MB) |
| GPU | **Không cần** |
| Internet | Cần kết nối khi hỏi đáp (gửi API) |

---

## 7. TỔNG KẾT

Kiến trúc Hybrid RAG (Local Embedding + Cloud Generation qua Groq) là **phương án tối ưu nhất hiện tại** (04/2026) cho dự án đồ án với ràng buộc miễn phí + máy yếu, vì:

1. ⚡ **Nhanh**: Thời gian phản hồi < 2 giây (nhờ chip LPU của Groq)
2. 🎯 **Chính xác**: Model 70B tham số + Prompt Engineering chặt chẽ + Chunk size tối ưu
3. 🔒 **Bảo mật**: Tài liệu gốc ở Local, chỉ gửi context nhỏ lên Cloud
4. 💰 **Miễn phí**: Groq free tier không cần thẻ tín dụng
5. 💻 **Nhẹ**: Máy 4GB RAM vẫn chạy mượt (chỉ chạy Embedding nhẹ trên Local)
6. 🔄 **Có Fallback**: Cerebras làm backup khi Groq gặp sự cố

---

## 8. HƯỚNG DẪN CHẠY LẦN ĐẦU TRÊN MÁY KHÁC (DÀNH CHO TEAM)

### 8.1. Yêu cầu cài đặt trước

| **Ollama** | Bản mới nhất | https://ollama.com/download |


Tóm tắt thứ tự chạy (Quick Start)


# 1. Cài đặt (chỉ lần đầu)

ollama pull nomic-embed-text
ollama serve

cd backend && npm install
cd ../frontend && npm install

# 2. Chạy hàng ngày (3 terminal)
ollama serve                      # Terminal 1
cd backend && npm run dev         # Terminal 2
cd frontend && npm run dev        # Terminal 3
```
