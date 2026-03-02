# Shipping Charge Estimator

Monorepo with:

- `apps/api` - NestJS + Prisma + PostgreSQL + Redis
- `apps/web` - Next.js App Router + TypeScript + Tailwind + shadcn/ui

## 1) Setup

```bash
docker compose up -d
```

Backend:

```bash
cd apps/api
cp .env.example .env
npm install
npm run prisma:generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

Frontend (new terminal):

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

## 2) Run Tests

Backend unit tests:

```bash
cd apps/api
npm test
```

Backend integration tests:

```bash
cd apps/api
npm run test:e2e
```

## 3) Swagger

- URL: `http://localhost:3001/docs`

## 4) Key Endpoints (base: `/api/v1`)

- `GET /warehouse/nearest?sellerId=...`
- `GET /shipping-charge?warehouseId=...&customerId=...&productId=...&deliverySpeed=standard|express`
- `POST /shipping-charge/calculate`
- `GET /shipping-charge/history`
- CRUD: `/customers`, `/sellers`, `/products`, `/warehouses`
- Convenience: `GET /sellers/:id/products`

## 5) Environment Variables

`apps/api/.env.example`

- `PORT`
- `DATABASE_URL`
- `REDIS_URL`

`apps/web/.env.example`

- `NEXT_PUBLIC_API_BASE_URL`

## 6) Frontend Routes

- `/calculator`
- `/admin`
- `/history`
