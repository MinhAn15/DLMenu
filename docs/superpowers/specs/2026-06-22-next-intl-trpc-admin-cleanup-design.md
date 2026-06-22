# Design Spec: next-intl Integration, tRPC Admin Migration & Cleanup

- **Date:** 2026-06-22
- **Author:** Antigravity (Solution Architect & AI Engineer)
- **Status:** Proposed

## 1. Goal

Hoàn thành các Phase còn lại của dự án DiLinhMenu:
1. **P3 next-intl layout integration:** Thay thế hoàn toàn `LanguageContext` bằng thư viện `next-intl` trong các client components và server layout, không sử dụng internationalized URL routing (giữ nguyên cấu trúc URL hiện tại).
2. **P8 cleanup:** Xóa bỏ hoàn toàn `AdminDataContext` cũ, migrate các Server Actions phục vụ Platform Admin sang tRPC procedures thuộc `adminRouter` mới, tối ưu hóa hiệu năng lazy-load dữ liệu.
3. **Phase B E2E tests:** Bổ sung các bài kiểm thử E2E bằng Playwright cho Platform Admin dashboard và sửa đổi các bài test E2E cũ bị fail do lệch text giao diện.

---

## 2. i18n Migration (next-intl without routing)

Hiện tại, việc đa ngôn ngữ đang sử dụng `LanguageContext` tự chế đọc file `@/locales/vi.json` và `@/locales/en.json`. Chúng ta sẽ chuyển sang dùng `next-intl` chính thức để tăng tính ổn định, hỗ trợ translation interpolations và SSR tốt hơn.

### Cấu hình next-intl
1. **`next.config.ts`**: Bọc cấu hình với `createNextIntlPlugin`.
   ```typescript
   import createNextIntlPlugin from 'next-intl/plugin';
   const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
   const nextConfig = {
     transpilePackages: ['@dilinh/types', '@dilinh/validation'],
   };
   export default withNextIntl(nextConfig);
   ```

2. **`i18n/request.ts`**: Cấu hình để đọc locale từ cookie `dilinh-locale` (fallback mặc định: `vi`):
   ```typescript
   import { getRequestConfig } from 'next-intl/server';
   import { cookies } from 'next/headers';

   const locales = ['vi', 'en'];
   const defaultLocale = 'vi';

   export default getRequestConfig(async () => {
     const cookieStore = await cookies();
     const savedLocale = cookieStore.get('dilinh-locale')?.value;
     const locale = savedLocale && locales.includes(savedLocale) ? savedLocale : defaultLocale;

     return {
       locale,
       messages: (await import(`../messages/${locale}.json`)).default,
     };
   });
   ```

3. **Gộp Từ điển Dịch (`messages/vi.json` & `messages/en.json`)**:
   Để tránh việc phải sửa đổi tất cả các key dịch chữ thường cũ (như `customer.menu.add_to_cart`), ta sẽ sao chép toàn bộ từ điển cũ (`src/locales/vi.json`) lồng vào khóa `customer` và `admin` chữ thường trong file `messages/vi.json` (và tương tự cho tiếng Anh). Điều này đảm bảo hệ thống dịch tương thích ngược hoàn toàn.

4. **Tích hợp vào Layout chính (`src/app/layout.tsx`)**:
   Tải `locale` và `messages` ở server component và wrap toàn bộ ứng dụng bằng `NextIntlClientProvider`:
   ```typescript
   import { NextIntlClientProvider } from 'next-intl';
   import { getLocale, getMessages } from 'next-intl/server';

   export default async function RootLayout({ children }: { children: React.ReactNode }) {
     const locale = await getLocale();
     const messages = await getMessages();

     return (
       <html lang={locale} suppressHydrationWarning>
         <body>
           <ThemeProvider ...>
             <NextIntlClientProvider messages={messages} locale={locale}>
               <TRPCProvider>
                 {children}
               </TRPCProvider>
             </NextIntlClientProvider>
           </ThemeProvider>
         </body>
       </html>
     );
   }
   ```

5. **Refactor Client Components**:
   Thay thế `const { t, language, setLanguage } = useLanguage()` bằng:
   * `const t = useTranslations()` (đọc bản dịch).
   * `const locale = useLocale()` (lấy ngôn ngữ hiện tại).
   * Thay đổi ngôn ngữ bằng cách ghi đè cookie `dilinh-locale` và gọi `window.location.reload()`.
   ```typescript
   const setLanguage = (lang: 'vi' | 'en') => {
     document.cookie = `dilinh-locale=${lang}; path=/; max-age=31536000`;
     window.location.reload();
   };
   ```

---

## 3. tRPC Admin Migration & Context Cleanup (P8)

Loại bỏ `AdminDataContext` vốn gây nghẽn cổ chai khi tải trang đầu tiên. Từng trang platform admin sẽ trực tiếp tự truy vấn dữ liệu thông qua tRPC client.

### Tạo tRPC `adminRouter` (`src/lib/server/routers/admin.ts`)
Định nghĩa các procedure platform admin được bảo vệ nghiêm ngặt bằng `adminProcedure`:
* `getShops`: Lấy toàn bộ danh sách cửa hàng.
* `getCategories`: Lấy toàn bộ danh sách menu categories, hỗ trợ filter theo `shopId`.
* `getMenuItems`: Lấy toàn bộ danh sách menu items, hỗ trợ filter theo `shopId`.
* `getTables`: Lấy toàn bộ danh sách bàn.
* `getUsers`: Lấy toàn bộ danh sách tài khoản người dùng (profiles).
* `getOrders`: Lấy toàn bộ danh sách đơn hàng (joins order_items, shop_tables, profiles).

### Đăng ký trong `src/lib/server/routers/_app.ts`
```typescript
export const appRouter = router({
  ...
  admin: adminRouter,
});
```

### Refactor Platform Admin Pages & Components
Các trang trong `/platform-admin/` sẽ import `trpc` client và gọi hooks trực tiếp:
```typescript
const { data: shops, isLoading } = trpc.admin.getShops.useQuery();
```
* **Lợi ích:** Lazy loading tự động. Khi xem trang `/platform-admin/users`, chỉ có data `users` và `shops` được load, thay vì cả 6 bảng dữ liệu như trước.

---

## 4. E2E Testing Plan

1. **Sửa đổi E2E tests cũ:**
   * `auth-flow.spec.ts`: Cập nhật lại text mong đợi từ `"Tăng Doanh Thu Với"` thành `"Quản Lý Quán"` để khớp với Landing Page thực tế.
2. **Viết E2E tests mới (`tests/e2e/platform-admin-dashboard.spec.ts`):**
   * Kiểm tra giao diện Platform Admin Dashboard.
   * Xác nhận sự hiển thị của các component: `ActionInbox` (lọc các sự kiện cần xử lý), `ActivityFeed` (nhật ký hoạt động 24h), `SystemHealthSection` (các chỉ số uptime, backup, database), `PlatformSidebar`.

---

## 5. Verification Plan

* **Integration Tests:** Chạy `npm run test:integration` đảm bảo các tRPC endpoints mới hoạt động chính xác với mock database.
* **Type Safety:** Chạy `npm run build` đảm bảo không có lỗi TypeScript strict.
* **E2E Tests:** Chạy `npx playwright test` đảm bảo 100% test cases pass trên database thật.
