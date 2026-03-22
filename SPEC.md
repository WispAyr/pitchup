# PitchUp — Commerce Platform for Mobile Food Vendors

**Product Concept Document v1.0**
**Date:** 22 March 2026
**Author:** Parkwise Product Team

---

## Executive Summary

**PitchUp** is a purpose-built commerce platform for mobile food vendors — chippy vans, burger vans, mobile coffee, street food traders, and anyone who cooks from wheels. It solves the fundamental problem that plagues every mobile food business: **your customers never know where you are**.

Unlike generic restaurant tech (Square, Flipdish, Storekit) or delivery aggregators (Just Eat, Uber Eats), PitchUp is built around the reality that these businesses *move*. Location is not static — it's the core variable. Everything flows from that: ordering, scheduling, customer communication, loyalty, analytics.

The platform leverages Parkwise's existing technology stack — mapping, POS, event management (VenueGuard), and signage — to deliver something no competitor currently offers: a **location-aware commerce system designed for businesses on wheels**.

**Target:** £2M ARR within 3 years. 2,000+ paying vendors across the UK.

---

## The Problem

### The Mobile Food Vendor's Daily Reality

There are an estimated **30,000–50,000 mobile food traders** operating in the UK, from the classic fish & chip van doing the village rounds to gourmet street food operators working festivals and markets. They share a set of problems that no existing platform properly addresses:

1. **Invisible to customers.** Most have a Facebook page updated sporadically. Maybe a phone number on the van. Customers who want to find them tonight literally can't. "Where's the chippy van?" is a question asked in thousands of village WhatsApp groups every week.

2. **No online ordering.** You show up, you queue, you hope they haven't run out of battered sausages. Pre-ordering doesn't exist for 95% of mobile vendors. This means lost sales (people who'd order but won't queue) and wasted stock (no demand signal).

3. **Events are chaos.** Events are the most profitable days — and the hardest to manage. Volume spikes, no pre-orders, long queues, cash handling, running out of stock at 7pm. Event organisers want vendors but have no integrated way to manage them.

4. **No customer relationship.** A chippy van might serve the same 200 people every Tuesday in the same car park, but has zero way to notify them of schedule changes, specials, or closures. The "relationship" is entirely dependent on showing up.

5. **Multi-location confusion.** A vendor with 2-3 vans operating different pitches has no unified system. Each van is basically a separate business operationally.

6. **Terrible tech options.** The existing choices are:
   - Generic POS (Square, SumUp, Zettle) — handles payments, nothing else
   - Restaurant ordering platforms (Flipdish, Storekit) — built for fixed locations
   - Delivery aggregators (Just Eat, Deliveroo) — 25-35% commission, no collection model, require a fixed address
   - Facebook/Instagram — free but fragmented, no ordering, algorithm-dependent reach

**Nobody has built the operating system for mobile food.**

---

## The Market

### UK Mobile Food Vendor Market

| Metric | Estimate | Source/Basis |
|--------|----------|--------------|
| Mobile food traders in UK | 30,000–50,000 | NCASS membership + unregistered estimates |
| Average annual revenue per van | £40,000–£120,000 | Industry surveys |
| Total market value | £1.5B–£5B | Derived |
| Growth rate | 5-8% annually | Street food trend, event economy growth |
| Serviceable addressable market (SAM) | 10,000 vendors | Tech-ready, regular operators |
| Target penetration (Year 3) | 2,000 vendors | 20% of SAM |
| ARPU target | £50/month average | Blended across tiers |
| Year 3 ARR | £1.2M–£2M | Conservative–optimistic |

### Market Segments

**Tier 1 — Traditional Mobile Caterers (60% of market)**
Fish & chip vans, burger vans, hot dog stands. Often family-run, do the same village/estate rounds weekly. Low tech adoption but high loyalty customer base. Price-sensitive. Would pay £29/month if it clearly brought more customers.

**Tier 2 — Street Food Operators (25% of market)**
Gourmet/specialist food (Korean BBQ, wood-fired pizza, loaded fries). Work markets, festivals, food halls. More tech-savvy, Instagram-active, brand-conscious. Would pay £49-79/month. Most likely early adopters.

**Tier 3 — Multi-Unit Operators (10% of market)**
2-5 vans, possibly a fixed location too. Need fleet management, unified branding, multi-location menus. Would pay £79-149/month.

**Tier 4 — Event Caterers (5% of market)**
Primarily work events/festivals. Need event integration, high-volume order management, temporary location support. Cross-sells with VenueGuard.

