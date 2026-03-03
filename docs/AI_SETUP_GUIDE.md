# � Hướng Dẫn Cài Đặt AI (Siêu Tốc)

Dành cho các thành viên muốn chạy và code AI trên máy mới.

## 1. Cài đặt AI Engine (Chỉ làm 1 lần)
1. Tải và cài đặt **Ollama** tại [ollama.com](https://ollama.com/).
2. Mở Terminal và tải 2 model sau:
   ```bash
   ollama pull qwen2.5:1.5b
   ollama pull nomic-embed-text
   ```

## 2. Cài đặt Project (Chỉ làm 1 lần)
1. Di chuyển vào thư mục `backend/`.
2. Chạy lệnh cài đặt thư viện:
   ```bash
   npm install
   ```
3. Đảm bảo file `.env` đã có: `OLLAMA_URL=http://localhost:11434`

## 3. Cách chạy (Lần đầu & Lần sau)
Mỗi khi muốn làm việc với AI, bạn chỉ cần thực hiện đúng 2 bước:
1. **Mở Ollama** (Nếu chưa chạy).
2. **Chạy Backend**: 
   ```bash
   cd backend
   npm run dev
   ```

---

## 🛠 Kiểm tra nhanh qua Postman
1. **Nạp file (Ingest)**: `POST http://localhost:5000/api/ai/ingest`
   - Body JSON: `{ "filePath": "tên_file.pdf" }`
   - *Mẹo: Copy file PDF vào thư mục backend để dùng tên file ngắn gọn.*
2. **Hỏi đáp (Ask)**: `POST http://localhost:5000/api/ai/ask`
   - Body JSON: `{ "question": "Nội dung là gì?" }`

> **Lưu ý**: Nếu báo lỗi `ENOENT`, hãy kiểm tra lại đường dẫn file có đúng không (ưu tiên để file trong thư mục `backend`).
