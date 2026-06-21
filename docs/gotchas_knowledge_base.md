# DiLinhMenu Knowledge Base & Gotchas

Tài liệu này lưu trữ các kinh nghiệm (Gotchas) và những vấn đề kỹ thuật hóc búa đã gặp trong quá trình xây dựng DiLinhMenu, nhằm giúp thế hệ sau hoặc chính AI có thể debug/cải tiến nhanh chóng.

## 1. Playwright E2E Testing Gotchas

### 1.1 Lỗi "Pointer Events Intercepted" do Next.js `Image` (fill)
- **Vấn đề:** Khi dùng `<Image src="..." fill />` của Next.js cho ảnh `EmptyState`, nếu cha của thẻ `<Image>` thiếu thuộc tính `position: relative`, ảnh sẽ tự động phình to (absolute) đè lên toàn bộ màn hình (`<main>`). Điều này khiến Playwright báo lỗi `subtree intercepts pointer events` khi click vào Sidebar menu.
- **Cách khắc phục:** Luôn bọc `<Image fill>` trong thẻ `div` có class `relative`. Thậm chí an toàn hơn, với các file ảnh tĩnh không cần tối ưu quá sâu, sử dụng thẻ `<img>` HTML kết hợp class `pointer-events-none` và `object-contain`.

### 1.2 Lỗi Supabase Rate Limit (Too Many Requests) trong E2E
- **Vấn đề:** Chạy 5 kịch bản Playwright song song (`workers: 5`) gọi hàm `.createUser` hoặc `signIn` của Supabase Auth. Hệ thống Auth của Supabase có cơ chế chống SPAM, khóa IP ngay lập tức nếu thấy tần suất request quá nhanh.
- **Cách khắc phục:** Trong `playwright.config.ts`, cấu hình cứng `workers: 1` hoặc thiết lập `serial` cho các Test file liên quan đến Auth.

### 1.3 Lỗi Blank Screen ở Admin Dashboard do Rác dữ liệu (Flaky Test)
- **Vấn đề:** File `seed.ts` upsert cửa hàng liên tục nhưng đôi khi có slug trùng lặp, khiến `useAdminShop()` dùng `.single()` bị văng lỗi "Multiple rows returned". Hậu quả: Giao diện trắng hoặc bị văng về màn hình Welcome (Dù user đã có quán).
- **Cách khắc phục:** Cập nhật query thành `.limit(1)` và lấy phần tử đầu tiên `data[0]` thay vì `.single()`.

## 2. Tailwind CSS & Responsive Gotchas

### 2.1 Mất Cân Bằng UI Trên PC (Line breaks)
- **Vấn đề:** Việc dùng `<br />` tĩnh trong thẻ `<h1>` (Ví dụ: `Tăng doanh thu với <br/> QR Menu`) rất đẹp trên Mobile nhưng tạo khoảng trắng vô nghĩa trên PC.
- **Cách khắc phục:** Dùng `<span className="block md:inline"></span>` thay cho `<br />`. Text sẽ tự xuống dòng trên Mobile (do block) nhưng gộp dòng trên PC (inline).

