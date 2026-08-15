-- ============================================================
-- LHT Store — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
--
-- This mirrors the SQLAlchemy models in backend/app/models/ exactly —
-- table names, column names/types and constraints match 1:1, so the
-- FastAPI backend can be pointed at this database (via DATABASE_URL)
-- with no further changes.
--
-- After running this script, connect the backend with a DATABASE_URL
-- of the form (use Supabase's "Session pooler" connection string,
-- Settings → Database → Connection string → URI, then swap the
-- scheme to postgresql+psycopg2):
--   postgresql+psycopg2://postgres.<project-ref>:<password>@<pooler-host>:5432/postgres
--
-- Then run once from backend/: alembic stamp head
-- (marks the migration history as up to date — no schema change,
-- just tells Alembic "this SQL script already did the work" so
-- future `alembic upgrade head` calls apply cleanly on top of it.)
-- ============================================================

-- ─── ENUM TYPES ──────────────────────────────────────────────
-- (wrapped in DO blocks so re-running this script is safe)
do $$ begin
  create type inquiry_subject as enum (
    'order', 'product_question', 'order_tracking', 'return_exchange', 'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type inquiry_status as enum ('new', 'contacted', 'closed');
exception
  when duplicate_object then null;
end $$;

-- ─── ADMIN USERS ─────────────────────────────────────────────
create table if not exists admin_users (
  id              integer generated always as identity primary key,
  email           varchar(255) not null unique,
  hashed_password varchar(255) not null,
  created_at      timestamptz not null default now()
);

-- ─── PRODUCTS ────────────────────────────────────────────────
create table if not exists products (
  id                 integer generated always as identity primary key,
  slug               varchar(80) not null unique,
  name               varchar(120) not null,
  shape              varchar(60) not null,
  price_cents        integer not null,
  currency           varchar(3) not null default 'MAD',
  tagline            varchar(200) not null default '',
  description        text not null default '',
  image_placeholder  varchar(255) not null default '',
  image_url          varchar(500),
  badge              varchar(40),
  is_bestseller      boolean not null default false,
  is_new             boolean not null default false,
  is_active          boolean not null default true,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ─── COLLECTIONS ─────────────────────────────────────────────
create table if not exists collections (
  id                 integer generated always as identity primary key,
  slug               varchar(80) not null unique,
  name               varchar(120) not null,
  description        text not null default '',
  image_placeholder  varchar(255) not null default '',
  image_url          varchar(500),
  is_active          boolean not null default true,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ─── PRODUCT ↔ COLLECTION (many-to-many) ────────────────────
create table if not exists product_collections (
  product_id    integer not null references products(id) on delete cascade,
  collection_id integer not null references collections(id) on delete cascade,
  position      integer not null default 0,
  primary key (product_id, collection_id)
);

-- ─── INQUIRIES (contact / order requests) ───────────────────
create table if not exists inquiries (
  id           integer generated always as identity primary key,
  name         varchar(120) not null,
  email        varchar(255) not null,
  phone        varchar(30),
  address      text,
  subject      inquiry_subject not null default 'order',
  message      text not null,
  product_slug varchar(80) references products(slug),
  status       inquiry_status not null default 'new',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists ix_inquiries_email on inquiries(email);

-- ─── NEWSLETTER SUBSCRIBERS ──────────────────────────────────
create table if not exists newsletter_subscribers (
  id         integer generated always as identity primary key,
  email      varchar(255) not null unique,
  created_at timestamptz not null default now()
);

-- ─── AUTO-UPDATE updated_at ──────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at before update on products
  for each row execute function update_updated_at();

drop trigger if exists collections_updated_at on collections;
create trigger collections_updated_at before update on collections
  for each row execute function update_updated_at();

drop trigger if exists inquiries_updated_at on inquiries;
create trigger inquiries_updated_at before update on inquiries
  for each row execute function update_updated_at();

-- ============================================================
-- Notes
-- ============================================================
-- • No Row Level Security is enabled: the FastAPI backend connects
--   with the `postgres` role via DATABASE_URL and enforces all access
--   rules itself (admin JWT auth on /api/v1/admin/*). If you later let
--   the frontend talk to Supabase directly (its REST API or JS client,
--   bypassing this backend), enable RLS and add policies before doing
--   so — right now every table is wide open to anyone holding the
--   database connection string.
-- • Seed data (the starter product/collection catalog) is applied via
--   the Python seed script, not this file — see backend/app/seed.py.
--   Run `python -m app.seed` after pointing DATABASE_URL at this
--   database.
-- • Create the first admin login with:
--     python -m app.create_admin you@example.com yourpassword
-- ============================================================
