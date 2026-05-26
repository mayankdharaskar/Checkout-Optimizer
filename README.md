# D2C Checkout Optimizer

Multi-tenant SaaS for dynamic checkout-stage offers (exit-intent, idle time) with analytics and an embeddable widget SDK.

## Quick start

```bash
npm install
npm run db:setup    # prisma db push + seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo credentials

| Field | Value |
|-------|--------|
| Email | `demo@checkoutoptimizer.dev` |
| Password | `demo1234` |
| Widget store key | `cko_demo_store_key_for_local_testing` |

## Test the widget

1. Start the dev server: `npm run dev`
2. Open [http://localhost:3000/test-checkout.html](http://localhost:3000/test-checkout.html)
3. Trigger exit-intent (move mouse quickly to top of viewport) or wait 45s for idle offer

## API endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/engine/evaluate` | `X-Store-Key` | Match campaigns and return offer |
| `POST /api/analytics/track` | `X-Store-Key` | Beacon analytics events |
| `GET /api/widget/sdk?key=` | — | Embeddable JavaScript SDK |
| `GET/POST /api/campaigns` | Session | Campaign CRUD (dashboard) |

### Evaluate example

```bash
curl -X POST http://localhost:3000/api/engine/evaluate \
  -H "Content-Type: application/json" \
  -H "X-Store-Key: cko_demo_store_key_for_local_testing" \
  -d '{
    "sessionId": "test_1",
    "trigger": "EXIT_INTENT",
    "cartTotalCents": 7500,
    "country": "US",
    "durationOnPageMs": 12000
  }'
```

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — SQLite path (`file:./dev.db`)
- `AUTH_SECRET` — random string for NextAuth
- `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` — app origin

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (builds widget first) |
| `npm run build` | Production build |
| `npm run build:widget` | Bundle SDK to `public/widget/` |
| `npm run db:setup` | Push schema + seed |
