'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSupabase } from '@autamedica/auth';
import { logger } from '@autamedica/shared';

export interface CommunityGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  member_count: number;
  post_count: number;
}

export interface CommunityPost {
  id: string;
  group_id: string;
  author_id: string;
  author_display_name: string | null;
  is_anonymous: boolean;
  title: string;
  content: string;
  tags: string[];
  moderation_status: string;
  reaction_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  group?: CommunityGroup;
}

interface LoadPostsOptions {
  sort_by?: 'recent' | 'popular';
  limit?: number;
}

const DEFAULT_POST_LIMIT = 10;

export function useCommunity() {
  const supabase = useSupabase();

  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    if (!supabase) {
      return;
    }

    setGroupsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('community_groups')
        .select('*')
        .is('deleted_at', null)
        .order('member_count', { ascending: false });

      if (fetchError) throw fetchError;
      setGroups(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar grupos';
      setError(message);
    } finally {
      setGroupsLoading(false);
    }
  }, [supabase]);

  const loadPosts = useCallback(async (options: LoadPostsOptions = {}) => {
    if (!supabase) {
      return;
    }

    const { sort_by = 'recent', limit = DEFAULT_POST_LIMIT } = options;

    setPostsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('community_posts')
        .select('*, group:community_groups(*)')
        .eq('moderation_status', 'approved')
        .is('deleted_at', null)
        .limit(limit);

      if (sort_by === 'popular') {
        query = query.order('reaction_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setPosts(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar publicaciones';
      setError(message);
    } finally {
      setPostsLoading(false);
    }
  }, [supabase]);

  const createPost = useCallback(
    async (payload: {
      groupId: string;
      content: string;
      title?: string;
      anonymous?: boolean;
      tags?: string[];
    }) => {
      if (!supabase) {
        throw new Error('Supabase no está disponible en este contexto');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { error: insertError } = await supabase
        .from('community_posts')
        .insert({
          group_id: payload.groupId,
          content: payload.content,
          title: payload.title ?? null,
          is_anonymous: payload.anonymous ?? false,
          tags: payload.tags ?? [],
          author_id: user.id,
        });

      if (insertError) {
        throw insertError;
      }

      await loadPosts();
    },
    [supabase, loadPosts],
  );

  const addReaction = useCallback(
    async (payload: { postId: string; reactionType: string }) => {
      if (!supabase) {
        throw new Error('Supabase no está disponible en este contexto');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { error: upsertError } = await supabase
        .from('post_reactions')
        .upsert(
          {
            post_id: payload.postId,
            reaction_type: payload.reactionType,
            user_id: user.id,
          },
          { onConflict: 'post_id,user_id' }
        );

      if (upsertError) {
        throw upsertError;
      }

      await loadPosts();
    },
    [supabase, loadPosts],
  );

  const loading = groupsLoading || postsLoading;

  return {
    groups,
    posts,
    loading,
    error,
    loadGroups,
    loadPosts,
    createPost,
    addReaction,
  };
}

export function useCommunityGroups() {
  const { groups, loading, error, loadGroups } = useCommunity();

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return { groups, loading, error };
}

export function useCommunityPosts(limit = DEFAULT_POST_LIMIT) {
  const { posts, loading, error, loadPosts } = useCommunity();

  useEffect(() => {
    loadPosts({ limit });
  }, [limit, loadPosts]);

  const refetch = useCallback(() => loadPosts({ limit }), [limit, loadPosts]);

  return { posts, loading, error, refetch };
}

export function useAutoJoinGroup() {
  const supabase = useSupabase();

  const autoJoin = useCallback(
    async (groupId: string) => {

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: existing } = await supabase
          .from('group_memberships')
          .select('id')
          .eq('group_id', groupId)
          .eq('patient_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (existing) return;

        await supabase
          .from('group_memberships')
          .insert({
            group_id: groupId,
            patient_id: user.id,
            role: 'member',
            status: 'active',
          });
      } catch (err) {
        logger.error('Error auto-joining group:', err);
      }
    },
    [supabase],
  );

  return { autoJoin };
}
