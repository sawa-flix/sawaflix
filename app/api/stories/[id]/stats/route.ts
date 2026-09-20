import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/prisma';
import { ensureAreaToryTables } from '@/lib/prisma/ensureAreaToryTables';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAreaToryTables();
    const { id: storyId } = await props.params;

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    // Try fetching existing stats cache
    let stats = await prisma.storyStats.findUnique({
      where: { storyId },
    }).catch(() => null);

    // If no cached stats record, aggregate counts from the database
    if (!stats) {
      const [likesCount, viewsCount, commentsCount] = await Promise.all([
        prisma.storyLike.count({ where: { storyId } }).catch(() => 0),
        prisma.storyView.count({ where: { storyId } }).catch(() => 0),
        prisma.storyComment.count({ where: { storyId, isDeleted: false } }).catch(() => 0),
      ]);

      stats = await prisma.storyStats.upsert({
        where: { storyId },
        update: { likesCount, viewsCount, commentsCount },
        create: { storyId, likesCount, viewsCount, commentsCount },
      }).catch(() => ({
        storyId,
        likesCount,
        viewsCount,
        commentsCount,
        updatedAt: new Date(),
      }));
    }

    // Fetch recent interactors (likers + commenters) for overlapping avatar stack
    let interactors: Array<{ id: string; name: string; avatar: string }> = [];
    try {
      const [recentLikes, recentComments] = await Promise.all([
        prisma.storyLike.findMany({
          where: { storyId },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }).catch(() => []),
        prisma.storyComment.findMany({
          where: { storyId, isDeleted: false },
          select: { userId: true, userName: true, userAvatar: true },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }).catch(() => []),
      ]);

      const seenIds = new Set<string>();

      // Add commenters first if they have avatars
      for (const c of recentComments) {
        if (!seenIds.has(c.userId) && c.userAvatar) {
          seenIds.add(c.userId);
          interactors.push({
            id: c.userId,
            name: c.userName || 'Community Member',
            avatar: c.userAvatar,
          });
        }
      }

      // Add likers from Supabase if needed
      const likeUserIds = recentLikes.map((l) => l.userId).filter((uid) => !seenIds.has(uid));
      if (likeUserIds.length > 0 && interactors.length < 5) {
        try {
          const supabase = await createClient();
          const { data: profiles } = await supabase
            .from('users')
            .select('id, username, profile_image_url')
            .in('id', likeUserIds);

          if (profiles) {
            for (const p of profiles) {
              if (p.profile_image_url && !seenIds.has(p.id)) {
                seenIds.add(p.id);
                interactors.push({
                  id: p.id,
                  name: p.username || 'Community Member',
                  avatar: p.profile_image_url,
                });
              }
            }
          }
        } catch {
          // Ignore supabase profile lookup error
        }
      }

      // Fallback diverse African community avatars if likes exist but few avatars recorded
      const FALLBACK_AVATARS = [
        { id: 'av-1', name: 'Brenda Bih', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
        { id: 'av-2', name: 'Ewane Manga', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
        { id: 'av-3', name: 'Nathalie Ngo', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80' },
      ];

      const effectiveLikes = stats.likesCount ?? 0;
      if (interactors.length === 0 && effectiveLikes > 0) {
        interactors = FALLBACK_AVATARS.slice(0, Math.min(effectiveLikes, 3));
      }
    } catch (e) {
      console.error('[StoryStats] Error retrieving interactors:', e);
    }

    // Check if the requesting user is authenticated and has liked this story
    let isLiked = false;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const likeRecord = await prisma.storyLike.findUnique({
          where: {
            storyId_userId: {
              storyId,
              userId: user.id,
            },
          },
        }).catch(() => null);
        isLiked = !!likeRecord;
      }
    } catch {
      // Guest user — remains isLiked = false
    }

    return NextResponse.json({
      storyId,
      likesCount: stats.likesCount ?? 0,
      viewsCount: stats.viewsCount ?? 0,
      commentsCount: stats.commentsCount ?? 0,
      isLiked,
      interactors,
    });
  } catch (error: any) {
    console.error('[StoryStats API Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
