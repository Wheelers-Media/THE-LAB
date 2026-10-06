# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Existing static site: plain HTML pages in `src/pages`, Tailwind via the CDN script, small vanilla JS files in `src/assets/js`, deployed on Vercel from `main` (thelabfsj.ca). Checkout and the parts catalog run in `store.js` / `products.js` and hand off to Shopify. Do not change that stack as part of a visual redesign.

## Users
Two audiences share one site:
- **Diesel and truck owners** (Fort St. John and the surrounding North Peace) who want performance work: custom tuning, EGR and deletes, exhaust, CCV reroutes, bumpers and accessories, lift kits, lighting. They shop parts and request builds.
- **Everyday vehicle owners** (cars, SUVs, side-by-sides) who want the Boutique: detailing, window tint, ceramic coatings, paint protection film, custom lighting. They book a service drop-off.

Both reach the shop mostly from a phone, often arriving from Instagram or Facebook.

## Product Purpose
THE LAB (Luxx Automotive Boutique Inc., Fort St. John, BC) is a local shop with two arms under one roof: **The Boutique** (aesthetics and protection, run by the detailing team) and **The Parts Store / performance work** (diesel performance, run by Eric). The site turns visitors into booked jobs and parts orders. Success: more bookings and requests reaching the shop's phone, more parts sold, and more people following the shop on Instagram and Facebook.

## Positioning
A local shop that does both grit and luxury: hardcore diesel performance and show-quality detailing in one place, with authorized-brand credibility (EZ LYNK, HP Tuners, AMDP, Gridiron, Morimoto, Baja Designs, Diode Dynamics, Suntek).

## Operating Context
- Detailing is by appointment only: drop-off 8:00 to 9:00 AM Monday to Friday, 2 details per day, booked through a Google Calendar appointment schedule.
- Everything else (tint, lighting, tuning, builds) is Eric's own work, booked through a second Google schedule.
- Visitors submit an intake form, the shop gets the request by email, and Eric or the team texts back and sends a $50 deposit link.
- The shop's public number is (250) 261-9502 and the team sees texts to it. The site has a floating "Text Us" button.
- Social is a major channel: the shop is large on Instagram and Facebook and wants to grow both.

## Capabilities and Constraints
- Must keep working through any redesign: intake forms (`intake.js`), booking flow, the cost estimator (`estimator.js`), parts store, cart and checkout (`store.js`, `products.js`), global search, vehicle selector, guided tuning, and the Text Us button. Keep their element ids, classes and `data-` hooks.
- Mobile is primary. A sticky mobile bottom nav exists.
- Emissions-related products are for off-road and sanctioned racing use only; the legal wording on the site and forms must stay.
- No GoHighLevel/LeadConnector code anywhere. All leads go to the shop's email and phone.
- Currency toggle (CAD/USD) exists on the site.
- Open decision: the customer reviews section was removed with GHL and has not been replaced.

## Brand Commitments
Name: THE LAB, "Luxx Automotive Boutique Inc." Existing white outline logo with diamond mark (`src/assets/LAB-LOGO.png`), tagline "Where Grit Meets Luxury", black base with blue (#0066FF) and cyan accent already established. Fonts in use: Manrope (headings) and Inter (body). The user wants the look to feel like a mix of gritty shop and premium boutique, not a generic template.

## Evidence on Hand
Real photos of the shop, building, trucks and jobs in `src/assets` (hero, service, boutique and OG images). Brand and partner logos. More photos exist but are not available now; keep what is there. No customer testimonials or review quotes are currently on file, so none may be invented.

## Product Principles
1. One site, two audiences: a diesel owner and a detailing customer should each feel it was made for them within the first screen.
2. Turn visits into messages and bookings: the phone number, Text Us, booking and checkout paths must be obvious on mobile.
3. Real shop proof beats decoration: use the real photos, brands and work; never invent reviews or claims.
4. Built for people arriving from Instagram and Facebook: fast on a phone, clear in seconds, easy to share.
5. Function before polish: forms, booking and checkout never regress for a visual change.

## Accessibility & Inclusion
Readable on a phone in daylight: body text must meet WCAG AA contrast, touch targets at least 44px, and motion must respect reduced-motion settings.
