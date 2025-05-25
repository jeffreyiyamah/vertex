import type { VertexLog } from './normalize';

/**
 * Creates a readable paragraph summary of critical events from the highlighted logs
 */
export function summarize(criticalLogs: VertexLog[]): string {
  const totalCritical = criticalLogs.length;
  
  if (totalCritical === 0) {
    return "No critical security events were detected during the analyzed timeframe. All activities appear to be routine operations with no suspicious patterns identified.";
  }
  
  // Group events by type and analyze patterns
  const eventAnalysis = analyzeCriticalEvents(criticalLogs);
  
  return generateNarrative(eventAnalysis, totalCritical);
}

interface EventAnalysis {
  failedLogins: VertexLog[];
  rootActivity: VertexLog[];
  privilegeChanges: VertexLog[];
  suspiciousPatterns: SuspiciousPattern[];
  timeline: TimelineEvent[];
}

interface SuspiciousPattern {
  type: 'rapid_succession' | 'ip_correlation' | 'privilege_escalation' | 'unusual_timing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  events: VertexLog[];
}

interface TimelineEvent {
  timestamp: string;
  event: VertexLog;
  context: string;
}

function analyzeCriticalEvents(logs: VertexLog[]): EventAnalysis {
  const failedLogins = logs.filter(log => log.event === 'login_failed');
  const rootActivity = logs.filter(log => log.user === 'root' || log.user === 'Root');
  const privilegeChanges = logs.filter(log => 
    log.event.includes('role_assumed') || 
    log.event.includes('permission_changed') ||
    log.event.includes('policy_changed')
  );
  
  const suspiciousPatterns = detectSuspiciousPatterns(logs);
  const timeline = buildTimeline(logs);
  
  return {
    failedLogins,
    rootActivity, 
    privilegeChanges,
    suspiciousPatterns,
    timeline
  };
}

function detectSuspiciousPatterns(logs: VertexLog[]): SuspiciousPattern[] {
  const patterns: SuspiciousPattern[] = [];
  
  // Check for rapid succession events
  const rapidEvents = findRapidSuccessionEvents(logs);
  if (rapidEvents.length > 0) {
    patterns.push({
      type: 'rapid_succession',
      severity: 'medium',
      description: `${rapidEvents.length} events occurred within a short timeframe`,
      events: rapidEvents
    });
  }
  
  // Check for correlated IP activity
  const ipCorrelation = analyzeIPCorrelation(logs);
  if (ipCorrelation.suspicious) {
    patterns.push({
      type: 'ip_correlation',
      severity: ipCorrelation.severity,
      description: ipCorrelation.description,
      events: ipCorrelation.events
    });
  }
  
  return patterns;
}

function findRapidSuccessionEvents(logs: VertexLog[]): VertexLog[] {
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const rapidEvents: VertexLog[] = [];
  const RAPID_THRESHOLD = 2 * 60 * 1000; // 2 minutes
  
  for (let i = 1; i < sortedLogs.length; i++) {
    const timeDiff = new Date(sortedLogs[i].timestamp).getTime() - 
                    new Date(sortedLogs[i-1].timestamp).getTime();
    
    if (timeDiff < RAPID_THRESHOLD) {
      if (!rapidEvents.includes(sortedLogs[i-1])) rapidEvents.push(sortedLogs[i-1]);
      if (!rapidEvents.includes(sortedLogs[i])) rapidEvents.push(sortedLogs[i]);
    }
  }
  
  return rapidEvents;
}

function analyzeIPCorrelation(logs: VertexLog[]): {
  suspicious: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  events: VertexLog[];
} {
  const ipGroups = groupBy(logs, 'ip');
  const uniqueIPs = Object.keys(ipGroups);
  
  // Look for suspicious IP patterns
  for (const ip of uniqueIPs) {
    const ipEvents = ipGroups[ip];
    const hasFailedLogin = ipEvents.some(event => event.event === 'login_failed');
    const hasSuccessfulActivity = ipEvents.some(event => event.event !== 'login_failed');
    
    if (hasFailedLogin && hasSuccessfulActivity) {
      return {
        suspicious: true,
        severity: 'high',
        description: `IP ${ip} shows both failed authentication and successful activity`,
        events: ipEvents
      };
    }
  }
  
  return {
    suspicious: false,
    severity: 'low',
    description: '',
    events: []
  };
}

function buildTimeline(logs: VertexLog[]): TimelineEvent[] {
  return logs
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(log => ({
      timestamp: log.timestamp,
      event: log,
      context: generateEventContext(log)
    }));
}

function generateEventContext(log: VertexLog): string {
  switch (log.event) {
    case 'login_failed':
      return `Authentication failure from ${log.ip}`;
    case 'login_success':
      return `Successful authentication from ${log.ip}`;
    default:
      return `${log.event} by ${log.user}`;
  }
}

