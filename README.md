# DiLinhMenu Platform

A multi-tenant order and loyalty platform for cafes and restaurants in Di Linh, Vietnam.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Vanilla CSS + CSS Modules
- **Database/Auth:** Supabase
- **Language:** TypeScript
- **Testing:** Jest

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Supabase Setup**
   - Create a project on Supabase.
   - Run the SQL files in `supabase/migrations/` sequentially in the SQL Editor.
   - Update `.env.local` with your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Testing**
   ```bash
   npm test
   ```

## Key Features
- **Tenant Isolation:** Data is separated by `shop_id` with Row Level Security.
- **Dynamic Theming:** Each shop can configure its primary color.
- **Loyalty System:** Earn points based on spending and level up through 4 ranks (Thành viên, Bạc, Vàng, Kim cương) with respective discounts.
- **QR Ordering:** Direct QR code access to specific tables `q/[short_code]`.
- **OTP Login:** Frictionless login using Phone + OTP via Supabase Auth.
