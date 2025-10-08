/**
 * UI utility functions for class name composition and styling
 * Migrated from @autamedica/utils for consolidation
 */

/**
 * Combines class names, filtering out falsy values
 * Useful for conditional class composition in React components
 *
 * @example
 * cn('base-class', isActive && 'active', 'other-class')
 * // => 'base-class active other-class'
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}
