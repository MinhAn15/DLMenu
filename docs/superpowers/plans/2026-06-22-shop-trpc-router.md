# Kế hoạch triển khai: Tích hợp shopRouter tRPC & Di trú API Shop Admin

> **Dành cho agent:** KỸ NĂNG BẮT BUỘC: Sử dụng `superpowers:subagent-driven-development` hoặc `superpowers:executing-plans` để thực hiện kế hoạch này từng bước. Các bước sử dụng cú pháp checkbox (`- [ ]`) để theo dõi tiến độ.

**Mục tiêu:** Thay thế hoàn toàn các Server Action phục vụ các trang Shop Admin (promotions, settings, tables, analytics) bằng một router tRPC `shopRouter` tập trung, đảm bảo multitenancy isolation thông qua `ownsShop` middleware và tăng cường tốc độ tải trang bằng React Query.

**Kiến trúc:** 
1. Xây dựng `shopRouter` tại `src/lib/server/routers/shop.ts` phân tách thành các namespace con (`promotions`, `settings`, `tables`, `analytics`).
2. Tích hợp phân quyền thông qua `shopOwnerProcedure` (chỉ cho phép `shop_owner` hoặc `platform_admin`) và kiểm tra tính hợp lệ của shop thông qua middleware `ownsShop`.
3. Thay thế các lệnh gọi Server Actions trực tiếp ở client-side components trong thư mục `src/app/admin/` bằng hooks React Query từ client tRPC.

**Công nghệ sử dụng:** Next.js 16 (App Router), tRPC v10, Zod Validation, Supabase PostgreSQL, Recharts.

---

## Các Thay Đổi Đề Xuất

### 1. Xây dựng tRPC Router cho Shop

#### [NEW] [shop.ts](file:///c:/Project/New%20folder/dilinhmenu/src/lib/server/routers/shop.ts)
Tạo tRPC router cho shop chứa các namespace thủ tục (procedures) cho Promotions, Settings, Tables, và Analytics:
- `promotions.list` (query)
- `promotions.create` (mutation)
- `promotions.delete` (mutation)
- `promotions.toggle` (mutation)
- `settings.updateInfo` (mutation)
- `settings.updateTheme` (mutation)
- `tables.list` (query)
- `tables.create` (mutation)
- `tables.delete` (mutation)
- `tables.toggle` (mutation)
- `analytics.get` (query)

*(Tham khảo ví dụ mã nguồn chi tiết trong file implementation_plan.md chính)*

#### [MODIFY] [_app.ts](file:///c:/Project/New%20folder/dilinhmenu/src/lib/server/routers/_app.ts)
Đăng ký `shopRouter` mới vào `appRouter` chung dưới namespace `shop`.

---

### 2. Di trú các trang Admin Client-Side

#### [MODIFY] [promotions/page.tsx](file:///c:/Project/New%20folder/dilinhmenu/src/app/admin/promotions/page.tsx)
- Xóa import Server Actions từ `@/lib/actions/shop`.
- Sử dụng hook tRPC `trpc.shop.promotions.*`.
- Kích hoạt invalidate cache React Query bằng `utils.shop.promotions.list.invalidate({ shopId: shop.id })` khi mutations thành công.

#### [MODIFY] [settings/page.tsx](file:///c:/Project/New%20folder/dilinhmenu/src/app/admin/settings/page.tsx)
- Xóa import Server Actions từ `@/lib/actions/shop`.
- Sử dụng hook tRPC `trpc.shop.settings.*`.

#### [MODIFY] [tables/page.tsx](file:///c:/Project/New%20folder/dilinhmenu/src/app/admin/tables/page.tsx)
- Xóa import Server Actions từ `@/lib/actions/tables`.
- Sử dụng hook tRPC `trpc.shop.tables.*`.
- Kích hoạt invalidate cache: `utils.shop.tables.list.invalidate({ shopId: shop.id })`.

#### [MODIFY] [analytics/page.tsx](file:///c:/Project/New%20folder/dilinhmenu/src/app/admin/analytics/page.tsx)
- Xóa import Server Actions từ `@/lib/actions/analytics`.
- Sử dụng hook tRPC `trpc.shop.analytics.get.useQuery({ shopId: shop.id, days })`.

---

### 3. Dọn dẹp Server Actions thừa

#### [DELETE] [tables.ts](file:///c:/Project/New%20folder/dilinhmenu/src/lib/actions/tables.ts)
Xóa bỏ hoàn toàn tệp tin Server Action quản lý bàn.

#### [DELETE] [analytics.ts](file:///c:/Project/New%20folder/dilinhmenu/src/lib/actions/analytics.ts)
Xóa bỏ hoàn toàn tệp tin Server Action tính toán analytics.

#### [MODIFY] [shop.ts](file:///c:/Project/New%20folder/dilinhmenu/src/lib/actions/shop.ts)
- Xóa bỏ các Server Actions liên quan đến Promotions và Settings.
- Giữ lại `getAdminShops` và `getAdminShopById`.

---

## Kế hoạch kiểm thử & Xác minh

### Kiểm thử tự động (Automated Tests)
1. **Integration Tests:** Xây dựng tệp `tests/integration/shop.test.ts`.
2. **E2E Tests:** Chạy lại toàn bộ bộ test Playwright:
   ```bash
   npx playwright test
   ```
3. **Static Build Validation:**
   ```bash
   npm run build
   ```
