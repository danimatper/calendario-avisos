-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase

create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  event_date timestamptz not null,
  reminder_value integer not null default 1,
  reminder_unit text not null default 'days' check (reminder_unit in ('hours', 'days')),
  category text,
  notified boolean not null default false,
  created_at timestamptz default now()
);

-- Seguridad a nivel de fila: solo usuarios autenticados pueden acceder.
-- (Calendario compartido: cualquier usuario autenticado ve y gestiona todos
--  los eventos, que es el comportamiento deseado para un equipo interno.)
alter table events enable row level security;

create policy "Authenticated can read" on events
  for select to authenticated using (true);

create policy "Authenticated can insert" on events
  for insert to authenticated with check (true);

create policy "Authenticated can update" on events
  for update to authenticated using (true) with check (true);

create policy "Authenticated can delete" on events
  for delete to authenticated using (true);
