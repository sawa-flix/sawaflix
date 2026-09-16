import { MessagesSquare } from 'lucide-react';
import type { CommunityPost } from '@/types/profile';

interface ProfileCommunityFeedProps {
  posts: CommunityPost[];
}

/**
 * Announcements/posts/polls/updates — no posts table exists anywhere in
 * this app yet. `CommunityPost` is defined in types/profile.ts so this is
 * ready to wire up the moment a real backend exists ("future ready"), but
 * ships with an honest empty state, not seeded fake posts.
 */
export function ProfileCommunityFeed({ posts }: ProfileCommunityFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <MessagesSquare size={24} className="text-white/40" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">No posts yet</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Announcements, polls, and updates this creator shares will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((post) => (
        <li key={post.id} className="rounded-xl border border-white/5 bg-white/5 p-4">
          <p className="text-sm font-bold text-white">{post.title}</p>
          <p className="mt-1 text-sm text-gray-400">{post.body}</p>
        </li>
      ))}
    </ul>
  );
}
