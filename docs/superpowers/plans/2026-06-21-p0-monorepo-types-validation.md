# P0: Monorepo + packages/types + packages/validation

> **For agentic workers:** Sub-skill: Use executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Thiết lập npm workspaces monorepo với 2 packages thiết yếu.

**Architecture:** Root workspace → `packages/types` (database types + enums), `packages/validation` (Zod schemas). App ở root, packages import bằng workspace protocol `"*"` (npm workspaces).

**Tech Stack:** npm workspaces, TypeScript 5, Zod, Vitest

---

### Task 1: Root workspace config

**Files:**
- Modify: `package.json` (root)
- Create: `tsconfig.base.json` (root)

- [ ] **Step 1: Add workspaces field to root package.json**

Root `package.json` hiện tại đã có sẵn. Thêm `"workspaces"`:

```json
{
  "name": "dilinhmenu",
  "private": true,
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "dev": "npm run dev -w apps/web",
    "build": "npm run build -w apps/web",
    "test": "npm run test -w apps/web"
  }
}
```

- [ ] **Step 2: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 3: Verify**

Run: `npm install`
Expected: workspace packages ready (no errors)

---

### Task 2: Create packages/types

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/src/index.ts`
- Create: `packages/types/src/database.ts`
- Create: `packages/types/src/enums.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@dilinh/types",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {}
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Migrate database types from src/lib/types/database.ts**

Copy current database types into `packages/types/src/database.ts`. Giữ nguyên mọi type.

- [ ] **Step 4: Extract enums to packages/types/src/enums.ts**

```typescript
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type OrderType = 'dine_in' | 'takeaway';
export type UserRole = 'customer' | 'shop_owner' | 'platform_admin';
export type MemberRank = 'member' | 'silver' | 'gold' | 'diamond';
export type SubscriptionTier = 'free' | 'pro' | 'premium';
```

- [ ] **Step 5: Create index.ts re-export**

```typescript
export * from './database';
export * from './enums';
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit -p packages/types`
Expected: No errors

---

### Task 3: Create packages/validation — TDD

**Files:**
- Create: `packages/validation/package.json`
- Create: `packages/validation/tsconfig.json`
- Create: `packages/validation/src/index.ts`
- Create: `packages/validation/src/common.ts`
- Create: `packages/validation/src/menu.ts`
- Create: `packages/validation/src/order.ts`
- Create: `packages/validation/src/shop.ts`
- Create: `packages/validation/src/auth.ts`
- Create: `packages/validation/src/admin.ts`
- Create: `packages/validation/vitest.config.ts`
- Create: `packages/validation/tests/menu.test.ts`
- Create: `packages/validation/tests/order.test.ts`
- Create: `packages/validation/tests/shop.test.ts`
- Create: `packages/validation/tests/auth.test.ts`
- Modify: `package.json` — thêm test script

- [ ] **Step 1: Create package.json (RED — no code yet, just config)**

```json
{
  "name": "@dilinh/validation",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "vitest run"
  },
  "dependencies": {
    "@dilinh/types": "*",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

- [ ] **Step 4 — RED: Write failing test for common schemas**

```typescript
// packages/validation/tests/common.test.ts
import { describe, it, expect } from 'vitest';
import { priceSchema, slugSchema, uuidSchema } from '../src/common';

