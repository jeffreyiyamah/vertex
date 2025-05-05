import type { VertexLog } from './normalize';

/**
 * Creates a summary of critical events from the highlighted logs
 */
export function summarize(criticalLogs: VertexLog[]): string {
  // Count total critical events
  const totalCritical = criticalLogs.length;
  
  // Count events per IP address
  const ipCounts: Record<string, number> = {};
  const eventCounts: Record<string, number> = {};
  
  criticalLogs.forEach(log => {
    // Count by IP
    if (!ipCounts[log.ip]) {
      ipCounts[log.ip] = 0;
    }
    ipCounts[log.ip]++;
    
    // Count by event type
    if (!eventCounts[log.event]) {
      eventCounts[log.event] = 0;
    }
    eventCounts[log.event]++;
  });
  
  // Generate summary text
  let summary = `Found ${totalCritical} critical security events. `;
  
  // Add IP breakdown
  if (Object.keys(ipCounts).length > 0) {
    const ipDetails = Object.entries(ipCounts)
      .map(([ip, count]) => `${count} from ${ip}`)
      .join(', ');
    summary += `Events by IP: ${ipDetails}. `;
  }
  
  // Add event type breakdown
  if (Object.keys(eventCounts).length > 0) {
    const eventDetails = Object.entries(eventCounts)
      .map(([event, count]) => `${count} ${event.replace('_', ' ')}`)
      .join(', ');
    summary += `Event types: ${eventDetails}.`;
  }
  
  return summary;
}