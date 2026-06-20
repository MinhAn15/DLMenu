# DiLinhMenu Super Admin UI — Redesign Specification

> **Version**: 2.0 (Action-Inbox Tenant Console)
> **Date**: 2026-06-19
> **Status**: Draft for review
> **Author**: AI Architect + Product Owner
> **Supersedes**: `2026-06-16-super-admin-platform-design.md` v1.0 (kept as historical record)

---

## 1. Mục tiêu (Objective)

Redesign the Super Admin UI at `/platform-admin/*` so that it reads as a **professional B2B tenant operations console**, not a global statistics dashboard.

The current UI (Dashboard with 4 stat cards + flat sub-pages) was deemed "vô nghĩa" and "khó hiểu" because:
- Statistics are shown without action hooks — pure numbers without "what should I do next".
- Bố cục phẳng, mỗi trang là 1 màn hình riêng, nhưng user phải liên tục chuyển qua lại.
- Kiểu dáng "stats dashboard" không phù hợp với workflow thực của Super Admin — vốn là **một bạn sales/CSM-operator tiếp nhận yêu cầu từ chủ quán và cấu hình tính năng cho họ**.

After redesign the UI should:
- **Action-first**: mỗi màn hình bắt đầu bằng 1–3 tác vụ cần làm hôm nay, không phải bằng con số.
- **Workflow-aligned**: chủ quán gọi → bạn mở workspace của họ → cấu hình → gửi. Bố cục phản ánh đúng flow đó.
- **Tier-1 SaaS aesthetic**: theo dấu Linear / Stripe Dashboard / Vercel — sidebar trung tính, top bar + global search, nội dung rộng rãi thoáng đãng. Không dùng gradient rẻ tiền, không emoji lung tung trong heading production.
- **Local nhưng chuyên nghiệp**: copy tiếng Việt với giọng DiLinhMenu (ấm áp, tin cậy) nhưng technical terms giữ tiếng Anh chuẩn ngành (workspace, tier, downgrade, downgrade, churn, etc.).

---

## 2. Đối tượng & Use cases (Personas)

### 2.1 Primary persona — "Operator"

| | |
|---|---|
| **Ai?** | Bạn (owner SaaS) + colleagues + investors nội bộ |
| **Vai trò** | Điều hành nền tảng DiLinhMenu; tiếp nhận và xử lý yêu cầu từ phía chủ quán |
| **Mục tiêu mỗi ngày** | (a) biết có bao nhiêu quán đang hoạt động ổn. (b) Xử lý ticket/yêu cầu từ chủ quán nhanh. (c) Tìm ra quán nào sắp churn / cần upsell tier. |
| **Tech literacy** | Trung bình; đã quen với SaaS dashboard (Stripe, Shopee Seller Center, KiotViet admin). |
| **Số lượng khách hàng (chủ quán)** | 5–50 quán ban đầu; đường dài có thể 500+ |
| **Workflow ngày điển hình** | Vào dashboard xem inbox → mở shop → chỉnh cấu hình hoặc reply ticket → next. Lặp lại 5–10 lần/ngày. |

### 2.2 Secondary — "Viewer" (Investor / Advisor)

Chỉ đọc dashboard / thống kê để đánh giá sức khỏe platform. Cần view thân thiện với người không vận hành: dashboard + thống kê đủ, không cần inbox-style action queue.

---

## 3. Information Architecture (IA)

### 3.1 Route structure

```
/platform-admin                                  ──── Dashboard inbox (action queue)
/platform-admin/shops                             ──── Tenant list (global, segmented)
│   /platform-admin/shops?filter=all              ────     · tất cả quán
│   /platform-admin/shops?filter=needing-action  ────     · cần can thiệp
│   /platform-admin/shops?filter=onboarding       ────     · đang thiết lập
│   /platform-admin/shops?filter=trial-ending     ────     · sắp hết thử nghiệm
/platform-admin/shops/[shopId]                    ──── Tenant workspace (default tab: Tổng quan)
/platform-admin/shops/[shopId]/menu              ────   override menu items
/platform-admin/shops/[shopId]/promotions        ────   configure promotions
/platform-admin/shops/[shopId]/settings          ────   shop theme / bank-info
/platform-admin/shops/[shopId]/activity         ────   orders, tier changes, config timeline
/platform-admin/menu                              ──── Global menu template library (kept from v1)
/platform-admin/promotions                        ──── Global promotions overview (kept from v1)
/platform-admin/platform-stats                    ──── Aggregate statistics (charts here, NOT on dashboard)
/platform-admin/team                              ──── Team members (colleagues + investors with view roles)
/platform-admin/platform-settings                 ──── Syste/ platform config (easter flags, tier pricing, OTP provider)
/platform-admin/login                             ──── sign-in
```

