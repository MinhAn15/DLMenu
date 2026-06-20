# DiLinhMenu Platform — Design Specification

> **Version**: 1.0
> **Date**: 2026-06-14
> **Status**: Approved (Brainstorming Complete)
> **Author**: AI Architect + Product Owner

---

## 1. Executive Summary

### Problem
Chủ quán cà phê/nhậu ở Di Linh thiếu data khách hàng và không có cách giữ chân khách. Khách hàng không có lý do để quay lại quán cũ — tạo thành "double gap" khoảng trống ở cả hai phía.

### Solution
**DiLinhMenu** — Multi-tenant SaaS platform cho phép:
- **End-user**: Quét QR tại bàn → login bằng SĐT → xem menu → đặt món → tích điểm
- **Chủ quán**: Dashboard quản lý doanh thu, menu, loyalty, flash sale, analytics
- **Platform owner**: Quản lý toàn bộ tenants, billing, monitoring

### Business Model
- **B2B SaaS**: Chủ quán là khách hàng trả tiền
- **End-user**: Dùng miễn phí
- **Revenue**: Free → Freemium (299k-599k/tháng) → Commission (phase 3)

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + PWA
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, Edge Functions, Storage)
- **Deploy**: Vercel (frontend) + Supabase Cloud (backend)
- **External**: Zalo OA API (OTP), eSMS.vn (SMS fallback), Cloudinary (image CDN)

---

## 2. Target Users

### 2.1 Chủ quán (B2B Customer)
- Quán cà phê và quán nhậu ở Di Linh, Lâm Đồng
- Cần quản lý doanh thu, khách hàng, khuyến mãi
- Ít kiến thức tech, budget hạn chế
- Cần UX admin đơn giản, thấy value nhanh

### 2.2 End-user (Consumer)
- Đa dạng tuổi: người trẻ (cà phê) + trung niên (quán nhậu)
- Smartphone Android tầm trung/cũ
- Quen Zalo/Facebook, chưa quen app phức tạp
- Cần UX cực đơn giản: quét QR → 3 bước → xong

### 2.3 Platform Admin (Owner)
- Quản lý toàn bộ platform, onboard quán mới
- Monitor system health, billing, support

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DILINHMENU PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │   CUSTOMER WEB APP       │  │   ADMIN DASHBOARD        │    │
│  │   (Next.js PWA)          │  │   (Next.js)              │    │
│  │                          │  │                          │    │
│  │   /s/{slug}/t/{table}    │  │   /admin/{slug}          │    │
│  │   • Menu browsing        │  │   • Revenue dashboard    │    │
│  │   • QR scan → login      │  │   • Menu management      │    │
│  │   • Order placement      │  │   • Loyalty config       │    │
│  │   • Loyalty status       │  │   • Flash sale mgmt      │    │
│  │   • Flash sale alerts    │  │   • Table/QR management  │    │
│  │   • Order history        │  │   • Customer insights    │    │
│  └───────────┬──────────────┘  └───────────┬──────────────┘    │
│              │                              │                    │
│              └──────────┬───────────────────┘                    │
│                         │                                        │
│              ┌──────────▼──────────┐                             │
│              │   SUPABASE BACKEND  │                             │
│              │                     │                             │
│              │   • Auth (Phone OTP)│                             │
│              │   • PostgreSQL + RLS│                             │
│              │   • Realtime        │                             │
│              │   • Edge Functions  │                             │
│              │   • Storage (images)│                             │
│              └──────────┬──────────┘                             │
│                         │                                        │
│              ┌──────────▼──────────┐                             │
│              │   EXTERNAL SERVICES │                             │
│              │   • Zalo OA (OTP)   │                             │
│              │   • eSMS (fallback) │                             │
│              │   • Cloudinary (CDN)│                             │
│              └─────────────────────┘                             │
│                                                                  │
│  ┌──────────────────────────┐                                   │
│  │   PLATFORM ADMIN         │                                   │
│  │   /platform-admin        │                                   │
│  │   • Tenant management    │                                   │
│  │   • System monitoring    │                                   │
│  │   • Billing management   │                                   │
│  └──────────────────────────┘                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Multi-Tenant Strategy
- **Shared database** with `shop_id` as tenant discriminator
- **Supabase Row Level Security (RLS)** enforces data isolation
- **Every table** (except `users`) has `shop_id` column
- **Users table** is global — 1 user can be member of multiple shops
- **user_shop_memberships** bridges users ↔ shops with per-shop loyalty data

