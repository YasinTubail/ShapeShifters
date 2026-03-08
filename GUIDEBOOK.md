# SHAPESHIFTERS — Owner & Developer Guidebook

Everything you need to run, manage, and grow the website.

---

## Table of Contents

1. [Running the Website Locally](#1-running-the-website-locally)
2. [Where Is It Hosted](#2-where-is-it-hosted)
3. [Deploying to Vercel](#3-deploying-to-vercel)
4. [Admin Panel Guide](#4-admin-panel-guide)
5. [Managing Products](#5-managing-products)
6. [Managing Collections](#6-managing-collections)
7. [Viewing Orders](#7-viewing-orders)
8. [Stripe Payments Setup](#8-stripe-payments-setup)
9. [Environment Variables](#9-environment-variables)
10. [File Structure](#10-file-structure)
11. [Making Changes to the Website](#11-making-changes-to-the-website)
12. [Security Notes](#12-security-notes)
13. [Common Tasks](#13-common-tasks)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Running the Website Locally

**Requirements:** Node.js (already installed on your machine)

Open a terminal, go to the project folder, and run:

```bash
npm run dev
```

Then open your browser at: **http://localhost:3000**

To stop the server: press `Ctrl + C` in the terminal.

**To build for production (check for errors):**
```bash
npm run build
```
If the build passes with no errors, the site is ready to deploy.

---

## 2. Where Is It Hosted

The website is designed to be hosted on **Vercel** (https://vercel.com).

Vercel is free for small projects and connects directly to your GitHub repository. When you push code to GitHub, Vercel automatically rebuilds and redeploys the website.

**Current status:** The code is on your local machine. To go live, follow Section 3 below.

---

## 3. Deploying to Vercel

### Step 1 — Push to GitHub

```bash
# In the project folder:
git init
git add .
git commit -m "launch shapeshifters"
```

Then create a new repository on https://github.com (call it `shapeshifters`) and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/shapeshifters.git
git push -u origin main
```

### Step 2 — Connect to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click **New Project** → Import your `shapeshifters` repository
3. Vercel will detect Next.js automatically — click **Deploy**
4. It will fail the first time because env variables are missing — that's expected

### Step 3 — Add Environment Variables in Vercel

In your Vercel project: **Settings → Environment Variables**

Add all of these:

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | Your live Stripe secret key (`sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your live publishable key (`pk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook setup (see Section 8) |
| `NEXT_PUBLIC_BASE_URL` | `https://your-domain.com` |
| `ADMIN_PASSWORD` | A strong password you choose |
| `SESSION_SECRET` | Run `openssl rand -hex 32` to generate one |

Then redeploy: **Deployments → Redeploy**

### Step 4 — Custom Domain (optional)

In Vercel: **Settings → Domains** → Add your domain (e.g. `shapeshifters.com`)
Follow the instructions to update your DNS records.

---

## 4. Admin Panel Guide

**URL:** `your-website.com/admin/login`

**Password:** Whatever you set as `ADMIN_PASSWORD` in your environment variables.
Current local password: `shapeshifters2026`

### What you can do in the admin:

| Section | What it does |
|---|---|
| **Dashboard** | See total products, orders, and revenue at a glance |
| **Products** | Add, edit, hide, or delete products |
| **Orders** | See all customer orders from Stripe |
| **Collections** | Create or manage product collections |

### How to log in:
1. Go to `/admin/login`
2. Enter your password
3. You stay logged in for 7 days

### How to log out:
Click **Log Out** at the bottom of the sidebar.

---

## 5. Managing Products

### Add a new product:
1. Admin → Products → **+ Add Product**
2. Fill in all fields:
   - **ID**: a unique slug like `ess-005` (no spaces, lowercase)
   - **Name**: the product display name
   - **Price**: in Turkish Lira, no decimals (e.g. `3290` = ₺3.290)
   - **Category**: Hoodies / Tees / Bottoms / Accessories
   - **Collection**: `1st` or `essentials` (must match collection slug exactly)
   - **Image**: the path to the image file, e.g. `/images/my-product.jpg`
   - **Sizes**: tick the available sizes
3. Click **Save**

### Add a product image:
1. Put the image file in the `public/images/` folder on your computer
2. Then deploy to Vercel (or it will only show locally)
3. Use the path `/images/filename.jpg` in the product form

### Hide a product (without deleting):
- Admin → Products → click the **eye icon** on the product row
- Hidden products stay in the database but won't appear in the shop
- Click the eye icon again to make it visible

### Edit a product:
- Admin → Products → click the **pencil icon**

### Delete a product:
- Admin → Products → click the **trash icon** → confirm

---

## 6. Managing Collections

### Add a collection:
1. Admin → Collections → **+ Add Collection**
2. Fill in:
   - **ID**: unique (e.g. `summer-2026`)
   - **Name**: display name (e.g. `Summer 2026`)
   - **Slug**: URL-friendly version (e.g. `summer-2026`) — this is what goes in product `collection` field
   - **Description**: short text
   - **Image**: path to image in `public/images/`
3. Click Save

### Link a product to a collection:
When adding/editing a product, set the **Collection** field to the collection's **slug** (e.g. `essentials`).

---

## 7. Viewing Orders

Admin → **Orders**

Shows all Stripe checkout sessions. Each order has:
- Order ID
- Customer name + email
- Items purchased
- Shipping address (Turkey)
- Amount (in TRY)
- Status: `paid` / `unpaid`

**Note:** Orders marked `unpaid` are abandoned carts — customers who started checkout but didn't complete payment.

For detailed order management (refunds, disputes), log into your Stripe Dashboard at https://dashboard.stripe.com.

---

## 8. Stripe Payments Setup

### Test mode (local development):
The `.env.local` file already has test keys. Payments won't charge real cards.

To test a payment, use card number: `4242 4242 4242 4242`, any future expiry date, any CVC.

### Go live (production):
1. Log in to https://dashboard.stripe.com
2. Go to **Developers → API Keys**
3. Copy your **Live** secret key and publishable key
4. Add them to Vercel environment variables (see Section 3)

### Set up the Stripe Webhook:
This is what tells your website "a payment just happened" so it can send confirmation emails.

1. In Stripe Dashboard: **Developers → Webhooks → Add endpoint**
2. URL: `https://your-domain.com/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy the **Signing secret** (`whsec_...`)
5. Add it to Vercel as `STRIPE_WEBHOOK_SECRET`

### For local webhook testing:
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the whsec_ secret printed and paste into .env.local
```

---

## 9. Environment Variables

These are the secret settings for the website. **Never share these publicly or commit them to GitHub.**

`.env.local` is the file used locally. Vercel has its own copy in Settings → Environment Variables.

| Variable | What it is | Where to get it |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key | dashboard.stripe.com → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | dashboard.stripe.com → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe → Webhooks |
| `NEXT_PUBLIC_BASE_URL` | Your website URL | Set to `https://your-domain.com` |
| `ADMIN_PASSWORD` | Admin panel password | Choose a strong one |
| `SESSION_SECRET` | Signing key for login cookies | Run: `openssl rand -hex 32` |
| `RESEND_API_KEY` | Email service (optional) | resend.com |

---

## 10. File Structure

```
project/
├── app/                        All pages
│   ├── page.tsx                Homepage
│   ├── shop/page.tsx           Shop page
│   ├── product/[id]/page.tsx   Product detail
│   ├── collections/            Collections pages
│   ├── contact/page.tsx        Contact page
│   ├── about/page.tsx          About page
│   ├── admin/                  Admin panel (password protected)
│   │   ├── login/              Login page
│   │   └── (panel)/            Dashboard, products, orders, collections
│   ├── actions/
│   │   ├── admin.ts            Admin operations (add/edit/delete products)
│   │   └── stripe.ts           Checkout logic
│   └── api/webhooks/stripe/    Stripe webhook handler
│
├── components/                 Reusable UI pieces
│   ├── header.tsx              Navigation bar
│   ├── footer.tsx              Footer
│   ├── cart-drawer.tsx         Shopping cart sidebar
│   ├── checkout.tsx            Stripe checkout embed
│   └── admin/                  Admin UI components
│
├── data/
│   ├── products.json           All product data (source of truth)
│   └── collections.json        All collection data
│
├── lib/
│   ├── server-products.ts      Read/write products.json
│   ├── admin-auth.ts           Login session management
│   ├── rate-limit.ts           Brute force protection
│   ├── stripe.ts               Stripe client
│   ├── email.ts                Order confirmation emails
│   └── currency.ts             Price formatting (TRY)
│
├── public/images/              All product + brand images
├── proxy.ts                    Protects /admin routes
├── next.config.mjs             Next.js configuration + security headers
├── .env.local                  Secret environment variables (never commit)
├── README.md                   Technical overview
└── GUIDEBOOK.md                This file
```

---

## 11. Making Changes to the Website

### Change text on any page:
1. Open the file for that page (e.g. `app/about/page.tsx` for the About page)
2. Find the text and edit it
3. Save — the dev server will reload automatically

### Change a price:
- Option A: Admin panel → Products → Edit product → change Price
- Option B: Edit `data/products.json` directly

### Change a product image:
1. Add the new image to `public/images/`
2. Admin → Products → Edit → update the Image field to `/images/new-filename.jpg`

### Change the Instagram or phone number:
- Contact page: `app/contact/page.tsx`
- Footer: `components/footer.tsx`

### Change the homepage hero text:
- File: `app/page.tsx` or the hero component it uses

### Add a new page:
Create a file at `app/your-page-name/page.tsx` — it becomes available at `/your-page-name`

---

## 12. Security Notes

- **Admin password** is set in `ADMIN_PASSWORD` env var. Use a strong password.
- **SESSION_SECRET** must be a random 32+ character string in production. Generate it with `openssl rand -hex 32`.
- **Never commit `.env.local`** to GitHub — it's already in `.gitignore`.
- The admin panel is protected at two levels:
  1. The proxy (`proxy.ts`) blocks unauthenticated access at the edge
  2. Every admin action verifies the session before executing
- Login is rate-limited: 10 attempts per 15 minutes, then 30-minute lockout.

---

## 13. Common Tasks

### "I want to add a new product"
→ Admin → Products → + Add Product

### "I want to change a price"
→ Admin → Products → Edit (pencil icon)

### "I want to hide a product temporarily"
→ Admin → Products → Eye icon (toggles active/hidden)

### "I want to see who bought what"
→ Admin → Orders (or Stripe Dashboard for more detail)

### "I want to issue a refund"
→ Go to https://dashboard.stripe.com → Payments → find the payment → Refund

### "The website is down"
→ Check https://vercel.com/dashboard for deployment status and error logs

### "I pushed code and something broke"
→ Vercel → Deployments → click the last working deployment → **Promote to Production**

### "I need to update a secret (e.g. new Stripe key)"
→ Vercel → Settings → Environment Variables → edit the variable → Redeploy

### "I want to back up my product data"
→ Copy the file `data/products.json` — it contains all your products

---

## 14. Troubleshooting

### Website shows blank page / error
- Check Vercel deployment logs for errors
- Make sure all environment variables are set in Vercel
- Run `npm run build` locally to find TypeScript/compile errors

### Admin login not working
- Check that `ADMIN_PASSWORD` in Vercel matches what you're typing
- Make sure `SESSION_SECRET` is set in Vercel
- Try clearing browser cookies and logging in again

### Payments not working
- Make sure you switched from test keys (`sk_test_`) to live keys (`sk_live_`) in Vercel
- Check that `NEXT_PUBLIC_BASE_URL` is set to your real domain

### Orders not showing in admin
- The admin orders page reads directly from Stripe — check your Stripe API keys are correct

### Product images not loading
- Make sure the image file is in `public/images/`
- Make sure the path in the product matches exactly (case-sensitive): `/images/filename.jpg`
- After adding new images locally, you must deploy to Vercel for them to appear online

### Emails not sending after purchase
- `RESEND_API_KEY` must be set in Vercel
- The Stripe webhook must be configured and `STRIPE_WEBHOOK_SECRET` must match

---

## Contact & Support

- **Instagram:** [@shapeshifter_tr](https://www.instagram.com/shapeshifter_tr/)
- **WhatsApp / Phone:** +90 507 805 90 57
