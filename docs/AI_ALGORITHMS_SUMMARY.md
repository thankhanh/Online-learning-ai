# TÓM TẮT CÁC THUẬT TOÁN AI TRONG DỰ ÁN

> Tài liệu này mô tả chi tiết các thuật toán và kỹ thuật AI được áp dụng trong dự án Online Learning AI, phục vụ cho 2 chức năng: **Chatbot hỏi đáp** và **Tạo đề thi trắc nghiệm tự động**.

---

## 1. RETRIEVAL-AUGMENTED GENERATION (RAG)

### 1.1. Mô tả
RAG là kiến trúc cốt lõi của toàn bộ hệ thống AI trong dự án. Thay vì để LLM tự bịa câu trả lời từ "trí nhớ" sẵn có, RAG bắt buộc LLM phải đọc ngữ cảnh thực tế (lấy từ cơ sở dữ liệu vector) trước khi trả lời.

### 1.2. Luồng hoạt động trong dự án
```
Câu hỏi → Embedding(query) → Vector Search(MongoDB) → Top-K chunks → LLM(Groq) → Câu trả lời
```

### 1.3. Ưu điểm
- Giảm thiểu **hallucination** (bịa thông tin) vì LLM bị ép trả lời dựa trên dữ liệu thực
- Không cần **fine-tuning** (huấn luyện lại) model — tiết kiệm thời gian và chi phí
- Dễ cập nhật kiến thức — chỉ cần nạp thêm tài liệu PDF mới, không cần train lại
- Phù hợp với dữ liệu chuyên ngành (bài giảng đại học)

### 1.4. Nhược điểm
- Chất lượng phụ thuộc vào bước Retrieval — nếu tìm sai context thì LLM trả lời sai
- Giới hạn bởi context window — không thể nhồi cả cuốn sách vào 1 prompt
- Cần xây dựng và bảo trì Vector Database riêng

