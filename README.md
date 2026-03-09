# SHAPESHIFTERS

Egyptian-heritage streetwear brand based in Turkey. Built with Next.js 16 App Router, Stripe embedded checkout, and a full admin panel — no external database required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Payments | Stripe Embedded Checkout (TRY) |
| Data Store | JSON files (`data/`) — no database needed |
| Auth | HMAC-SHA256 cookie session (single admin) |
| Deployment | Vercel |
| Analytics | Vercel Analytics |

---

## Project Structure

```
app/
  (public pages)         homepage, shop, product, collections, about, etc.
  admin/
    login/               login page (no layout)
    (panel)/             protected admin area
      dashboard/         stats + recent orders
      products/          product CRUD
      orders/            Stripe orders list
      collections/       collection CRUD
  actions/
    admin.ts             all admin server actions (auth-guarded)
    stripe.ts            checkout + session retrieval
  api/
    webhooks/stripe/     Stripe webhook handler

components/
  admin/
    sidebar.tsx          admin navigation
    product-form.tsx     shared create/edit form
    product-row-actions.tsx  toggle/edit/delete buttons
    collections-client.tsx   collection CRUD UI
  (public components)    cart, header, product grid, checkout, etc.

data/
  products.json          source of truth — edit via admin or directly
  collections.json       source of truth for collections

lib/
  admin-auth.ts          HMAC session create/verify/clear
  rate-limit.ts          in-memory login rate limiter
  server-products.ts     read/write products.json and collections.json
  stripe.ts              Stripe client singleton
  email.ts               order confirmation email (Resend/SendGrid)
  currency.ts            TRY formatting helpers

proxy.ts                 protects all /admin/* routes (Next.js proxy)
```

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local` is already present. Fill in the required values:

```env
# Stripe (get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...        # from stripe listen command

# Your dev URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Admin panel credentials
ADMIN_PASSWORD=your-strong-password-here

# Session signing secret — generate with: openssl rand -hex 32
SESSION_SECRET=your-32-char-random-secret

# Email (optional — order confirmation emails)
# RESEND_API_KEY=re_...
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Test Stripe webhooks locally

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret printed by the CLI and paste it into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

---

## Admin Panel

**URL:** `/admin/login`
**Password:** set in `ADMIN_PASSWORD` env var

| Page | Path | What it does |
|---|---|---|
| Dashboard | `/admin/dashboard` | Live stats: products, orders, revenue |
| Products | `/admin/products` | View, toggle active/hidden, edit, delete |
| Add Product | `/admin/products/new` | Create a new product |
| Edit Product | `/admin/products/[id]` | Edit existing product |
| Orders | `/admin/orders` | All Stripe checkout sessions |
| Collections | `/admin/collections` | Create/edit/delete collections |

All mutations are auth-guarded server-side. The proxy (`proxy.ts`) also protects every `/admin/*` route at the edge.

---

## Security

| Mechanism | Implementation |
|---|---|
| Route protection | `proxy.ts` — HMAC-SHA256 cookie check on every `/admin/*` request |
| Action auth | Every admin server action calls `verifyAdminSession()` before executing |
| Session cookie | `httpOnly`, `sameSite: strict`, `secure` in production, 7-day expiry |
| Session signing | HMAC-SHA256 with `SESSION_SECRET` env var (not a static salt) |
| Login rate limit | 10 attempts / 15 min per IP, then 30-min lockout |
| Price validation | Stripe line items use server-side prices — client price is ignored |
| Security headers | `X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, `Referrer-Policy`, `Permissions-Policy` |
| Admin cache | `Cache-Control: no-store` on all `/admin/*` responses |

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/shapeshifters.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
2. Add all environment variables from `.env.local` (use production values)
3. Generate a real `SESSION_SECRET`: `openssl rand -hex 32`
4. Set `NEXT_PUBLIC_BASE_URL` to your production domain (e.g. `https://shapeshifters.com`)

### 3. Set up Stripe production webhook

1. In Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://your-domain.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy the signing secret into Vercel env vars as `STRIPE_WEBHOOK_SECRET`

### 4. Switch to live Stripe keys

Replace `sk_test_...` / `pk_test_...` with your live keys in Vercel environment variables.

---

## Adding Products

**Via admin panel (recommended):**
1. Go to `/admin/products/new`
2. Fill in name, price (in TRY, without decimals), sizes, image path, etc.
3. Image must be placed in `public/images/` — use the relative path e.g. `/images/my-product.jpg`

**Via JSON directly:**
Edit `data/products.json`. Each product follows this shape:

```json
{
  "id": "unique-id",
  "name": "Product Name",
  "price": 3290,
  "category": "Hoodies",
  "color": "Black",
  "collection": "essentials",
  "image": "/images/product.jpg",
  "material": "100% Premium Cotton Fleece",
  "description": "Product description here.",
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "active": true
}
```

---

## Adding Email Notifications

Order confirmation emails are triggered by the Stripe webhook on successful payment.

1. Sign up for [Resend](https://resend.com) (free tier: 3,000 emails/month)
2. Add your API key to `.env.local`: `RESEND_API_KEY=re_...`
3. Update `lib/email.ts` with your verified sender domain

---

## Currency

All prices are in **Turkish Lira (TRY)**. Prices in `products.json` are stored as integers in kuruş (e.g. `3290` = ₺3,290). The `formatPrice` utility in `lib/currency.ts` handles display formatting.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (`sk_test_...` / `sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Yes (prod) | Webhook signing secret from Stripe CLI or dashboard |
| `NEXT_PUBLIC_BASE_URL` | Yes | Full URL of your site (no trailing slash) |
| `ADMIN_PASSWORD` | Yes | Admin panel password |
| `SESSION_SECRET` | Yes | Random 32+ char string for signing session cookies |
| `RESEND_API_KEY` | Optional | Resend API key for order emails |
