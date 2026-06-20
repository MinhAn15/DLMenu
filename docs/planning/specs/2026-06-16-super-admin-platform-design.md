# Super Admin Platform — Design Specification

> **Version**: 1.0
> **Date**: 2026-06-16
> **Status**: Approved
> **Author**: AI Architect + Product Owner

---

## 1. Mục tiêu (Objective)

Xây dựng một **"Control Center" toàn quyền** cho Platform Owner (Super Admin), nơi có thể:
- Quản lý tập trung **toàn bộ các quán (tenants)** trên hệ thống.
- Thao tác trực tiếp (CRUD) dữ liệu của **bất kỳ quán nào** (Menu, Bàn, QR, Đơn hàng) mà không cần chuyển trang hay đăng nhập lại.
- **Clone (Nhân bản)** dữ liệu từ quán A sang quán B để tăng tốc onboarding.
- Giám sát toàn cục (Doanh thu, Đơn hàng, Hệ thống) trên toàn platform.

## 2. Kiến trúc UI: Global Context Switcher

### 2.1. Layout tổng thể
```
┌─────────────────────────────────────────────────────────┐
│  HEADER BAR (Fixed top)                                 │
│  [DLMenu Platform Admin]     [🏪 Dropdown: Chọn quán ▼]│
│                               • Tất cả các quán         │
│                               • Quán Cafe Mai            │
│                               • Quán Nhậu Ba Miền        │
├──────────┬──────────────────────────────────────────────┤
│ SIDEBAR  │  MAIN CONTENT AREA                          │
│          │                                              │
│ 📊 Tổng  │  (Data table thay đổi theo context)         │
│    quan  │                                              │
│ 🏪 Quán  │  Khi chọn "Tất cả": Hiện cross-shop data    │
│ 🍔 Menu  │  Khi chọn 1 quán:   Filter cho quán đó      │
│ 🪑 Bàn   │                                              │
│ 🛒 Đơn   │                                              │
│    hàng  │                                              │
│ 👤 Người │                                              │
│    dùng  │                                              │
│ ⚙️ Hệ   │                                              │
│   thống  │                                              │
│          │                                              │
│ 🚪Thoát  │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 2.2. Shop Selector (Bộ chọn Quán)
- Nằm ở **Header Bar** (luôn hiển thị).
- Trạng thái mặc định: `🏪 Tất cả các quán`.
- Khi chọn 1 quán cụ thể, **toàn bộ DataTable trong các tab Menu, Bàn, Đơn hàng** sẽ tự động filter theo `shop_id` tương ứng.
- Khi ở chế độ "Tất cả", các DataTable sẽ có **thêm cột "Tên quán"** để phân biệt.

## 3. Các Module (Sidebar Navigation)

### 3.1. Tổng quan (Dashboard)
**Route**: `/platform-admin`

| Metric | Mô tả |
|--------|--------|
| Tổng số quán | Active / Inactive |
| Tổng doanh thu hôm nay | SUM(all shops) |
| Tổng đơn hàng hôm nay | COUNT(all shops) |
| Gói cước | Phân bổ Free / Pro / Premium |

- Biểu đồ: Doanh thu 7 ngày gần nhất (tổng hợp hoặc per-shop).
- Danh sách: Top 5 quán doanh thu cao nhất.
- Hoạt động gần đây: 10 đơn hàng mới nhất trên toàn platform.

### 3.2. Quản lý Quán (Tenant Management)
**Route**: `/platform-admin/shops`

**DataTable columns**:
| Cột | Mô tả |
|-----|--------|
| Tên quán | + Logo thumbnail |
| Slug | URL-friendly identifier |
| Chủ quán | SĐT/Tên chủ quán |
| Gói cước | Free / Pro / Premium (Badge) |
| Trạng thái | Active / Inactive (Toggle) |
| Số bàn | COUNT(tables) |
| Số món | COUNT(menu_items) |
| Ngày tạo | Timestamp |
| Thao tác | Sửa, Clone, Xóa |

**Chức năng**:
- **Tạo quán mới**: Modal form (Tên, Slug, SĐT chủ, Địa chỉ, Logo, Gói cước).
- **Sửa quán**: Inline edit hoặc Modal (toàn bộ thông tin shop).
- **Toggle Active/Inactive**: Tắt/Mở quán ngay trên table.
- **Clone quán**: Chọn quán nguồn → Nhập tên + slug mới → Hệ thống clone toàn bộ: Categories, Menu Items, Tables, Loyalty Config, Theme Config. (Không clone Orders, Users, Points).
- **Xóa quán**: Soft delete (set `is_active = false`) hoặc Hard delete (cascade).

### 3.3. Kho Menu Toàn Cục (Global Menu Management)
**Route**: `/platform-admin/menu`

**Hai tab con**:
1. **Danh mục (Categories)**: DataTable hiển thị tất cả categories, filter theo shop.
2. **Món ăn (Items)**: DataTable hiển thị tất cả menu items.

**DataTable columns (Items)**:
| Cột | Mô tả |
|-----|--------|
| Hình | Thumbnail |
| Tên món | + Tags (Nổi bật, Mới) |
| Quán (*) | Hiện khi mode "Tất cả" |
| Danh mục | Tên category |
| Giá (VND) | Formatted |
| Trạng thái | Đang bán / Hết hàng |
| Thao tác | Sửa, Nhân bản sang quán khác, Xóa |

**Chức năng đặc biệt**:
- **Bulk Add (Thêm hàng loạt)**: Upload CSV/Excel chứa danh sách món → Parse & insert vào DB cho quán đã chọn.
- **Clone món sang quán khác**: Chọn 1 hoặc nhiều món → Chọn quán đích → Copy menu items.
- **Quick Price Edit**: Inline edit giá trực tiếp trên table.

### 3.4. Quản lý Bàn & QR Code
**Route**: `/platform-admin/tables`

**DataTable columns**:
| Cột | Mô tả |
|-----|--------|
| QR Preview | Thumbnail mã QR |
| Quán (*) | Tên quán |
| Số bàn | Table number |
| Mã ngắn | Short code (VD: QCM-01) |
| Trạng thái | Hoạt động / Đã tắt |
| Thao tác | Toggle, Download QR, Xóa |

**Chức năng đặc biệt**:
- **Tạo hàng loạt bàn**: Chọn quán → Nhập số lượng (VD: 20 bàn) → Hệ thống tự auto-generate Bàn 1-20 kèm short code & QR URL.
- **Download All QR**: Bấm 1 nút để tải toàn bộ QR code của 1 quán dưới dạng ZIP (hoặc PDF nhiều trang để in).
- **Regenerate QR**: Tạo lại URL và mã QR cho 1 bàn (nếu URL bị lộ ra ngoài).

### 3.5. Giám sát Đơn hàng
**Route**: `/platform-admin/orders`

**DataTable columns**:
| Cột | Mô tả |
|-----|--------|
| Mã đơn | #001, #002... |
| Quán (*) | Tên quán |
| Bàn | Số bàn |
| Khách | Tên/SĐT |
| Tổng tiền | Formatted VND |
| Trạng thái | Badge (pending, confirmed...) |
| Thời gian | Created at |
| Thao tác | Xem chi tiết, Đổi trạng thái |

**Chức năng**:
- **Filter**: Theo quán, trạng thái, khoảng thời gian.
- **Xem chi tiết đơn**: Modal hiện danh sách order_items.
- **Can thiệp trạng thái**: Super Admin có thể force-update trạng thái đơn (VD: Hoàn thành, Huỷ).

### 3.6. Quản lý Người dùng
**Route**: `/platform-admin/users`

**DataTable columns**:
| Cột | Mô tả |
|-----|--------|
| SĐT | Unique identifier |
| Tên hiển thị | Display name |
| Role | customer / shop_owner / platform_admin |
| Số quán tham gia | COUNT(memberships) |
| Tổng chi tiêu | SUM(total_spent) cross shops |
| Đăng ký từ | created_at |
| Thao tác | Xem, Đổi Role, Xoá |

**Chức năng**:
- **Đổi Role**: Nâng cấp customer thành shop_owner (và gán cho 1 quán).
- **Xem lịch sử**: Toàn bộ orders + points transactions của user.
- **Gán chủ quán**: Gán 1 user làm owner cho 1 shop cụ thể.

### 3.7. Cài đặt Hệ thống
**Route**: `/platform-admin/settings`

- **Cấu hình Default Loyalty**: Template loyalty_config mặc định cho quán mới.
- **Cấu hình OTP**: Chọn provider (Zalo ZNS / eSMS / Mock), API keys.
- **Quản lý Gói cước**: Điều chỉnh giới hạn cho Free / Pro / Premium.
- **Audit Log**: Xem lịch sử thao tác của tất cả admin.

## 4. Tính năng Clone (Chi tiết)

### 4.1. Clone Quán (Shop-level)
```
Input:  Shop nguồn (source_shop_id)
        Tên quán mới + Slug mới
