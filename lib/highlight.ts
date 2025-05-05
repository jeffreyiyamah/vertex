import type { VertexLog } from './normalize';

// Set of critical events that should be highlighted
const CRITICAL_EVENTS = new Set([
  'login_failed',
  'mfa_required',
  'account_locked',
  'password_changed',
  'permission_changed',
  'policy_changed'
]);

/**
 * Accepts array of VertexLogs and returns indices of critical events
 */
export function highlight(logs: VertexLog[]): number[] {
  const criticalIndices: number[] = [];
  
  logs.forEach((log, index) => {
    if (CRITICAL_EVENTS.has(log.event)) {
      criticalIndices.push(index);
    }
  });
  
  return criticalIndices;
}