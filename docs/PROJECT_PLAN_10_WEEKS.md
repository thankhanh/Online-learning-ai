# 📅 LỊCH TRÌNH PHÁT TRIỂN DỰ ÁN 10 TUẦN
**Ngày bắt đầu**: 30/01/2026
**Ngày kết thúc dự kiến**: 09/04/2026

## 👥 THÀNH VIÊN & VAI TRÒ
1.  🦁 **Leader**: Quản lý source code (`dev`, `main`), Review Code, DevOps (Docker, Deploy), Hỗ trợ kỹ thuật, Setup khung dự án.
2.  🎨 **Frontend Dev (Member 1)**: Phát triển giao diện React, UX/UI, WebRTC, Tương tác người dùng.
3.  🔌 **Backend Dev (Member 2)**: API, Database, Authentication, Socket.io (Real-time).
4.  🤖 **AI Engineer (Member 3)**: RAG System, Ollama integration, Anti-cheat Logic, Exam Generation.

---

## 🗓️ CHI TIẾT CÔNG VIỆC TỪNG TUẦN

### 🟢 GIAI ĐOẠN 1: CORE & AUTHENTICATION (TUẦN 1-2)

#### 📅 Tuần 1 (30/01 - 05/02): Setup & UI Framework
*Mục tiêu: Cả team chạy được dự án local, Frontend có layout cơ bản.*

| Vai Trò | Nhiệm Vụ Cụ Thể | Trạng Thái |
| :--- | :--- | :--- |
| **🦁 Leader** | - Thiết lập Git rule, branch protection.<br>- Viết Document Onboarding chi tiết.<br>- Setup CI/CD cơ bản (Linting). | [x] |
| **🎨 Frontend** | - Cài đặt Tailwind/UI Library.<br>- Dựng Layout chính (Dashboard, Navbar, Sidebar).<br>- Tạo trang Landing Page & 404. | [x] |
| **🔌 Backend** | - Setup Express, Error Handling Middleware.<br>- Kết nối DB (Local & Atlas).<br>- Config Logging (Morgan, Winston). | [x] |
| **🤖 AI** | - Nghiên cứu Ollama & LangChain.<br>- Viết POC (Proof of Concept) script test kết nối Ollama local. | [] |

#### 📅 Tuần 2 (06/02 - 12/02): Authentication & User Management
*Mục tiêu: Đăng ký, Đăng nhập hoàn chỉnh, Lưu profile user.*

| **🦁 Leader** | - Review PR Tuần 1.<br>- Merge code vào `dev`.<br>- Dựng cấu trúc Folder chuẩn cho Controller/Service. | [x] |
| **🎨 Frontend** | - Form Login/Register/Forgot Password.<br>- Xử lý JWT lưu vào LocalStorage/Cookie.<br>- Trang User Profile (View/Edit). | [x] |
| **🔌 Backend** | - API Auth: Register, Login, Refresh Token.<br>- Middleware: `verifyToken`, `authorizeRole`.<br>- API User CRUD. | [x] |
| **🤖 AI** | - Dựng vector database (ChromaDB/Faiss) local.<br>- Model Schema cho Vector Store. | [ ] |

---

### 🟡 GIAI ĐOẠN 2: LỚP HỌC & TÀI LIỆU (TUẦN 3-5)

#### 📅 Tuần 3 (13/02 - 19/02): Quản Lý Lớp Học (Classroom)
*Mục tiêu: Tạo lớp, mời sinh viên, hiển thị danh sách lớp.*

| Vai Trò | Nhiệm Vụ Cụ Thể | Trạng Thái |
| :--- | :--- | :--- |
| **🦁 Leader** | - Hỗ trợ Backend tối ưu Query.<br>- Review Logic phân quyền lớp học. | [ ] |
| **🎨 Frontend** | - UI Danh sách lớp học (Grid/List view).<br>- UI Tạo lớp học (Modal).<br>- Trang chi tiết lớp học (Stream/Newsfeed). | [ ] |
| **🔌 Backend** | - API CRUD Classroom.<br>- API `joinClass` (bằng code hoặc invite link).<br>- Permission middleware cho lớp học. | [x] |
| **🤖 AI** | - Viết hàm `parsePDF` để đọc tài liệu upload.<br>- Test tách text từ file PDF/Docx. | [ ] |

#### 📅 Tuần 4 (20/02 - 26/02): Tài Liệu & RAG System Core
*Mục tiêu: Upload tài liệu và AI bắt đầu "học" tài liệu đó.*

| Vai Trò | Nhiệm Vụ Cụ Thể | Trạng Thái |
| :--- | :--- | :--- |
| **🦁 Leader** | - Setup AWS S3 hoặc MinIO để lưu file (hoặc local storage). | [ ] |
| **🎨 Frontend** | - UI Upload file (Drag & drop).<br>- Progress bar khi upload.<br>- Tab "Tài liệu" trong lớp học. | [ ] |
| **🔌 Backend** | - API Upload file (Multer).<br>- Trigger event: File uploaded -> Báo AI xử lý. | [ ] |
| **🤖 AI** | - Implement `ingestData` pipeline: PDF -> Text -> Chunks -> Vector DB.<br>- API search vector đơn giản để test. | [ ] |

#### 📅 Tuần 5 (27/02 - 05/03): Chatbot AI (Q&A)
*Mục tiêu: Sinh viên hỏi, AI trả lời dựa trên tài liệu lớp học.*

