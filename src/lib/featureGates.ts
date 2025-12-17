/**
 * Feature Gating System for Route of Flight
 * 
 * This module provides centralized feature access control based on user plans
 * and trial status. All feature checks should go through this system.
 */

export enum Plan {
  BASIC = 'basic',
  PRO = 'pro',
  PRO_PLUS = 'pro-plus'
}

export enum FeatureKey {
  // Logbook features
  LOGBOOK_UNLIMITED_ENTRIES = 'logbook:unlimited_entries',
  LOGBOOK_WORLD_MAP_VIEW = 'logbook:world_map_view',
  LOGBOOK_PREDICTIONS_TOOL = 'logbook:predictions_tool',
  
  // Route Builder
  ROUTE_BUILDER_ACCESS = 'route_builder:access',
  
  // Resume Builder
  RESUME_BUILDER_ACCESS = 'resume_builder:access',
  RESUME_AUTO_SYNC = 'resume:auto_sync',
  
  // Airline Database (always available)
  AIRLINE_DATABASE_ACCESS = 'airline_database:access',
}

export interface UserSubscription {
  current_plan_slug: Plan | string;
  trial_start_at?: string | null;
  trial_end_at?: string | null;
  subscribed?: boolean;
}

/**
 * Check if user is currently in an active trial period
 */
export function isInTrial(subscription: UserSubscription | null): boolean {
  if (!subscription?.trial_end_at) return false;
  
  const trialEnd = new Date(subscription.trial_end_at);
  const now = new Date();
  
  return trialEnd > now;
}

/**
 * Get the effective plan for feature checking
 * During trial, Basic users get Pro-level access to Route Builder and Resume Builder
 */
export function getEffectivePlan(subscription: UserSubscription | null): Plan {
  if (!subscription) return Plan.BASIC;
  
  const planSlug = subscription.current_plan_slug?.toLowerCase() || Plan.BASIC;
  
  // Map to enum
  if (planSlug === 'pro' || planSlug === Plan.PRO) return Plan.PRO;
  if (planSlug === 'pro-plus' || planSlug === 'pro_plus' || planSlug === Plan.PRO_PLUS) return Plan.PRO_PLUS;
  
  return Plan.BASIC;
}

/**
 * Check if user has access to a specific feature
 * @param subscription - User's subscription data
 * @param feature - Feature key to check
 * @param isAdmin - Optional admin status. If true, always returns true (full access)
 */
export function hasFeature(
  subscription: UserSubscription | null,
  feature: FeatureKey,
  isAdmin: boolean = false
): boolean {
  // Admins have full unlimited access to all features
  if (isAdmin) {
    return true;
  }
  
  if (!subscription) {
    // Default to Basic plan for unauthenticated users
    return hasFeatureForPlan(Plan.BASIC, false, feature);
  }
  
  const plan = getEffectivePlan(subscription);
  const inTrial = isInTrial(subscription);
  
  return hasFeatureForPlan(plan, inTrial, feature);
}

/**
 * Core feature access logic based on plan and trial status
 */
function hasFeatureForPlan(
  plan: Plan,
  inTrial: boolean,
  feature: FeatureKey
): boolean {
  switch (feature) {
    // Logbook: Unlimited entries (Pro and Pro Plus only)
    case FeatureKey.LOGBOOK_UNLIMITED_ENTRIES:
      return plan === Plan.PRO || plan === Plan.PRO_PLUS;
    
    // Logbook: World/Map view (Pro Plus only)
    case FeatureKey.LOGBOOK_WORLD_MAP_VIEW:
      return plan === Plan.PRO_PLUS;
    
    // Logbook: Predictions tool (Pro Plus only)
    case FeatureKey.LOGBOOK_PREDICTIONS_TOOL:
      return plan === Plan.PRO_PLUS;
    
    // Route Builder: Access (Pro, Pro Plus, or Basic in trial)
    case FeatureKey.ROUTE_BUILDER_ACCESS:
      if (plan === Plan.PRO || plan === Plan.PRO_PLUS) return true;
      if (plan === Plan.BASIC && inTrial) return true;
      return false;
    
    // Resume Builder: Access (Pro, Pro Plus, or Basic in trial)
    case FeatureKey.RESUME_BUILDER_ACCESS:
      if (plan === Plan.PRO || plan === Plan.PRO_PLUS) return true;
      if (plan === Plan.BASIC && inTrial) return true;
      return false;
    
    // Resume: Auto-sync (Pro Plus only)
    case FeatureKey.RESUME_AUTO_SYNC:
      return plan === Plan.PRO_PLUS;
    
    // Airline Database: Always available
    case FeatureKey.AIRLINE_DATABASE_ACCESS:
      return true;
    
    default:
      return false;
  }
}

/**
 * Get the upgrade message for a locked feature
 */
export function getUpgradeMessage(feature: FeatureKey): string {
  switch (feature) {
    case FeatureKey.LOGBOOK_UNLIMITED_ENTRIES:
      return 'Upgrade to Pro or Pro Plus for unlimited logbook entries';
    case FeatureKey.LOGBOOK_WORLD_MAP_VIEW:
    case FeatureKey.LOGBOOK_PREDICTIONS_TOOL:
      return 'Upgrade to Pro Plus to unlock this feature';
    case FeatureKey.ROUTE_BUILDER_ACCESS:
      return 'Upgrade to Pro or Pro Plus to access Route Builder';
    case FeatureKey.RESUME_BUILDER_ACCESS:
      return 'Upgrade to Pro or Pro Plus to access Resume Builder';
    case FeatureKey.RESUME_AUTO_SYNC:
      return 'Upgrade to Pro Plus for automatic logbook syncing';
    default:
      return 'Upgrade to unlock this feature';
  }
}

/**
 * Get the minimum plan required for a feature
 */
export function getRequiredPlan(feature: FeatureKey): Plan {
  switch (feature) {
    case FeatureKey.LOGBOOK_UNLIMITED_ENTRIES:
    case FeatureKey.ROUTE_BUILDER_ACCESS:
    case FeatureKey.RESUME_BUILDER_ACCESS:
      return Plan.PRO;
    case FeatureKey.LOGBOOK_WORLD_MAP_VIEW:
    case FeatureKey.LOGBOOK_PREDICTIONS_TOOL:
    case FeatureKey.RESUME_AUTO_SYNC:
      return Plan.PRO_PLUS;
    case FeatureKey.AIRLINE_DATABASE_ACCESS:
      return Plan.BASIC;
    default:
      return Plan.PRO;
  }
}