### 2.2 Layout "Dài Loằng Ngoằng" trên PC
- **Vấn đề:** Grid thẻ món ăn (Customer Menu) hoặc Quản lý Đơn hàng (Admin Orders) thường mặc định `flex-col` (1 cột), khiến PC có màn hình rộng bị kéo giãn nút và ảnh rất to.
- **Cách khắc phục:** Luôn định nghĩa grid đa phân giải: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`.

## 3. Business Logic & Supabase RLS Gotchas

### 3.1 Customer Notes (Ghi chú đơn hàng)
- **Vấn đề:** Khách có thể nhập "ít đá, không đường" nhưng Backend chỉ lấy món (menu_item) mà bỏ quên trường note trong `order_items`.
- **Cách khắc phục:** Ghi đè vào bảng `order_items` với cột `note`. Dùng `useCart` store global để lưu `note` song song với `quantity`.

### 3.2 Real-time Polling Đơn hàng
- **Vấn đề:** Khách đặt đơn, chủ quán phải bấm F5 mới thấy đơn. Nếu dùng Supabase `.on('postgres_changes')` đôi khi bị mất kết nối WebSockets (WebSocket Disconnect).
- **Cách khắc phục:** Tích hợp Polling Interval (15 giây) kết hợp cùng WebSockets Listener. Nếu WebSockets chết, setInterval vẫn fetch lại đơn để hệ thống đạt 99.9% uptime.

## 4. AI / NVIDIA NIM Gotchas

### 4.1 react-hot-toast chặn Playwright E2E click
- **Vấn đề:** react-hot-toast render container `z-index: 9999` full-viewport với `pointer-events: none` trên container nhưng `pointer-events: auto` trên children. Playwright dùng `elementFromPoint()` bỏ qua `pointer-events: none` và tìm thấy toast, chặn click vào sidebar/button.
- **Cách khắc phục:** Dùng `page.evaluate(() => el.click())` bypass actionability check, hoặc `waitForTimeout(4000)` cho toast auto-dismiss (mặc định 3s).

### 4.2 Supabase Storage RLS: text = uuid type mismatch
- **Vấn đề:** Migration RLS policy dùng `(storage.foldername(name))[1] = shops.id` — foldername trả về `text` nhưng `shops.id` là `uuid`. PostgreSQL không tự cast kiểu này.
- **Cách khắc phục:** Cast explicit: `(storage.foldername(name))[1]::uuid`.

### 4.3 Tailwind CSS `fixed` + `md:relative` xung đột
- **Vấn đề:** Code `className="fixed md:relative"` không hoạt động như mong đợi — cả 2 đều là one-layer utilities, `fixed` thắng.
- **Cách khắc phục:** Dùng `className="fixed md:sticky"` để mobile fixed, desktop sticky trong flex container.

### 4.4 `useAdminShop` async — shop null khi render lần đầu
- **Vấn đề:** Hook `useAdminShop` fetch shop bằng `useEffect` async. Component render lần đầu với `shop = null`, sau đó re-render khi data về. Trong E2E, click button khi shop chưa load → modal không hiển thị ImageGenerator (vì render condition `{shop && <ImageGenerator />}`).
- **Cách khắc phục:** Trong E2E, `waitForTimeout(3000)` sau khi page hiển thị trước khi click vào element phụ thuộc shop.

## 5. Architecture & Enterprise Gotchas

### 5.1 Monorepo — chỉ extract package khi có consumer thứ 2
- **Vấn đề:** Tạo `packages/ui` + `packages/config` ngay từ đầu khi chỉ có 1 app là YAGNI. Overhead workspace tooling, transpile config, version management.
- **Cách khắc phục:** Chỉ extract `packages/types` + `packages/validation` (2 package thiết yếu cho shared types + validation). Dùng npm workspaces (không Turborepo). Chỉ thêm package khi có app thứ 2 cần dùng.

### 5.2 tRPC context — không gọi getUser() trong context factory
- **Vấn đề:** Nếu gọi `supabase.auth.getUser()` trong `createTRPCContext()`, mọi request (kể cả public/guest endpoints) đều phải chờ auth check ~100-300ms.
- **Cách khắc phục:** Context chỉ tạo supabase client (0.1ms). Auth check đặt trong middleware, chỉ chạy cho `protectedProcedure`. Public procedures không bị ảnh hưởng.

### 5.3 Server Actions vs tRPC — chọn 1 rule rõ ràng, không grey area
- **Vấn đề:** Để cả Server Actions + tRPC cho data mutations tạo confusion — dev không biết nên dùng cái nào.
- **Cách khắc phục:** Rule cứng: "Auth (Supabase SDK) + file uploads (FormData) → Server Action. Mọi data operation còn lại → tRPC." Không có ngoại lệ.

### 5.4 Realtime + TanStack Query — phải dedup subscription updates
- **Vấn đề:** Khi mutation + subscription cùng update cache, race condition xảy ra — subscription có thể merge data cũ sau khi mutation đã update cache mới.
- **Cách khắc phục:** Optimistic update trong `onMutate`. Subscription dùng `commit_timestamp` so sánh với `lastSync` — chỉ merge changes từ OTHER clients, ignore changes do mutation hiện tại gây ra.

### 5.5 Integration tests cho tRPC — dùng createCaller() không cần MSW
- **Vấn đề:** MSW thêm 1 lớp HTTP stack phải mock. tRPC procedures test qua HTTP cần request/response serialization, tăng độ phức tạp.
- **Cách khắc phục:** Dùng `router.createCaller(ctx)` in-process + `vi.mock('@supabase/ssr')`. Nhanh hơn, đơn giản hơn, test đúng business logic. MSW chỉ cần nếu test middleware HTTP-specific.