### 3.3 URL Routing Strategy

| Route Pattern | Purpose | Auth Required |
|---|---|---|
| `/s/{slug}/t/{table}` | Customer menu & ordering | Phone login |
| `/s/{slug}` | Shop landing page | No |
| `/admin/{slug}` | Shop owner dashboard | Owner login |
| `/admin/{slug}/*` | Admin sub-pages | Owner login |
| `/platform-admin` | Platform management | Super admin |

---

## 4. Database Schema

### 4.1 Core Tables

#### `shops` (Tenants)
```sql
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  phone VARCHAR(20),
  address TEXT,
  
  -- Configuration (JSONB for flexibility)
  theme_config JSONB DEFAULT '{}',
  -- e.g. { "primary_color": "#6B4226", "font": "Inter" }
  
  business_hours JSONB DEFAULT '{}',
  -- e.g. { "mon": {"open": "07:00", "close": "22:00"}, ... }
  
  loyalty_config JSONB NOT NULL DEFAULT '{
    "points_formula": {"type": "per_amount", "amount_per_point": 10000},
    "ranks": [
      {"name": "Thành viên", "min_points": 0, "discount_percent": 0},
      {"name": "Bạc", "min_points": 100, "discount_percent": 3},
      {"name": "Vàng", "min_points": 500, "discount_percent": 5},
      {"name": "Kim cương", "min_points": 2000, "discount_percent": 10}
    ],
    "bonus_rules": [],
    "discount_stacking": "take_highest"
  }',
  
  -- Relations
  owner_user_id UUID REFERENCES users(id),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, pro, premium
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `users` (Global)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),
  
  -- Platform role
  role VARCHAR(20) DEFAULT 'customer', -- customer, shop_owner, platform_admin
  
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ DEFAULT now()
);
```

#### `user_shop_memberships`
```sql
CREATE TABLE user_shop_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  
  -- Loyalty
  ranking_points INT DEFAULT 0,      -- Only increases, determines rank
  redeemable_points INT DEFAULT 0,   -- Can be spent
  rank VARCHAR(20) DEFAULT 'member', -- member, silver, gold, diamond
  total_spent DECIMAL(12,0) DEFAULT 0,
  order_count INT DEFAULT 0,
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_order_at TIMESTAMPTZ,
  
  UNIQUE(user_id, shop_id)
);
```

#### `tables`
```sql
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  table_number INT NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL, -- e.g. "MAI-05"
  qr_url VARCHAR(500),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(shop_id, table_number)
);
```

#### `menu_categories`
```sql
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `menu_items`
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,0) NOT NULL, -- VND, no decimals
  image_url VARCHAR(500),
  
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  
  -- Metadata
  tags JSONB DEFAULT '[]', -- e.g. ["hot", "popular", "new"]
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `orders`
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id),
  table_id UUID REFERENCES tables(id), -- nullable for takeaway
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Order details
  order_type VARCHAR(20) NOT NULL DEFAULT 'dine_in', -- dine_in, takeaway
  order_number VARCHAR(20) NOT NULL, -- Human-readable: #001, #002...
  
  -- Pricing
  subtotal DECIMAL(12,0) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,0) DEFAULT 0,
  discount_type VARCHAR(50), -- 'rank_gold_5%', 'flash_sale_20%'
  total DECIMAL(12,0) NOT NULL DEFAULT 0,
  
  -- Loyalty
  points_earned INT DEFAULT 0,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- pending → confirmed → preparing → ready → completed
  -- pending → cancelled
  
  -- Notes
  customer_note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

#### `order_items`
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,0) NOT NULL,
  subtotal DECIMAL(12,0) NOT NULL, -- quantity × unit_price
  note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `promotions`
```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- flash_sale, discount, bogo
  
  -- Discount config
  discount_percent INT, -- e.g. 20 = 20%
  discount_amount DECIMAL(10,0), -- fixed amount discount
  
  -- Applicability
  applicable_items JSONB DEFAULT '[]', -- item IDs, or [] = all items
  applicable_ranks JSONB DEFAULT '[]', -- rank names, or [] = all ranks
  
  -- Schedule
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  
  -- Limits
  max_uses INT, -- total uses limit
  current_uses INT DEFAULT 0,
  max_uses_per_user INT, -- per user limit
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `points_transactions` (Event Sourcing)
```sql
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  shop_id UUID NOT NULL REFERENCES shops(id),
  order_id UUID REFERENCES orders(id),
  
  type VARCHAR(30) NOT NULL,
  -- earn, redeem, cancel_refund, rank_bonus, admin_adjust
  
  ranking_points_delta INT NOT NULL DEFAULT 0,
  redeemable_points_delta INT NOT NULL DEFAULT 0,
  
  ranking_points_after INT NOT NULL,
  redeemable_points_after INT NOT NULL,
  
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 Row Level Security (RLS) Policies

```sql
-- Example: Orders visible only to the shop owner or the ordering user
CREATE POLICY "orders_shop_isolation" ON orders
  FOR ALL USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Example: Menu items visible to everyone within the shop context
