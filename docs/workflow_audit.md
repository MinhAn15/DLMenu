# Workflow & Skill Audit (DiLinhMenu)

Dựa trên yêu cầu `/skill-repair` và mong muốn tối ưu hóa workflow/skill cho dự án hiện tại, dưới đây là bản đánh giá và đề xuất tinh chỉnh quy trình làm việc (Development Workflows) cũng như cách sử dụng AI Skills (GSD, Superpowers) sao cho phù hợp nhất với **DiLinhMenu**.

---

## 1. Đánh giá Workflows hiện tại của dự án

### ✅ Những gì đang hoạt động tốt:
- **E2E Testing Workflow (Playwright)**: Đã thiết lập thành công luồng test từ đầu đến cuối (Auth, Customer, Admin). Có cơ chế reset database tự động (`seed.ts`) trước mỗi lần chạy test.
- **Knowledge Base Workflow**: Đã tạo thói quen tốt là lưu trữ các "Gotchas" (lỗi thường gặp) và "Prompt Library" vào thư mục `docs/`. Điều này giúp AI tự học và tránh lặp lại lỗi cũ.
- **Component Workflow**: Tách biệt rõ ràng UI Components (`src/components/ui`), Business logic (`hooks`), và Pages (`src/app`).

### ⚠️ Những gì cần "Repair" / Tối ưu thêm:
- **CI/CD Pipeline**: Hiện tại chúng ta phải chạy test bằng tay (`npx playwright test`). Cần thiết lập GitHub Actions để tự động chạy E2E test mỗi khi có Pull Request hoặc Push code.
- **Data Fetching Workflow**: Hiện tại đang fetch data trực tiếp trong Client Components ở nhiều nơi (gây chậm UI). Nên chuyển dần sang Server Components (Next.js 14 App Router) hoặc sử dụng React Query để cache data tốt hơn.
- **Error Tracking**: Khi app đưa vào thực tế (Production), nếu khách hàng gặp lỗi, quán sẽ không biết. Cần tích hợp một công cụ như Sentry.

---

## 2. Tinh chỉnh Agent Skills (AI & GSD & Superpowers)

Để AI hoạt động hiệu quả và "nhập vai" tốt nhất trong dự án này, chúng ta cần thống nhất cách sử dụng các lệnh điều phối (Orchestration):

### 🧠 `/ai` hoặc `ai:` (Master Orchestration)
- **Tình trạng hiện tại**: Đang dùng rất tốt để yêu cầu AI nhìn bức tranh tổng thể, đánh giá chéo (như một CTO/Senior Designer).
- **Cách dùng tối ưu cho DiLinhMenu**: Luôn đi kèm với các yêu cầu mang tính chiến lược. Ví dụ: *"ai: Review toàn bộ UI UX xem có đạt chuẩn Enterprise cho thị trường Việt Nam chưa"*.

### ⚡ `/gsd` (Get Shit Done - Project Execution)
- **Tình trạng hiện tại**: Chưa dùng nhiều trong các phase vừa qua.
- **Cách dùng tối ưu cho DiLinhMenu**: Dùng cho các tác vụ mang tính "Đóng gói tính năng". Ví dụ: *"gsd: Implement tính năng thanh toán VNPay"*. AI sẽ tự động kích hoạt chu trình: Lên kế hoạch -> Viết code -> Viết Test -> Xác nhận.

### 🦸 `sp:` (Superpowers - Discipline)
- **Tình trạng hiện tại**: Các kỹ năng Test-Driven Development (TDD) hoặc Systematic Debugging đang chạy ngầm khá tốt, nhưng đôi khi AI vẫn vội vàng.
- **Cách dùng tối ưu cho DiLinhMenu**: Khi gặp bug khó hoặc muốn viết tính năng mới không có rủi ro, hãy dùng *"sp: Fix bug giỏ hàng"*. AI sẽ bị ép buộc phải: Đọc log -> Tái hiện bug -> Phân tích gốc rễ -> Viết test -> Mới sửa code.

---

## 3. Kế hoạch hành động (Đề xuất)

Nếu bạn đồng ý với bản Audit này, chúng ta có thể thực hiện 2 việc sau để nâng cấp dự án:
1. **Tạo GitHub Actions Workflow** (`.github/workflows/e2e.yml`) để tự động chạy Playwright Test.
2. **Chuẩn hóa Server Actions** để tối ưu hóa tốc độ tải trang cho khách hàng (đặc biệt quan trọng khi khách dùng mạng 3G/4G yếu tại quán).

Bạn nghĩ sao về các hướng tinh chỉnh Workflow này?
