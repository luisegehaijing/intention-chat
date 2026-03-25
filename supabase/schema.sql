create extension if not exists pgcrypto;

create table if not exists pilot_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists pilot_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references pilot_users(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pilot_sessions_user_id on pilot_sessions(user_id);
create index if not exists idx_pilot_sessions_expires_at on pilot_sessions(expires_at);

create table if not exists pilot_submissions (
  id uuid primary key default gen_random_uuid(),
  cycle_key text not null,
  email text not null,
  availability jsonb not null,
  pace text not null check (pace in ('gentle','balanced','challenging')),
  no_go_topics text,
  discussion_entry_one text not null,
  discussion_entry_two text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cycle_key, email)
);

create table if not exists pilot_matches (
  id uuid primary key default gen_random_uuid(),
  cycle_key text not null,
  group_code text not null,
  meeting_time timestamptz not null,
  whereby_link text not null,
  status text not null default 'matched' check (status in ('matched','completed')),
  matching_reason text,
  created_at timestamptz not null default now()
);

create table if not exists pilot_match_members (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references pilot_matches(id) on delete cascade,
  submission_id uuid not null references pilot_submissions(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  unique(match_id, email)
);

create table if not exists pilot_feedback (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references pilot_matches(id) on delete cascade,
  email text not null,
  happened boolean not null,
  duration_minutes int,
  overall_satisfaction int,
  meaningful_score int not null,
  enjoyment_score int,
  learned_something_new boolean,
  increase_future_match_chance text check (increase_future_match_chance in ('yes','maybe','no')),
  comfort_score int,
  would_join_again text check (would_join_again in ('yes','maybe','no')),
  prompt_proposal text,
  safety_report text,
  created_at timestamptz not null default now(),
  unique(match_id, email)
);

alter table pilot_submissions add column if not exists discussion_entry_one text;
alter table pilot_submissions add column if not exists discussion_entry_two text;
alter table pilot_matches add column if not exists matching_reason text;
alter table pilot_feedback add column if not exists duration_minutes int;
alter table pilot_feedback add column if not exists overall_satisfaction int;
alter table pilot_feedback add column if not exists enjoyment_score int;
alter table pilot_feedback add column if not exists learned_something_new boolean;
alter table pilot_feedback add column if not exists increase_future_match_chance text;

update pilot_submissions set discussion_entry_one = coalesce(discussion_entry_one, 'To be provided by participant');