> **Conflicts to note**: 06-16 spec route `/platform-admin/settings` (system settings) is renamed to `/platform-admin/platform-settings` to free `/platform-admin/settings` as the **per-shop** settings page convention. If the user prefers the old naming, that's a 1-line revert.

### 3.2 Sidebar IA (left, persistent)

```
┌──────────────────────────────┐
│ ☕ DiLinhMenu · Nền tảng        │ ← Branding
├──────────────────────────────┤
│ 🔲 Bảng điều khiển              │  (Dashboard)
│                              │
│ 🏪 Khách hàng                  │  (nhóm section — không phải 1 route)
│   ├─ Tất cả quán        (24)  │  → /platform-admin/shops?filter=all
│   ├─ Cần xử lý ⬤        (5)  │  → /platform-admin/shops?filter=needing-action
│   ├─ Đang dùng thử       (3)  │  → /platform-admin/shops?filter=onboarding
│   └─ Sắp hết hạn         (2)  │  → /platform-admin/shops?filter=trial-ending
│                              │
│ 🍔 Kho Menu                    │  → /platform-admin/menu (kept from v1)
│ 🎟️ Khuyến mãi                  │  → /platform-admin/promotions
│ 📊 Thống kê                    │  → /platform-admin/platform-stats
│ 👥 Team                       │  → /platform-admin/team
│ ⚙️ Cài đặt nền tảng            │  → /platform-admin/platform-settings
├──────────────────────────────┤
│ ⬤ Đang mở: Mai Coffee…     │ ← Context chip (visible only when workspace open)
├──────────────────────────────┤
│ 🚪 Thoát                      │
└──────────────────────────────┘
```

### 3.3 Top bar (sticky, 56px, neutral background)

```
[ 🔍 Tìm theo tên quán, SĐT, hoặc mã đơn                ] [➕ Tạo đơn thử] [🔔 3] [Ngô Minh A ▾]
```

**Search is the primary nav for power users**. Hit `⌘K` to focus.

---

## 4. Dashboard redesign — `/platform-admin`

### 4.1 Replace "stat cards" with "action inbox"

The current Dashboard's 4 stat cards (Tổng số Quán / Doanh thu thực / Đơn hôm nay / Tổng số Món) are killed. Numbers don't drive action.

