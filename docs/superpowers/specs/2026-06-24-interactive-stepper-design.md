# Interactive Stepper Design Spec

## 1. Goal
Chuyển đổi phần "Vận Hành Đơn Giản Trong 3 Bước" trên Landing Page từ cấu trúc Grid tĩnh thành giao diện Interactive Feature Tabs chuẩn Enterprise-grade. Mục tiêu là tối ưu hóa không gian hiển thị và cung cấp cho người xem (chủ quán) hình dung thực tế nhất về cách ứng dụng hoạt động thông qua các minh họa trực quan.

## 2. Architecture & File Structure
- **Tạo mới:** `src/components/ui/InteractiveStepper.tsx` (Client Component)
- **Cập nhật:** `src/app/page.tsx` (Thay thế mảng `steps` cũ bằng component mới)
- **Cập nhật:** `src/app/page.module.css` (Xóa bỏ các class cũ như `.stepsGrid`, `.stepCard` và thay thế nếu cần)

## 3. State & Interaction (Data Flow)
- Sử dụng Hook `useState` để theo dõi `activeStep` (chỉ mục: 0, 1, 2).
- Cài đặt `useEffect` timer để **tự động chuyển tab (auto-play)** mỗi 5 giây. Vòng lặp sẽ tạm dừng (pause) khi người dùng di chuột (`onMouseEnter`) vào vùng Stepper để họ có thể đọc kỹ thông tin.
- Khi một Tab được chọn (click), bộ đếm timer sẽ tự động reset.

## 4. UI/UX Layout
*Được xây dựng trên nền tảng lưới Tailwind kết hợp CSS modules:*
- **Desktop View (>= 768px):** Màn hình chia làm 2 cột.
  - **Cột trái (40%):** Chứa 3 thẻ Tab theo chiều dọc. Mỗi tab có một thanh tiến trình (progress bar) nhỏ chạy dọc bên trái. Khi active, thanh này sẽ nổi bật màu cam (`#F5A623`) và nội dung tab rõ nét hơn.
  - **Cột phải (60%):** Một khung viền minh họa (Mockup Wrapper) lớn, có màu nền nhạt sang trọng (`bg-slate-50`). Sử dụng `framer-motion` (`AnimatePresence`) để thực hiện hiệu ứng slide & fade khi tab thay đổi.
- **Mobile View (< 768px):** Chuyển sang một cột. Danh sách các Tab nằm trên (có thể thu gọn phần mô tả của các Tab không active) và Mockup nằm ngay bên dưới.

## 5. Visual Content (Abstract UI Mockups)
Để tăng tính chuyên nghiệp và đảm bảo tốc độ tải trang cực nhanh, thay vì dùng ảnh PNG/JPG nặng nề, hệ thống sẽ sử dụng các **Abstract CSS Mockups** (Vẽ UI bằng mã code):
- **Bước 1 (Quét mã):** Hoạt ảnh một chiếc điện thoại đang mô phỏng quét một mã QR code ở giữa màn hình.
- **Bước 2 (Tích điểm tự động):** Giao diện một tấm thẻ thành viên VIP (màu gradient Vàng) nổi lên màn hình với hiệu ứng hạt (particles) "Cộng +35 điểm".
- **Bước 3 (Đồng bộ tức thì):** Một màn hình quản lý nhà bếp (KDS), nơi các tấm "Order Ticket" liên tục trượt vào từ bên phải báo hiệu đơn mới.

## 6. Verification
- Component phải render trơn tru mà không có lỗi Hydration.
- Animations chạy mượt mà ở 60fps, không gây giật lag trên thiết bị di động.
- Tính năng auto-play ngừng hoạt động chính xác khi có tương tác hover chuột.
