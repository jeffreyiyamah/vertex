import type { VertexLog } from './normalize';

// Enhanced critical events detection
const CRITICAL_EVENTS = new Set([
  'login_failed',
  'mfa_required', 
  'account_locked',
  'password_changed',
  'permission_changed',
  'policy_changed',
  'role_assumed'
]);

// Events that are suspicious based on context
const CONTEXTUAL_EVENTS = new Set([
  'CreateKey',
  'RunInstances', 
  'CreateBucket',
  'PutObject',
  'AuthorizeSecurityGroupIngress'
]);

/**
 * Enhanced highlighting that considers event context and patterns
 */
export function highlight(logs: VertexLog[]): number[] {
  const criticalIndices: number[] = [];
  
  logs.forEach((log, index) => {
    // Direct critical events
    if (CRITICAL_EVENTS.has(log.event)) {
      criticalIndices.push(index);
      return;
    }
    
    // Context-based critical events
    if (isContextuallyCritical(log, logs, index)) {
      criticalIndices.push(index);
    }
  });
  
  return criticalIndices;
}

/**
 * Determine if an event is critical based on context
 */
function isContextuallyCritical(log: VertexLog, allLogs: VertexLog[], currentIndex: number): boolean {
  // Root user activity is always notable
  if (log.user === 'root' || log.user === 'Root') {
    return true;
  }
  
  // Failed authentication attempts
  if (log.event === 'login_failed' || log.detail.toLowerCase().includes('failure')) {
    return true;
  }
  
  // External IP addresses (not private ranges)
  if (log.ip && isExternalIP(log.ip)) {
    // External IPs with sensitive operations
    if (CONTEXTUAL_EVENTS.has(log.event)) {
      return true;
    }
  }
  
  // Time-based correlation (events within suspicious timeframes)
  if (hasTemporalCorrelation(log, allLogs, currentIndex)) {
    return true;
  }
  
  return false;
}

/**
 * Check if IP is external (not private range)
 */
function isExternalIP(ip: string): boolean {
  // Private IP ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^127\./,  // localhost
    /^169\.254\./ // link-local
  ];
  
  return !privateRanges.some(range => range.test(ip));
}

/**
 * Check for temporal correlation with other suspicious events
 */
function hasTemporalCorrelation(log: VertexLog, allLogs: VertexLog[], currentIndex: number): boolean {
  const currentTime = new Date(log.timestamp).getTime();
  const CORRELATION_WINDOW = 10 * 60 * 1000; // 10 minutes
  
  // Look for other suspicious events within time window
  for (let i = 0; i < allLogs.length; i++) {
    if (i === currentIndex) continue;
    
    const otherLog = allLogs[i];
    const otherTime = new Date(otherLog.timestamp).getTime();
    const timeDiff = Math.abs(currentTime - otherTime);
    
    if (timeDiff <= CORRELATION_WINDOW) {
      // Check if the other event is inherently suspicious
      if (CRITICAL_EVENTS.has(otherLog.event) || 
          otherLog.event === 'login_failed' ||
          (otherLog.user === 'root' || otherLog.user === 'Root')) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get risk level for highlighted events
 */
export function getRiskLevel(criticalLogs: VertexLog[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (criticalLogs.length === 0) return 'LOW';
  
  const hasRootCompromise = criticalLogs.some(log => 
    log.user === 'root' && log.event === 'login_failed'
  );
  
  const hasMultipleFailures = criticalLogs.filter(log => 
    log.event === 'login_failed'
  ).length >= 3;
  
  const hasExternalAttacks = criticalLogs.some(log => 
    isExternalIP(log.ip) && log.event === 'login_failed'
  );
  
  if (hasRootCompromise) return 'CRITICAL';
  if (hasMultipleFailures && hasExternalAttacks) return 'HIGH';
  if (hasExternalAttacks || hasMultipleFailures) return 'MEDIUM';
  
  return 'LOW';
}