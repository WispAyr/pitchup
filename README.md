# PitchUp

Mobile food vendor platform — multi-tenant Next.js application with subdomain routing, pre-ordering, live maps, Stripe Connect, and vendor dashboards.

## Quick Start

```bash
# Install dependencies
npm install

# Set up PostgreSQL database
# Create a database called "pitchup" and update DATABASE_URL in .env

# Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# Seed demo data (3 vendors, 2 customers)
npx prisma db seed

# Run development server
npm run dev
```

## Local Development with Subdomains

Add these entries to `/etc/hosts`:

```
127.0.0.1 pitchup.local-connect.uk
127.0.0.1 dannys-chippy.pitchup.local-connect.uk
127.0.0.1 pizza-nomad.pitchup.local-connect.uk
127.0.0.1 the-coffee-van.pitchup.local-connect.uk
```

Or use `localhost` subdomains (works without /etc/hosts):

- Main site: http://localhost:3000
- Danny's Chippy: http://dannys-chippy.localhost:3000
- Pizza Nomad: http://pizza-nomad.localhost:3000
- The Coffee Van: http://the-coffee-van.localhost:3000

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Vendor (Danny's Chippy) | danny@example.com | password123 |
| Vendor (Pizza Nomad) | pizza@example.com | password123 |
| Vendor (The Coffee Van) | coffee@example.com | password123 |
| Customer (Sarah) | sarah@example.com | password123 |
| Customer (James) | james@example.com | password123 |

## Architecture

- **Main site** (`pitchup.local-connect.uk`): Landing page, discovery map, vendor directory
- **Vendor subsites** (`{slug}.pitchup.local-connect.uk`): Branded pages with menu, schedule, ordering
- **Vendor dashboard** (`{slug}.pitchup.local-connect.uk/admin`): Menu CRUD, orders, analytics, settings
- **Middleware**: Reads hostname, rewrites subdomain requests to `/vendor/[slug]/...`

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM
- NextAuth.js (credential-based auth)
- Stripe Connect (payments)
- Leaflet + OpenStreetMap (maps)
- Zustand (cart state)
- Server-Sent Events (real-time orders)

## API Routes

| Endpoint | Description |
|----------|-------------|
| `/api/vendors` | Vendor registration & directory |
| `/api/vendors/[slug]` | Vendor profile with full details |
| `/api/menu/categories` | Menu category CRUD |
| `/api/menu/items` | Menu item CRUD |
| `/api/orders` | Order creation & listing |
| `/api/orders/[id]` | Order status updates |
| `/api/orders/sse` | Real-time order stream (SSE) |
| `/api/live-sessions` | Go Live / End Session |
| `/api/follows` | Follow/unfollow vendors |
| `/api/analytics` | Vendor analytics |
| `/api/stripe/connect` | Stripe Connect onboarding |
| `/api/stripe/checkout` | Stripe Checkout sessions |
| `/api/qrcode/[slug]` | QR code generation |
| `/api/locations` | Location CRUD |
| `/api/schedules` | Schedule CRUD |
| `/api/customers` | Customer registration |
