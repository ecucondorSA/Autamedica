export type MemberRole = 'member' | 'admin';

/**
 * Checks if the member role has permissions to manage company settings, billing, and members.
 * @param r The member role.
 * @returns True if the role is 'admin', false otherwise.
 */
export const canManageCompany = (r: MemberRole): boolean => r === 'admin';

/**
 * Checks if the member role has permissions to manage billing.
 * @param r The member role.
 * @returns True if the role is 'admin', false otherwise.
 */
export const canManageBilling = (r: MemberRole): boolean => r === 'admin';

/**
 * Checks if the member role has permissions to invite new members.
 * @param r The member role.
 * @returns True if the role is 'admin', false otherwise.
 */
export const canInviteMembers = (r: MemberRole): boolean => r === 'admin';
