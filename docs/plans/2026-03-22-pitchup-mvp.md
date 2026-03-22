# PitchUp MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a multi-tenant Next.js platform for mobile food vendors with subdomain routing, pre-ordering, live maps, Stripe Connect, and vendor dashboards.

**Architecture:** Next.js 14+ App Router with middleware-based subdomain routing. PostgreSQL + Prisma ORM with PostGIS for location queries. Main site at pitchup.local-connect.uk, vendor subsites at {slug}.pitchup.local-connect.uk. SSE for real-time order updates.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Prisma, PostgreSQL/PostGIS, NextAuth.js, Stripe Connect, Leaflet/OpenStreetMap, Server-Sent Events

---

## Task 1: Project Foundation

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Create: `prisma/schema.prisma`
- Create: `src/middleware.ts`
- Create: `src/lib/prisma.ts`, `src/lib/auth.ts`, `src/lib/stripe.ts`
- Create: `.env.example`

**Steps:**
1. Initialize Next.js 14+ project with App Router, TypeScript, Tailwind
2. Install dependencies: prisma, @prisma/client, next-auth, stripe, leaflet, qrcode, bcryptjs
3. Create Prisma schema with all models (Vendor, MenuCategory, MenuItem, Location, Schedule, LiveSession, Order, Customer, Follow, Review)
4. Create middleware for subdomain routing
5. Create shared lib files (prisma client, auth config, stripe)
6. Run prisma generate

## Task 2: Database Seed

**Files:**
- Create: `prisma/seed.ts`

**Steps:**
1. Create seed with 3 vendors: Dannys Chippy, Pizza Nomad, The Coffee Van
2. Include menu categories and items with allergens
3. Include locations and schedules
4. Include demo customer accounts

## Task 3: Main Platform Pages

**Files:**
- Create: `src/app/(main)/layout.tsx`, `src/app/(main)/page.tsx`
- Create: `src/app/(main)/discover/page.tsx`
- Create: `src/app/(main)/vendors/page.tsx`
- Create: `src/app/(main)/auth/signin/page.tsx`, `src/app/(main)/auth/signup/page.tsx`
- Create: `src/components/main/*`

**Steps:**
1. Landing page with hero, search, vendor signup CTA
2. Discovery map page with Leaflet showing live vendors
3. Vendor directory with search/filter
4. Auth pages (signin/signup for both vendor and customer)

## Task 4: Vendor Subsite Pages

**Files:**
- Create: `src/app/(vendor)/layout.tsx`, `src/app/(vendor)/page.tsx`
- Create: `src/app/(vendor)/menu/page.tsx`
- Create: `src/app/(vendor)/schedule/page.tsx`
- Create: `src/app/(vendor)/about/page.tsx`
- Create: `src/app/(vendor)/order/page.tsx`
- Create: `src/components/vendor/*`

**Steps:**
1. Vendor-branded layout with their colors/logo
2. Home page with hero, live status, menu preview
3. Full menu page with categories, items, allergens, photos
4. Schedule page with weekly calendar and location map
5. About page with description, social links
6. Pre-order flow: cart → collection time → checkout

## Task 5: Vendor Dashboard

**Files:**
- Create: `src/app/(vendor)/admin/layout.tsx`
- Create: `src/app/(vendor)/admin/page.tsx` (overview)
- Create: `src/app/(vendor)/admin/menu/page.tsx`
- Create: `src/app/(vendor)/admin/schedule/page.tsx`
- Create: `src/app/(vendor)/admin/orders/page.tsx`
- Create: `src/app/(vendor)/admin/analytics/page.tsx`
- Create: `src/app/(vendor)/admin/settings/page.tsx`
- Create: `src/app/(vendor)/admin/go-live/page.tsx`

**Steps:**
1. Dark mode dashboard layout with sidebar nav
2. Menu CRUD (add/edit/delete categories and items)
3. Schedule management (weekly recurring)
4. Go Live button with location picker
5. Order queue with real-time updates (SSE)
6. Analytics dashboard (orders, revenue, popular items)
7. Profile/branding settings (colors, logo, description)
8. Stripe Connect onboarding

## Task 6: API Routes

**Files:**
- Create: `src/app/api/vendors/route.ts`
- Create: `src/app/api/vendors/[slug]/route.ts`
- Create: `src/app/api/menu/route.ts`, `src/app/api/menu/[id]/route.ts`
- Create: `src/app/api/orders/route.ts`, `src/app/api/orders/[id]/route.ts`
- Create: `src/app/api/orders/sse/route.ts`
- Create: `src/app/api/live-sessions/route.ts`
- Create: `src/app/api/follows/route.ts`
- Create: `src/app/api/stripe/*`
- Create: `src/app/api/qrcode/[slug]/route.ts`

**Steps:**
1. Vendor CRUD + lookup by slug
2. Menu CRUD (categories + items)
3. Order creation, status updates, listing
4. SSE endpoint for real-time order updates
5. Live session start/stop
6. Follow/unfollow vendors
7. Stripe Connect onboarding + checkout session creation
8. QR code generation

## Task 7: Cart & Checkout

**Files:**
- Create: `src/lib/cart.ts` (client-side cart store)
- Create: `src/components/cart/*`

**Steps:**
1. Cart context/store with localStorage persistence
2. Add to cart, remove, update quantity
3. Collection time picker
4. Stripe checkout integration
5. Order confirmation page

## Task 8: Real-time & Notifications

**Files:**
- Create: `src/lib/sse.ts`
- Create: `src/app/api/orders/sse/route.ts`

**Steps:**
1. SSE endpoint for vendor order queue
2. Client-side SSE hook for real-time updates
3. Push notification signup (Web Push API stub)

## Task 9: Polish & Demo Ready

**Steps:**
1. Responsive design pass (mobile-first)
2. Error handling and loading states
3. Run seed, verify all 3 demo vendors work
4. Verify subdomain routing works locally