describe('common schemas', () => {
  it('priceSchema accepts valid positive number', () => {
    expect(priceSchema.parse(50000)).toBe(50000);
  });

  it('priceSchema rejects zero', () => {
    expect(() => priceSchema.parse(0)).toThrow();
  });

  it('priceSchema rejects negative', () => {
    expect(() => priceSchema.parse(-1000)).toThrow();
  });

  it('slugSchema accepts valid slug', () => {
    expect(slugSchema.parse('my-restaurant-123')).toBe('my-restaurant-123');
  });

  it('slugSchema rejects invalid characters', () => {
    expect(() => slugSchema.parse('My Restaurant!')).toThrow();
  });

  it('uuidSchema accepts valid UUID', () => {
    expect(uuidSchema.parse('550e8400-e29b-41d4-a716-446655440000')).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('uuidSchema rejects invalid string', () => {
    expect(() => uuidSchema.parse('not-a-uuid')).toThrow();
  });
});
```

- [ ] **Step 5: Verify RED**

Run: `npm run test -w packages/validation`
Expected: FAIL — "priceSchema is not defined" (or similar)

- [ ] **Step 6 — GREEN: Write common schemas to pass**

```typescript
// packages/validation/src/common.ts
import { z } from 'zod';

export const priceSchema = z.number().positive().max(100_000_000);
export const sortOrderSchema = z.number().int().nonnegative();
export const tagsSchema = z.array(z.string().max(50)).max(10);
export const slugSchema = z.string().min(2).max(100).regex(/^[a-z0-9-]+$/);
export const uuidSchema = z.string().uuid();
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
```

- [ ] **Step 7: Verify GREEN**

Run: `npm run test -w packages/validation`
Expected: PASS — 7 tests

- [ ] **Step 8 — RED: Write failing test for menu schemas**

```typescript
// packages/validation/tests/menu.test.ts
import { describe, it, expect } from 'vitest';
import { createCategorySchema, createMenuItemSchema, updateCategorySchema } from '../src/menu';

describe('menu schemas', () => {
  describe('createCategorySchema', () => {
    it('accepts valid input', () => {
      const result = createCategorySchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Khai vị',
      });
      expect(result.name).toBe('Khai vị');
    });

    it('accepts optional description', () => {
      const result = createCategorySchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Khai vị',
        description: 'Các món khai vị',
      });
      expect(result.description).toBe('Các món khai vị');
    });

    it('rejects empty name', () => {
      expect(() => createCategorySchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        name: '',
      })).toThrow();
    });

    it('rejects invalid UUID', () => {
      expect(() => createCategorySchema.parse({
        shopId: 'not-uuid',
        name: 'Khai vị',
      })).toThrow();
    });
  });

  describe('createMenuItemSchema', () => {
    it('accepts valid input with minimum fields', () => {
      const result = createMenuItemSchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Phở bò',
        price: 50000,
      });
      expect(result.name).toBe('Phở bò');
    });

    it('accepts full input with all fields', () => {
      const result = createMenuItemSchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Phở bò đặc biệt',
        price: 85000,
        description: 'Phở bò tái nạm',
        tags: ['bò', 'phở'],
      });
      expect(result.tags).toEqual(['bò', 'phở']);
    });

    it('rejects negative price', () => {
      expect(() => createMenuItemSchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Phở',
        price: -5000,
      })).toThrow();
    });

    it('rejects price exceeding max', () => {
      expect(() => createMenuItemSchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Phở',
        price: 200_000_000,
      })).toThrow();
    });
  });

  describe('updateCategorySchema', () => {
    it('accepts partial update with only name', () => {
      const result = updateCategorySchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Mới',
      });
      expect(result.name).toBe('Mới');
    });

    it('accepts setting description to null', () => {
      const result = updateCategorySchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        description: null,
      });
      expect(result.description).toBeNull();
    });
  });
});
```

- [ ] **Step 9: Verify RED**

Run: `npm run test -w packages/validation`
Expected: FAIL — "createCategorySchema is not defined" (some tests fail, some pass from common)

- [ ] **Step 10 — GREEN: Write menu schemas to pass**

```typescript
// packages/validation/src/menu.ts
import { z } from 'zod';
import { priceSchema, tagsSchema, uuidSchema } from './common';