---

## Competitive Landscape

### Direct Competitors (Purpose-Built for Mobile Food)

**Virtually none exist at scale.** This is the opportunity.

A handful of attempts have been made:
- **StreetDots** (UK) — pitched as "Airbnb for street food pitches," matching vendors to locations. Gained some traction but focused on pitch-finding, not commerce. Limited ordering features.
- **Feastive / various startups** — small apps attempting "find food trucks near me" as consumer discovery. Most failed due to chicken-and-egg: no vendors without customers, no customers without vendors.
- **Roaming Hunger** (US) — food truck catering/booking platform, US-focused, more B2B catering than daily operations.

**Key insight:** Previous attempts focused on the *consumer discovery* problem. PitchUp focuses on the *vendor operations* problem and lets discovery follow naturally.

### Adjacent Competitors

| Platform | Strengths | Gaps for Mobile Vendors |
|----------|-----------|------------------------|
| **Square** | Excellent POS, card reader, basic online store | No location awareness, no scheduling, no "where am I today" functionality |
| **SumUp** | Simple card payments, affordable hardware | Even more basic than Square. Payment only. |
| **Storekit** | Beautiful online ordering, QR codes, no commission | Built for fixed restaurants. No location/schedule concept. |
| **Flipdish** | Full restaurant management, apps, POS | Expensive, complex, assumes permanent address. Overkill for a chippy van. |
| **Just Eat / Deliveroo** | Massive customer base | 25-35% commission. Require fixed address. Delivery model doesn't fit collection-based mobile vendors. |
| **Toast / Lightspeed** | Enterprise restaurant management | Way too complex and expensive. US-focused. |
| **Facebook/Instagram** | Free, where customers already are | No ordering, no scheduling tools, algorithm controls reach, no payments |

### Competitive Moat

PitchUp's advantage comes from combining things that no single competitor offers:

1. **Location-aware ordering** — order from a van that's at a specific place at a specific time
2. **Schedule management** — weekly pitch calendar that customers can subscribe to
3. **Event integration** — via VenueGuard tech, handle event-day volume
4. **Purpose-built simplicity** — not a restaurant system crammed into a van

---

## Product Vision

### Core Concept

**PitchUp gives every mobile food vendor a smart, location-aware online presence with built-in ordering.**

For the **vendor**, it's: "My digital shopfront that follows me wherever I go."
For the **customer**, it's: "I always know where my favourite chippy van is, and I can order before I get there."

### Product Name Options

| Name | Vibe | Domain Availability |
|------|------|-------------------|
| **PitchUp** | "Pitch" = vendor location + "pitch up" = arrive. Perfect double meaning. | pitchup.app, pitchup.food |
| **VanGo** | Playful (Van Gogh pun), memorable, implies movement | vango.app (likely taken) |
| **Kerb** | Where vans park. Clean, urban. | kerb.co (taken by London street food company) |
| **RollUp** | "Rolling up" to a location. Fun. | rollup.food |
| **PitchDay** | Combines pitch + daily schedule | pitchday.co |
| **Vendora** | Vendor + a modern suffix | vendora.app |
| **ChipTrack** | Playful for chippy vans, "tracking" location | chiptrack.co.uk |
| **GrubMap** | Food + location | grubmap.co.uk |

**Recommended: PitchUp** — it's the strongest. Natural language ("we're pitching up at Tesco car park tonight"), implies location, implies arrival, easy to say and spell.

---

## Feature Set

### MVP (Month 1-3) — "The Essentials"

The MVP must deliver immediate value to a vendor who currently has nothing but a Facebook page and a SumUp card reader.

#### 1. Vendor Profile & Branded Page
- Simple onboarding: business name, logo, description, photos
- Auto-generated branded URL: `pitchup.app/dannys-chippy`
- Mobile-responsive micro-site with menu, schedule, and live location
- QR code for the van window → links to their PitchUp page
- Basic SEO so "Danny's Chippy Van Ayr" finds them

#### 2. Menu Builder
- Drag-and-drop menu creation
- Categories (mains, sides, drinks, specials)
- Item photos (phone upload with auto-crop/compress)
- Prices, portion sizes, allergen tags (14 UK allergens)
- Daily specials / limited items with stock counts
- "Sold out" toggle per item (one tap)

#### 3. Location & Schedule
- Weekly schedule builder: "Tuesday = Tesco Prestwick 5-8pm, Thursday = Ayr Seafront 4-9pm"
- "Go Live" button — vendor taps when they arrive at a pitch, page shows "OPEN NOW at [location]"
- Optional GPS auto-detect from phone
- Schedule visible on vendor's page as a calendar
- Google Maps integration showing current/next location

