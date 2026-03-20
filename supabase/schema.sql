-- ============================================================
-- StaffFlow — Supabase Schema
-- 実行方法: Supabase ダッシュボード > SQL Editor に貼り付けて実行
-- ============================================================

-- UUID 拡張を有効化
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. users（システム利用者）
-- ============================================================
create table if not exists public.users (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  email         text not null unique,
  role          text not null default 'staff'
                check (role in ('admin', 'staff', 'viewer')),
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 2. candidates（求職者）
-- ============================================================
create table if not exists public.candidates (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  email             text,
  phone             text,
  status            text not null default 'active'
                    check (status in ('active', 'placed', 'inactive', 'blacklist')),
  skills            text[],
  desired_salary    integer,
  location          text,
  assigned_user_id  uuid references public.users (id) on delete set null,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- 3. companies（企業）
-- ============================================================
create table if not exists public.companies (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  industry          text,
  address           text,
  assigned_user_id  uuid references public.users (id) on delete set null,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- 4. company_contacts（企業担当者）
-- ============================================================
create table if not exists public.company_contacts (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies (id) on delete cascade,
  name        text not null,
  role        text,
  email       text
);

-- ============================================================
-- 5. jobs（求人・案件）
-- ============================================================
create table if not exists public.jobs (
  id               uuid primary key default uuid_generate_v4(),
  company_id       uuid not null references public.companies (id) on delete cascade,
  title            text not null,
  employment_type  text not null default 'dispatch'
                   check (employment_type in ('dispatch', 'introduction', 'temp_to_perm')),
  salary_min       integer,
  salary_max       integer,
  status           text not null default 'open'
                   check (status in ('open', 'filled', 'closed', 'cancelled')),
  headcount        integer not null default 1,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- 6. selections（選考）
-- ============================================================
create table if not exists public.selections (
  id                uuid primary key default uuid_generate_v4(),
  candidate_id      uuid not null references public.candidates (id) on delete cascade,
  job_id            uuid not null references public.jobs (id) on delete cascade,
  stage             text not null default 'proposed'
                    check (stage in ('proposed', 'document', 'interview', 'final', 'offered', 'hired', 'rejected')),
  result            text check (result in ('pending', 'pass', 'fail', null)),
  assigned_user_id  uuid references public.users (id) on delete set null,
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- 7. contracts（契約）
-- ============================================================
create table if not exists public.contracts (
  id              uuid primary key default uuid_generate_v4(),
  candidate_id    uuid not null references public.candidates (id) on delete cascade,
  company_id      uuid not null references public.companies (id) on delete cascade,
  job_id          uuid references public.jobs (id) on delete set null,
  contract_type   text not null default 'dispatch'
                  check (contract_type in ('dispatch', 'introduction', 'temp_to_perm')),
  start_date      date not null,
  end_date        date,
  monthly_salary  integer,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- 8. attendances（勤怠）
-- ============================================================
create table if not exists public.attendances (
  id               uuid primary key default uuid_generate_v4(),
  contract_id      uuid not null references public.contracts (id) on delete cascade,
  month            date not null,               -- 対象月（YYYY-MM-01）
  scheduled_hours  numeric(5,1) not null default 0,
  actual_hours     numeric(5,1) not null default 0,
  overtime_hours   numeric(5,1) not null default 0,
  status           text not null default 'draft'
                   check (status in ('draft', 'submitted', 'approved', 'rejected'))
);

-- ============================================================
-- 9. activity_logs（活動ログ）
-- ============================================================
create table if not exists public.activity_logs (
  id            uuid primary key default uuid_generate_v4(),
  candidate_id  uuid references public.candidates (id) on delete cascade,
  user_id       uuid references public.users (id) on delete set null,
  content       text not null,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- Row Level Security（RLS）
-- ============================================================
alter table public.users           enable row level security;
alter table public.candidates      enable row level security;
alter table public.companies       enable row level security;
alter table public.company_contacts enable row level security;
alter table public.jobs            enable row level security;
alter table public.selections      enable row level security;
alter table public.contracts       enable row level security;
alter table public.attendances     enable row level security;
alter table public.activity_logs   enable row level security;

-- 開発用: 認証済みユーザーは全操作を許可（本番前に見直すこと）
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'users','candidates','companies','company_contacts',
    'jobs','selections','contracts','attendances','activity_logs'
  ]
  loop
    execute format(
      'create policy if not exists "allow_authenticated_%s"
       on public.%I for all to authenticated using (true) with check (true)',
      tbl, tbl
    );
  end loop;
end;
$$;

-- ============================================================
-- サンプルデータ（動作確認用・任意）
-- ============================================================
insert into public.users (name, email, role) values
  ('山田 太郎', 'yamada@staffflow.jp', 'admin'),
  ('佐藤 花子', 'sato@staffflow.jp', 'staff'),
  ('鈴木 一郎', 'suzuki@staffflow.jp', 'staff')
on conflict (email) do nothing;
