-- Run this against your Supabase project (SQL editor or CLI) — it is NOT
-- applied automatically. Powers ProfileStats.followersCount/followingCount
-- and likesReceived; until this runs, those fields resolve to null and the
-- UI shows an honest "—" rather than a fake number.

create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references users(id) on delete cascade not null,
  followee_type text not null check (followee_type in ('user', 'youtube_channel')),
  followee_id text not null,
  created_at timestamptz default now() not null,
  unique (follower_id, followee_type, followee_id)
);

create index if not exists follows_followee_idx on follows (followee_type, followee_id);
create index if not exists follows_follower_idx on follows (follower_id);

alter table follows enable row level security;

create policy "follows are publicly readable" on follows
  for select using (true);

create policy "users can follow as themselves" on follows
  for insert with check (auth.uid() = follower_id);

create policy "users can unfollow their own follows" on follows
  for delete using (auth.uid() = follower_id);

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  content_type text not null check (content_type in ('youtube_video', 'movie', 'music', 'story')),
  content_id text not null,
  created_at timestamptz default now() not null,
  unique (user_id, content_type, content_id)
);

create index if not exists likes_content_idx on likes (content_type, content_id);
create index if not exists likes_user_idx on likes (user_id);

alter table likes enable row level security;

create policy "likes are publicly readable" on likes
  for select using (true);

create policy "users can like as themselves" on likes
  for insert with check (auth.uid() = user_id);

create policy "users can unlike their own likes" on likes
  for delete using (auth.uid() = user_id);
