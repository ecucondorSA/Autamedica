/**
 * @autamedica/types - Patient Community Types
 *
 * Tipos para el sistema de comunidad de pacientes.
 * Red de apoyo entre pares con moderación médica.
 */

import type { Brand } from '../core/brand.types';
import type { PatientId, DoctorId } from '../core/brand.types';
import type { ISODateString } from '../core/brand.types';
import type { BaseEntity } from '../core/base.types';

// ==========================================
// Branded IDs
// ==========================================

export type CommunityGroupId = Brand<string, 'CommunityGroupId'>;
export type PostId = Brand<string, 'PostId'>;
export type CommentId = Brand<string, 'CommentId'>;
export type ReactionId = Brand<string, 'ReactionId'>;
export type ReportId = Brand<string, 'ReportId'>;

// ==========================================
// Community Group
// ==========================================

export interface CommunityGroup extends BaseEntity {
  id: CommunityGroupId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: GroupCategory;
  member_count: number;
  post_count: number;
  is_private: boolean;
  requires_approval: boolean;
  moderator_ids: DoctorId[];
  tags: string[];
  rules: GroupRule[];
}

export type GroupCategory =
  | 'chronic_disease'
  | 'mental_health'
  | 'reproductive_health'
  | 'preventive_care'
  | 'general_wellness'
  | 'support_groups'
  | 'caregivers';