#### 4. Customer Notifications
- Customers can "follow" a vendor
- Push notification (PWA) or SMS when vendor goes live at a location
- "Nearby" alert if customer is within configurable radius
- Weekly schedule email digest for followers

#### 5. Pre-Ordering
- Customers browse menu, select items, choose collection time window
- Vendor receives orders on their phone/tablet
- Order queue with preparation time estimates
- Customer gets "your order is ready" notification
- Simple basket → Stripe checkout
- No delivery — collection only (matches the real model)

#### 6. Basic Payments
- Stripe Connect for each vendor (onboard in minutes)
- Card payments through pre-orders
- PitchUp takes a small transaction fee (see pricing)
- Daily payouts to vendor bank account
- Basic sales reporting

### Phase 2 (Month 4-6) — "Growth Tools"

#### 7. Customer Loyalty
- Digital stamp card (buy 9, get 1 free — configurable)
- Points system option
- "Regular" badge for frequent customers
- Loyalty dashboard for vendors
- Auto-reward triggers (e.g., 10th order = free chips)

#### 8. Social Integration
- One-tap "Going live!" post to Facebook page and Instagram
- Auto-generated post with location map, tonight's specials, and link to pre-order
- Post templates vendors can customise
- "Share my van" social cards for customers

#### 9. Analytics Dashboard
- Revenue by location (which pitches earn most?)
- Revenue by day/time
- Popular items & attach rates
- Customer acquisition (new followers per week)
- Pre-order vs walk-up ratio
- Weather correlation (yes, really — chippy van sales are weather-dependent)

#### 10. Offline Mode
- Order queue works offline (syncs when connection returns)
- Menu and today's orders cached locally
- Critical for rural pitches with poor signal
- PWA with service worker architecture

### Phase 3 (Month 7-12) — "Platform Power"

#### 11. Event Mode (VenueGuard Integration)
- Event organisers create events, invite/assign vendors
- Vendor gets event-specific menu, hours, pitch assignment
- Bulk order handling — kitchen display system for high-volume
- Event analytics — vendor performance across events
- Shared event page: "Food at [Event Name]" showing all vendors
- Pre-order for events (order your food before you arrive at the festival)

