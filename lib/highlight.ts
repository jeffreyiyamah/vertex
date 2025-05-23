import type { VertexLog } from './normalize';

// Set of critical events that should be highlighted
const CRITICAL_EVENTS = new Set([
  'login_failed',
  'mfa_required',
  'account_locked',
  'password_changed',
  'permission_changed',
  'policy_changed',
  'security_group_modified',
  'kms_key_created',
  'role_assumed'
]);

// CloudTrail Insights events are always considered critical
const INSIGHTS_EVENTS = new Set([
  'UpdateInstanceInformation',
  'AssumeRole',
  'PutObject',
  'GetObject',
  'ListBuckets'
]);

// Suspicious IP patterns (you can expand this)
const SUSPICIOUS_IP_PATTERNS = [
  /^203\.0\.113\./, // Example suspicious IP range
  /^198\.51\.100\./, // Another example range
];

/**
 * Accepts array of VertexLogs and returns indices of critical events
 */
export function highlight(logs: VertexLog[]): number[] {
  const criticalIndices: number[] = [];
  
  logs.forEach((log, index) => {
    let isCritical = false;

    // Check standard critical events
    if (CRITICAL_EVENTS.has(log.event)) {
      isCritical = true;
    }

    // CloudTrail Insights are always critical (unusual API activity)
    if (log.user === 'CloudTrail Insights') {
      isCritical = true;
    }

    // Check for Insights-specific event names
    if (INSIGHTS_EVENTS.has(log.event)) {
      isCritical = true;
    }

    // Failed login attempts
    if (log.event.includes('login') && log.detail.toLowerCase().includes('fail')) {
      isCritical = true;
    }

    // Root user activity (always suspicious)
    if (log.user.toLowerCase() === 'root') {
      isCritical = true;
    }

    // Suspicious IP addresses
    if (SUSPICIOUS_IP_PATTERNS.some(pattern => pattern.test(log.ip))) {
      isCritical = true;
    }

    // Network activity from external sources
    if (log.event === 'network_activity' && !log.ip.startsWith('10.') && !log.ip.startsWith('192.168.')) {
      isCritical = true;
    }

    // Data events involving sensitive operations
    if (log.event === 'data_event' && (
      log.detail.includes('Delete') || 
      log.detail.includes('Put') || 
      log.detail.includes('financial')
    )) {
      isCritical = true;
    }

    // Console logins from unusual locations
    if (log.event === 'login_success' && !log.ip.startsWith('192.168.') && !log.ip.startsWith('10.')) {
      isCritical = true;
    }

    if (isCritical) {
      criticalIndices.push(index);
    }
  });
  
  return criticalIndices;
}