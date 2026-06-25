# Admin Menu Design Spec

## Goal
Nâng cấp giao diện trang Quản lý Thực đơn (Admin Menu) của Shop Admin đạt chuẩn Enterprise-grade, đồng bộ với trang Admin Settings đã làm trước đó.

## Design Approach
- **Cấu trúc 2 Cột (Sidebar & Main Content):** 
  - Sidebar bên trái chứa danh sách Categories, giúp chuyển đổi nhanh chóng.
  - Vùng bên phải hiển thị danh sách Món ăn (Items) thuộc danh mục đang chọn.
- **Enhanced Table:** 
  - Bảng món ăn được làm đẹp, tích hợp nút Switch (Bật/Tắt trạng thái Còn/Hết hàng) trực tiếp trên dòng.
  - Hình ảnh thumbnail nhỏ với viền cong mượt mà.
- **Responsive:** Trên màn hình nhỏ, Sidebar sẽ cuộn ngang hoặc thu gọn lên trên.
- **Styling:** Loại bỏ hoàn toàn inline CSS, sử dụng Tailwind utility classes và `lucide-react` icons.

## Data Flow
- Sử dụng hook `useAdminShop` để lấy thông tin quán.
- Fetch API qua tRPC (`trpc.menu.getCategories`, `trpc.menu.getMenuItems`).
- Mutations: Tạo/Sửa/Xóa Category & Item không đổi logic, chỉ bọc trong UI mới đẹp hơn.

## Error Handling & Testing
- Đảm bảo Playwright E2E tests cho Admin Menu không bị gãy do đổi giao diện.
- Xác nhận các Modal Thêm/Sửa vẫn hoạt động bình thường, bổ sung hiệu ứng chuyển động mượt mà.