Output: Shop mới với:
        ✓ Toàn bộ Categories (new IDs)
        ✓ Toàn bộ Menu Items (mapped to new category IDs)
        ✓ Toàn bộ Tables (new short codes)
        ✓ Loyalty Config (copy nguyên)
        ✓ Theme Config (copy nguyên)
        ✗ KHÔNG clone: Orders, Users, Memberships, Points
```

### 4.2. Clone Món sang quán khác (Item-level)
```
Input:  Danh sách menu_item IDs
        Target shop_id
Output: Menu items mới trong quán đích
        - Giữ nguyên: name, price, description, image_url, tags
        - Map lại: category_id (tìm category cùng tên trong quán đích, 
          hoặc tạo mới nếu chưa có)
```

## 5. Kỹ thuật (Technical Implementation)

### 5.1. Routing
| Route | Page |
|-------|------|
| `/platform-admin` | Dashboard |
| `/platform-admin/shops` | Quản lý quán |
| `/platform-admin/menu` | Kho Menu |
| `/platform-admin/tables` | Bàn & QR |
| `/platform-admin/orders` | Đơn hàng |
| `/platform-admin/users` | Người dùng |
| `/platform-admin/settings` | Cài đặt |

### 5.2. Components
```
src/
├── app/platform-admin/
│   ├── layout.tsx              # Platform Admin Layout (Sidebar + Header + ShopSelector)
│   ├── page.tsx                # Dashboard
│   ├── shops/page.tsx          # Tenant Management
│   ├── menu/page.tsx           # Global Menu
│   ├── tables/page.tsx         # Tables & QR
│   ├── orders/page.tsx         # Orders Monitor
│   ├── users/page.tsx          # User Management
│   └── settings/page.tsx       # System Settings
├── components/platform-admin/
│   ├── PlatformSidebar.tsx     # Sidebar navigation
│   ├── ShopSelector.tsx        # Global shop filter dropdown
│   ├── PlatformStatCard.tsx    # Dashboard stat cards
│   └── CloneShopModal.tsx      # Clone dialog
├── hooks/
│   ├── useShopContext.ts       # React Context for selected shop filter
│   └── usePlatformData.ts     # Data fetching for platform admin
└── lib/actions/
    ├── platformShops.ts        # CRUD shops (create, update, delete, clone)
    ├── platformMenu.ts         # Cross-shop menu operations
    ├── platformTables.ts       # Cross-shop table operations
    ├── platformOrders.ts       # Cross-shop order monitoring
    └── platformUsers.ts        # User management
