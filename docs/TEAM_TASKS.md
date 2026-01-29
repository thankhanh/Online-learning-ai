# 📋 TEAM TASK TRACKING & GIT FLOW

> **TRẠNG THÁI DỰ ÁN**: 🏗️ **GIAI ĐOẠN 1: IMPLEMENTATION (VIBE CODING)**
> **NGÀY**: 29/01/2026

---

## 🌳 QUY TẮC GIT & LÀM VIỆC (BẮT BUỘC)

1.  **Nhánh Chính**:
    *   `main`: Phiên bản sản phẩm (Stable). Chỉ Leader được merge vào.
    *   `dev`: Nhánh phát triển chung. Nơi Leader tổng hợp code.
2.  **Nhánh Thành Viên (Feature Branches)**:
    *   Frontend: `feature/frontend`
    *   Backend: `feature/backend`
    *   AI: `feature/ai`
3.  **Quy Trình**:
    *   B1: `git checkout feature/xxx`
    *   B2: `git pull origin dev` (Lấy code mới nhất)
    *   B3: Code & Test
    *   B4: `git push origin feature/xxx` -> Báo Leader Review.

---

## ✅ PHẦN 1: CÔNG VIỆC ĐÃ HOÀN THÀNH (COMPLETED)
*Phần này đã được Leader/System setup xong. Team không cần làm lại.*

1.  **Project Scaffolding**:
    *   [x] Khởi tạo Backend (Express, Node.js).
    *   [x] Khởi tạo Frontend (Vite, React).
2.  **Infrastructure**:
    *   [x] Docker Compose (MongoDB, Ollama, FE, BE).
    *   [x] Cấu hình kết nối Database (Hỗ trợ cả Local & Atlas).
    *   [x] Cấu trúc thư mục Monolithic Modular.
3.  **Database**:
    *   [x] Thiết kế 5 trùm Model: User, Classroom, Material, Exam, Result.

---

## 🚀 PHẦN 2: NHIỆM VỤ HÔM NAY (TODAY'S TASKS)

### 👑 ROLE: LEADER / DATABASE / ADMIN
*   **Trạng thái**: Support & Review.
*   **Nhiệm vụ**:
    - [ ] Theo dõi tiến độ trên 3 nhánh `feature`.
    - [ ] Review PR và Merge vào `dev` khi các bạn hoàn thành.
    - [ ] Hỗ trợ fix lỗi môi trường nếu có.

### 🤖 ROLE: AI ENGINEER
*   **Nhánh**: `feature/ai`
*   **Prompt**: Senior AI Engineer, RAG Specialist.
*   **Trạng thái**: ⏳ PENDING
*   **DOs & DON'Ts**:
    *   ✅ Chỉ code trong `backend/src/services/ai/`.
    *   ❌ Không sửa file config DB hay Server chính.

#### 📝 Task Details:
1.  **Xử lý RAG Pipeline (`backend/src/services/ai/ragPipeline.js`)**:
    - [ ] Implement hàm `ingestDocument`: Đọc PDF -> Split Text -> Embed -> Lưu Memory Vector.
    - [ ] Implement hàm `retrieveContext`: Tìm đoạn văn bản liên quan theo query.
2.  **API Hỏi đáp (`backend/src/controllers/aiController.js`)**:
    - [ ] API `POST /api/ai/ask`: Nhận `question` -> Gọi RAG -> Gọi Ollama -> Trả lời.

---

### 🔌 ROLE: BACKEND ENGINEER
*   **Nhánh**: `feature/backend`
*   **Prompt**: Senior Backend Developer (Node.js).
*   **Trạng thái**: ⏳ PENDING
*   **DOs & DON'Ts**:
    *   ✅ Tập trung logic API và Socket.
    *   ❌ Không đụng vào folder `services/ai`.

#### 📝 Task Details:
1.  **Authentication (`backend/src/controllers/authController.js`)**:
    - [ ] API `POST /auth/register` & `/auth/login`.
    - [ ] Trả về JWT Token + Role (Student/Lecturer).
2.  **Exam Logic (`backend/src/socket/examSocket.js`)**:
    - [ ] Handle `join-exam`: Check user info.
    - [ ] Handle `violation`: Nhận cảnh báo gian lận từ Client -> Lưu vào DB Result.

---

### 🎨 ROLE: FRONTEND ENGINEER
*   **Nhánh**: `feature/frontend`
*   **Prompt**: Senior React Developer.
*   **Trạng thái**: ⏳ PENDING
*   **DOs & DON'Ts**:
    *   ✅ Chỉ code trong `frontend/src/`.
    *   ❌ Không hardcode API URL (dùng biến môi trường).

#### 📝 Task Details:
1.  **Giao diện lớp học (`src/pages/Classroom.jsx`)**:
    - [ ] Hiển thị Video Call (WebRTC Mesh).
    - [ ] Chat Sidebar (Socket.io).
2.  **Giao diện thi (`src/pages/Exam.jsx`)**:
    - [ ] Hiển thị đề thi (Mock data tạm).
    - [ ] **Anti-Cheat**: Bắt sự kiện `visibilitychange` (tab switch), `blur` (mất focus).
    - [ ] Gửi socket `violation` về server ngay khi phát hiện.
