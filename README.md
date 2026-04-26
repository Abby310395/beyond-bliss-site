# Beyond Bliss Creations — Website

Production-ready static site for Beyond Bliss Creations. Built as plain HTML/CSS/JS so it works on any host (Vercel, Netlify, GitHub Pages, Cloudflare Pages).

## What's inside

```
beyond-bliss-site/
├── public/
│   ├── index.html      ← Markup + all styles inline
│   ├── products.js     ← All 55 products (edit prices here)
│   └── app.js          ← Cart, Razorpay, WhatsApp logic
├── vercel.json         ← Vercel config (auto-deploy)
└── README.md           ← This file
```

## Features

- **55 products** sourced from R K Handicrafts (Saharanpur), priced with Option B (shipping baked in, free shipping marketed)
- **Cart with localStorage** — items persist across browser sessions
- **Razorpay checkout** — UPI, cards, wallets, NetBanking
- **WhatsApp order fallback** — customers can also order by WhatsApp message
- **WhatsApp catalogue link** — links to your existing WhatsApp catalogue at `wa.me/c/919045642346`
- **Per-product WhatsApp enquiry** — every product card has an "Ask on WhatsApp" link
- **Mobile-responsive** — works perfectly on phones (where 80% of your customers will be)
- **SEO-ready** — proper meta tags, semantic HTML, lazy-loaded images

---

## Deploy to Vercel (5 minutes)

### Option 1: Drag and drop (simplest)
1. Create a free account at [vercel.com](https://vercel.com)
2. Go to your dashboard → "Add New" → "Project"
3. Drag the `beyond-bliss-site` folder onto the page
4. Click "Deploy"
5. Done. You'll get a URL like `beyond-bliss.vercel.app`

### Option 2: GitHub (recommended for ongoing edits)
1. Push this folder to a new GitHub repo (`git init`, `git add .`, etc.)
2. In Vercel: "Import Git Repository" → select your repo
3. Framework preset: **Other** · Build Command: leave empty · Output Directory: `public`
4. Click "Deploy"
5. Every time you push to GitHub, Vercel rebuilds automatically

### Connect a custom domain
1. Buy a domain (e.g. `beyondblisscreations.in` from GoDaddy / Namecheap, ~₹700/year)
2. In Vercel project → Settings → Domains → Add → enter your domain
3. Update DNS as Vercel instructs (usually one CNAME or A record at your registrar)
4. Done. SSL/HTTPS is automatic.

---

## Razorpay Setup (10 minutes — required for payments)

The site works WITHOUT Razorpay (orders fall through to WhatsApp). But to take card/UPI payments online, do this:

1. Sign up at [razorpay.com](https://razorpay.com) — use your business email
2. Complete KYC: PAN, Aadhaar, GST (optional but recommended), bank account
3. Go to **Settings → API Keys → Generate Key**
4. You'll get a `Key ID` (starts with `rzp_test_` for test mode, `rzp_live_` for live)
5. Open `public/app.js` and find this line:
   ```js
   RAZORPAY_KEY_ID: "rzp_test_REPLACE_ME",
   ```
6. Replace with your actual Key ID:
   ```js
   RAZORPAY_KEY_ID: "rzp_live_AbCdEf123456",
   ```
7. Save, redeploy. Done.

**Note:** This setup uses Razorpay's "Standard Checkout" without a backend, which works for all orders up to ₹1 lakh. For higher-value orders or order-tracking features, you'll eventually want a backend (Node.js + Razorpay's `orders.create` API). That's a month-2 problem.

---

## Editing products

Open `public/products.js`. Each product is an object:

```js
{
  "slug": "wooden-money-box",
  "name": "Wooden Money Box",
  "cost": 110,            // Internal — what R K charges you. Not shown.
  "price": 299,           // What customer pays
  "mrp": 449,             // Crossed-out "MRP" shown for discount feel
  "discount": 33,         // Auto-calculated
  "category": "boxes",
  "categoryLabel": "Boxes & Storage",
  "image": "https://5.imimg.com/...",  // Currently hotlinked to imimg.com
  "dimensions": "6×4 inch",
  "desc": "Rectangular wooden money savings box."
}
```

To add/edit/remove products, just edit this file. No build step needed — just save and redeploy.

### Pricing formula (Option B)

Already applied to all 55 products:

| R K cost | Markup | + Shipping baked | Round to |
|---|---|---|---|
| Under ₹50 | 4.0× | +₹50 | nearest x49 |
| ₹50–100 | 2.5× | +₹40 | nearest x49 |
| ₹100–300 | 2.2× | +₹50 | nearest x49 |
| ₹300–800 | 2.0× | +₹60 | nearest x49 |
| ₹800+ | 1.8× | +₹80 | nearest x99 |

MRP = selling price × 1.5 (gives ~33% off display).

---

## Replacing supplier images (recommended within 60 days)

Currently all images are hotlinked from R K Handicrafts' IndiaMART listings (the imimg.com CDN). This works fine but has two issues:

1. **Dependency** — if R K removes their listings, your images break
2. **Reverse-image search** — customers can find your supplier and skip you

### To self-host images:
1. Visit each `image` URL in `products.js`, save the JPG locally
2. Save them to `public/products/` with the slug as filename, e.g. `wooden-money-box.jpg`
3. In `products.js`, change image URLs from `https://5.imimg.com/...` to `/products/wooden-money-box.jpg`
4. Redeploy

### Better: take your own photos
Once you have stock, photograph each product yourself:
- Phone camera is fine (iPhone 12+ or any modern Android)
- Single white bedsheet as backdrop
- Daylight by a window
- 3 angles per product
- Free editing in [Photoroom](https://photoroom.com) for clean white backgrounds

This is the single biggest move you can make to differentiate from every other Saharanpur seller.

---

## WhatsApp catalogue

The hero & nav already link to your WhatsApp catalogue: `wa.me/c/919045642346`.

To update what customers see on WhatsApp:
1. Open WhatsApp Business app
2. Settings → Business tools → Catalogue
3. Add/edit products there
4. The link `wa.me/c/919045642346` always shows the latest version automatically

---

## What to do next

1. **Deploy** to Vercel (5 min)
2. **Sign up for Razorpay** (10 min)
3. **Buy a domain** (~₹700/year, optional but recommended)
4. **Test a real order** at ₹1 to verify payment flow works
5. **Start posting Instagram Reels** — drive traffic to `yourdomain.in`
6. **Within 60 days**: replace supplier images with your own photos

---

## File-by-file what to edit

| Want to change... | Edit this file |
|---|---|
| Add/remove products, change prices | `public/products.js` |
| Razorpay Key ID | `public/app.js` (top of file) |
| WhatsApp number / phone number | `public/app.js` (CONFIG block) + `public/index.html` (search for the number) |
| Hero text / story text | `public/index.html` |
| Colours / fonts | `public/index.html` (in `<style>` block, top has `:root` variables) |

That's it. Ship it.