#### 12. Multi-Van Fleet Management
- Dashboard showing all vans' locations and status
- Shared menu library across vans
- Per-van schedule and sales tracking
- Staff management (who's working which van)
- Consolidated reporting

#### 13. Pitch Directory & Marketplace
- Public directory of regular pitches
- Pitch owners (car parks, pubs, businesses) list available spots
- Vendors can browse and request pitches
- Scheduling to avoid conflicts (two chippy vans same car park = bad)
- Reviews and ratings for pitches
- **Revenue opportunity:** listing fees for premium pitches

#### 14. Digital Menu Board (Signage Integration)
- Generate a menu board from PitchUp menu data
- Display on tablet/TV mounted on van
- Auto-update prices and sold-out items
- Weather-reactive specials (sunny = ice cream promotion)
- Leverages Parkwise signage system directly

#### 15. Customer App / PWA
- "Find food near me" discovery
- Saved favourites, order history, re-order
- Location-based browsing
- Group ordering (one person collects for the office)

---

## Design Principles

### 1. Operator-First Simplicity
The average chippy van operator is 45-55, not a tech person, and has fish-greasy fingers. The operator interface must be:
- Operable with one hand on a phone
- Usable in bright sunlight (high contrast)
- Functional with 3G/4G (minimal data)
- Learnable in under 10 minutes
- Big touch targets (they're wearing gloves or have wet hands)

### 2. Mobile-First, Desktop-Optional
- Customer ordering: 95% mobile
- Vendor management: 80% mobile, 20% tablet/desktop
- Admin/analytics: desktop-first

### 3. Works on Terrible Connectivity
- PWA with aggressive caching
- Offline order queue
- Image optimisation (WebP, lazy load, blur-up)
- API designed for intermittent connections (retry, queue, sync)
- Graceful degradation — never a blank screen

### 4. White-Label Feel
Each vendor's page should feel like *their* site, not a marketplace listing. Their brand, their colours, their personality. PitchUp is the engine, not the brand customers see.

### 5. Zero Lock-In Feel
Vendors should never feel trapped. Data export, Stripe is theirs, customer list is theirs. This builds trust and reduces churn.

---

## Technical Architecture

### Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Customer Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  PWA     │  │  Vendor  │  │  Admin   │              │
│  │(Customer)│  │  App     │  │ Dashboard│              │
│  │  Next.js │  │  (PWA)   │  │  Next.js │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                    │
└───────┼──────────────┼──────────────┼────────────────────┘
        │              │              │
┌───────┴──────────────┴──────────────┴────────────────────┐
│                    API Gateway                            │
│              (Node.js / Fastify)                          │
│         REST + WebSocket (live updates)                   │
├──────────────────────────────────────────────────────────┤
│                    Core Services                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Vendor  │ │  Order   │ │ Location │ │  Menu    │   │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Payment  │ │Notifica- │ │ Loyalty  │ │Analytics │   │
│  │ Service  │ │  tion    │ │ Service  │ │ Service  │   │
│  │ (Stripe) │ │ Service  │ │          │ │          │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├──────────────────────────────────────────────────────────┤
│                   Data Layer                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │PostgreSQL│ │  Redis   │ │   S3     │                │
│  │ (Primary)│ │ (Cache/  │ │ (Images) │                │
│  │          │ │  PubSub) │ │          │                │
│  └──────────┘ └──────────┘ └──────────┘                │
├──────────────────────────────────────────────────────────┤
│               Integration Layer                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │VenueGuard│ │ Signage  │ │ Facebook │ │ Twilio   │   │
│  │  Events  │ │  System  │ │/Insta API│ │  SMS     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend (Customer) | Next.js + PWA | SSR for SEO, PWA for offline, fast on mobile |
| Frontend (Vendor) | React Native or PWA | Needs push notifications, camera, GPS |
| API | Node.js / Fastify | Fast, lightweight, team knows it |
| Database | PostgreSQL + PostGIS | PostGIS for location queries ("vendors within 5km") |
| Cache / Real-time | Redis | Pub/sub for live order updates, location caching |
| Payments | Stripe Connect | Platform payments, per-vendor accounts, instant payouts |
| Notifications | Firebase Cloud Messaging + Twilio | Push (free) + SMS (paid, for critical alerts) |
| Image Storage | Cloudflare R2 or S3 | Cheap, CDN-backed |
| Hosting | Railway / Fly.io / VPS | Start simple, scale as needed |
| Maps | Mapbox or Google Maps | Customer-facing maps |

### Key Technical Decisions

**PostGIS for location** — enables queries like "find vendors within 3km of me" and "which pitch has no vendor scheduled for Thursday evening." This is the same spatial approach used in Parkwise mapping.

**Stripe Connect (Standard)** — each vendor gets their own Stripe account. PitchUp acts as the platform, taking an application fee per transaction. Vendors own their Stripe relationship. Minimal PCI scope.

**PWA over native app** — for both customer and vendor. No App Store friction (critical for adoption). Install prompt on first visit. Works offline. Push notifications via service worker. If native becomes necessary later, React Native is the upgrade path.

**WebSocket for live updates** — when a vendor goes live, their followers see it instantly. Order status updates in real-time. Kitchen queue updates.

### Leveraging Existing Parkwise Tech

| Existing Tech | PitchUp Application |
|--------------|---------------------|
| **VenueGuard event/zone system** | Event Mode — vendor zones, event pages, multi-vendor coordination. Zone concept maps to pitch/location. |
| **Mapping/location engine** | Core of the "where's the van" feature. Geo-fencing for arrival detection. Proximity alerts. |
| **POS system** | Order management patterns, payment flows, receipt generation. Could offer PitchUp as a POS mode. |
| **Signage system** | Digital menu boards on van-mounted screens. Auto-sync with PitchUp menu data. Weather-reactive displays. |
| **Sentinel alerts** | Operational alerts for vendors — low stock warnings, peak time approaching, payment issues. |

**Reuse estimate:** 30-40% of the backend patterns and 20% of frontend components can be adapted from existing Parkwise projects, significantly reducing build time.

---

## Pricing Strategy

### Tiered SaaS Model

| Tier | Price | Target | Features |
|------|-------|--------|----------|
| **Starter** | **Free** | New vendors, try-before-buy | Profile page, menu (10 items), schedule, QR code. No ordering. |
| **Essential** | **£29/month** | Single van operators | Everything in Starter + pre-ordering, notifications (100 followers), basic analytics, loyalty stamps |
| **Professional** | **£59/month** | Busy operators, market traders | Everything in Essential + unlimited followers, social auto-post, advanced analytics, event mode, offline mode |
| **Fleet** | **£99/month + £29/van** | Multi-van operations | Everything in Professional + multi-van dashboard, staff management, consolidated reporting, priority support |

### Transaction Fees

- **1.5% + 20p** per pre-order transaction (on top of Stripe's ~1.4% + 20p)
- PitchUp's margin: ~1.5% per transaction
- Free tier: no transactions (no ordering)
- Vendors who process £2,000/month in pre-orders pay ~£30 in PitchUp transaction fees

### Revenue Model Projection

| Year | Vendors | ARPU/month | MRR | ARR | Transaction Revenue | Total ARR |
|------|---------|------------|-----|-----|-------------------|-----------|
| 1 | 300 | £35 | £10.5K | £126K | £30K | £156K |
| 2 | 1,000 | £45 | £45K | £540K | £150K | £690K |
| 3 | 2,500 | £50 | £125K | £1.5M | £400K | £1.9M |

### Why This Pricing Works

- **Free tier drives adoption** — vendor sets up in 10 minutes, gets a nice page and QR code for free. Upsell to ordering.
- **£29/month is a no-brainer** — if one extra pre-order per day = ~£8-10 revenue, the platform pays for itself in 3 days.
- **Transaction fees align incentives** — PitchUp earns more when vendors sell more. Vendors don't mind because pre-orders are *incremental* revenue they wouldn't have had.
- **Fleet tier captures higher value** — multi-van operators have real budget and real pain points.

---

## Go-To-Market Strategy

### Phase 1: Local Launch (Month 1-3)
- **Geography:** Ayrshire and surrounding area
- **Target:** 20-30 local chippy vans and mobile caterers
- **Approach:** Direct outreach, Ewan's existing network, Parkwise relationships
- **Offer:** Free Essential tier for 3 months for founding vendors
- **Goal:** Prove the product, get testimonials, iterate

### Phase 2: Scotland Expansion (Month 4-8)
- **Geography:** Central Scotland (Glasgow, Edinburgh corridors)
- **Target:** 200 vendors
- **Channels:**
  - NCASS (National Caterers Association) partnership/listing
  - Facebook groups (mobile caterer groups are huge and active)
  - Festival/event partnerships (VenueGuard cross-sell)
  - Content marketing: "How to double your chippy van revenue"
  - Referral programme (vendor refers vendor = 1 month free)

### Phase 3: UK National (Month 9-18)
- **Target:** 1,000+ vendors
- **Channels:**
  - Trade show presence (Street Food Live, Casual Dining Show)
  - PR: "The app that tells you where your local chippy van is tonight"
  - Influencer partnerships (street food TikTok/Instagram accounts)
  - Event organiser partnerships (onboard all vendors for an event onto PitchUp)

### Consumer Acquisition (Demand Side)
- Each vendor is a distribution channel — QR code on every van drives consumer signups
- "Follow your favourites" creates network effects
- Local press: "Never miss the chippy van again" is a great human interest story
- Consumer discovery is organic through vendor marketing

---

## Key User Journeys

### Vendor: First Day

1. Vendor hears about PitchUp from a mate at a catering event
2. Visits pitchup.app, clicks "Set Up Your Van"
3. Enters: business name, phone, what they serve
4. Uploads logo (or PitchUp generates one from their name)
5. Adds 5 menu items with prices from phone camera
6. Sets weekly schedule: "Mon: Troon Beach, Wed: Prestwick Tesco, Fri-Sat: Events"
7. Gets a QR code → prints it → sticks on van window
8. Total time: **8 minutes**

### Vendor: Regular Evening

1. Vendor arrives at Tesco car park at 4:30pm
2. Opens PitchUp app → taps "Go Live at Tesco Prestwick"
3. 150 followers get a push notification: "Danny's Chippy is live at Tesco Prestwick until 8pm!"
4. Pre-orders start coming in — vendor sees them on phone mounted in the van
5. "Fish supper x2, collection 5:15pm" → vendor marks as "preparing"
6. Customer arrives, shows order screen → vendor taps "collected"
7. Walk-up customers scan QR code, some follow for next time
8. At 8pm, vendor taps "Close" → daily summary shows: 47 orders, £380 revenue, 12 new followers

### Customer: Finding Dinner

1. Customer remembers "that amazing fish & chips from the van last week"
2. Opens pitchup.app → sees Danny's Chippy is live 1.2km away
3. Browses menu, adds fish supper + chips + can of Irn-Bru
4. Selects "collect at 6:30pm"
5. Pays £9.50 by card
6. Gets notification at 6:25pm: "Your order is being prepared!"
7. Walks over, shows phone, gets food, no queue
8. Gets prompt: "Follow Danny's Chippy to know when they're nearby?"

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low vendor tech adoption | Medium | High | Dead-simple UX, free tier, hands-on onboarding for early users |
| Chicken-and-egg (no customers on platform) | Medium | High | Vendor IS the distribution — QR codes, social sharing. Don't rely on consumer app discovery. |
| Stripe/payment friction | Low | Medium | Stripe Connect has excellent onboarding. Offer alternative (manual bank transfer) as fallback. |
| Poor 4G at rural pitches | Medium | Medium | Offline mode is Phase 2 priority. Core order acceptance works offline. |
| Competition copies the idea | Low | Medium | First-mover advantage, existing tech stack gives 6-12 month head start, network effects compound |
| Vendors churn after trial | Medium | Medium | Demonstrate ROI clearly — "PitchUp brought you 34 new customers and £450 in pre-orders this month" |
| Regulatory (food hygiene, allergens) | Low | Low | Allergen display is a feature, not a burden. Helps vendors comply with Natasha's Law. |

---

## MVP Build Plan

### Team Required

| Role | Need | Source |
|------|------|--------|
| Full-stack developer | 1 | Existing Parkwise team or hire |
| Designer (part-time) | 0.5 | Contract, focus on mobile UX |
| Ewan | Product direction | Existing |

### MVP Timeline (12 weeks)

| Week | Deliverable |
|------|------------|
| 1-2 | Data model, API scaffolding, Stripe Connect integration, vendor auth |
| 3-4 | Vendor profile + menu builder (CRUD), image upload pipeline |
| 5-6 | Schedule system, "Go Live" with location, customer-facing vendor page |
| 7-8 | Pre-ordering flow (browse → basket → checkout → order queue) |
| 9-10 | Notification system (follows, go-live alerts), QR code generation |
| 11 | Vendor order management screen, basic analytics |
| 12 | Testing with 5 real vendors, bug fixes, launch prep |

### Estimated MVP Cost

- Development: £15,000–£25,000 (if contracted) or 3 months of dev time (if in-house)
- Stripe: no upfront cost (per-transaction)
- Hosting: ~£50/month initially
- Domain + branding: £500
- **Total MVP: £15,000–£25,000**

If built largely in-house leveraging existing Parkwise code and patterns, the cash cost drops to hosting + design contractor (~£3,000-5,000).

---

## Success Metrics

### North Star Metric
**Weekly active vendors** (vendors who went live at least once in the past 7 days)

### Key Metrics

| Metric | MVP Target (3 months) | Year 1 Target |
|--------|----------------------|---------------|
| Registered vendors | 50 | 500 |
| Weekly active vendors | 20 | 200 |
| Pre-orders per week | 200 | 5,000 |
| Customer followers (total) | 2,000 | 50,000 |
| Vendor churn (monthly) | <10% | <5% |
| Pre-order conversion rate | 15% | 25% |
| Average order value | £8-12 | £10-15 |
| NPS (vendors) | 40+ | 50+ |

---

## Why Now, Why Us

### Why Now
- Street food is booming — post-COVID outdoor dining, event economy recovered
- Mobile payments are universal — even the most traditional chippy van has a card reader now
- PWA technology is mature — no app store needed
- Nobody else has done it properly yet

### Why Parkwise / Ewan
- **Existing location/mapping tech** — the hardest part of "where's the van" is already built
- **VenueGuard event platform** — event integration is a massive differentiator
- **POS experience** — understands payment flows, reconciliation, operator UX
- **Signage system** — digital menu boards are a natural extension
- **Local network** — Ayrshire is perfect testbed, Ewan knows the operators
- **Full-stack capability** — can build and ship fast without external dependencies

---

## Appendix: Name Recommendation

**PitchUp** is the recommended name.

- **Domain:** Secure `pitchup.app` and `pitchup.food`
- **Tagline options:**
  - "Your van. Your customers. Your schedule."
  - "Never miss the van."
  - "Mobile food, sorted."
  - "Pitch up. Serve up. Cash up."
- **Brand voice:** Friendly, no-nonsense, slightly cheeky. These are hardworking people who don't want corporate speak. Talk like a mate who's good with tech.

---

*This document is a living spec. Next steps: validate with 5 local vendors, confirm naming/domain availability, scope MVP sprint.*
