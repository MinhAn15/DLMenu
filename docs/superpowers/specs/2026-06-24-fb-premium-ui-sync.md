# Design & Implementation Spec: F&B Premium UI Sync

## 1. Goal
Đồng bộ hóa toàn bộ UI/UX của Landing Page theo phong cách **F&B Premium (Tone Ấm Áp & Cao Cấp)**. Loại bỏ sự lộn xộn giữa tone "Xám/Lạnh" (SaaS) và "Nâu/Cam" (Thô mộc). Mang lại một tổng thể thiết kế thống nhất, đáng tin cậy, chuẩn Enterprise nhưng vẫn giữ được "vị ngon" của ngành F&B.

## 2. Color Palette Standardization
Khai báo và tái cấu trúc lại các biến màu trong CSS Modules:
- **Background Primary:** `#FFFDF8` (Trắng ngà / Floral White) - Tạo cảm giác sạch sẽ, sáng sủa nhưng không bị chói mắt như trắng tinh.
- **Background Secondary (Hero & Footer):** `#FFF8ED` (Kem nhạt / Orange 50) - Phân tách các khu vực nội dung.
- **Primary Brand Color:** `#D97706` (Cam Nghệ / Amber 600) - Dùng cho nút bấm, nhấn mạnh văn bản.
- **Text Color:** `#291C15` (Nâu Espresso cực đậm) - Thay vì dùng `#000000` (Đen tuyền) hay Slate (Xám xanh), ta dùng màu nâu sậm để thống nhất vibe F&B.
- **Card Borders & Shadows:** Viền thẻ siêu nhạt `rgba(217, 119, 6, 0.15)`, shadow ngả màu cam/nâu `0 10px 15px -3px rgba(217, 119, 6, 0.05)`.

## 3. Component Updates
Tiến hành cập nhật hàng loạt trên các file:

### 3.1. `src/app/page.module.css` (Global Home Styles)
- Cập nhật `.hero` background sang màu kem ấm (`#FFF8ED`).
- Cập nhật `.featCard` (Phần Nền tảng vững chắc): Đổi màu nền thẻ thành Trắng, thay viền xám (`rgba(226, 232, 240)`) bằng viền ấm, cập nhật hover shadow sang tone Amber.
- Cập nhật `.priceCard` tương tự. Đảm bảo nút "Bắt đầu miễn phí" có màu gradient Amber bắt mắt.

### 3.2. `src/components/ui/InteractiveStepper.module.css`
- Đổi nền khu vực Mockup Window từ Xám lạnh (`#f8fafc`) sang Trắng ngà (`#fffdf8`) hoặc Kem nhạt.
- Cập nhật các màu viền (`border-color`) từ tone xám (slate-100/200) sang tone ấm.
- Đồng bộ màu chữ (Text) sang tone Espresso.

### 3.3. `src/components/ui/LiveDemoBento.tsx` & `.css` (Khu vực đầu trang)
- Phần thẻ "Tích điểm thành viên" hiện tại có nền màu nâu quá sậm và gắt (`#8C4A26` hoặc tương tự), làm chìm thiết kế. Chuyển thẻ này sang màu Cam Gradient (giống như thẻ VIP Gold trong Interactive Stepper) để đồng bộ hoàn toàn concept "Thành viên = Thẻ Vàng".
- Các thẻ Bento khác giữ nền trắng, điều chỉnh border radius thành 24px đồng nhất toàn site.

## 4. Verification Plan
- Chạy Browser Subagent để chụp ảnh toàn trang.
- Đảm bảo 3 khu vực: Hero Bento, Interactive Stepper và Features Section có cùng một ngôn ngữ thiết kế, liền mạch khi cuộn trang.
