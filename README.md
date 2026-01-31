# PriceRight

**AI-powered pricing engine for working artists.**

Get data-backed pricing that reflects your actual market value — no guesswork, no second-guessing. Built with Next.js, powered by Groq (free), deployed on Render (free).

---

## Total Cost to Run

| Thing | Cost |
|---|---|
| Render (hosting) | Free |
| Groq (AI API) | Free (14,400 req/day) |
| Domain (optional) | ~$10–15/yr |
| **Total** | **$0 to start** |

---

## What You Need

- **Node.js** 18 or higher installed on your machine
- A **GitHub** account (to host your repo)
- A **Groq** account — groq.com (free, no credit card)
- A **Render** account — render.com (free, no credit card)

---

## Step 1 — Get Your Free Groq API Key

1. Go to **https://console.groq.com**
2. Sign up with your email (free, no credit card needed)
3. In the left sidebar, click **API Keys**
4. Click **Create API Key**
5. Give it a name (e.g. "priceright")
6. **Copy the key** — you'll need it in Step 3. Save it somewhere safe.

---

## Step 2 — Set Up the Project Locally

1. Download this project and unzip it
2. Open a **terminal** in the project folder
3. Run:
   ```
   npm install
   ```
   This downloads the dependencies (Next.js, React, etc.). Takes ~30 seconds.

---

## Step 3 — Add Your API Key

1. In the project folder, you'll see a file called `.env.example`
2. Duplicate it and rename the copy to `.env` (no `.example`)
3. Open `.env` in any text editor
4. Replace `your_groq_api_key_here` with the key you copied in Step 1
5. Save the file

Your `.env` should look like this:
```
GROQ_API_KEY=gsk_abc123yourkeyhere...
```

> **Important:** Never commit `.env` to GitHub. It contains your secret key. The `.env` file is automatically ignored by Next.js — just make sure you don't manually add it.

---

## Step 4 — Test Locally

1. Run:
   ```
   npm run dev
   ```
2. Open your browser and go to **http://localhost:3000**
3. Try it out — fill in the form and run an analysis
4. If it works, you're ready to deploy. Hit `Ctrl+C` in the terminal to stop the server.

---

## Step 5 — Deploy to Render

**Option A: Using render.yaml (fastest)**

1. Push your project to a **GitHub repository**
   - Go to github.com → New Repository
   - Follow GitHub's instructions to push your local project
   - Make sure `.env` is NOT in the repo (it shouldn't be)
2. Go to **https://render.com** and sign up (free)
3. Click **New** → **Blueprint**
4. Paste your GitHub repo URL
5. Render reads `render.yaml` and auto-configures everything
6. You'll see a field for `GROQ_API_KEY` — paste your key from Step 1
7. Click **Create Resources**
8. Wait 1–2 minutes for the build
9. You're live! Render gives you a URL like `priceright.onrender.com`

**Option B: Manual setup (if Blueprint doesn't work)**

1. Push your project to GitHub (same as above)
2. Go to render.com → **New** → **Web Service**
3. Connect your GitHub repo
4. Set these fields:
   - **Build Command:** `npm install && next build`
   - **Start Command:** `next start -p $PORT`
5. Scroll down to **Environment Variables**
6. Add a new variable:
   - Key: `GROQ_API_KEY`
   - Value: (paste your key)
7. Click **Create Web Service**
8. Wait for the build. You're live.

---

## Step 6 — Add a Custom Domain (Optional)

If you want a real domain like `priceright.io` instead of the Render URL:

1. Buy a domain at **Namecheap** or **Cloudflare** (~$10–15/yr)
2. In Render, go to your service → **Settings** → **Custom Domains**
3. Click **Add a custom domain** and type your domain
4. Render will show you DNS records to add
5. Go to your domain registrar (Namecheap/Cloudflare) and add those DNS records
6. Wait 5–30 minutes for DNS to propagate
7. Your site is live at your custom domain

---

## How It Works (Architecture)

```
User's Browser
      │
      │  POST /api/analyze  (sends form data)
      ▼
┌─────────────────┐
│  Render Server  │  ← Your Next.js app
│  (pages/api/)   │  ← Constructs the AI prompt
│                 │  ← Calls Groq with your hidden API key
└────────┬────────┘
         │
         │  POST to Groq API
         ▼
┌─────────────────┐
│   Groq (free)   │  ← Runs Llama 3.3 70B
│                 │  ← Returns pricing JSON
└─────────────────┘
```

Your API key lives **only** on the server. The browser never sees it. This is why we need the backend proxy — if the AI call happened directly in the browser, anyone could extract your key from the source code.

---

## Project Structure

```
priceright/
├── package.json          ← Dependencies and scripts
├── next.config.js        ← Next.js config
├── render.yaml           ← Render deployment config
├── .env.example          ← Template for your API key
├── .env                  ← Your actual API key (you create this)
└── pages/
    ├── _document.js      ← Loads Google Fonts
    ├── index.js          ← The full app UI
    └── api/
        └── analyze.js    ← Backend: calls Groq, returns pricing
```

---

## Monetization (When You're Ready)

The app is built to support a freemium model. When you want to add paid tiers:

1. **Add Stripe** — integrate stripe.com for payment processing
2. **Track usage** — add a simple database (like Supabase, free tier) to count analyses per user
3. **Gate the premium features** — the "Coming Soon" card on the results page is already there, waiting to be wired up
4. **Suggested tiers:**
   - Free: 3 analyses/month
   - Pro ($9/mo): Unlimited analyses + portfolio audit
   - Studio ($29/mo): Everything + trend reports + priority support

---

## Troubleshooting

**"Server not configured"**
→ Your `GROQ_API_KEY` environment variable isn't set. Check Step 3 (local) or Step 5 (Render).

**"AI analysis failed"**
→ The Groq API returned an error. Check your API key is valid at console.groq.com. If it's expired, create a new one.

**"Too many requests"**
→ Rate limiter kicked in (10 requests/minute per IP). Wait 60 seconds and try again. You can increase the limit in `pages/api/analyze.js`.

**Render build fails**
→ Make sure your repo has `package.json` at the root. Try running `npm install && next build` locally to see the error.

**Fonts not loading**
→ Check your internet connection. Fonts are loaded from Google Fonts. If you need offline fonts, switch to `next/font` (see Next.js docs).
