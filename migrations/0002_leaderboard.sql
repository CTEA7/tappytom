create table if not exists profiles (
  user_id    text primary key,
  username   text not null,
  updated_at timestamptz not null default now()
);

create table if not exists scores (
  id         serial primary key,
  user_id    text not null,
  username   text not null,
  score      integer not null,
  created_at timestamptz not null default now()
);

create index if not exists scores_best_idx on scores (score desc, created_at asc);
create index if not exists scores_created_idx on scores (created_at);
create index if not exists scores_user_idx on scores (user_id);
