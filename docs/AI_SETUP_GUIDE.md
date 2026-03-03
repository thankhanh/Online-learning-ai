# 📖 Hướng Dẫn Cài Đặt & Chạy AI Local

Tài liệu này hướng dẫn các thành viên trong nhóm cách thiết lập môi trường để chạy các tính năng AI (RAG Pipeline, Hỏi đáp tài liệu) trên máy cá nhân.

## 1. Yêu cầu hệ thống
- **Node.js**: v18 trở lên.
- **RAM**: Tối thiểu 8GB (Khuyến nghị 16GB để chạy AI mượt mà).
- **GPU**: Không bắt buộc nhưng sẽ giúp AI trả lời nhanh hơn.

## 2. Cài đặt Ollama (AI Engine)
Ollama là công cụ dùng để chạy các mô hình ngôn ngữ lớn (LLM) ngay trên máy cục bộ.

1.  Truy cập [ollama.com](https://ollama.com/) và tải về phiên bản phù hợp với OS của bạn.
2.  Cài đặt và khởi chạy Ollama.
3.  Mở Terminal (CMD hoặc PowerShell) và tải các model cần thiết bằng lệnh:
    ```bash
    # Tải model ngôn ngữ (Dùng để trả lời câu hỏi)
    ollama pull qwen2.5:1.5b

    # Tải model embedding (Dùng để xử lý nội dung PDF)
    ollama pull nomic-embed-text
    ```

## 3. Cấu hình Backend
1.  Vào thư mục `backend/`.
2.  Mở file `.env` và kiểm tra cấu hình URL của Ollama:
    ```dotenv
    OLLAMA_URL=http://localhost:11434
    ```
3.  Cài đặt các thư viện mới (LangChain, Ollama integration, pdf-parse...):
    ```bash
    npm install @langchain/ollama pdf-parse langchain @langchain/community
    ```

## 4. Cách chạy và kiểm tra
1.  Khởi động Backend: `npm run dev`
2.  Sử dụng Postman hoặc Curl để kiểm tra API:

### A. Nạp tài liệu (Ingest)
Gửi đường dẫn file PDF để AI học nội dung (Trong giai đoạn dev, truyền `filePath` trực tiếp).
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/ai/ingest`
- **Body (JSON)**:
  ```json
  {
    "filePath": "C:/path/to/your/document.pdf"
  }
  ```

### B. Hỏi đáp (Ask)
Hỏi về nội dung tài liệu đã nạp.
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/ai/ask`
- **Body (JSON)**:
  ```json
  {
    "question": "Nội dung chính của tài liệu này là gì?"
  }
  ```

## 5. Lưu ý cho Frontend
- API AI được đăng ký tại tiền tố `/api/ai`.
- Các bạn FE có thể gọi trực tiếp các endpoint trên để tích hợp vào Sidebar Chat hoặc chức năng hỗ trợ học tập.

---
**Ghi chú**: Nếu gặp lỗi "Connection Refused", hãy đảm bảo ứng dụng Ollama đang chạy ở background.
