'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserClient } from '@autamedica/auth';
import type {
  CommunityGroup,
  CommunityPost,
  PostComment,
  PostReaction,
  ReactionType,
  GroupMembership,
  CommunityFeedFilters,
  CommunityPostInsert,
  PostCommentInsert,
} from '@autamedica/types';

interface UseCommunityReturn {
  groups: CommunityGroup[];
  myGroups: CommunityGroup[];
  posts: CommunityPost[];
  loading: boolean;
  error: string | null;
  joinGroup: (groupId: string) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<boolean>;
  createPost: (post: CommunityPostInsert) => Promise<CommunityPost | null>;
  addComment: (comment: PostCommentInsert) => Promise<PostComment | null>;
  addReaction: (postId: string, commentId: string | null, reactionType: ReactionType) => Promise<boolean>;
  removeReaction: (postId: string, commentId: string | null) => Promise<boolean>;
  loadPosts: (filters?: CommunityFeedFilters) => Promise<void>;
  refreshGroups: () => Promise<void>;
  loadGroups: () => Promise<void>;
}

/**
 * Hook para gestionar la comunidad de pacientes
 *
 * @example
 * ```tsx
 * const {
 *   groups,
 *   myGroups,
 *   posts,
 *   joinGroup,
 *   createPost,
 *   addReaction,
 * } = useCommunity();
 *
 * const handleJoinGroup = async (groupId) => {
 *   await joinGroup(groupId);
 * };
 * ```
 */
