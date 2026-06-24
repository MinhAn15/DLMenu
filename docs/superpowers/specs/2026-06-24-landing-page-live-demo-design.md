# Landing Page Live Demo Design Spec

## 1. Goal
Transform the static Bento Grid on the Landing Page (`src/app/page.tsx`) into an "Interactive Live Demo". This solves the issue of users mistaking static hardcoded data for real data, and provides a "WOW" factor by showcasing the dynamic capabilities of the DiLinhMenu platform.

## 2. Identified Logic Flaw & Correction (Spec Self-Review)
**Original Flaw:** The initial proposal suggested adding the points from randomly generated orders to a single static "1,450 pt" loyalty card. This is logically flawed because different orders come from different customers, so their points shouldn't pool into one single customer's balance. The Bento Grid currently mixes the "Merchant Dashboard" view (Orders, Revenue) with the "Customer" view (QR Code, Loyalty Points).
**Correction:** 
- The Loyalty Card will specifically simulate a *recent customer's* perspective. 
- When a new order is generated (e.g., "Table 02 - 30K"), the Loyalty Card will update its subtitle to "Khách Bàn 02 vừa nhận" and animate the point addition (e.g., `+30 pt`). The base number can be a generic simulated balance (e.g., `1,450` -> `1,480`).

## 3. Data Flow & Simulation Logic
We will use React Hooks (`useState`, `useEffect`) to manage the simulation loop.

### 3.1. Mock Data Pool
A static array of typical F&B items with prices and icons.
```typescript
const mockItems = [
  { title: "Cà phê đen đá", price: 20, icon: "☕", color: "iconAmber" },
  { title: "Sinh tố bơ", price: 35, icon: "🥑", color: "iconGreen" },
  { title: "Trà Đào Cam Sả", price: 35, icon: "🧋", color: "iconOrange" },
  { title: "Trà Xanh Macchiato", price: 40, icon: "🍵", color: "iconIndigo" },
];
```

### 3.2. Simulation State Loop (Interval: 6s)
Every 6 seconds, a new order is generated:
1. **Orders List:** Push the new order to the top of the `orders` state array. Keep a maximum of 3 items. Relative timestamps (e.g., "Vừa xong", "1 phút trước") will be simulated.
2. **Revenue Chart:** Add the order's price to today's revenue total. Update the dynamic height (scaleY) of the last bar in the chart and recalculate the "+X%" growth metric.
3. **Loyalty Points:** Trigger an animation on the Points card showing `+X pt` awarded to the customer of that order.

## 4. Components & UI Changes
- **Live Demo Badge:** Add a pulsing green indicator (e.g., "Live Demo") at the top-right of the Bento container to clearly communicate that this is simulated data.
- **Framer Motion Animations:**
  - `AnimatePresence` for the order list items (slide down, fade in).
  - Number counting animation for the Revenue percentage and Loyalty points.
  - Smooth height transitions for the CSS bars in the revenue chart.

## 5. Implementation Approach
- Modify `src/app/page.tsx`.
- Create a `LiveDemoBento` client component to encapsulate the state and logic, keeping the main page clean.
- Use `framer-motion` for all transitions.

## 6. Open Questions / Assumptions
- Assume the use of `framer-motion` (already in `package.json`).
- Assume the current CSS module structure (`page.module.css`) will be updated with new classes for the animations or dynamic styles.
