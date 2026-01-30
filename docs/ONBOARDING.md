# 🚀 Hướng Dẫn Setup & Onboarding Team

Chào mừng bạn đến với dự án **Online Learning AI**!
Đây là hướng dẫn nhanh để bạn setup môi trường và bắt đầu code ngay sau khi pull code về từ nhánh `dev`.

## 1. Yêu cầu tiên quyết
- **Node.js**: v18 trở lên.
- **Git**: Đã cài đặt.
- **Docker Desktop**: (Tùy chọn) Để chạy MongoDB/Ollama local.

## 2. Setup dự án (Lần đầu tiên)

### Bước 1: Pull code mới nhất
```bash
git checkout dev
git pull origin dev
```

### Bước 2: Cài đặt Dependencies
Bạn cần cài đặt package cho cả Backend và Frontend.

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### Bước 3: Cấu hình biến môi trường
Tạo file `backend/.env` (copy từ `.env.example` nếu có) và điền thông tin sau:

```env
PORT=5000
# Connection String dùng chung cho Team (MongoDB Atlas)
MONGO_URI=mongodb+srv://online-learning-ai_db:Ab123456%40@online-learning-ai.nujhveb.mongodb.net/?appName=Online-learning-ai
OLLAMA_URL=http://localhost:11434
JWT_SECRET=supersecretkey_team_dev
```
*> Lưu ý: Nếu muốn chạy DB Local, hãy sửa `MONGO_URI=mongodb://localhost:27017/online_learning`.*

## 3. Chạy Server

### Cách 1: Chạy thủ công (Khuyên dùng để Dev)
Mở 2 terminal:

**Terminal 1 (Backend)**: `cd backend` -> `npm run dev`
*(Log thành công: ✅ MongoDB Connected...)*

**Terminal 2 (Frontend)**: `cd frontend` -> `npm run dev`
*(App chạy tại: http://localhost:5173)*

### Cách 2: Chạy bằng Docker
```bash
docker-compose up --build
```

## 4. Quy trình làm việc (Git Flow)
1. Luôn pull `dev` mới nhất trước khi làm việc: `git pull origin dev`.
2. Tạo nhánh feature riêng: `git checkout -b feature/ten-cua-ban`.
3. Code xong -> Push lên -> Tạo Pull Request vào `dev`.

---
**Happy Coding!** 🚀