export const createCategorySchema = z.object({
  shopId: uuidSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateCategorySchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createMenuItemSchema = z.object({
  shopId: uuidSchema,
  categoryId: uuidSchema.nullable().optional(),
  name: z.string().min(1).max(200),
  price: priceSchema,
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  tags: tagsSchema.optional(),
});

export const updateMenuItemSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(200).optional(),
  categoryId: uuidSchema.nullable().optional(),
  price: priceSchema.optional(),
  description: z.string().max(2000).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  tags: tagsSchema.optional(),
});
```

- [ ] **Step 11: Verify GREEN**

Run: `npm run test -w packages/validation`
Expected: PASS — all tests (common + menu)

- [ ] **Step 12 — RED: Write failing test for order schemas**

```typescript
// packages/validation/tests/order.test.ts
import { describe, it, expect } from 'vitest';
import { createOrderSchema, updateOrderStatusSchema } from '../src/order';

describe('order schemas', () => {
  describe('createOrderSchema', () => {
    it('accepts dine_in order with tableId', () => {
      const result = createOrderSchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        tableId: '550e8400-e29b-41d4-a716-446655440001',
        orderType: 'dine_in',
        items: [
          { menuItemId: '550e8400-e29b-41d4-a716-446655440002', quantity: 2, unitPrice: 50000 },
        ],
        customerNote: 'Không hành',
      });
      expect(result.orderType).toBe('dine_in');
    });

    it('accepts takeaway without tableId', () => {
      const result = createOrderSchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        orderType: 'takeaway',
        items: [
          { menuItemId: '550e8400-e29b-41d4-a716-446655440002', quantity: 1, unitPrice: 50000 },
        ],
      });
      expect(result.orderType).toBe('takeaway');
    });

    it('rejects empty items', () => {
      expect(() => createOrderSchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        orderType: 'takeaway',
        items: [],
      })).toThrow();
    });

    it('rejects unknown orderType', () => {
      expect(() => createOrderSchema.parse({
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        orderType: 'delivery',
        items: [{ menuItemId: 'id', quantity: 1, unitPrice: 50000 }],
      })).toThrow();
    });
  });

  describe('updateOrderStatusSchema', () => {
    it('accepts valid status transition', () => {
      const result = updateOrderStatusSchema.parse({
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'confirmed',
      });
      expect(result.status).toBe('confirmed');
    });

    it('rejects invalid status', () => {
      expect(() => updateOrderStatusSchema.parse({
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'invalid_status',
      })).toThrow();
    });
  });
});
```

- [ ] **Step 13: Verify RED**

Run: `npm run test -w packages/validation`
Expected: FAIL — some new tests fail

- [ ] **Step 14 — GREEN: Write order schemas to pass**

```typescript
// packages/validation/src/order.ts
import { z } from 'zod';
import { uuidSchema, priceSchema } from './common';

export const orderTypeSchema = z.enum(['dine_in', 'takeaway']);
export const orderStatusSchema = z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);

const orderItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: priceSchema,
  note: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  shopId: uuidSchema,
  tableId: uuidSchema.optional(),
  orderType: orderTypeSchema,
  items: z.array(orderItemSchema).min(1).max(50),
  customerNote: z.string().max(1000).optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: uuidSchema,
  status: orderStatusSchema,
});
```

- [ ] **Step 15: Verify GREEN**

Run: `npm run test -w packages/validation`
Expected: PASS — all tests

- [ ] **Step 16 — RED: Write failing test for shop schemas**

```typescript
// packages/validation/tests/shop.test.ts
import { describe, it, expect } from 'vitest';
import { createShopSchema, updateShopSchema } from '../src/shop';

describe('shop schemas', () => {
  describe('createShopSchema', () => {
    it('accepts valid shop creation', () => {
      const result = createShopSchema.parse({
        name: 'Quán Cơm Lam',
        slug: 'com-lam',
      });
      expect(result.name).toBe('Quán Cơm Lam');
    });

    it('rejects invalid slug with uppercase', () => {
      expect(() => createShopSchema.parse({
        name: 'Test',
        slug: 'Com Lam',
      })).toThrow();
    });

    it('rejects empty name', () => {
      expect(() => createShopSchema.parse({
        name: '',
        slug: 'test',
      })).toThrow();
    });
  });
});
```

- [ ] **Step 17: Verify RED → GREEN**

Run cycle: test fails → write code → test passes

```typescript
// packages/validation/src/shop.ts
import { z } from 'zod';
import { slugSchema } from './common';

