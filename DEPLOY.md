# 🚀 Hướng dẫn Deploy AH Pickleball App

## Tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│  Database: Supabase PostgreSQL (Free tier - 500MB)          │
│  Hosting: Vercel (Free tier - Unlimited)                    │
│  Estimated time: 15-20 phút                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## PHẦN 1: TẠO DATABASE TRÊN SUPABASE (5 phút)

### Bước 1.1: Đăng ký tài khoản
1. Truy cập: https://supabase.com
2. Click **"Start your project"**
3. Đăng nhập bằng **GitHub** (nhanh nhất)

### Bước 1.2: Tạo project mới
1. Click **"New project"**
2. Điền thông tin:
   - **Organization**: Chọn org của bạn (hoặc tạo mới)
   - **Name**: `ah-pickleball`
   - **Database Password**: Tạo password mạnh → **LƯU LẠI NGAY!** ⚠️
   - **Region**: `Southeast Asia (Singapore)` ← gần Việt Nam nhất
3. Click **"Create new project"**
4. Đợi khoảng 2 phút để project khởi tạo

### Bước 1.3: Lấy Connection String
1. Vào project vừa tạo
2. Click **Settings** (bánh răng bên trái) → **Database**
3. Kéo xuống mục **Connection string**
4. Chọn tab **Transaction pooler** (port 6543)
5. Copy chuỗi connection (dạng: `postgresql://postgres.[ref]:[password]@...`)

**Quan trọng**: Bạn sẽ cần 2 connection string:
- **DATABASE_URL**: Dùng port `6543` (Transaction pooler) - cho app
- **DIRECT_URL**: Dùng port `5432` (Session pooler) - cho migrations

---

## PHẦN 2: CẤU HÌNH BIẾN MÔI TRƯỜNG (2 phút)

### Bước 2.1: Tạo file .env
Tạo file `.env` ở thư mục gốc dự án:

```bash
# Thay YOUR_PROJECT_REF bằng ref từ Supabase (vd: abcdefghijk)
# Thay YOUR_PASSWORD bằng password bạn đã tạo

DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### Bước 2.2: Push schema lên database
Chạy lệnh sau để tạo các bảng trong Supabase:

```bash
npx prisma db push
```

Nếu thành công, bạn sẽ thấy:
```
🚀  Your database is now in sync with your Prisma schema.
```

### Bước 2.3: Kiểm tra database
```bash
npx prisma studio
```
Mở browser tại http://localhost:5555 để xem các bảng đã được tạo.

---

## PHẦN 3: PUSH CODE LÊN GITHUB (3 phút)

### Bước 3.1: Tạo repo mới trên GitHub
1. Truy cập: https://github.com/new
2. **Repository name**: `ah-pickleball`
3. **Visibility**: Private (khuyến nghị)
4. Click **"Create repository"**

### Bước 3.2: Push code
```bash
# Nếu chưa có git
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/ah-pickleball.git

# Commit và push
git add .
git commit -m "Initial commit: Pickleball billing app"
git branch -M main
git push -u origin main
```

---

## PHẦN 4: DEPLOY LÊN VERCEL (5 phút)

### Bước 4.1: Đăng ký Vercel
1. Truy cập: https://vercel.com
2. Click **"Start Deploying"**
3. Đăng nhập bằng **GitHub**

### Bước 4.2: Import project
1. Click **"Add New..."** → **"Project"**
2. Chọn repo `ah-pickleball` vừa tạo
3. Click **"Import"**

### Bước 4.3: Cấu hình Environment Variables
Trong phần **Environment Variables**, thêm 2 biến:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres.xxx:xxx@...pooler...:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres.xxx:xxx@...pooler...:5432/postgres` |

⚠️ **Quan trọng**: Copy chính xác giá trị từ file `.env` của bạn

### Bước 4.4: Deploy
1. Click **"Deploy"**
2. Đợi khoảng 2-3 phút
3. Khi hoàn tất, bạn sẽ có link dạng: `https://ah-pickleball-xxx.vercel.app`

---

## PHẦN 5: SỬ DỤNG APP

### Dành cho Admin (bạn):
1. Truy cập: `https://YOUR_APP.vercel.app`
2. Bấm ⚙️ (Settings) để thêm thành viên cố định
3. Tạo buổi mới → Thêm người chơi → Nhập trận

### Dành cho anh em xem:
1. Trong trang buổi chơi, bấm nút **Share** 📤
2. Copy link dạng: `https://YOUR_APP.vercel.app/view/[session-id]`
3. Gửi link cho anh em
4. Anh em mở link → Xem kết quả real-time (auto refresh mỗi 5 giây)

---

## 💰 Chi phí

| Dịch vụ | Free tier | Giới hạn |
|---------|-----------|----------|
| **Supabase** | ✅ Miễn phí | 500MB storage, 2 projects |
| **Vercel** | ✅ Miễn phí | 100GB bandwidth/tháng |
| **GitHub** | ✅ Miễn phí | Unlimited private repos |

**Tổng chi phí: 0đ** 🎉

---

## 🔧 Troubleshooting

### Lỗi "Invalid prisma..."
```bash
npm run build
# hoặc
npx prisma generate
```

### Lỗi database connection
- Kiểm tra lại DATABASE_URL và DIRECT_URL
- Đảm bảo password không có ký tự đặc biệt chưa encode

### Muốn reset database
```bash
npx prisma db push --force-reset
```

### Xem logs trên Vercel
1. Vào Vercel Dashboard
2. Chọn project → **Deployments** → Chọn deployment
3. Click **Functions** → Xem logs

---

## 📱 Tips sử dụng

1. **Bookmark trang chính** trên điện thoại để truy cập nhanh
2. **Tạo shortcut** trên màn hình home (Add to Home Screen)
3. **Share link view** cho anh em qua nhóm chat
4. Sau khi thanh toán xong → Xóa buổi để giữ app gọn gàng

Chúc bạn triển khai thành công! 🏓