| Vai Trò | Nhiệm Vụ Cụ Thể | Trạng Thái |
| :--- | :--- | :--- |
| **🦁 Leader** | - Tối ưu performance endpoint AI.<br>- Rate limiting cho API Chat. | [ ] |
| **🎨 Frontend** | - UI Chatbox nổi (Floating button).<br>- Hiển thị lịch sử chat.<br>- Typing indicator (AI đang trả lời...). | [ ] |
| **🔌 Backend** | - API Proxy gọi sang AI Service.<br>- Lưu lịch sử chat vào MongoDB. | [ ] |
| **🤖 AI** | - Prompt Engineering: "You are a helpful tutor...".<br>- Kết hợp Search Vector + LLM (Context Injection). | [ ] |

---

### 🟠 GIAI ĐOẠN 3: THI CỬ & ANTI-CHEAT (TUẦN 6-8)

#### 📅 Tuần 6 (06/03 - 12/03): Tạo Đề & Làm Bài Thi
*Mục tiêu: Giảng viên tạo đề, Sinh viên vào làm bài cơ bản.*

| Vai Trò | Nhiệm Vụ Cụ Thể | Trạng Thái |
| :--- | :--- | :--- |
| **🦁 Leader** | - Thiết kế Schema JSON cho đề thi (Question bank). | [ ] |
| **🎨 Frontend** | - UI Soạn đề thi (Dynamic form, thêm/sửa câu hỏi).<br>- Giao diện làm bài thi (Countdown timer). | [ ] |
| **🔌 Backend** | - API Exam CRUD.<br>- API Submit bài thi & Auto-grade (Chấm điểm trắc nghiệm). | [ ] |
| **🤖 AI** | - AI hỗ trợ sinh câu hỏi trắc nghiệm từ tài liệu đính kèm (GenQuiz). | [ ] |

#### 📅 Tuần 7 (13/03 - 19/03): Real-time & Anti-Cheat Basic
*Mục tiêu: Giám sát thời gian thực, phát hiện chuyển tab.*

| Vai Trò | Nhiệm Vụ Cụ Thể | Trạng Thái |
| :--- | :--- | :--- |
| **🦁 Leader** | - Config Socket.io Server (Redis Adapter nếu cần). | [ ] |
| **🎨 Frontend** | - Bắt sự kiện: `blur`, `resize`, `visibilitychange`.<br>- Fullscreen mode enforcement.<br>- Emit socket warning. | [ ] |
| **🔌 Backend** | - Socket Room cho từng bài thi.<br>- API log vi phạm (Violation logs). | [ ] |
| **🤖 AI** | - (Nghiên cứu) Webcam tracking (eye tracking đơn giản bằng JS library hoặc Server-side process). | [ ] |

#### 📅 Tuần 8 (20/03 - 26/03): Video Call & Advanced Proctoring
*Mục tiêu: Gọi video giám sát, AI phân tích hành vi.*

| Vai Trò | Nhiệm Vụ Cụ Thể | Trạng Thái |
| :--- | :--- | :--- |
| **🦁 Leader** | - Setup TURN/STUN server cho WebRTC (nếu cần ra internet). | [ ] |
| **🎨 Frontend** | - Tích hợp WebRTC (PeerJS hoặc SimplePeer) để stream video sinh viên.<br>- Grid View cho Giám thị. | [ ] |
| **🔌 Backend** | - Signaling Server cho WebRTC. | [ ] |
| **🤖 AI** | - Phân tích frame ảnh từ video stream (Server side - optional/heavy) hoặc Client-side Face detection (Tensorflow.js). | [ ] |

---

### 🔴 GIAI ĐOẠN 4: POLISH & DEPLOY (TUẦN 9-10)

#### 📅 Tuần 9 (27/03 - 02/04): Fix Bug & Dashboard Thống Kê
*Mục tiêu: Hoàn thiện tính năng, làm đẹp Dashboard.*

| Vai Trò | Nhiệm Vụ Cụ Thể | Trạng Thái |
| :--- | :--- | :--- |
| **🦁 Leader** | - Stress test server.<br>- Security Audit (SQL Injection, XSS). | [ ] |
| **🎨 Frontend** | - Dashboard Chart (Recharts/Chart.js): Điểm số, Thống kê vi phạm.<br>- Polish UI/UX, Animation. | [ ] |
| **🔌 Backend** | - API Analytics (Aggregate data).<br>- Export Report (PDF/Excel). | [ ] |
| **🤖 AI** | - Fine-tune Prompt lần cuối.<br>- Cải thiện tốc độ RAG. | [ ] |

#### 📅 Tuần 10 (03/04 - 09/04): Deploy & Documentation
*Mục tiêu: Đưa sản phẩm lên môi trường thật, đóng gói.*

| Vai Trò | Nhiệm Vụ Cụ Thể | Trạng Thái |
| :--- | :--- | :--- |
| **🦁 Leader** | - Deploy VPS/Cloud (Docker Swarm/K8s).<br>- Cấu hình Domain, SSL. | [ ] |
| **Team** | - Viết User Guide (HDSD) cho SV và GV.<br>- Quay video demo sản phẩm.<br>- Slide báo cáo đồ án. | [ ] |

---

## 📝 QUY TRÌNH BÁO CÁO (Dành cho Member)
Sau khi hoàn thành task, mỗi member phải update vào file này hoặc `TEAM_TASKS.md`:
1. Đánh dấu `[x]` vào task đã xong. (Sửa file Markdown trực tiếp)
2. Ghi chú ID của Pull Request (PR) tương ứng (Ví dụ: `Feature Login - PR #12`).
3. Báo Leader trên nhóm chat để review.
