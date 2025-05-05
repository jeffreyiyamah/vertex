// Define the normalized log structure
export interface VertexLog {
    timestamp: string;
    user: string;
    ip: string;
    event: string;
    detail: string;
  }
  
  // Event type mapping for common CloudTrail events
  const eventMapping: Record<string, string> = {
    'ConsoleLogin': 'login_success',
    'ConsoleLoginFailure': 'login_failed',
    'AddMFADevice': 'mfa_added',
    'DeleteMFADevice': 'mfa_removed',
    'AssumeRole': 'role_assumed',
    // Add more mappings as needed
  };
  
  /**
   * Normalizes raw CloudTrail-style records into VertexLog format
   */
  export function normalize(records: any[]): VertexLog[] {
    return records.map(record => {
      // Extract common fields with fallbacks
      const timestamp = record.eventTime || record.timestamp || new Date().toISOString();
      
      // Handle different user identifiers in CloudTrail
      let user = 'unknown';
      if (record.userIdentity) {
        user = record.userIdentity.userName || 
               record.userIdentity.sessionContext?.sessionIssuer?.userName ||
               record.userIdentity.principalId ||
               record.userIdentity.arn?.split('/').pop() ||
               'unknown';
      } else if (record.user) {
        user = record.user;
      }
      
      // Extract IP address
      const ip = record.sourceIPAddress || 
                 record.requestParameters?.sourceIP || 
                 record.ip || 
                 '0.0.0.0';
      
      // Determine event type
      let event = 'unknown';
      if (record.eventName) {
        event = eventMapping[record.eventName] || 'api_call';
      } else if (record.event) {
        event = eventMapping[record.event] || record.event;
      }
      
      // Flatten additional event data into a detail string
      let detail = '';
      if (record.additionalEventData) {
        detail = JSON.stringify(record.additionalEventData);
      } else if (record.requestParameters) {
        detail = JSON.stringify(record.requestParameters);
      } else if (record.detail) {
        detail = typeof record.detail === 'string' ? 
                 record.detail : 
                 JSON.stringify(record.detail);
      }
      
      return {
        timestamp,
        user,
        ip,
        event,
        detail
      };
    });
  }