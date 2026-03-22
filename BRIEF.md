# PitchUp — Build Brief

## Architecture

### Multi-Tenant Subdomain System
- **Main platform:** pitchup.local-connect.uk (marketing + vendor directory + customer discovery)
- **Vendor subsites:** {slug}.pitchup.local-connect.uk (e.g., chippy.pitchup.local-connect.uk)
- Each vendor gets their own branded subsite with:
  - Custom name, logo, colours, hero image
  - Live menu with photos, prices, allergens, dietary tags
  - Live location map ("We're here tonight!")
  - Weekly schedule with locations
  - Pre-ordering with collection time slots
  - Follow/notification signup
  - Reviews/ratings
  - Social links
  - QR code for the van window

### Main PitchUp Site (pitchup.local-connect.uk)
- **Landing page:** Marketing, "Find food near you", vendor signup CTA
- **Discovery map:** Live map showing all active vendors right now
- **Directory:** Browse vendors by area, cuisine type, rating
- **Search:** "Fish and chips near me tonight"
- **Customer accounts:** Follow vendors, order history, saved favourites
- **Vendor signup/onboarding:** Self-service, get your subsite in minutes
- **Admin dashboard:** Platform analytics, vendor management, moderation

### Vendor Dashboard (accessible from their subsite /admin)
- Menu management (CRUD items, categories, photos, allergens, modifiers)
- Schedule management (weekly recurring + one-off events)
- "Go Live" button — sets current location, notifies followers
- Order queue — incoming pre-orders, status management (received → preparing → ready → collected)
- Customer list / followers
- Analytics (orders, revenue, popular items, best locations)
- Profile/branding settings
- Stripe Connect onboarding for payments

### Tech Stack
- **Framework:** Next.js 14+ (App Router) — handles subdomain routing natively
- **Database:** PostgreSQL with PostGIS (location queries)
- **Auth:** NextAuth.js (vendor + customer accounts)
- **Payments:** Stripe Connect (platform takes cut, vendors get direct payouts)
- **Maps:** Leaflet + OpenStreetMap (free, no API keys)
- **Real-time:** WebSockets or SSE for order updates
- **Notifications:** Web push notifications (PWA)
- **Images:** Sharp for processing, S3-compatible storage or local
- **Styling:** Tailwind CSS
- **Deployment:** Node.js on PU2 initially, PM2 managed

### Data Model (Core)
- **vendors** — id, slug (subdomain), name, description, logo, banner, colours, cuisine_type, contact, stripe_account_id, subscription_tier, created_at
- **menu_categories** — id, vendor_id, name, sort_order
- **menu_items** — id, vendor_id, category_id, name, description, price, image, allergens[], dietary_tags[], available, modifiers[], sort_order
- **locations** — id, vendor_id, name, address, lat, lng, is_regular (for saved pitches)
- **schedules** — id, vendor_id, location_id, day_of_week, start_time, end_time, recurring
- **live_sessions** — id, vendor_id, location_id, started_at, ended_at, lat, lng (current live position)
- **orders** — id, vendor_id, customer_id, live_session_id, items_json, total, status (pending/confirmed/preparing/ready/collected/cancelled), collection_time, stripe_payment_id, created_at
- **customers** — id, name, email, phone, auth_provider
- **follows** — customer_id, vendor_id, notifications_enabled
- **reviews** — id, vendor_id, customer_id, rating, text, created_at

### Subdomain Routing
Next.js middleware reads the hostname:
- `pitchup.local-connect.uk` → main platform routes
- `{slug}.pitchup.local-connect.uk` → vendor subsite routes (lookup vendor by slug)
- Nginx wildcard SSL: `*.pitchup.local-connect.uk`

### MVP Scope (Phase 1)
1. Vendor registration + onboarding wizard
2. Vendor subsite (menu, schedule, about, location map)
3. Main platform landing + directory + discovery map
4. "Go Live" with location broadcasting
5. Pre-ordering flow (browse → cart → checkout → Stripe)
6. Vendor order queue management
7. Customer accounts + follow vendors
8. Basic push notifications (vendor goes live)
9. QR code generation per vendor
10. Vendor analytics dashboard

### Design Direction
- Mobile-first, PWA-capable
- Warm, approachable, slightly playful — NOT corporate
- Primary colour: Warm orange/amber (#F59E0B range) — food, warmth, appetite
- Dark mode default for vendor dashboard
- Clean, fast, thumb-friendly on phones
- Inspirations: Deliveroo's food photography, Monzo's friendly UX, But simpler

### Key Differentiators to Build In
- "Where's the van?" real-time map is the hero feature
- Vendor subsites feel like their OWN website, not a marketplace listing
- Pre-ordering is opt-in per vendor (some just want the location/menu page)
- Works beautifully on 4G with minimal data
- QR code on van → instant menu + follow in seconds
