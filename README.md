<div align="center">
  <h1>🎓 Hệ Thống Quản Lý Trung Tâm Gia Sư</h1>
  <p><strong>Tutor Management System (TutorEdu)</strong></p>
  <p>
    <em>Đồ án môn học Công Nghệ Phần Mềm</em>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs" alt="NestJS 11" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  </p>
</div>

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng Chính](#-tính-năng-chính)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Vai Trò Người Dùng](#-vai-trò-người-dùng)
- [Hướng Dẫn Cài Đặt](#-hướng-dẫn-cài-đặt)
- [Cấu Hình Môi Trường](#-cấu-hình-môi-trường)
- [Cấu Trúc Project](#-cấu-trúc-project)
- [Database](#-database)
- [API Endpoints](#-api-endpoints)
- [Tài Khoản Test](#-tài-khoản-test)
- [Triển Khai](#-triển-khai)
- [Kết Quả Đạt Được](#-kết-quả-đạt-được)
- [Hạn Chế & Hướng Phát Triển](#-hạn-chế--hướng-phát-triển)
- [Tài Liệu Tham Khảo](#-tài-liệu-tham-khảo)

---

## 🎯 Giới Thiệu

**Tutor Management System (TutorEdu)** là hệ thống web toàn diện giúp số hóa và tự động hóa toàn bộ quy trình hoạt động của trung tâm gia sư. Hệ thống bao phủ toàn bộ vòng đời của lớp học gia sư: từ **đăng ký → ghép lớp → thương lượng → dạy-học → báo cáo → đánh giá**.

### Bài Toán

Các trung tâm gia sư hiện tại gặp nhiều bất cập:
- **Ghép lớp thủ công**: Nhân viên phải tra cứu thủ công để tìm gia sư phù hợp theo môn, khu vực, lịch dạy (mất 30 phút – vài ngày/yêu cầu)
- **Thiếu minh bạch**: Không có hệ thống theo dõi trạng thái yêu cầu, quá trình thương lượng
- **Quản lý hồ sơ phức tạp**: Khó theo dõi trạng thái phê duyệt, chuyên môn của đội ngũ gia sư
- **Thiếu công cụ báo cáo**: Không có cái nhìn tổng quan về hoạt động (số lớp, doanh thu)
- **Tương tác rời rạc**: Thiếu kênh liên lạc có hệ thống giữa trung tâm, gia sư và học viên

### Giải Pháp

Xây dựng hệ thống web với:
- **Matching tự động**: Thuật toán gợi ý gia sư phù hợp dựa trên môn học, khu vực, kinh nghiệm
- **Thương lượng trực tuyến**: Gia sư gửi đề xuất, học viên phản hồi trên hệ thống
- **Tạo lớp tự động**: Khi 2 bên đồng ý, lớp và lịch học được tạo tự động
- **Báo cáo chuẩn hóa**: Gia sư nộp báo cáo buổi học, học viên xem trực tiếp
- **Dashboard thống kê**: Admin có cái nhìn tổng quan về toàn bộ hoạt động

---

## ✨ Tính Năng Chính

### 🔐 Xác Thực & Hồ Sơ
- Đăng ký tài khoản Học viên / Gia sư
- Đăng nhập phân luồng (Hub cho Admin/Staff, Portal cho Tutor/Student)
- Quên mật khẩu qua OTP email
- Cập nhật hồ sơ cá nhân, upload avatar/CV

### 📚 Quản Lý Lớp Học
- Gửi yêu cầu tìm gia sư (Student)
- Xử lý yêu cầu, gợi ý gia sư phù hợp (Staff)
- Thương lượng học phí, lịch học (Tutor ↔ Student)
- Tạo lớp, quản lý lịch, báo cáo buổi học
- Yêu cầu hủy lớp (cần đồng ý 2 bên)

### ⚙️ Quản Trị
- CRUD tài khoản, khóa/mở khóa (Admin)
- Phê duyệt hồ sơ gia sư (Admin/Staff)
- CRUD môn học (Admin)
- Xem nhật ký hệ thống – System Logs (Admin)

### 🔔 Thông Báo & Hỗ Trợ
- Thông báo tự động khi có yêu cầu mới, đề xuất, lớp được tạo
- Gửi email OTP qua SMTP

---

## 🛠 Công Nghệ Sử Dụng

### Frontend
| Công nghệ | Mục đích |
|-----------|----------|
| **Next.js 16** | Framework React với App Router (SSR + CSR) |
| **TypeScript** | Ngôn ngữ lập trình type-safe |
| **Tailwind CSS 4** | CSS utility-first framework |
| **Shadcn/UI** | Component library hiện đại |
| **Lucide Icons** | Icon set |
| **Zod** | Schema validation |

### Backend
| Công nghệ | Mục đích |
|-----------|----------|
| **NestJS 11** | Framework Node.js modular (Controller – Service – Repository) |
| **TypeORM** | ORM mapping entity sang PostgreSQL |
| **Passport.js + JWT** | Xác thực stateless |
| **class-validator** | DTO validation |
| **Nodemailer** | Gửi email SMTP |
| **bcryptjs** | Mã hóa mật khẩu |
| **Helmet** | Bảo mật HTTP headers |

### Database & Storage
| Công nghệ | Mục đích |
|-----------|----------|
| **PostgreSQL 16** | Cơ sở dữ liệu quan hệ |
| **Cloudinary** | Lưu trữ ảnh đại diện và file CV |
| **SMTP** | Gửi email OTP và thông báo |

---

## 🏗 Kiến Trúc Hệ Thống

Hệ thống sử dụng kiến trúc **Client-Server**, tách biệt hoàn toàn Frontend và Backend:

```
┌─────────────────────────────────────────────────────┐
│                    Browser                           │
│  ┌───────────────────────────────────────────────┐  │
│  │            Next.js App (Port 3000)             │  │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────────┐  │  │
│  │  │ Public  │ │   Hub    │ │    Portal     │  │  │
│  │  │  Pages  │ │Admin/Staff│ │ Tutor/Student │  │  │
│  │  └─────────┘ └──────────┘ └───────────────┘  │  │
│  │           middleware.ts (JWT Guard)            │  │
│  └───────────────────────────────────────────────┘  │
└───────────┬─────────────────────────────────────────┘
            │ HTTP / Fetch API
┌───────────▼─────────────────────────────────────────┐
│           NestJS API (Port 3001)                     │
│  ┌─────────┐ ┌──────────┐ ┌─────────────────────┐  │
│  │  Auth   │ │  Users   │ │  Classes (CRUD)     │  │
│  │ Module  │ │  Module  │ │  Schedules, Reports │  │
│  ├─────────┤ ├──────────┤ ├─────────────────────┤  │
│  │Subjects │ │Notifica- │ │  System Logs        │  │
│  │ Module  │ │ tions    │ │  (Audit Trail)      │  │
│  ├─────────┤ ├──────────┤ ├─────────────────────┤  │
│  │  Mail   │ │  Upload  │ │  Settings           │  │
│  │ Module  │ │(Cloudinary)│ │  Module            │  │
│  └─────────┘ └──────────┘ └─────────────────────┘  │
│    Guards: JwtAuthGuard + RolesGuard (RBAC)         │
└───────────┬─────────────────────────────────────────┘
            │ TypeORM
┌───────────▼─────────────────────────────────────────┐
│              PostgreSQL Database                      │
│  16 tables: users, roles, tutors, students,          │
│  classes, schedules, learning_reports, reviews,      │
│  class_requests, subjects, notifications,            │
│  refresh_tokens, otps, system_logs, settings,        │
│  tutor_subjects                                      │
└─────────────────────────────────────────────────────┘
```

### Luồng Xác Thực

JWT Access Token (30 phút) lưu trong HttpOnly Cookie → Frontend middleware.ts verify JWT bằng `jose` trên Edge Runtime → Tự động refresh token khi hết hạn (Refresh Token Rotation).

---

## 👥 Vai Trò Người Dùng

| Vai trò | Mô tả | Quyền chính |
|---------|-------|-------------|
| **Admin** | Quản trị viên trung tâm | Quản lý tài khoản, phê duyệt gia sư, quản lý môn học, xem nhật ký hệ thống, thống kê |
| **Staff** | Nhân viên trung tâm | Xử lý yêu cầu ghép lớp, gợi ý gia sư, quản lý lớp học, xem hồ sơ |
| **Tutor** | Gia sư | Nhận/ghép lớp, gửi đề xuất, thương lượng, báo cáo buổi học, xem thu nhập |
| **Student** | Học viên/Phụ huynh | Gửi yêu cầu tìm gia sư, thương lượng, xem báo cáo, đánh giá |
| **Guest** | Khách chưa đăng nhập | Xem danh sách gia sư, lớp học mới, đăng ký/đăng nhập |

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống

- Node.js 20+
- PostgreSQL 16+
- npm / yarn / pnpm

### 1. Backend

```bash
# Clone repository
git clone <repo-url>
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env (tham khảo Cấu Hình Môi Trường)
cp .env.example .env
# Chỉnh sửa file .env với thông tin của bạn

# Chạy database migration (hoặc để synchronize: true)
# npm run typeorm:migration:run

# Seed dữ liệu mẫu
npm run seed

# Khởi động development server
npm run start:dev
```

Backend sẽ chạy tại **http://localhost:3001**

### 2. Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env.local
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/api" > .env.local

# Khởi động development server
npm run dev
```

Frontend sẽ chạy tại **http://localhost:3000**

### 3. Database (PostgreSQL)

```sql
-- Tạo database
CREATE DATABASE tutormanager;

-- Kết nối đến database
\c tutormanager;
```

---

## 🔧 Cấu Hình Môi Trường

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=tutormanager

# JWT
JWT_SECRET=your_jwt_secret_key_256bit
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary (Avatar & CV upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP (Email)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@tutoredu.com

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/api
```

---

## 📁 Cấu Trúc Project

### Frontend

```
frontend/
├── app/                          # App Router (Next.js)
│   ├── (public)/                 # Trang công khai
│   │   ├── page.tsx              # Trang chủ
│   │   ├── login/                # Đăng nhập
│   │   ├── register/             # Đăng ký
│   │   ├── tutors/               # Danh sách gia sư
│   │   ├── classes/              # Danh sách lớp học mới
│   │   ├── forgot-password/      # Quên mật khẩu
│   │   └── about/                # Giới thiệu
│   ├── (hub)/                    # Cổng Admin/Staff
│   │   ├── hub/dashboard/        # Dashboard Admin
│   │   └── staff/                # Staff (request-management, classes, tutors, students)
│   ├── (portal)/                 # Cổng Tutor/Student
│   │   ├── tutors/               # Dashboard Gia sư
│   │   │   ├── dashboard/        # Trang chính
│   │   │   ├── calendar/         # Lịch dạy
│   │   │   ├── students/         # Học viên
│   │   │   ├── earnings/         # Thu nhập
│   │   │   ├── new-classes/      # Lớp mới
│   │   │   ├── recommendations/  # Đề xuất
│   │   │   └── profile/          # Hồ sơ
│   │   └── student/              # Dashboard Học viên
│   │       ├── page.tsx          # Dashboard
│   │       ├── classes/          # Lớp học
│   │       ├── calendar/         # Lịch học
│   │       └── profile/          # Hồ sơ
│   ├── api/                      # API proxy routes
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # Shared components
│   ├── ui/                       # UI primitives (button, card, input, badge)
│   ├── layout/                   # Header, Footer, Sidebar
│   ├── auth/                     # Auth guards, timeout handler
│   ├── common/                   # Common components (Pagination, Calendar, etc.)
│   └── sections/                 # Homepage sections (Hero, Subjects, Tutors, etc.)
├── lib/                          # Utilities
│   ├── api/                      # API client functions
│   ├── auth.ts                   # Auth helpers (JWT decode, role check)
│   └── hooks/                    # Custom hooks (useDebounce)
├── types/                        # TypeScript type definitions
└── middleware.ts                 # JWT verification, route protection
```

### Backend

```
backend/src/
├── auth/                         # Module xác thực
│   ├── auth.controller.ts        # API endpoints
│   ├── auth.service.ts           # Business logic
│   ├── auth.module.ts            # Module definition
│   ├── dto/                      # Request DTOs
│   ├── guards/                   # JWT Auth Guard, Roles Guard
│   ├── strategies/               # Passport JWT Strategy
│   ├── decorators/               # Custom decorators (@Roles)
│   └── entities/                 # RefreshToken, OTP entities
├── users/                        # Module quản lý users
│   ├── users.controller.ts       # API endpoints
│   ├── users.service.ts          # Business logic
│   ├── admin.controller.ts       # Admin endpoints (CRUD, approve)
│   ├── entities/                 # User, Tutor, Student, Role entities
│   └── users.module.ts
├── classes/                      # Module lớp học
│   ├── classes.controller.ts     # API endpoints
│   ├── classes.service.ts        # Business logic
│   ├── class-requests.*          # Yêu cầu ghép lớp
│   ├── reviews.controller.ts     # Đánh giá
│   ├── dto/                      # Request DTOs
│   └── entities/                 # Class, Schedule, Review, ClassRequest, LearningReport
├── subjects/                     # Module môn học
├── notifications/                # Module thông báo
├── tutors/                       # Module gia sư
├── system-logs/                  # Audit log
├── upload/                       # Cloudinary upload
├── mail/                         # Email service (Nodemailer)
├── settings/                     # System settings
├── app.module.ts                 # Root module
├── main.ts                       # Entry point
└── seed.ts                       # Seed data script
```

---

## 🗄 Database

Hệ thống gồm **16 bảng chính**:

| Bảng | Mô tả |
|------|-------|
| **users** | Tài khoản người dùng (email, password_hash, họ tên, avatar) |
| **roles** | Vai trò (admin, staff, tutor, student) |
| **tutors** | Hồ sơ gia sư (trình độ, kinh nghiệm, trạng thái duyệt) |
| **students** | Hồ sơ học viên (lớp, trường, phụ huynh) |
| **subjects** | Môn học |
| **tutor_subjects** | Liên kết gia sư - môn học (N-N) |
| **classes** | Lớp học (gia sư, học viên, môn, học phí, trạng thái) |
| **schedules** | Lịch học (ngày, giờ, trạng thái buổi học) |
| **learning_reports** | Báo cáo buổi học |
| **reviews** | Đánh giá gia sư |
| **class_requests** | Yêu cầu tìm gia sư |
| **notifications** | Thông báo |
| **refresh_tokens** | Refresh Token Rotation |
| **otps** | Mã OTP quên mật khẩu |
| **system_logs** | Nhật ký hệ thống (audit trail) |
| **settings** | Cài đặt hệ thống |

### Quy Tắc Nghiệp Vụ

- Mỗi email chỉ được tạo 1 tài khoản (UNIQUE constraint)
- Gia sư phải được Admin/Staff phê duyệt (`approval_status = "approved"`) mới có thể đăng nhập và nhận lớp
- Chỉ học viên thuộc lớp đó mới được đánh giá gia sư, và chỉ 1 lần/lớp (UNIQUE student_id + class_id)
- Hủy lớp cần đồng ý từ cả 2 bên (gia sư và học viên)
- Khi Admin khóa tài khoản → tất cả lớp đang active của user đó tự động chuyển "suspended"
- OTP quên mật khẩu có hạn 10 phút, chỉ dùng 1 lần

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register-student` | Đăng ký học viên |
| POST | `/api/auth/register-tutor` | Đăng ký gia sư |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/forgot-password` | Quên mật khẩu (gửi OTP) |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu |
| GET | `/api/auth/profile` | Lấy thông tin profile |
| PATCH | `/api/auth/profile` | Cập nhật profile |

### Users (Admin)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/users` | Danh sách người dùng |
| POST | `/api/admin/users` | Tạo tài khoản mới |
| PUT | `/api/admin/users/:id` | Cập nhật người dùng |
| PATCH | `/api/admin/users/:id/status` | Khóa/Mở khóa |
| DELETE | `/api/admin/users/:id` | Xóa người dùng |

### Tutor Approvals
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/tutors` | Danh sách gia sư |
| PATCH | `/api/admin/tutors/:id/approve` | Phê duyệt/Từ chối |
| GET | `/api/admin/students` | Danh sách học viên |

### Subjects
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/subjects` | Danh sách môn học |
| POST | `/api/admin/subjects` | Tạo môn học |
| PUT | `/api/admin/subjects/:id` | Cập nhật môn học |

### Classes
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/classes` | Danh sách lớp học |
| POST | `/api/classes` | Tạo lớp học |
| PATCH | `/api/classes/:id/status` | Cập nhật trạng thái |
| DELETE | `/api/classes/:id` | Xóa lớp học |

### Class Requests
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/class-requests` | Danh sách yêu cầu |
| POST | `/api/class-requests` | Tạo yêu cầu |
| PATCH | `/api/class-requests/:id/status` | Cập nhật trạng thái |

### Reviews
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/classes/:classId/reviews` | Tạo đánh giá |
| GET | `/api/tutors/:tutorId/reviews` | Lấy đánh giá của gia sư |

### Notifications
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/notifications` | Danh sách thông báo |
| PATCH | `/api/notifications/:id/read` | Đánh dấu đã đọc |
| PATCH | `/api/notifications/read-all` | Đánh dấu tất cả đã đọc |

### Stats & System Logs
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/stats` | Thống kê tổng quan |
| GET | `/api/system-logs` | Nhật ký hệ thống |

---

## 🧪 Tài Khoản Test

Sau khi chạy seed data, các tài khoản sau có sẵn:

| Vai trò | Email | Mật khẩu | Ghi chú |
|---------|-------|----------|---------|
| **Admin** | `admin@tutoredu.com` | `Admin@123` | Full quyền quản trị |
| **Staff** | `staff@tutoredu.com` | `Staff@123` | Nhân viên xử lý yêu cầu |
| **Tutor** | `tutor@test.com` | `123456` | Gia sư mẫu (đã duyệt) |
| **Student** | `student@test.com` | `123456` | Học viên mẫu |

> **Lưu ý**: Các tài khoản gia sư đã duyệt khác (Nguyễn Văn Bình, Trần Thị Cẩm) sử dụng email hệ thống `@tutoredu.com` với mật khẩu tạm thời được gửi qua email cá nhân khi phê duyệt.

---

## 🚢 Triển Khai

### Development
```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```

### Production Build
```bash
# Backend
cd backend && npm run build
npm run start:prod

# Frontend
cd frontend && npm run build
npm run start
```

### Mô Hình Triển Khai
- **Frontend**: Deploy lên Vercel (auto CI/CD từ GitHub)
- **Backend**: Deploy lên Render/Railway
- **Database**: Managed PostgreSQL (Supabase/Neon)
- **Storage**: Cloudinary
- **Containerization**: Docker (Dockerfile cho cả frontend và backend)

---

## 📊 Kết Quả Đạt Được

Hệ thống đã hoàn thành **30+ chức năng chính**:

- ✅ 4 cổng riêng biệt (Admin Hub, Staff Hub, Tutor Portal, Student Portal)
- ✅ Quy trình ghép lớp thông minh với matching score
- ✅ Thương lượng trực tuyến giữa gia sư và học viên
- ✅ Xác thực bảo mật: JWT + Refresh Token Rotation, RBAC, HttpOnly Cookie, Helmet
- ✅ Dashboard thống kê trực quan với biểu đồ
- ✅ Quản lý lịch dạy-học (calendar view)
- ✅ Báo cáo buổi học, theo dõi thu nhập
- ✅ Đánh giá gia sư bởi học viên
- ✅ Audit Log tự động ghi nhật ký mọi thao tác

### Chất Lượng
- ✅ Thời gian phản hồi API < 500ms
- ✅ Dashboard load < 2s
- ✅ Responsive trên mobile và desktop
- ✅ Giao diện hiện đại, UX thân thiện

---

## ⚠️ Hạn Chế & Hướng Phát Triển

### Hạn Chế Hiện Tại
- ❌ Chưa có thông báo realtime (WebSocket/SSE)
- ❌ Chưa tích hợp thanh toán trực tuyến
- ❌ Chưa có unit test / integration test toàn diện
- ❌ Chưa có ứng dụng di động (Mobile App)
- ❌ Chưa tích hợp chat trực tiếp
- ❌ Thuật toán matching còn đơn giản, chưa áp dụng AI/ML

### Hướng Phát Triển
- 🔜 Tích hợp WebSocket/SSE cho thông báo realtime
- 🔜 Phát triển ứng dụng di động (React Native / Flutter)
- 🔜 Tích hợp thanh toán trực tuyến (VNPay, Momo, ZaloPay)
- 🔜 Áp dụng AI/Machine Learning nâng cao gợi ý gia sư
- 🔜 Tích hợp chat realtime (Socket.io)
- 🔜 CI/CD với GitHub Actions, Docker container
- 🔜 Unit test / integration test (Jest, Supertest)
- 🔜 Redis caching cho hiệu năng
- 🔜 Triển khai lên cloud (AWS, Vercel, Railway)

---

## 📖 Tài Liệu Tham Khảo

1. [NestJS Official Documentation](https://docs.nestjs.com/)
2. [Next.js Official Documentation](https://nextjs.org/docs)
3. [TypeORM Documentation](https://typeorm.io/)
4. [PostgreSQL Documentation](https://www.postgresql.org/docs/)
5. [Tailwind CSS Documentation](https://tailwindcss.com/docs)
6. [Shadcn/UI Documentation](https://ui.shadcn.com/)
7. [JWT (JSON Web Token) RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
8. [Passport.js Documentation](http://www.passportjs.org/docs/)
9. [Cloudinary Documentation](https://cloudinary.com/documentation)
10. [Nodemailer Documentation](https://nodemailer.com/about/)
11. [React Documentation](https://react.dev/)
12. [TypeScript Documentation](https://www.typescriptlang.org/docs/)
13. Ian Sommerville, *"Software Engineering"*, 10th Ed., Pearson, 2015
14. Roger S. Pressman, *"Software Engineering: A Practitioner's Approach"*, 9th Ed., McGraw-Hill, 2019

---

## 📄 Giấy Phép

Dự án này được thực hiện với mục đích học tập tại Học viện Công nghệ Bưu chính Viễn thông (PTIT).

---

<div align="center">
  <p><strong>Học viện Công Nghệ Bưu Chính Viễn Thông</strong></p>
  <p>Đồ án môn học: Công Nghệ Phần Mềm</p>
  <p>TP.HCM, tháng 06/2026</p>
</div>
