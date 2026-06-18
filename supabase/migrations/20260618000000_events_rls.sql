-- Create events table
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  date text not null,
  time text not null,
  description text,
  category text not null,
  color text not null,
  emoji text not null,
  lat double precision not null,
  lng double precision not null,
  attendees integer not null default 0,
  max_attendees integer not null default 20,
  created_at timestamptz default now()
);

-- Enable RLS
alter table events enable row level security;

-- Allow anyone (including anonymous) to read events
create policy "Anyone can read events"
  on events
  for select
  using (true);
