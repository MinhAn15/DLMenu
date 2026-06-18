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
