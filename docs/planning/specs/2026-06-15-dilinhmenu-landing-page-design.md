# DiLinhMenu Landing Page — Design Specification

> **Version**: 2.0 (Adaptive Bento Box Redesign)
> **Date**: 2026-06-19
> **Status**: Approved
> **Author**: AI Architect + Product Owner

---

## 1. Mục tiêu (Objective)
Thiết kế trang Landing Page (trang chủ) cho nền tảng DiLinhMenu (B2B SaaS) nhằm mục đích:
- Thu hút các chủ quán cà phê, quán nhậu tại khu vực Di Linh.
- Giới thiệu giải pháp "Tăng doanh thu & Giữ chân khách hàng" thông qua QR Menu & Loyalty.
- Thuyết phục khách hàng bấm nút "Đăng ký dùng thử miễn phí".
- Đạt điểm 10/10 về mặt thẩm mỹ chuyên nghiệp nhưng vẫn mang đậm màu sắc bản địa mộc mạc đặc trưng của Di Linh (đất đỏ Bazan, xanh đồi chè).

## 2. Thông điệp cốt lõi (Core Value Proposition)
- **Thông điệp chính**: "Quản Lý Quán Đơn Giản & Mộc Mạc"
- **Hai giá trị mũi nhọn**:
  1. Tích điểm & chăm sóc thành viên tự động hóa, tăng trưởng doanh thu từ khách hàng cũ.
  2. Số hóa thực đơn với QR Code mượt mà, tiện lợi, không yêu cầu cài đặt ứng dụng.

## 3. Thẩm mỹ & Thiết kế thích ứng (Aesthetics & Adaptive Design)

Để đảm bảo khả năng hiển thị hoàn hảo ở cả 2 chế độ Light Mode và Dark Mode mà không gặp lỗi tương phản (Contrast Collapse) trên nền gradient sáng cố định của Hero, chúng ta thiết lập hệ thống biến màu sắc cục bộ riêng biệt cho `.hero`:

### 3.1. Chế độ Sáng (Light Mode - Nền kem mộc mạc)
- **Nền Hero (`--hero-bg`)**: `linear-gradient(135deg, #FFFDF9 0%, #FFF5E6 50%, #FFEAD2 100%)` (màu kem ấm áp của sữa đá).
- **Nền Bento Card (`--bento-bg`)**: `rgba(255, 255, 255, 0.85)` (trắng kính mờ, tạo chiều sâu).
- **Màu viền Bento (`--bento-border`)**: `rgba(140, 74, 38, 0.12)` (viền nâu Bazan siêu nhạt).
- **Chữ chính Bento (`--bento-text-primary`)**: `#4A2810` (Nâu đất nung đậm, tương phản sắc nét).
- **Chữ phụ Bento (`--bento-text-secondary`)**: `#7C6150` (Nâu xám ấm).
- **Chữ Badge (`--bento-badge-text`)**: `#D97706` (Vàng cam đất).
- **Nút Active (`--bento-btn-bg`)**: `#8C4A26` (Nâu Bazan chủ đạo).

### 3.2. Chế độ Tối (Dark Mode - Nền Bazan huyền bí)
- **Nền Hero (`--hero-bg`)**: `linear-gradient(135deg, #1C0F0A 0%, #2A170F 50%, #3D1E10 100%)` (màu đất đỏ bazan về đêm).
- **Nền Bento Card (`--bento-bg`)**: `rgba(45, 25, 17, 0.7)` (kính nâu tối ấm áp).
- **Màu viền Bento (`--bento-border`)**: `rgba(232, 93, 74, 0.25)` (viền đỏ đất nung nhạt).
- **Chữ chính Bento (`--bento-text-primary`)**: `#FFF4EE` (Kem sữa nhạt, tương phản rực rỡ).
- **Chữ phụ Bento (`--bento-text-secondary`)**: `#CBB3A5` (Nâu kem nhạt dễ đọc).
- **Chữ Badge (`--bento-badge-text`)**: `#F5A623` (Vàng sáng).
- **Nút Active (`--bento-btn-bg`)**: `#E85D4A` (Màu đỏ cam đồi chè bazan).

### 3.3. Hiệu ứng Kính cao cấp (Premium Glassmorphism)
- Sử dụng bóng đổ đa lớp mang tông màu bazan:
  `box-shadow: 0 4px 20px -2px rgba(140, 74, 38, 0.06), 0 12px 40px -10px rgba(140, 74, 38, 0.08)`
- Viền mỏng 1px kính mờ tinh tế và bộ lọc `backdrop-filter: blur(12px)`.
- Hiệu ứng Hover 3D: dịch chuyển nhẹ nhàng theo chiều dọc và phóng to viền `transform: translateY(-6px) scale(1.02)`.

## 4. Tái cân bằng cấu trúc bố cục (Layout Structure)

Trang Landing Page sẽ được chia thành hai cột lớn trên màn hình rộng ($\ge$ 1024px) với tỷ lệ vàng cân bằng:

- **Cột Trái (Hero Content)**:
  - Chiều rộng chiếm tối đa 50%.
  - Headline H1 được tăng trọng lượng thị giác (`font-size: 3.5rem` trên desktop, `line-height: 1.15`, `letter-spacing: -0.02em`).
  - Nút bấm CTA lớn (`padding: 18px 36px`, `border-radius: 100px`, bổ sung shadow mềm bazan).
  - Tự động căn giữa theo chiều dọc để cân bằng đối xứng với cột bên phải.

- **Cột Phải (Bento Box Visual)**:
  - Chiều rộng giới hạn tối đa `560px` trên desktop để không bị dãn thô.
  - Sử dụng grid layout linh hoạt hỗ trợ 3 cột trên desktop, 2 cột trên tablet, và 1 cột trên mobile.
  - Căn chỉnh chiều cao hợp lý bằng cách loại bỏ các padding dư thừa, đảm bảo Bento Box có chiều cao tương thích với phần chữ giới thiệu bên trái.

## 5. Quy trình Kiểm thử giao diện (Testing Specification)

Để đảm bảo giao diện hoàn hảo và không bị tái lỗi, mọi thay đổi phải tuân thủ quy trình kiểm thử sau:
1. **Kiểm thử thủ công / Tự động qua Browser**: Mở trình duyệt và kiểm tra giao diện ở cả 2 độ phân giải Desktop (1440px) và Mobile (375px).
2. **Kiểm thử độ tương phản**: Sử dụng công cụ đo độ tương phản để đảm bảo tỉ lệ Contrast Ratio $\ge$ 4.5:1 đối với mọi khối văn bản thường và $\ge$ 3.0:1 đối với văn bản lớn.
3. **Kiểm thử đa thiết bị / đa chủ đề**: Chụp ảnh màn hình (screenshot) cả hai phiên bản Light Theme và Dark Theme để thẩm định trực quan.