### 1.5. Nguồn tài liệu
- Lewis, P., et al. (2020). *"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"*. [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)
- LangChain Documentation. *"RAG Tutorial"*. [https://js.langchain.com/docs/tutorials/rag](https://js.langchain.com/docs/tutorials/rag)

---

## 2. TEXT EMBEDDING (BIỂU DIỄN VECTOR)

### 2.1. Mô tả
Text Embedding là thuật toán biến đổi văn bản (text) thành một vector số học trong không gian nhiều chiều (768 chiều). Các đoạn văn có ý nghĩa tương tự nhau sẽ có vector "gần nhau" trong không gian này.

### 2.2. Áp dụng trong dự án
- **Model**: `nomic-embed-text` (chạy local qua Ollama)
- **Kích thước vector**: 768 chiều
- **Dùng cho**: Chuyển đổi cả tài liệu PDF lẫn câu hỏi của user thành vector để so sánh ngữ nghĩa
- **File code**: `ragPipeline.js` → `OllamaEmbeddings({ model: 'nomic-embed-text' })`

### 2.3. Ưu điểm
- Hiểu được **ngữ nghĩa** (semantic), không chỉ so khớp từ khóa — VD: "xe hơi" và "ô tô" sẽ ra vector gần nhau
- Model `nomic-embed-text` rất nhẹ (~270MB RAM), chạy trên CPU bình thường
- Chạy hoàn toàn **local** — tài liệu không rời khỏi máy tính

### 2.4. Nhược điểm
- Phụ thuộc Ollama phải chạy nền trên máy
- Embedding model không thể "hiểu sâu" bằng LLM — chỉ đo mức tương đồng ngữ nghĩa bề mặt
- Chất lượng embedding phụ thuộc vào ngôn ngữ — model chủ yếu train trên tiếng Anh

### 2.5. Nguồn tài liệu
- Nussbaum, Z., et al. (2024). *"Nomic Embed: Training a Reproducible Long Context Text Embedder"*. [arXiv:2402.01613](https://arxiv.org/abs/2402.01613)
- Ollama Documentation. [https://ollama.com/library/nomic-embed-text](https://ollama.com/library/nomic-embed-text)

---

## 3. RECURSIVE CHARACTER TEXT SPLITTING (CHIA NHỎ VĂN BẢN)

### 3.1. Mô tả
Thuật toán chia nhỏ văn bản dài (từ PDF) thành các đoạn ngắn (chunks) có kích thước cố định, với phần chồng lấn (overlap) giữa các chunks để không bị mất ngữ cảnh tại ranh giới.

### 3.2. Áp dụng trong dự án
- **Thư viện**: `@langchain/textsplitters` → `RecursiveCharacterTextSplitter`
- **Tham số**:
  - `chunkSize: 500` — mỗi chunk tối đa 500 ký tự
  - `chunkOverlap: 100` — 100 ký tự chồng lấn giữa 2 chunk liền kề
- **Chiến lược cắt**: Ưu tiên cắt theo `\n\n` (đoạn văn) → `\n` (dòng) → `.` (câu) → ` ` (từ) → ký tự
- **File code**: `ragPipeline.js` dòng 70-73

### 3.3. Ưu điểm
- Giữ nguyên cấu trúc ngữ nghĩa tự nhiên (cắt theo đoạn văn trước, không cắt giữa câu)
- Overlap giúp không bị mất thông tin tại điểm nối giữa 2 chunk
- Chunk nhỏ (500 ký tự) → mỗi chunk chứa 1 ý chính → Retrieval chính xác hơn

### 3.4. Nhược điểm
- Chunk quá nhỏ có thể mất ngữ cảnh rộng (VD: chunk chứa "Đáp án là C" nhưng không chứa câu hỏi)
- Phải chọn chunkSize phù hợp với loại tài liệu — không có giá trị "tốt nhất cho mọi trường hợp"

### 3.5. Nguồn tài liệu
- LangChain Documentation. *"RecursiveCharacterTextSplitter"*. [https://js.langchain.com/docs/how_to/recursive_text_splitter](https://js.langchain.com/docs/how_to/recursive_text_splitter)

---

## 4. VECTOR SIMILARITY SEARCH (TÌM KIẾM TƯƠNG ĐỒNG VECTOR)

### 4.1. Mô tả
Thuật toán tìm kiếm các vector gần nhất (Approximate Nearest Neighbor — ANN) trong không gian nhiều chiều. MongoDB Atlas sử dụng thuật toán **HNSW** (Hierarchical Navigable Small World) để tìm kiếm nhanh.

### 4.2. Áp dụng trong dự án
- **Nền tảng**: MongoDB Atlas Vector Search
- **Index**: `vector_index` trên collection `vectors`
- **Top-K**: Lấy 4-5 chunks gần nhất cho chatbot, 10 chunks cho quiz
- **File code**: `ragPipeline.js` → `vectorStore.similaritySearch(query, k, filter)`

### 4.3. Ưu điểm
- Tốc độ tìm kiếm cực nhanh (O(log n)) dù có hàng triệu vectors nhờ cấu trúc đồ thị HNSW
- Hỗ trợ **metadata filtering** — lọc theo `classroomId` để chỉ tìm trong tài liệu đúng lớp
- Tích hợp sẵn trong MongoDB Atlas — không cần triển khai DB vector riêng (Pinecone, Weaviate)

### 4.4. Nhược điểm
- Là tìm kiếm xấp xỉ (approximate) — có thể bỏ sót kết quả chính xác nhất trong một số trường hợp hiếm
- Yêu cầu tạo Vector Search Index trên MongoDB Atlas thủ công
- Chỉ so sánh ngữ nghĩa, không giỏi tìm kiếm chính xác theo từ khóa (VD: mã số, tên riêng)

### 4.5. Nguồn tài liệu
- Malkov, Y. & Yashunin, D. (2018). *"Efficient and Robust Approximate Nearest Neighbor using Hierarchical Navigable Small World Graphs"*. [arXiv:1603.09320](https://arxiv.org/abs/1603.09320)
- MongoDB Documentation. *"Atlas Vector Search"*. [https://www.mongodb.com/docs/atlas/atlas-vector-search/](https://www.mongodb.com/docs/atlas/atlas-vector-search/)

---

## 5. LARGE LANGUAGE MODEL — LLM (MÔ HÌNH NGÔN NGỮ LỚN)

### 5.1. Mô tả
LLM là mô hình Transformer được huấn luyện trên lượng dữ liệu văn bản khổng lồ, có khả năng hiểu và sinh văn bản tự nhiên. Dự án sử dụng LLM cho 2 tác vụ: **Sinh câu trả lời** (Chatbot) và **Sinh câu hỏi trắc nghiệm** (Quiz).

### 5.2. Áp dụng trong dự án
- **Model**: `llama-3.3-70b-versatile` (70 tỉ tham số, mã nguồn mở của Meta)
- **Nền tảng**: Groq Cloud API (chip LPU, tốc độ ~800 tokens/giây)
- **Thư viện**: `@langchain/groq` → `ChatGroq`
- **Chatbot** (`aiService.js`): `temperature: 0.1` — trả lời chính xác, bám sát context
- **Quiz** (`quizService.js`): `temperature: 0.3` — tạo câu hỏi đa dạng hơn
- **Output Quiz**: JSON có cấu trúc `[{ question, options[], answer }]`

### 5.3. Ưu điểm
- Model 70B tham số — hiểu Tiếng Việt tốt, suy luận logic mạnh
- Groq LPU cho tốc độ sinh token nhanh nhất thế giới (phản hồi < 2 giây)
- Hoàn toàn **miễn phí** (free tier: 1,000 req/ngày cho model 70B)
- Hỗ trợ Structured Output (JSON) — phù hợp cho tạo đề thi có cấu trúc

### 5.4. Nhược điểm
- Phụ thuộc Internet — không hoạt động khi mất mạng
- Free tier có giới hạn rate limit (30 requests/phút, 1,000 requests/ngày)
- Vẫn có thể hallucinate nếu prompt không đủ chặt chẽ
- Dữ liệu (context nhỏ) được gửi lên Cloud — dù Groq cam kết không dùng để train

### 5.5. Nguồn tài liệu
- Grattafiori, A., et al. (2024). *"The Llama 3 Herd of Models"*. [arXiv:2407.21783](https://arxiv.org/abs/2407.21783)
- Groq Documentation. [https://console.groq.com/docs](https://console.groq.com/docs)
- LangChain Groq Integration. [https://js.langchain.com/docs/integrations/chat/groq](https://js.langchain.com/docs/integrations/chat/groq)

---

## 6. PROMPT ENGINEERING (KỸ THUẬT THIẾT KẾ PROMPT)

### 6.1. Mô tả
Prompt Engineering là kỹ thuật thiết kế câu lệnh (prompt) gửi cho LLM sao cho nhận được kết quả chính xác, đúng định dạng, và giảm thiểu bịa thông tin.

### 6.2. Áp dụng trong dự án

**Chatbot** — System Prompt có 4 quy tắc bắt buộc:
1. CHỈ trả lời dựa trên Ngữ cảnh (context). KHÔNG bịa thông tin.
2. Nếu không đủ context → nói rõ "Tài liệu không đề cập" trước khi bổ sung.
3. Trả lời bằng Tiếng Việt, ngắn gọn, có cấu trúc.
4. Trích dẫn nội dung cụ thể từ context để minh chứng.

**Quiz Generation** — Prompt ép output JSON:
- Yêu cầu chính xác 10 câu hỏi
- Định nghĩa schema JSON cụ thể: `{ question, options[], answer }`
- Ràng buộc: `answer` phải khớp chính xác với 1 phần tử trong `options`
- Cấm sinh bất kỳ text nào ngoài JSON

### 6.3. Ưu điểm
- Kiểm soát chất lượng output mà không cần thay đổi model
- Chi phí bằng 0 — chỉ cần viết prompt tốt hơn
- Linh hoạt — có thể thay đổi hành vi AI ngay lập tức mà không cần deploy lại

### 6.4. Nhược điểm
- Không có bảo đảm 100% — LLM vẫn có thể vi phạm quy tắc trong prompt
- Prompt dài quá → tốn token → giảm dung lượng dành cho context thực sự
- Cần thử nghiệm nhiều lần (trial and error) để tìm prompt tối ưu

### 6.5. Nguồn tài liệu
- OpenAI. *"Prompt Engineering Guide"*. [https://platform.openai.com/docs/guides/prompt-engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- Wei, J., et al. (2022). *"Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"*. [arXiv:2201.11903](https://arxiv.org/abs/2201.11903)

---

## 7. BẢNG TỔNG HỢP

| Thuật toán / Kỹ thuật | Áp dụng cho | File code | Ưu điểm chính | Nhược điểm chính |
|---|---|---|---|---|
| **RAG** | Chatbot + Quiz | Toàn bộ pipeline | Giảm hallucination, không cần train | Phụ thuộc chất lượng retrieval |
| **Text Embedding** | Nạp tài liệu + Tìm kiếm | `ragPipeline.js` | Hiểu ngữ nghĩa, nhẹ, chạy local | Phụ thuộc Ollama |
| **Text Splitting** | Nạp tài liệu | `ragPipeline.js` | Giữ cấu trúc ngữ nghĩa | Phải chọn chunkSize phù hợp |
| **Vector Search (HNSW)** | Chatbot + Quiz | `ragPipeline.js` | Nhanh O(log n), có metadata filter | Tìm kiếm xấp xỉ |
| **LLM (Llama 3.3 70B)** | Chatbot + Quiz | `aiService.js`, `quizService.js` | 70B tham số, nhanh, miễn phí | Cần Internet, có rate limit |
| **Prompt Engineering** | Chatbot + Quiz | `aiService.js`, `quizService.js` | Chi phí 0, linh hoạt | Không bảo đảm 100% |
