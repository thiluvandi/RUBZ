create table enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null, organisation text, event_type text, event_date date,
  city text, crowd text, notes text, status text not null default 'new'
);
alter table enquiries enable row level security; -- inserts happen server-side with the service role key