function generateNarrative(analysis: EventAnalysis, totalEvents: number): string {
  if (totalEvents === 0) {
    return "No critical security events were detected during the analyzed timeframe. All activities appear to be routine operations with no suspicious patterns identified.";
  }

  let narrative = "";
  
  // Build a cohesive narrative paragraph
  const parts: string[] = [];
  
  // Start with event count and timeframe
  if (analysis.timeline.length > 0) {
    const timeSpan = getTimeSpan(analysis.timeline);
    parts.push(`During a ${timeSpan} period, ${totalEvents} security event${totalEvents > 1 ? 's' : ''} ${totalEvents > 1 ? 'were' : 'was'} flagged for review`);
  } else {
    parts.push(`${totalEvents} security event${totalEvents > 1 ? 's' : ''} ${totalEvents > 1 ? 'were' : 'was'} identified`);
  }
  
  // Add failed login details
  if (analysis.failedLogins.length > 0) {
    const failedIPs = [...new Set(analysis.failedLogins.map(log => log.ip))];
    const usernames = [...new Set(analysis.failedLogins.map(log => log.user))];
    
    if (analysis.failedLogins.length === 1) {
      parts.push(`including a failed authentication attempt by ${usernames[0]} from external IP ${failedIPs[0]}`);
    } else {
      parts.push(`including ${analysis.failedLogins.length} failed authentication attempts from external IPs (${failedIPs.join(', ')})`);
    }
  }
  
  // Add root activity details
  if (analysis.rootActivity.length > 0) {
    const rootEvents = analysis.rootActivity.map(log => {
      if (log.event === 'encryption_key_created') return 'KMS encryption key creation';
      return log.event.replace('_', ' ');
    });
    
    if (analysis.rootActivity.length === 1) {
      const fromInternal = analysis.rootActivity[0].ip && (
        analysis.rootActivity[0].ip.startsWith('192.168.') || 
        analysis.rootActivity[0].ip.startsWith('10.') || 
        analysis.rootActivity[0].ip.startsWith('172.')
      );
      parts.push(`and administrative root account activity (${rootEvents[0]}) ${fromInternal ? 'from the internal network' : 'from an external source'}`);
    } else {
      parts.push(`and ${analysis.rootActivity.length} administrative operations by the root account (${rootEvents.join(', ')})`);
    }
  }
  
  // Combine the main sentence
  narrative = parts.join(' ') + '. ';
  
  // Add risk assessment
  if (analysis.suspiciousPatterns.length > 0) {
    const highSeverityPatterns = analysis.suspiciousPatterns.filter(p => p.severity === 'high' || p.severity === 'critical');
    if (highSeverityPatterns.length > 0) {
      narrative += `Critical correlation patterns were detected: ${highSeverityPatterns.map(p => p.description.toLowerCase()).join(', ')}. This suggests potential coordinated malicious activity requiring immediate investigation. `;
    } else {
      narrative += `Some correlation patterns were observed, but they appear to be of low to medium concern. `;
    }
  } else {
    // Most important part - when events are NOT correlated
    const hasFailedAndRoot = analysis.failedLogins.length > 0 && analysis.rootActivity.length > 0;
    if (hasFailedAndRoot) {
      narrative += `However, analysis shows these events are **not correlated** - the failed authentication and administrative activities originated from different IP addresses and show no evidence of privilege escalation or coordinated attack patterns. `;
    } else {
      narrative += `No suspicious correlation patterns were detected between events, indicating these appear to be isolated incidents rather than coordinated malicious activity. `;
    }
  }
  
  // Add final assessment
  const riskLevel = getRiskLevelFromAnalysis(analysis);
  switch (riskLevel) {
    case 'CRITICAL':
      narrative += "**Risk Level: CRITICAL** - Immediate security response required.";
      break;
    case 'HIGH':
      narrative += "**Risk Level: HIGH** - Prompt investigation recommended.";
      break;
    case 'MEDIUM':
      narrative += "**Risk Level: MEDIUM** - Routine monitoring and review recommended.";
      break;
    default:
      narrative += "**Risk Level: LOW** - Standard security monitoring continues.";
  }
  
  return narrative;
}

function getRiskLevelFromAnalysis(analysis: EventAnalysis): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  // Check for critical patterns first
  const criticalPatterns = analysis.suspiciousPatterns.filter(p => p.severity === 'critical');
  if (criticalPatterns.length > 0) return 'CRITICAL';
  
  // Check for high severity patterns
  const highPatterns = analysis.suspiciousPatterns.filter(p => p.severity === 'high');
  if (highPatterns.length > 0) return 'HIGH';
  
  // Check for multiple failed logins from external IPs
  const externalFailedLogins = analysis.failedLogins.filter(log => 
    log.ip && !log.ip.startsWith('192.168.') && !log.ip.startsWith('10.') && !log.ip.startsWith('172.')
  );
  
  if (externalFailedLogins.length >= 3) return 'HIGH';
  if (externalFailedLogins.length >= 1) return 'MEDIUM';
  
  // Root activity alone is not necessarily high risk if from internal network
  if (analysis.rootActivity.length > 0) {
    const externalRootActivity = analysis.rootActivity.filter(log =>
      log.ip && !log.ip.startsWith('192.168.') && !log.ip.startsWith('10.') && !log.ip.startsWith('172.')
    );
    if (externalRootActivity.length > 0) return 'HIGH';
    return 'MEDIUM'; // Internal root activity
  }
  
  return 'LOW';
}

function getTimeSpan(timeline: TimelineEvent[]): string {
  if (timeline.length < 2) return 'single point in time';
  
  const start = new Date(timeline[0].timestamp);
  const end = new Date(timeline[timeline.length - 1].timestamp);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (mins === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} and ${mins} minute${mins !== 1 ? 's' : ''}`;
  }
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}