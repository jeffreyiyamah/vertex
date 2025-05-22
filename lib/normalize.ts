// lib/normalize.ts

/**
 * The shape of a normalized log record for Vertex.
 */
export interface VertexLog {
  timestamp: string;    // ISO or parseable timestamp
  user: string;         // username performing the action
  ip: string;           // source IP address
  event: string;        // normalized event code (e.g. "login_success")
  detail: string;       // human-readable detail or message
}

/**
 * Convert raw CloudTrail (and generic) records into a consistent VertexLog[] array.
 */
export function normalize(records: any[] | Record<string, any>): VertexLog[] {
  const arr = Array.isArray(records) ? records : [records];

  return arr.map((r) => {
    // Base fields
    const timestamp = r.eventTime ?? r.timestamp ?? '';
    const user = r.userIdentity?.userName ?? r.userName ?? r.username ?? '';
    const ip = r.sourceIPAddress ?? r.sourceIp ?? r.ip ?? '';

    // Derive normalized event code and detail
    let eventCode = r.eventName ?? r.event ?? '';
    let detail: string;

    switch (r.eventName) {
      case 'ConsoleLogin':
        if (r.responseElements?.ConsoleLogin === 'Success') {
          eventCode = 'login_success';
          detail = r.additionalEventData?.MFAUsed
            ? `MFA used: ${r.additionalEventData.MFAUsed}`
            : 'Login succeeded';
        } else {
          eventCode = 'login_failed';
          detail = r.additionalEventData?.ErrorMessage || 'Login failed';
        }
        break;

      case 'ConsoleLoginFailure':
        eventCode = 'login_failed';
        detail = r.additionalEventData?.ErrorMessage || 'Login failed';
        break;

      case 'AddMFADevice':
        eventCode = 'mfa_added';
        detail = r.requestParameters?.serialNumber
          ? `MFA device added: ${r.requestParameters.serialNumber}`
          : 'MFA device added';
        break;

      case 'DeleteMFADevice':
        eventCode = 'mfa_removed';
        detail = r.requestParameters?.serialNumber
          ? `MFA device removed: ${r.requestParameters.serialNumber}`
          : 'MFA device removed';
        break;

      case 'AssumeRole':
        eventCode = 'role_assumed';
        detail = r.requestParameters?.roleSessionName
          ? `Role assumed: ${r.requestParameters.roleSessionName}`
          : r.requestParameters?.roleArn || 'Role assumed';
        break;

      default:
        detail = r.additionalEventData?.ErrorMessage
          ?? r.additionalEventData?.LoginTo
          ?? r.message
          ?? '';
    }

    return { timestamp, user, ip, event: eventCode, detail };
  });
}

/**
 * Capitalize the first letter of a string safely.
 */
export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}


export function humanize(log: VertexLog): string {
  const user = capitalize(log.user) || 'Unknown user';
  const ip = log.ip || 'unknown IP';
  const detail = log.detail;

  switch (log.event) {
    case 'login_success':
      return `${user} from ${ip} successfully logged in${detail ? ` (${detail})` : ''}.`;
    case 'login_failed':
      return `${user} from ${ip} failed to log in${detail ? `: ${detail}` : ''}.`;
    case 'mfa_added':
      return detail;
    case 'mfa_removed':
      return detail;
    case 'role_assumed':
      return detail;
    default:
      return detail
        ? `${user} from ${ip} triggered ${log.event}: ${detail}.`
        : `${user} from ${ip} triggered ${log.event}.`;
  }
}
