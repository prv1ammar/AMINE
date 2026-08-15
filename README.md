# LHT Store

A French sunglasses e-commerce brand site, built from a Claude-designed mockup into a real
FastAPI + React application, with an admin panel for managing the catalog.

## Architecture

```
lht-store/
├── backend/                  FastAPI application
│   ├── app/
│   │   ├── core/               settings (pydantic-settings), JWT/password security, logging
│   │   ├── db/                 SQLAlchemy engine/session, table bootstrap
│   │   ├── models/              Product, ProductCollection, Collection, Inquiry,
│   │   │                        NewsletterSubscriber, AdminUser
│   │   ├── schemas/            Pydantic request/response schemas
│   │   ├── crud/                DB access functions, one module per entity
│   │   ├── api/v1/
│   │   │   ├── products.py      public catalog (active products only)
│   │   │   ├── collections.py   public collections + collection→products
│   │   │   ├── inquiries.py     public POST (contact/order form)
│   │   │   ├── newsletter.py    public POST (subscribe)
│   │   │   ├── auth.py          admin login → JWT
│   │   │   └── admin.py         everything JWT-gated: product/collection CRUD,
│   │   │                        collection↔product membership, inquiry status,
│   │   │                        newsletter list, image uploads
│   │   ├── services/            side effects (email notifications)
│   │   ├── seed.py              loads the product catalog + starter collections
│   │   └── create_admin.py      creates an admin login
│   ├── alembic/                 versioned schema migrations
│   ├── supabase_schema.sql      hand-authored, Supabase-ready schema (see below)
│   └── tests/                   pytest suite (isolated in-memory SQLite per test)
│
└── frontend/                  React + TypeScript (Vite)
    └── src/
        ├── pages/                public routes (Home, Collection, Lookbook, Tarifs,
        │                         À Propos, Contact) + pages/admin/ (Login, Products,
        │                         Collections, Inquiries, Newsletter)
        ├── components/layout/    Header, Footer, Layout (public nav/footer chrome)
        ├── components/admin/     RequireAdmin (route guard)
        ├── components/ui/        ImageSlot (photo placeholder, falls back from a
        │                         real uploaded photo to descriptive placeholder text)
        ├── components/product/   ProductCard
        ├── features/*/           one folder per domain (products, collections,
        │                         inquiries, newsletter, admin auth): api.ts + types.ts
        │                         + hooks.ts (React Query)
        ├── lib/                  apiClient (public), adminApiClient (JWT-attached)
        └── styles/               tokens.css + global.css (public site) and admin.css
                                   (the admin panel — a plain functional UI, not branded)
```

**Design system**: the public site uses the black/cream "editorial" visual language
(Cormorant Garamond + Montserrat, `#0a0a0a` ink on `#f5f3f0` paper). The admin panel is a
separate, purely functional UI (system font, light neutral theme) — it's an internal tool,
not a branded surface.

**Order flow**: there's no cart or payment integration. Visitors browse the catalog and submit
an inquiry (contact form, or "commander" from a product/pricing card) which is stored as a
lead in the database, emailed to the store owner, and manageable from the admin panel — matching
the copy on the pricing page ("lien de paiement envoyé par email", no card data stored).

## Admin panel

Visit `/admin/login` (redirects to `/admin/produits` once logged in).

- **Produits** — create/edit/delete products, upload a photo (replaces the text placeholder
  everywhere it's shown), toggle visibility, set badges (Nouveau/Bestseller/…) and display order.
- **Collections** — create/edit/delete collections and manage which products belong to each
  one. Public collection filters appear automatically on `/collection` once a collection has
  at least one product.
- **Demandes** — every contact/order inquiry submitted on the public site, with a status
  dropdown (Nouvelle/Contacté/Clôturée).
- **Newsletter** — list of subscribed emails.

Create the first login with:
```bash
cd backend
python -m app.create_admin you@example.com "a-strong-password"
```

## Prerequisites

- Python 3.11+
- Node.js 20+
- (optional) Docker, if you'd rather run everything via `docker-compose up`

## Backend setup (local dev — SQLite)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
copy .env.example .env        # Windows; `cp` on macOS/Linux — SQLite by default, no edits needed

alembic upgrade head           # create tables via migrations
python -m app.seed             # load the product catalog + starter collections
python -m app.create_admin admin@lhtstore.com "a-strong-password"

uvicorn app.main:app --reload
```

API is served at `http://localhost:8000`, interactive docs at `http://localhost:8000/docs`.
(If port 8000 is already taken by something else on your machine, add `--port 8010` or similar
— just update `VITE_API_BASE_URL` and `CORS_ORIGINS` to match.)

Run tests with `pytest` from the `backend/` directory.

## Using Supabase instead of SQLite

`backend/supabase_schema.sql` is a complete, standalone schema — table-for-table and
column-for-column identical to what the SQLAlchemy models expect. To use it:

1. **Supabase Dashboard → SQL Editor → New query** → paste the contents of
   `backend/supabase_schema.sql` → Run. This creates every table, the enum types, indexes,
   and `updated_at` triggers. It's safe to re-run (uses `if not exists` / idempotent guards).
2. Get your connection string: **Settings → Database → Connection string → URI** (use the
   "Session pooler" one for a stable IPv4 host), then rewrite its scheme for SQLAlchemy:
   ```
   postgresql+psycopg2://postgres.<project-ref>:<password>@<pooler-host>:5432/postgres
   ```
3. Set that as `DATABASE_URL` in `backend/.env`.
4. From `backend/`, run once: `alembic stamp head` — this doesn't touch the schema, it just
   tells Alembic "the SQL script already did this migration" so future `alembic upgrade head`
   calls (for schema changes you make later) apply cleanly on top instead of erroring on
   already-existing tables.
5. `python -m app.seed` and `python -m app.create_admin ...` as usual — they run through the
   same SQLAlchemy models, now pointed at Supabase instead of SQLite.

No other code changes are needed — the backend doesn't use the Supabase client library or
PostgREST; it connects directly to the Postgres database via `DATABASE_URL`, the same way it
talks to SQLite locally. Row Level Security is intentionally left off (see the notes at the
bottom of `supabase_schema.sql`) since the backend — not the browser — is the only thing
holding that connection string.

## Frontend setup

```bash
cd frontend
npm install
copy .env.example .env        # Windows; `cp` on macOS/Linux
npm run dev
```

Site is served at `http://localhost:5173` and talks to the API at the URL set in
`VITE_API_BASE_URL` (defaults to `http://localhost:8000/api/v1`). If 5173 is taken, Vite will
pick the next free port automatically (or set one with `server.port` in `vite.config.ts`) —
just make sure it's in the backend's `CORS_ORIGINS`.

## Docker (alternative)

```bash
docker-compose up --build
```

Runs Postgres, the API and the frontend dev server together. Note the compose file doesn't
run `alembic upgrade head` / seeding automatically — exec into the `backend` container once
to run those the first time:

```bash
docker-compose exec backend alembic upgrade head
docker-compose exec backend python -m app.seed
docker-compose exec backend python -m app.create_admin admin@lhtstore.com "a-strong-password"
```