export const createShopSchema = z.object({
  name: z.string().min(1).max(200),
  slug: slugSchema,
});

export const updateShopSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});
```

- [ ] **Step 18 — RED: Write failing test for auth schemas**

```typescript
// packages/validation/tests/auth.test.ts
import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../src/auth';

describe('auth schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid email and password', () => {
      const result = loginSchema.parse({
        email: 'test@example.com',
        password: '123456',
      });
      expect(result.email).toBe('test@example.com');
    });

    it('rejects invalid email', () => {
      expect(() => loginSchema.parse({
        email: 'not-email',
        password: '123456',
      })).toThrow();
    });

    it('rejects short password', () => {
      expect(() => loginSchema.parse({
        email: 'test@example.com',
        password: '12',
      })).toThrow();
    });
  });

  describe('registerSchema', () => {
    it('accepts valid registration', () => {
      const result = registerSchema.parse({
        email: 'new@example.com',
        password: '123456',
        displayName: 'Nguyễn Văn A',
      });
      expect(result.displayName).toBe('Nguyễn Văn A');
    });

    it('rejects missing displayName', () => {
      expect(() => registerSchema.parse({
        email: 'new@example.com',
        password: '123456',
      })).toThrow();
    });
  });
});
```

- [ ] **Step 19: Verify RED → GREEN**

```typescript
// packages/validation/src/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  displayName: z.string().min(1).max(100),
});
```

- [ ] **Step 20: Run all tests — Verify All GREEN**

Run: `npm run test -w packages/validation`
Expected: PASS — 20+ tests, all green

- [ ] **Step 21: Create index.ts re-export**

```typescript
// packages/validation/src/index.ts
export * from './common';
export * from './menu';
export * from './order';
export * from './shop';
export * from './auth';
export * from './admin';
```

- [ ] **Step 22 — REFACTOR: Clean up duplicates**

Check for: duplicate priceSchema (could be in common already), consistent error messages.

---

### Task 4: Update apps/web to consume workspace packages

**Files:**
- Modify: `apps/web/package.json` (thêm deps)
- Modify: `apps/web/next.config.ts` (thêm transpilePackages)
- Modify: `apps/web/tsconfig.json` (thêm paths)

- [ ] **Step 1: Move apps/web to workspace**

Create `apps/web/` directory, move current `src/`, `tests/`, `public/`, config files into it.

- [ ] **Step 2: Update apps/web package.json**

```json
{
  "dependencies": {
    "@dilinh/types": "*",
    "@dilinh/validation": "*"
  }
}
```

- [ ] **Step 3: Update next.config.ts**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@dilinh/types', '@dilinh/validation'],
};

export default nextConfig;
```

- [ ] **Step 4: Verify build**

Run: `npm run build -w apps/web`
Expected: BUILD SUCCESS

---

### Task 5: Delete old types file + update imports

**Files:**
- Delete: `apps/web/src/lib/types/database.ts`
- Modify: every file that imports `@/lib/types/database` → now imports `@dilinh/types`

- [ ] **Step 1: Find all imports of old types**

Run: `rg "@/lib/types/database" apps/web/src --files-with-matches`

- [ ] **Step 2: Update each file to import from @dilinh/types**

```typescript
// Before:
import type { Shop, MenuItem } from '@/lib/types/database';

// After:
import type { Shop, MenuItem } from '@dilinh/types';
```

- [ ] **Step 3: Verify build**

Run: `npm run build -w apps/web`
Expected: No errors (all imports resolved)

---

### TDD Gate Check

- [ ] Tất cả tests trong packages/validation đều viết TRƯỚC implementation
- [ ] Mỗi test đã được verify RED trước khi viết code
- [ ] Mỗi test đã được verify GREEN sau khi viết code
- [ ] All tests pass: `npm run test -w packages/validation`
- [ ] Build pass: `npm run build -w apps/web`
