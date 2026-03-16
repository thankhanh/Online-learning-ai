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
3. Đảm bảo file `.env` đã có: `OLLAMA_URL=http://127.0.0.1:11434` (Sử dụng 127.0.0.1 để tránh lỗi kết nối trên Windows).

## 3. Cấu hình MongoDB Atlas Vector Search (Mới)
Để AI có thể tìm kiếm dữ liệu đã nạp, bạn **BẮT BUỘC** phải tạo Index trên MongoDB Atlas:
1. Truy cập Atlas Console -> **Search** -> **Create Search Index**.
2. Chọn **Atlas Vector Search** (JSON Editor).
3. Chọn collection `vectors` và dán cấu hình này:
   ```json
   {
     "fields": [
       {
         "numDimensions": 768,
         "path": "embedding",
         "similarity": "cosine",
         "type": "vector"
       },
       {
         "path": "classroomId",
         "type": "filter"
       }
     ]
   }
   ```

---

## 🛠 Kiểm tra nhanh qua Postman

### 1. Nạp file (Ingest)
- **URL**: `POST http://localhost:5000/api/ai/ingest`
- **Body**: Chọn **form-data**
  - `file`: Chọn file PDF từ máy tính (Kiểu: File)
  - `classroomId`: `6980e7970960e0fbd8c2b675` (Ví dụ)
  - `userId`: `6980e7970960e0fbd8c2b665` (Ví dụ)

### 2. Hỏi đáp (Ask)
- **URL**: `POST http://localhost:5000/api/ai/ask`
- **Body JSON**: 
  ```json
  { 
    "question": "Nội dung tài liệu nói về gì?",
    "classroomId": "6980e7970960e0fbd8c2b675"
  }
  ```

> **Lưu ý**: Dữ liệu sau khi nạp sẽ được lưu vĩnh viễn vào MongoDB. Bạn không cần nạp lại file trừ khi muốn cập nhật kiến thức mới.