CREATE POLICY "menu_items_public_read" ON menu_items
  FOR SELECT USING (is_available = true);

-- Example: Shop config editable only by shop owner
CREATE POLICY "shops_owner_update" ON shops
  FOR UPDATE USING (owner_user_id = auth.uid());
```

### 4.3 Indexes

```sql
-- Critical indexes for performance
CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_shop_status ON orders(shop_id, status);
CREATE INDEX idx_menu_items_shop_id ON menu_items(shop_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_user_shop_memberships_user ON user_shop_memberships(user_id);
CREATE INDEX idx_user_shop_memberships_shop ON user_shop_memberships(shop_id);
CREATE INDEX idx_points_transactions_user_shop ON points_transactions(user_id, shop_id);
CREATE INDEX idx_promotions_shop_active ON promotions(shop_id, is_active, starts_at, ends_at);
CREATE INDEX idx_tables_short_code ON tables(short_code);
```

---

## 5. Core User Flows

### 5.1 Customer Dine-in Order Flow

```
1. Khách ngồi bàn 5, quét QR
2. Browser mở: /s/quan-cafe-mai/t/5
3. App detect: shop = "quan-cafe-mai", table = 5
4. Hiển thị menu + flash sale banner (nếu có)
5. Prompt login: "Nhập SĐT để đặt món và tích điểm"
6. Khách nhập SĐT → Gửi OTP (Zalo > SMS fallback)
7. Khách nhập OTP → Authenticated
8. Nếu user mới → Auto-create user + membership
9. Nếu user cũ → Load profile, rank, points
10. Khách browse menu, thêm vào giỏ
11. Khách nhấn "Đặt món"
12. App tính: subtotal → apply discount (rank hoặc flash sale, lấy cao nhất)
13. Create order (status: pending)
14. Chủ quán nhận realtime notification
15. Chủ quán confirm → status: confirmed → preparing
16. Khách thấy status update realtime
17. Món xong → status: ready → completed
18. Points earned = total / amount_per_point (configurable)
19. Update user_shop_memberships (points, rank check)
20. Log to points_transactions
```

### 5.2 Shop Owner Dashboard Flow

```
1. Chủ quán login tại /admin/quan-cafe-mai
2. Auth: phone OTP (same flow) → verify role = shop_owner
3. Dashboard shows:
   a. Doanh thu hôm nay (real-time updated)
   b. Số đơn hàng pending (cần xử lý)
   c. Biểu đồ doanh thu 7 ngày
   d. Top 5 món bán chạy
4. Sidebar navigation:
   • Đơn hàng (realtime list + actions)
   • Menu (CRUD categories & items)
   • Bàn & QR (manage + print QR)
   • Khuyến mãi (create/edit flash sales)
   • Loyalty (configure points, ranks, discounts)
   • Khách hàng (list, filter by rank, history)
   • Thống kê (charts, analytics)
   • Cài đặt (shop info, theme, business hours)
```

### 5.3 Discount Resolution Flow

```
1. Khách rank Vàng (5% discount) đặt món đang Flash Sale (20%)
2. System calculates:
   - Rank discount: subtotal × 5% = X
   - Flash sale discount: subtotal × 20% = Y
3. Compare: Y > X
4. Apply: Flash Sale 20%
5. Display: "Bạn được giảm 20% từ Flash Sale! 🎉"
6. Record: discount_type = "flash_sale_20%"
7. Points earned based on ORIGINAL price (before discount)
```

### 5.4 Points & Rank Flow

```
1. Order completed, total = 350,000đ
2. Points formula: per_amount, amount_per_point = 10,000
3. Points earned = 350,000 / 10,000 = 35 points
4. Update ranking_points += 35 (now: 485)
5. Update redeemable_points += 35
6. Check rank thresholds:
   - Member: 0, Silver: 100, Gold: 500, Diamond: 2000
   - 485 < 500 → Still Silver
7. Next visit, earn 20 points → 505 → AUTO UPGRADE to Gold! 🎉
8. Log: points_transaction(type: 'earn', ranking_delta: +35, redeemable_delta: +35)
```

---

## 6. Business Rules

### 6.1 Points System
- Points formula configurable per shop (per_amount, percentage, per_order)
- Ranking points: only increase, determine rank
- Redeemable points: can be spent (future feature)
- Points earned based on ORIGINAL order amount (before discounts)
- Cancel before confirm → full points refund
- Cancel after confirm → configurable by shop owner

### 6.2 Rank System
- 4 tiers: Thành viên → Bạc → Vàng → Kim cương
- Thresholds configurable per shop
- Rank upgrade: automatic when threshold reached
- Rank downgrade: NOT implemented in MVP (future: configurable expiry)
- Discount per rank: configurable per shop

### 6.3 Discount Stacking
- Rule: **Take highest applicable discount only** (no stacking)
- Priority: compare all applicable discounts → apply the one most favorable to customer
- Display: clearly show which discount was applied
- Points: always calculated on pre-discount amount

### 6.4 Multi-device Same Table
- Each person creates their own order
- Each person earns their own points
- Shop owner sees: "Table 5: 2 orders (from A and B)"
- No order merging — each order is independent

### 6.5 Flash Sale Rules
- Start/end time configurable
- Can target specific items or all items
- Can target specific ranks or all ranks
- Usage limits: total and per-user
- Auto-deactivate when expired
- Visible to customers immediately upon login

---

## 7. Analytics Dashboard (MVP)

### 7.1 Core Metrics
| Metric | Calculation | Display |
|--------|-------------|---------|
| Doanh thu hôm nay | SUM(orders.total) WHERE date = today | Number + trend |
| Doanh thu tuần/tháng | SUM(orders.total) GROUP BY period | Line chart |
| Đơn hàng theo giờ | COUNT(orders) GROUP BY hour | Bar chart |
| Top 10 món bán chạy | COUNT(order_items) GROUP BY item | Ranked list |
| Khách mới vs cũ | Compare first_order_date with period | Pie chart |

### 7.2 AI Features (Phase 2)
- Gợi ý món nên khuyến mãi (based on margin + sales velocity)
- Requires minimum 30 days of data
- Unlocked progressively as data accumulates

---

## 8. Authentication

### 8.1 Phone OTP Flow
```
1. User enters phone number
2. System sends OTP via:
   - Priority 1: Zalo ZNS (free/low cost)
   - Priority 2: SMS via eSMS.vn (fallback)
3. OTP valid for 5 minutes, 6 digits
4. Max 3 attempts per phone per hour
5. Successful → Supabase auth session created
```

### 8.2 Role-Based Access
| Role | Access |
|------|--------|
| customer | Customer app only |
| shop_owner | Customer app + Admin dashboard (own shop) |
| platform_admin | Everything |

---

## 9. QR Code Design

### 9.1 URL Format
```
https://dilinhmenu.com/s/{shop_slug}/t/{table_number}
Example: https://dilinhmenu.com/s/quan-cafe-mai/t/5
```

### 9.2 Short Code (Backup)
```
Format: {SHOP_CODE}-{TABLE_NUMBER}
Example: MAI-05
Accessible via: https://dilinhmenu.com/q/MAI-05
```

### 9.3 QR Content
- QR encodes the full URL
- Printed on table tent/sticker
- Includes shop logo and table number (human-readable)
- Admin can regenerate QR + reassign table mapping

---

## 10. Deployment Strategy

### Phase 1: Pilot (0-3 quán)
- Supabase Free + Vercel Free = $0/tháng
- Limits: 500MB DB, 50k auth users, 2GB bandwidth
- Risk: Vercel Free không cho commercial use → cần upgrade khi có revenue

### Phase 2: Growth (3-10 quán)
- Supabase Pro ($25) + Vercel Pro ($20) = $45/tháng
- 8GB DB, unlimited auth, better performance

### Phase 3: Scale (10-50 quán)
- Supabase Pro + VPS (Hetzner) = $50-100/tháng
- Custom domain, better latency

### Phase 4: Enterprise (50+ quán)
- Dedicated infrastructure
- Custom pricing

---

## 11. MVP Scope

### In Scope (Sprint 1-2)
- [ ] Supabase project setup + database schema
- [ ] Phone OTP authentication
- [ ] Customer web app: QR → menu → order (dine-in only)
- [ ] Shop admin: dashboard, menu CRUD, order management
- [ ] Loyalty: points earning, rank display
- [ ] Basic analytics: daily revenue, order count
- [ ] Platform admin: shop CRUD

### In Scope (Sprint 3-4)
- [ ] Flash sale management + display
- [ ] Loyalty: rank-based discounts, configurable thresholds
- [ ] Analytics: charts, top items, customer retention
- [ ] Takeaway order support
- [ ] QR management + printing
- [ ] AI Image Generation for Menu Items — See [AI Image Generation Design](../../superpowers/specs/2026-06-20-ai-image-generation-design.md)

### Out of Scope (Future)
- [ ] AI recommendations
- [ ] Points redemption
- [ ] Rank expiry/downgrade
- [ ] Payment integration (online)
- [ ] Push notifications
- [ ] Multi-language support
- [ ] White-label for chains

---

## 12. Non-Functional Requirements

### Performance
- Page load < 3 seconds on 3G connection
- Menu browsing: instant (cached)
- Order submission: < 2 seconds
- Dashboard: real-time updates via Supabase Realtime

### Security
- RLS on all tables
- Phone OTP rate limiting (3 attempts/hour)
- HTTPS everywhere
- No PII in URLs or logs

### Reliability
- Supabase uptime SLA: 99.9%
- Graceful degradation when offline (show cached menu)
- Order status visible even after page refresh

### Accessibility
- Mobile-first design
- Large touch targets (44px minimum)
- High contrast text
- Works on Android 8+ Chrome

---

## 13. Data Ownership

> ⚠️ **Decision**: Platform retains all data. Shop owners cannot export.
> **Risk noted**: Potential legal conflict with Nghị định 13/2023/NĐ-CP.
> **Recommendation**: Revisit before production — consider allowing export of shop-specific data while retaining platform-wide anonymized data.

---

## 14. Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| Cà phê vs Nhậu: 1 app hay 2? | 1 platform, config-driven per shop |
| Auth method? | Phone OTP via Zalo ZNS + SMS fallback |
| Discount stacking? | Take highest only |
| Data ownership? | Platform retains (with legal risk warning) |
| Deployment? | Supabase Free + Vercel Free initially |
| Scale? | Di Linh only, architecture ready for expansion |
| Pricing? | Free → Freemium → Commission |
| Dine-in vs Takeaway? | Both, but dine-in first in MVP |

---

## Appendix A: Key Decisions Log

| # | Decision | Rationale | Risk |
|---|----------|-----------|------|
| 1 | Multi-tenant shared DB | Cost-effective, easy to manage | Data isolation depends on RLS correctness |
| 2 | Next.js + Supabase | SSR+PWA, free tier, 1 codebase | Vercel lock-in, Supabase is relatively new |
| 3 | Phone OTP via Zalo | Free, high coverage in VN | Dependency on Zalo OA API |
| 4 | URL-based QR per table | No app install, SEO, debuggable | URL can be shared/captured |
| 5 | Configurable points formula | Enterprise flexibility | More complex admin UI |
| 6 | Take highest discount only | Safe for shop owner margin | May disappoint power users expecting stacking |
| 7 | Event sourcing for points | Audit trail, anti-fraud | Slightly more complex queries |
| 8 | Free first, paid later | Land-and-expand strategy | Risk of never converting to paid |
