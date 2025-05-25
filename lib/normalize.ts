// lib/normalize.ts

export interface VertexLog {
  timestamp: string;
  user: string;
  ip: string;
  event: string;
  detail: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'authentication' | 'authorization' | 'data_access' | 'infrastructure' | 'administrative';
}

/**
 * Enhanced normalization with better event classification
 */
export function normalize(records: any[] | Record<string, any>): VertexLog[] {
  const arr = Array.isArray(records) ? records : [records];

  return arr.map((r) => {
    // Extract base fields
    const timestamp = r.eventTime ?? r.timestamp ?? '';
    const user = extractUser(r);
    const ip = r.sourceIPAddress ?? r.sourceIp ?? r.ip ?? '';
    
    // Enhanced event normalization
    const { eventCode, detail, severity, category } = normalizeEvent(r);

    return { 
      timestamp, 
      user, 
      ip, 
      event: eventCode, 
      detail,
      severity,
      category
    };
  });
}

function extractUser(record: any): string {
  // Handle different user identity formats
  if (record.userIdentity) {
    const identity = record.userIdentity;
    
    // Root user
    if (identity.type === 'Root') {
      return 'Root';
    }
    
    // IAM User
    if (identity.userName) {
      return identity.userName;
    }
    
    // Assumed Role
    if (identity.type === 'AssumedRole' && identity.arn) {
      const roleMatch = identity.arn.match(/assumed-role\/([^\/]+)\/(.+)/);
      if (roleMatch) {
        return `${roleMatch[2]} (${roleMatch[1]})`;
      }
    }
    
    // AWS Service
    if (identity.type === 'AWSService') {
      return identity.invokedBy || 'AWSService';
    }
  }
  
  return record.userName ?? record.username ?? record.user ?? 'unknown';
}

function normalizeEvent(record: any): {
  eventCode: string;
  detail: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'infrastructure' | 'administrative';
} {
  const eventName = record.eventName ?? record.event ?? '';
  
  switch (eventName) {
    case 'ConsoleLogin':
      if (record.responseElements?.ConsoleLogin === 'Success') {
        return {
          eventCode: 'login_success',
          detail: record.additionalEventData?.MFAUsed 
            ? `Console login with MFA: ${record.additionalEventData.MFAUsed}`
            : 'Console login succeeded',
          severity: 'low',
          category: 'authentication'
        };
      } else {
        return {
          eventCode: 'login_failed',
          detail: `Console login failed: ${record.additionalEventData?.ErrorMessage || 'Authentication failure'}`,
          severity: 'high',
          category: 'authentication'
        };
      }

    case 'ConsoleLoginFailure':
      return {
        eventCode: 'login_failed',
        detail: `Console login failed: ${record.additionalEventData?.ErrorMessage || 'Authentication failure'}`,
        severity: 'high',
        category: 'authentication'
      };

    case 'AssumeRole':
      return {
        eventCode: 'role_assumed',
        detail: `Role assumed: ${record.requestParameters?.roleArn || 'Unknown role'}`,
        severity: 'medium',
        category: 'authorization'
      };

    case 'RunInstances':
      return {
        eventCode: 'instance_created',
        detail: `EC2 instance launched: ${record.requestParameters?.instanceType || 'unknown type'} (${record.responseElements?.instancesSet?.items?.[0]?.instanceId || 'unknown ID'})`,
        severity: 'medium',
        category: 'infrastructure'
      };

    case 'CreateBucket':
      return {
        eventCode: 'bucket_created',
        detail: `S3 bucket created: ${record.requestParameters?.bucketName || 'unknown name'}`,
        severity: 'medium',
        category: 'infrastructure'
      };

    case 'PutObject':
      const isCloudTrailLog = record.userIdentity?.invokedBy === 'cloudtrail.amazonaws.com';
      return {
        eventCode: isCloudTrailLog ? 'log_archived' : 'file_uploaded',
        detail: isCloudTrailLog 
          ? `CloudTrail log archived: ${record.requestParameters?.key?.split('/').pop() || 'log file'}`
          : `File uploaded to S3: ${record.requestParameters?.key || 'unknown file'} to ${record.requestParameters?.bucketName || 'unknown bucket'}`,
        severity: isCloudTrailLog ? 'low' : 'medium',
        category: isCloudTrailLog ? 'administrative' : 'data_access'
      };

    case 'CreateKey':
      return {
        eventCode: 'encryption_key_created',
        detail: `KMS key created: ${record.requestParameters?.description || 'No description provided'}`,
        severity: record.userIdentity?.type === 'Root' ? 'medium' : 'low',
        category: 'administrative'
      };

    case 'GetUserPolicy':
      return {
        eventCode: 'policy_accessed',
        detail: `User policy accessed: ${record.requestParameters?.policyName || 'unknown policy'} for user ${record.requestParameters?.userName || 'unknown user'}`,
        severity: 'low',
        category: 'authorization'
      };

    case 'AuthorizeSecurityGroupIngress':
      const port = record.requestParameters?.ipPermissions?.items?.[0]?.fromPort;
      const cidr = record.requestParameters?.ipPermissions?.items?.[0]?.ipRanges?.items?.[0]?.cidrIp;
      return {
        eventCode: 'firewall_rule_added',
        detail: `Security group rule added: Allow port ${port || 'unknown'} from ${cidr || 'unknown CIDR'}`,
        severity: 'medium',
        category: 'infrastructure'
      };

    case 'PutConfigRule':
      return {
        eventCode: 'compliance_rule_created',
        detail: `AWS Config rule created: ${record.requestParameters?.configRule?.configRuleName || 'unknown rule'}`,
        severity: 'low',
        category: 'administrative'
      };

    case 'CreateNotebookInstance':
      return {
        eventCode: 'notebook_created',
        detail: `SageMaker notebook created: ${record.requestParameters?.notebookInstanceName || 'unknown name'} (${record.requestParameters?.instanceType || 'unknown type'})`,
        severity: 'low',
        category: 'infrastructure'
      };

    default:
      return {
        eventCode: eventName || 'unknown_event',
        detail: record.additionalEventData?.ErrorMessage 
          ?? record.message 
          ?? `${eventName} event occurred`,
        severity: 'low',
        category: 'administrative'
      };
  }
}

/**
 * Enhanced humanization with better context
 */
export function humanize(log: VertexLog): string {
  const user = capitalize(log.user) || 'Unknown user';
  const ip = log.ip || 'unknown IP';
  
  // Use the detail field for more descriptive text
  if (log.detail) {
    return `${user} from ${ip}: ${log.detail}`;
  }
  
  // Fallback to basic format
  switch (log.event) {
    case 'login_success':
      return `${user} from ${ip} successfully logged in.`;
    case 'login_failed':
      return `${user} from ${ip} failed to log in.`;
    default:
      return `${user} from ${ip} triggered ${log.event.replace('_', ' ')}.`;
  }
}

export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}