**New dashboard = action inbox + activity feed + collapsed system health.**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Hôm nay cần xử lý                                  [Xem tất cả →]            │
│ ────────────────────────────────────────────────────────────────────────  │
│                                                                          │
│ ⬤ Hôm nay cần xử lý (5)                                                  │
│                                                                          │
│ 🔴 Mai Coffee · Ủy quyền thanh toán online hết hạn 2 ngày                  │
│    "Chị Mai hỏi khi nào bật lại được VietQR?" — tin nhắn 4 giờ trước        │
│    [ Mở shop ]  [ Soạn phản hồi                                          ]│
│                                                                          │
│ 🟡 Bảy Mountain Café · Xin cấu hình bảng giá theo khu vực VIP                │
│    Anh Tuấn — chủ quán sắp khai trương                                      │
│    [ Mở shop ]  [ Xem yêu cầu                                             ││
│                                                                          │
│ 🔵 Hoa Hồng Tea · Đề xuất nâng cấp lên Pro (đã sinh 12.8tr/tháng)         │
│    Phát hiện tự động — chưa có phản hồi từ chủ quán                         │
│    [ Mở shop ]  [ Soạn đề xuất                                             ││
│                                                                          │
│ Hiển thị 3 / 5.    ·    [ Lọc theo mức độ: ●●● Tất cả | 🔴 | 🟡 | 🔵 ]      │
│                                                                          │
├───────────────────────────────────────────────────────────────────────  │
│ Hoạt động 24 giờ qua                                       [Xem nhật ký → ]  │
│ ────────────────────────────────────────────────────────────────────│
│ 09:14  Mai Coffee       +1 đơn mới   350.000đ   Bàn 5                       │
│ 09:02  Ba Miền Nhậu     Tạo KM       Flash Sale 20%                       │
│ 08:47  Trà Sữa Hoa Hồng +2 đơn      612.000đ   Mang về                     │
│ 08:30  Hệ thống          Backup dữ liệu đêm hoàn tất (63 shops)             │
│ ...                                                                       │
│                                                                          │
├───────────────────────────────────────────────────────────────────────│
│ ▸ Sức khỏe hệ thống  (mở rộng để xem chi tiết)                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Why this works

| Cũ (vô nghĩa) | Mới (ấn tượng chuyên nghiệp) |
|---|---|
| 4 stat cards mỗi cái 1 dòng tooltip | Mỗi "card" = 1 ticket với action, owner, deadline |
| Không biết làm gì tiếp theo khi nhìn | Mỗi dòng inbox là 1 nhiệm vụ rõ ràng — click [Mở shop] = workspace |
| Biểu đồ nhiều, context ít | Biểu đồ giấu dưới `/platform-admin/platform-stats` mở rộng bằng tay |
| Cảm giác "Dashboard nội bộ" | Cảm giác "Inbox việc phải làm" — đúng vai của operator |

### 4.3 Component inventory

| Component | Vai trò |
|---|---|
| `ActionInboxCard` | 1 ticket — priority dot 🔴🟡🔵 + tên shop + mô tả ngắn + 2 actions (Mở shop / Reply) |
| `ActionInboxFilters` | Filter theo priority + sắp xếp |
| `ActivityFeed` | Timeline dọc — dấu thời gian bên trái |
| `SystemHealthCollapsed` | Card mặc định đóng, mở rộng hiện uptime + queue stats |
| `EmptyState` | Khi inbox trống: "Tuyệt vời — không có gì cần xử lý hôm nay 🌱" |

---

## 5. Tenant workspace — `/platform-admin/shops/[shopId]`

### 5.1 Shop row in tenant list → click → workspace

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ← Quay lại danh sách  │   Mai Coffee                                  ⋮   │
│                      │ ID: qcm-005 · Tier: Pro · Còn 18 ngày              │
│                      │ Chủ quán: chị Mai · 0901-234-567                    │
├──────────────────────┴──────────────────────────────────────────────────┤
│ [ Tổng quan ]   Menu   Khuyến mãi   Cài đặt   Hoạt động                       │ ← tabs
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Tab: Tổng quan

```
┌──── Sức khỏe quán ────────────────────┐  ┌──── Doanh thu 14 ngày ─────────────┐
│ ●●○○○ Khỏe mạnh                        │  │ 22,4 tr  ▲ 18% so với 2 tuần trước │
│ ─ Đơn hôm nay: 28                       │  │ Đơn TB/ngày: 31                       │
│ ─ Khách mới tuần này: +14               │  │ Giá trị trung bình: 73k                │
│ ─ Loyalty active: 132 khách             │  │                                        │
└────────────────────────────────────────┘  └────────────────────────────────────────┘

Đề xuất cho bạn (2)                                 │
─────────────────────────────────────────────────  │
🟡 VietQR hết hạn 2 ngày → ảnh hưởng đơn chuyển khoản               │
   [Bật lại ngay]   [Nhắc chị Mai]                                    │
                                                                            │
🟢 Chị Mai đang dùng thử Pro — tier Pro hết hạn 18 ngày nữa                │
   [Gia hạn 30 ngày]   [Xem biểu phí]                                    │
                                                                            │
Hoạt động gần đây  (10)                                                  │
─────────────────────────────────────────────────  │
09:14  +1 đơn mới          350k       Bàn 5                                │
08:58  Trả lời từ chị Mai: "OK bạn bật giúp chị nhé"                        │
Hôm qua 19 đơn · 1,42tr                                                     │
[ Xem nhật ký đầy đủ → ]                                                  │
```

### 5.3 Tabs khác

| Tab | Nội dung chính |
|---|---|
| Menu | Bảng menu hiện tại của shop + quick-edit giá/availability. Khác với `/platform-admin/menu` (template library), tab này là **data thật của 1 shop**. |
| Khuyến mãi | CRUD flash-sale của shop. Cùng pattern với admin/promotions hiện tại. |
| Cài đặt | Theme, bank info (VietQR), config form. Tương đương `/admin/settings` hiện tại. |
| Hoạt động | Timeline **dài hạn** (không phải 24 giờ): orders, tier changes, ticket replies, config changes, audit log. Có thể scroll lịch sử lâu năm. |

---

## 6. Component library + visual tokens

### 6.1 Color tokens

Lấy lại từ `2026-06-15-dilinhmenu-landing-page-design.md` (Bento Box redsign) nhưng triệt để hơn — tránh dùng gradient trong production UI.

```
Light:
  --bg-canvas:        #FAFAF9    nền toàn trang
  --bg-surface:       #FFFFFF    nền card
  --bg-sidebar:       #0F172A    sidebar dark, contrast với content
  --border-subtle:    #E5E7EB
  --border-strong:    #D1D5DB
  --text-primary:     #111827
  --text-secondary:   #6B7280
  --text-inverse:     #F8FAFC
  --accent-primary:   #6B4226    Di-Linh coffee brown — chỉ dùng cho primary CTA, không dùng cho stat bar
  --accent-hover:     #4A2E1A
  --priority-urgent:  #B91C1C    inbox đỏ rực
  --priority-warn:    #D97706
  --priority-info:    #2563EB
  --success:          #15803D
  --danger:           #B91C1C

Dark:  (mirror với semantic tương ứng, không đổi hue chỉ đổi opacity/saturation)
```

⚠️ **NEVER**: gradient hero, rainbow buttons, emoji ở heading level 1/2.

### 6.2 Typography

```
font-sans:    Inter, system-ui (giữ như landing page)
font-mono:    JetBrains Mono (chỉ cho short_code, order_number, ID)
font-display: Inter weight 700 (Heading H1)

H1 32/40   weight 700   letter-spacing -0.02em    (page title)
H2 24/32   weight 600   letter-spacing -0.01em    (section title)
H3 20/28   weight 600                               (card title)
H4 16/24   weight 600                               (subsection)
Body 14/22  weight 400 (default UI)
Caption 12/16 weight 500 uppercase letter-spacing 0.04em   (badge, label, status)
Numeric 32/40 weight 700 tabular-nums                  (doanh thu — must align columns)
```

### 6.3 Spacing

4-point grid: `4 8 12 16 24 32 48 64`. Card padding mặc định `24`. Section spacing `48`.

### 6.4 Components mới cần build

| Component | Tái sử dụng | Ghi chú |
|---|---|---|
| `AppShell` | mới | Layout chuẩn: Sidebar + Topbar + main. Dùng chung `/platform-admin` & `/admin`. |
| `DataTable` | mới | Generic table với sort/filter/pagination inline. Header density. Replace nhiều inline `<table>` riêng lẻ. |
| `ActionInbox` (gồm `ActionInboxCard`, `ActionInboxFilters`) | mới | Đặc thù của dashboard. |
| `TenantList` (segmented sidebar đã cover một phần) | mới | Bảng có filter theo segment + search. |
| `WorkspaceShell` (gồm `WorkspaceTabs`, `WorkspaceHeader`) | mới | Tab-bar + identity card cho per-tenant view. |
| `InboxCard`, `Badge` (priority 🔴🟡🔵) | mới | Priority dot + actions. |
| `KpiTile` (small) | refactor của stat card cũ | Chỉ dùng trong workspace overview, không ở dashboard. |

---

## 7. Voice & Copy guide

### 7.1 Nguyên tắc

- **Tiếng Việt** là ngôn ngữ chính.
- **Technical terms** giữ nguyên tiếng Anh theo convention SaaS B2B: "workspace", "tier", "churn", "downgrade", "inbox", "shop", "menu", "đơn".
- **Tone**: tin cậy, cụ thể, không DIY-pandemic emoji. Câu ngắn. Số liệu đi kèm đơn vị rõ ràng ("22,4 tr", "31 đơn/ngày").
- **Tránh**: "Chào mừng bạn đến với…", "Hãy khám phá…", emoji lặp lại (🚚🛒✨🎉🎊…).
- **Khuyến khích**: zero-state ấm áp ("Không có gì cần xử lý. Hôm nay yên tĩnh 🌱"), copy cụ thể + proactive ("VietQR hết hạn 2 ngày").

### 7.2 Mapping từ copy cũ → copy mới

| Cũ (v1.0) | Mới (v2.0) | Note |
|---|---|---|
| "Tổng quan Hệ thống 🎛️" | "Bảng điều khiển" | Bỏ emoji 🎛️ |
| "Tổng số Quán" | (không dùng ở dashboard) | Stat đi vào workspace |
| "Doanh thu thực" | (không dùng ở dashboard) | Stat đi vào `/platform-admin/platform-stats` |
| "Đơn hôm nay" | (không dùng ở dashboard) | Counter ở sidebar với badge |
| "Tổng số Món" | (không dùng ở dashboard) | — |
| "Danh sách Quán" | "Khách hàng" | Nhấn mạnh business-quan hệ |
| "Gói cước" | "Tier" | Dùng technical term |
| "Active / Inactive" | "Đang hoạt động / Tạm ngưng" | Việt hóa rõ hơn |
| "Kho Menu" | "Kho Menu" | Giữ — đã tốt |

### 7.3 Microcopy inventory (vi/em dùng lại)

| Trường hợp | Copy đề xuất |
|---|---|
| Empty inbox | "Không có gì cần xử lý — hôm nay yên tĩnh 🌱" |
| Empty tenant list (after filter) | "Không tìm thấy quán nào khớp bộ lọc" |
| Tier "Pro" hết hạn | "Tier Pro còn 18 ngày — gia hạn?" |
| Promote upgrade | "Mai Coffee sinh 12,8 tr/tháng — phù hợp Pro" |
| Cancel button | "Hủy" (không dùng "Đóng" trừ khi modal) |
| Confirm danger | "Xóa quán? Không thể hoàn tác." |
| Filter label | `Tất cả / Cần xử lý / Đang dùng thử / Sắp hết hạn` |

---

## 8. Empty / Loading / Error states

### 8.1 Empty

- **Inbox rỗng**: illustration nhẹ (1 chiếc lá 🌱 ở SVG, không màu mè), copy "Hôm nay yên tĩnh".
- **Tenant list rỗng theo filter**: "Không tìm thấy quán nào trong nhóm này" + CTA "Xem tất cả"
- **Workspace chưa có đơn**: "Mai Coffee chưa có đơn nào. Khách quét QR bàn đầu tiên sẽ xuất hiện ở đây."

### 8.2 Loading

- Skeleton: thẻ xám nhạt pulse 1.2s, **không** spinner (spinner gợi "app bị lag").
- Trong `useAdminData`, expose `loading` per slice: `loading.shops !== loading.orders`. Mỗi section render xong là hiện ngay.

### 8.3 Error

- Query lỗi: "Không tải được dữ liệu. [Thử lại]" — inline ngay chỗ section lỗi, không nổ toast toàn trang.
- Permission error (vai trò sai → middleware redirect, không cần UI riêng).
- Network offline: top bar badge đỏ "Mất kết nối — dữ liệu có thể cũ".

---

## 9. Realtime / Refresh strategy

> **Decision**: pulled on **tab visibility** + **30-second silent revalidation**.
>
> - Khi user click vào 1 tab trong workspace hoặc segment mới → fetch.
> - Background polling mỗi 30s revalidate data của route hiện tại (không flash loading).
> - Supabase Realtime subscription cho `orders`/`shops` tables khi user đang ở dashboard → inbox card tự update khi có ticket mới (toast nhỏ góc dưới phải "Có yêu cầu mới").
> - Không force-refresh nếu user đang scroll/typing.

(Đã align với spec §12 — Realtime channels.)

---

## 10. Authorization + access control

Giữ nguyên theo PR-3a đã ship:

- `middleware.ts` enforce role check `/platform-admin/**` ← user.role === 'platform_admin'.
- Sub-route `/platform-admin/shops/[shopId]` không thêm check riêng — middleware + layout-level guard.
- Trong workspace header, dùng query-level RLS đã setup (migration 007).

---

## 11. Migration & cutover plan

### 11.0 Database signals for inbox priority (NEW — required for §4 design)

Inbox priority dots 🔴🟡🔵 are computed from **derived signals**, not free-form. Decide:

- **Tier expiry urgency** → `shops.subscription_expires_at` + days-remaining computed function
- **Customer request** → new table `support_requests(id, shop_id, request_kind, body, opened_at, status)` populated via storefront-side "request a feature" button + customer-service inbox widget. Phase A scope includes this table.
- **Churn risk** → derived from `last_order_at` staleness (e.g., >14 days inactive for paid-tier shop).
- **Upsell signal** → `mrr_estimate` computed from `points_transactions` history OR explicit `ltv_30d` rolling aggregate.

Migration `008_inbox_signals.sql` adds:
```sql
-- columns to shops:
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS last_order_at TIMESTAMPTZ;

-- new support_requests table
CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  request_kind TEXT NOT NULL CHECK (request_kind IN ('feature_unlock', 'config_help', 'billing', 'other')),
  body TEXT NOT NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed'))
);
CREATE INDEX idx_support_requests_open ON public.support_requests(shop_id) WHERE status = 'open';

-- RLS via 007-style admin_all pattern + owner-read pattern
```

Mock data: add 2–3 mock `support_requests` per shop so inbox renders 3+ items in audit.

### 11.1 Phase A — Tenant workspace route mới (zero downtime)

1. Build `/platform-admin/shops/[shopId]/page.tsx` + sub-tabs.
2. Sidebar "Khách hàng" links rewrite sang route mới.
3. Old `/platform-admin/shops` → redirect sang `?filter=all`.
4. Test: tạo 1 shop, vào `/platform-admin/shops/[shopId]`, click tab "Cài đặt", verify hiển thị theme/bank-info.

### 11.2 Phase B — Dashboard redesign

1. Rewrite `/platform-admin/page.tsx` thành action inbox + activity feed + system health collapsed.
2. Top bar search → `⌘K` command palette (Linear-style), default focus on first load.
3. Sidebar counters wire to live data (polling 60s).

### 11.3 Phase C — Polish

1. Voice/copy pass: làm sạch tiếng Việt theo §7.
2. Empty/loading/error pass: đảm bảo mọi state có design chuẩn §8.
3. Dark mode pass (nếu scheduled).
4. Realtime pass: cấu hình channel `orders`, `promotions`.

### 11.4 Phase D — QA + rollout

1. Playwright E2E: thêm `tests/e2e/platform-admin-workspace.spec.ts`, `platform-admin-dashboard-inbox.spec.ts`.
2. Headed-Chromium audit (re-use `tests/audit/super-admin-e2e.js` infrastructure).
3. Manual UAT trên mock data set với 5 shops.

---

## 12. Scope decisions (assumed unless user overrides)

| Q | Assumed answer | Lý do |
|---|---|---|
| Q5 | Option B: dynamic routes `/platform-admin/shops/[shopId]` | User pick |
| Scale assumption | 5–50 shops ban đầu; scale được preserve tới 500+ trong design | — |
| Realtime | Pulled on tab + 30s silent revalidation + Supabase Realtime cho inbox badge | Đã trao đổi ở turn trước |
| Old route redirect | `/platform-admin/settings` → `/platform-admin/platform-settings` (rename); `/platform-admin/shops` → `/platform-admin/shops?filter=all` | — |
| Versioning | v2.0 replaces v1.0 trong `docs/superpowers/specs/2026-06-16-super-admin-platform-design.md` (lưu lại v1.0 làm history) | — |
| Auth | Role check ở middleware + layout, không thay đổi (PR-3a) | — |

---

## 13. Open questions (chờ user verify)

1. **Settings route rename**: `/platform-admin/settings` → `/platform-admin/platform-settings` — bạn muốn giữ tên cũ, đổi tên mới, hay alias 2 URL?
2. **Inbox empty-state** "Hôm nay yên tĩnh 🌱": có nên có 1 illustration (SVG coffee cup / đồi chè) nhỏ, hay giữ tối giản pure-text?
3. **Customer flow**: `/platform-admin/users` (user-level manager) — giữ nguyên hay sửa luôn? Currently in scope v1.0. Trong design mới user-level không được nhấn mạnh.
4. **Tier copy**: dùng "Free / Pro / Premium" (giữ) hay tên tiếng Việt ("Cơ bản / Nâng cao / Cao cấp")?
5. **Page title vs browser tab**: `/platform-admin/shops/[shopId]` — title tab có format `Mai Coffee · DiLinhMenu Platform` cho professional không?

---

## 14. Acceptance criteria

PR này accept khi:

1. ✅ Tất cả 6 trang `/platform-admin/*` + 5 sub-tabs `/platform-admin/shops/[shopId]/*` render passed Playwright (mock mode).
2. ✅ Inbox hiển thị đúng priority dot 🔴🟡🔵 với action buttons.
3. ✅ Sidebar counter update khi data thay đổi (verified bằng cách ack 1 ticket rồi refresh — counter giảm).
4. ✅ Search ⌘K mở ra, focus vào, tìm được shop theo tên/SĐT/mã đơn trong mock data.
5. ✅ Copy Vietnamese đã qua review §7.2 mapping table.
6. ✅ Header contrast ratio ≥ 4.5:1 ở light + dark mode (automation check).
7. ✅ Headed-Chromium audit re-run; side-by-side compare trước/sau ở `tests/audit/before-after/`.
8. ✅ Không stat-card "vô nghĩa" nào còn ở dashboard chính.