```

### 5.3. Authorization
- Route `/platform-admin/**` chỉ cho phép user có `role = 'platform_admin'`.
- Middleware check (hoặc layout-level check) redirect về `/login` nếu không có quyền.
- Mock mode: `MOCK_PROFILE.role` set thành `'platform_admin'` khi truy cập route này.

### 5.4. Mock Data Strategy
- Tạo `MOCK_SHOPS` array chứa 3 quán demo (Cafe, Nhậu, Trà sữa).
- Mỗi quán có bộ categories, items, tables riêng.
- Clone action trong mock mode: Deep-copy objects + generate new IDs.

### 5.5. Design & Aesthetics
- **Theme**: Dark sidebar (#1F2937) + Light content area — tạo cảm giác "Control Center" nghiêm túc.
- **DataTable**: Sử dụng pattern giống Admin (header bg-gray-50, hover highlight, badge statuses).
- **Responsive**: Desktop-first (Super Admin chủ yếu dùng laptop/PC). Mobile fallback với Drawer sidebar.

## 6. Phân biệt rõ Super Admin vs Shop Admin

| Khía cạnh | Shop Admin (`/admin`) | Super Admin (`/platform-admin`) |
|-----------|----------------------|---------------------------------|
| Scope | 1 quán duy nhất | Toàn bộ platform |
| Data | Chỉ thấy data quán mình | Thấy cross-shop data |
| Clone | Không có | Clone quán, clone món |
| User mgmt | Không có | Quản lý role, gán chủ quán |
| QR Batch | Thêm từng bàn | Thêm hàng loạt + Download ZIP |
| Auth | shop_owner | platform_admin |