export function useCommunity(): UseCommunityReturn {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [myGroups, setMyGroups] = useState<CommunityGroup[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only create client in browser environment
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null);
  if (typeof window !== 'undefined' && !supabaseRef.current) {
    supabaseRef.current = createBrowserClient();
  }
  const supabase = supabaseRef.current;

  // Fetch all groups
  const fetchGroups = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('community_groups')
        .select('*')
        .is('deleted_at', null)
        .order('member_count', { ascending: false });

      if (fetchError) throw fetchError;

      setGroups((data || []) as unknown as CommunityGroup[]);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar grupos');
    }
  }, [supabase]);

  // Fetch user's groups
  const fetchMyGroups = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberships, error: membershipsError } = await supabase
        .from('group_memberships')
        .select('group_id')
        .eq('patient_id', user.id)
        .eq('status', 'active');

      if (membershipsError) throw membershipsError;

      if (!memberships || memberships.length === 0) {
        setMyGroups([]);
        return;
      }

      const groupIds = memberships.map(m => m.group_id);

      const { data: groupsData, error: groupsError } = await supabase
        .from('community_groups')
        .select('*')
        .in('id', groupIds)
        .is('deleted_at', null);

      if (groupsError) throw groupsError;

      setMyGroups((groupsData || []) as unknown as CommunityGroup[]);
    } catch (err) {
      console.error('Error fetching my groups:', err);
    }
  }, [supabase]);

  // Join group
  const joinGroup = useCallback(async (groupId: string): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return false;
      }

      const { error: insertError } = await supabase
        .from('group_memberships')
        .insert({
          group_id: groupId,
          patient_id: user.id,
          role: 'member',
          status: 'active',
        });

      if (insertError) throw insertError;

      // Update group member count
      await supabase.rpc('increment_group_member_count', { group_id: groupId });

      await fetchMyGroups();
      await fetchGroups();

      return true;
    } catch (err) {
      console.error('Error joining group:', err);
      setError(err instanceof Error ? err.message : 'Error al unirse al grupo');
      return false;
    }
  }, [supabase, fetchMyGroups, fetchGroups]);

  // Leave group
  const leaveGroup = useCallback(async (groupId: string): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error: deleteError } = await supabase
        .from('group_memberships')
        .delete()
        .eq('group_id', groupId)
        .eq('patient_id', user.id);

      if (deleteError) throw deleteError;

      // Update group member count
      await supabase.rpc('decrement_group_member_count', { group_id: groupId });

      await fetchMyGroups();
      await fetchGroups();

      return true;
    } catch (err) {
      console.error('Error leaving group:', err);
      setError(err instanceof Error ? err.message : 'Error al salir del grupo');
      return false;
    }
  }, [supabase, fetchMyGroups, fetchGroups]);

  // Create post
  const createPost = useCallback(async (
    post: CommunityPostInsert
  ): Promise<CommunityPost | null> => {
    if (!supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return null;
      }

      const { data, error: insertError } = await supabase
        .from('community_posts')
        .insert({
          ...post,
          author_id: user.id,
          moderation_status: 'pending_review',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return data as unknown as CommunityPost;
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : 'Error al crear publicación');
      return null;
    }
  }, [supabase]);

  // Add comment
  const addComment = useCallback(async (
    comment: PostCommentInsert
  ): Promise<PostComment | null> => {
    if (!supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return null;
      }

      const { data, error: insertError } = await supabase
        .from('post_comments')
        .insert({
          ...comment,
          author_id: user.id,
          moderation_status: 'approved', // Auto-approve comments
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return data as unknown as PostComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err instanceof Error ? err.message : 'Error al agregar comentario');
      return null;
    }
  }, [supabase]);

  // Add reaction
  const addReaction = useCallback(async (
    postId: string,
    commentId: string | null,
    reactionType: ReactionType
  ): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return false;
      }

      const { error: insertError } = await supabase
        .from('post_reactions')
        .insert({
          post_id: commentId ? null : postId,
          comment_id: commentId,
          user_id: user.id,
          reaction_type: reactionType,
        });

      if (insertError) throw insertError;

      return true;
    } catch (err) {
      console.error('Error adding reaction:', err);
      setError(err instanceof Error ? err.message : 'Error al agregar reacción');
      return false;
    }
  }, [supabase]);

  // Remove reaction
  const removeReaction = useCallback(async (
    postId: string,
    commentId: string | null
  ): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      let query = supabase
        .from('post_reactions')
        .delete()
        .eq('user_id', user.id);

      if (commentId) {
        query = query.eq('comment_id', commentId);
      } else {
        query = query.eq('post_id', postId);
      }

      const { error: deleteError } = await query;

      if (deleteError) throw deleteError;

      return true;
    } catch (err) {
      console.error('Error removing reaction:', err);
      return false;
    }
  }, [supabase]);

  // Load posts with filters
  const loadPosts = useCallback(async (filters?: CommunityFeedFilters) => {
    if (!supabase) return;
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('community_posts')
        .select('*')
        .eq('moderation_status', 'approved')
        .is('deleted_at', null);

      // Apply filters
      if (filters?.group_ids && filters.group_ids.length > 0) {
        query = query.in('group_id', filters.group_ids);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      // Sort
      const sortBy = filters?.sort_by || 'recent';
      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'popular') {
        query = query.order('reaction_count', { ascending: false });
      } else if (sortBy === 'trending') {
        query = query.order('last_activity_at', { ascending: false });
      } else if (sortBy === 'unanswered') {
        query = query.eq('comment_count', 0).order('created_at', { ascending: false });
      }

      query = query.limit(50);

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPosts((data || []) as unknown as CommunityPost[]);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar publicaciones');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Refresh groups
  const refreshGroups = useCallback(async () => {
    await Promise.all([fetchGroups(), fetchMyGroups()]);
  }, [fetchGroups, fetchMyGroups]);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([
        fetchGroups(),
        fetchMyGroups(),
        loadPosts(),
      ]);
      setLoading(false);
    };

    initialize();
  }, [fetchGroups, fetchMyGroups, loadPosts]);

  // Setup realtime subscription for posts
  useEffect(() => {
    const channel = supabase
      .channel('community_posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_posts',
          filter: 'moderation_status=eq.approved',
        },
        (payload) => {
          setPosts(prev => [payload.new as CommunityPost, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_posts',
        },
        (payload) => {
          setPosts(prev =>
            prev.map(post =>
              post.id === payload.new.id ? (payload.new as CommunityPost) : post
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return {
    groups,
    myGroups,
    posts,
    loading,
    error,
    joinGroup,
    leaveGroup,
    createPost,
    addComment,
    addReaction,
    removeReaction,
    loadPosts,
    refreshGroups,
  };
}