export interface GroupRule {
  rule_number: number;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface CommunityGroupInsert {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  category: GroupCategory;
  is_private?: boolean;
  requires_approval?: boolean;
  moderator_ids?: DoctorId[];
  tags?: string[];
  rules?: GroupRule[];
}

// ==========================================
// Group Membership
// ==========================================

export type GroupMembershipId = Brand<string, 'GroupMembershipId'>;

export interface GroupMembership extends BaseEntity {
  id: GroupMembershipId;
  group_id: CommunityGroupId;
  patient_id: PatientId;
  role: MemberRole;
  status: MembershipStatus;
  joined_at: ISODateString;
  last_active: ISODateString;
  post_count: number;
  comment_count: number;
  helpful_reactions_received: number;
  reputation_score: number;
}

export type MemberRole = 'member' | 'moderator' | 'admin';
export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'banned';

export interface GroupMembershipInsert {
  group_id: CommunityGroupId;
  patient_id: PatientId;
  role?: MemberRole;
  status?: MembershipStatus;
}

// ==========================================
// Community Post
// ==========================================

export interface CommunityPost extends BaseEntity {
  id: PostId;
  group_id: CommunityGroupId;
  author_id: PatientId;
  author_display_name: string; // Anonymous: "María, 45 años"
  title: string;
  content: string;
  content_type: 'text' | 'text_with_media';
  media_urls: string[];
  tags: string[];
  is_anonymous: boolean;
  is_pinned: boolean;
  is_locked: boolean; // Prevents new comments
  moderation_status: ModerationStatus;
  moderation_notes: string | null;
  moderated_by: DoctorId | null;
  moderated_at: ISODateString | null;
  view_count: number;
  reaction_count: number;
  comment_count: number;
  share_count: number;
  last_activity_at: ISODateString;
  edited_at: ISODateString | null;
}

export type ModerationStatus =
  | 'pending_review'
  | 'approved'
  | 'flagged'
  | 'removed'
  | 'requires_edit';

export interface CommunityPostInsert {
  group_id: CommunityGroupId;
  author_id: PatientId;
  author_display_name: string;
  title: string;
  content: string;
  content_type?: 'text' | 'text_with_media';
  media_urls?: string[];
  tags?: string[];
  is_anonymous?: boolean;
}

export interface CommunityPostUpdate {
  title?: string;
  content?: string;
  media_urls?: string[];
  tags?: string[];
  is_pinned?: boolean;
  is_locked?: boolean;
  moderation_status?: ModerationStatus;
  moderation_notes?: string;
  moderated_by?: DoctorId;
  moderated_at?: ISODateString;
}

// ==========================================
// Comments
// ==========================================

export interface PostComment extends BaseEntity {
  id: CommentId;
  post_id: PostId;
  parent_comment_id: CommentId | null; // For nested replies
  author_id: PatientId;
  author_display_name: string;
  content: string;
  is_anonymous: boolean;
  moderation_status: ModerationStatus;
  moderated_by: DoctorId | null;
  moderated_at: ISODateString | null;
  reaction_count: number;
  reply_count: number;
  is_marked_helpful: boolean;
  marked_helpful_by: PatientId | null;
  edited_at: ISODateString | null;
}

export interface PostCommentInsert {
  post_id: PostId;
  parent_comment_id?: CommentId | null;
  author_id: PatientId;
  author_display_name: string;
  content: string;
  is_anonymous?: boolean;
}

export interface PostCommentUpdate {
  content?: string;
  moderation_status?: ModerationStatus;
  moderated_by?: DoctorId;
  moderated_at?: ISODateString;
  is_marked_helpful?: boolean;
  marked_helpful_by?: PatientId;
}

// ==========================================
// Reactions
// ==========================================

export interface PostReaction {
  id: ReactionId;
  post_id: PostId;
  comment_id: CommentId | null;
  user_id: PatientId;
  reaction_type: ReactionType;
  created_at: ISODateString;
}

export type ReactionType =
  | 'like' // 👍 General support
  | 'heart' // ❤️ Empathy/love
  | 'hug' // 🤗 Virtual hug
  | 'pray' // 🙏 Prayers/thoughts
  | 'celebrate' // 🎉 Celebration
  | 'helpful' // ✅ Helpful answer
  | 'sad' // 😢 Sadness
  | 'angry'; // 😠 Frustration

export interface PostReactionInsert {
  post_id: PostId;
  comment_id?: CommentId | null;
  user_id: PatientId;
  reaction_type: ReactionType;
}

// ==========================================
// Reporting & Moderation
// ==========================================

export interface ContentReport extends BaseEntity {
  id: ReportId;
  reported_content_type: 'post' | 'comment';
  reported_content_id: PostId | CommentId;
  reporter_id: PatientId;
  report_reason: ReportReason;
  report_details: string;
  status: ReportStatus;
  reviewed_by: DoctorId | null;
  reviewed_at: ISODateString | null;
  resolution: string | null;
  action_taken: ModerationAction | null;
}

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'medical_misinformation'
  | 'personal_information_shared'
  | 'inappropriate_content'
  | 'promoting_unproven_treatments'
  | 'selling_products'
  | 'off_topic'
  | 'duplicate'
  | 'other';

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export type ModerationAction =
  | 'no_action'
  | 'warning_issued'
  | 'content_removed'
  | 'content_edited'
  | 'user_suspended'
  | 'user_banned';

export interface ContentReportInsert {
  reported_content_type: 'post' | 'comment';
  reported_content_id: PostId | CommentId;
  reporter_id: PatientId;
  report_reason: ReportReason;
  report_details: string;
}

// ==========================================
// Notifications
// ==========================================

export type CommunityNotificationId = Brand<string, 'CommunityNotificationId'>;

export interface CommunityNotification {
  id: CommunityNotificationId;
  user_id: PatientId;
  notification_type: CommunityNotificationType;
  related_post_id: PostId | null;
  related_comment_id: CommentId | null;
  related_user_id: PatientId | null;
  title: string;
  message: string;
  read: boolean;
  created_at: ISODateString;
}

export type CommunityNotificationType =
  | 'new_reply'
  | 'new_reaction'
  | 'post_pinned'
  | 'comment_marked_helpful'
  | 'mentioned'
  | 'moderator_message'
  | 'report_resolved';

// ==========================================
// User Reputation
// ==========================================

export interface UserReputation {
  patient_id: PatientId;
  total_posts: number;
  total_comments: number;
  helpful_answers: number;
  reactions_received: number;
  reputation_score: number;
  badges: ReputationBadge[];
  last_calculated: ISODateString;
}

export interface ReputationBadge {
  badge_id: string;
  badge_name: string;
  badge_icon: string;
  description: string;
  earned_at: ISODateString;
  category: 'contributor' | 'supporter' | 'expert' | 'moderator';
}

// ==========================================
// Feed & Discovery
// ==========================================

export interface CommunityFeedFilters {
  group_ids?: CommunityGroupId[];
  categories?: GroupCategory[];
  tags?: string[];
  time_range?: 'today' | 'week' | 'month' | 'all';
  sort_by?: 'recent' | 'popular' | 'unanswered' | 'trending';
  only_my_groups?: boolean;
}

export interface TrendingTopic {
  tag: string;
  post_count: number;
  growth_percentage: number;
  related_groups: CommunityGroupId[];
}

// ==========================================
// API Responses
// ==========================================

export interface CommunityPostAPIResponse {
  post: CommunityPost;
  author_reputation: UserReputation;
  reactions: PostReaction[];
  comment_count: number;
  user_has_reacted: boolean;
  user_reaction_type: ReactionType | null;
}

export interface CommunityFeedAPIResponse {
  posts: CommunityPost[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface CommunityGroupAPIResponse {
  group: CommunityGroup;
  membership: GroupMembership | null;
  is_member: boolean;
  trending_posts: CommunityPost[];
  member_stats: {
    total_members: number;
    active_last_week: number;
    new_this_month: number;
  };
}

// ==========================================
// Utility Functions
// ==========================================

export const GROUP_CATEGORIES_DISPLAY: Record<GroupCategory, string> = {
  chronic_disease: 'Enfermedades Crónicas',
  mental_health: 'Salud Mental',
  reproductive_health: 'Salud Reproductiva',
  preventive_care: 'Cuidado Preventivo',
  general_wellness: 'Bienestar General',
  support_groups: 'Grupos de Apoyo',
  caregivers: 'Cuidadores',
};

export const REACTION_DISPLAY: Record<ReactionType, { emoji: string; label: string }> = {
  like: { emoji: '👍', label: 'Me gusta' },
  heart: { emoji: '❤️', label: 'Me encanta' },
  hug: { emoji: '🤗', label: 'Abrazo virtual' },
  pray: { emoji: '🙏', label: 'Oraciones' },
  celebrate: { emoji: '🎉', label: 'Celebrar' },
  helpful: { emoji: '✅', label: 'Útil' },
  sad: { emoji: '😢', label: 'Triste' },
  angry: { emoji: '😠', label: 'Frustrante' },
};

export function canModerateContent(
  membership: GroupMembership | null,
  groupModeratorIds: DoctorId[],
  userId: string,
): boolean {
  if (!membership) return false;
  return (
    membership.role === 'moderator' ||
    membership.role === 'admin' ||
    groupModeratorIds.includes(userId as DoctorId)
  );
}

export function isContentApproved(post: CommunityPost): boolean {
  return post.moderation_status === 'approved';
}

export function requiresModerationReview(post: CommunityPost): boolean {
  return post.moderation_status === 'pending_review' || post.moderation_status === 'flagged';
}

export function calculateReputationScore(reputation: UserReputation): number {
  const postPoints = reputation.total_posts * 5;
  const commentPoints = reputation.total_comments * 2;
  const helpfulPoints = reputation.helpful_answers * 10;
  const reactionPoints = reputation.reactions_received * 1;

  return postPoints + commentPoints + helpfulPoints + reactionPoints;
}

export function canPostInGroup(membership: GroupMembership | null, group: CommunityGroup): boolean {
  if (!membership) return false;
  if (membership.status !== 'active') return false;
  if (group.requires_approval && membership.role === 'member') {
    return membership.reputation_score >= 50; // Minimum reputation required
  }
  return true;
}

export function anonymizeDisplayName(age: number, gender: string): string {
  const genderPrefix = gender === 'male' ? 'Paciente' : 'Paciente';
  return `${genderPrefix}, ${age} años`;
}

export function isHighRiskContent(content: string): boolean {
  const riskKeywords = [
    'suicidio',
    'autolesión',
    'overdose',
    'sobredosis',
    'matarme',
    'terminar con todo',
  ];
  const lowerContent = content.toLowerCase();
  return riskKeywords.some((keyword) => lowerContent.includes(keyword));
}
