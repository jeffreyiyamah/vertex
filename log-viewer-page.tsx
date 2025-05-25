"use client"

import Logo from '@/Logo';
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, AlertCircle, ChevronDown, ChevronUp, ChevronRight, Search, Download, ExternalLink, X, Shield, AlertTriangle, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAnalysisStore } from '@/lib/store'
import { normalize, humanize, type VertexLog } from '@/lib/normalize';
import { highlight, getRiskLevel } from '@/lib/highlight'
import { summarize } from '@/lib/summarize'

interface WhyCareContent {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  actions: string[];
}

function renderMarkdown(text: string) {
  return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Human readable timeline descriptions
function getHumanReadableDescription(log: any): string {
  const event = log.vertexLog;
  const user = event.user;
  const ip = event.ip;
  
  switch (event.event) {
    case 'login_failed':
      return `Failed login attempt by ${user} from ${isExternalIP(ip) ? 'external' : 'internal'} location`;
    
    case 'encryption_key_created':
      return `${user} created encryption key for sensitive data protection`;
    
    case 'instance_created':
      return `${user} launched new EC2 instance for cloud computing`;
    
    case 'bucket_created':
      return `${user} created S3 storage bucket for data management`;
    
    case 'file_uploaded':
      return `${user} uploaded sensitive file to cloud storage`;
    
    case 'log_archived':
      return `System automatically archived security audit logs`;
    
    case 'policy_accessed':
      return `${user} accessed administrative policy settings`;
    
    case 'firewall_rule_added':
      return `${user} modified network security rules`;
    
    case 'compliance_rule_created':
      return `${user} configured compliance monitoring rule`;
    
    case 'notebook_created':
      return `${user} created data analysis environment`;
    
    default:
      return `${user} performed ${event.event.replace('_', ' ')} operation`;
  }
}

function isExternalIP(ip: string): boolean {
  if (!ip) return false;
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^127\./,
  ];
  return !privateRanges.some(range => range.test(ip));
}

export default function LogNarrativePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("what-happened")
  const [searchTerm, setSearchTerm] = useState("")
  const [showTimeline, setShowTimeline] = useState(true)
  const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({})
  const [logLines, setLogLines] = useState<any[]>([])
  const [narrative, setNarrative] = useState<string>("")
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('LOW')
  const { files } = useAnalysisStore()
  
  useEffect(() => {
    const loadLogFile = async () => {
      if (!files || files.length === 0) return
      
      try {
        const file = files[0] as File
        const fileContent = await file.text()
        
        const parsedData = JSON.parse(fileContent)
        const records = parsedData.Records || parsedData
        const recordsArray = Array.isArray(records) ? records : [records]
        
        // Normalize logs with enhanced classification
        const normalizedLogs = normalize(recordsArray)
        
        // Get critical event indices
        const criticalIndices = highlight(normalizedLogs)
        const criticalLogs = criticalIndices.map(i => normalizedLogs[i])
        
        // Generate narrative and risk assessment
        const generatedNarrative = summarize(criticalLogs)
        const assessedRiskLevel = getRiskLevel(criticalLogs)
        
        setNarrative(generatedNarrative)
        setRiskLevel(assessedRiskLevel)
        
        // Format logs for display
        const formattedLogs = normalizedLogs.map((log, index) => ({
          id: index + 1,
          timestamp: log.timestamp,
          content: humanize(log),
          important: criticalIndices.includes(index),
          severity: log.severity || 'low',
          category: log.category || 'administrative',
          rawData: recordsArray[index],
          vertexLog: log
        }))
        
        setLogLines(formattedLogs)
      } catch (error) {
        console.error('Error loading log file:', error)
      }
    }

    loadLogFile()
  }, [files])

  const filteredLogs = logLines.filter(
    (log) => searchTerm === "" || log.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const toggleExpand = (id: number) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  const formatJsonForDisplay = (obj: any) => {
    if (!obj) return "No raw data available";
    
    const relevantFields = {
      eventTime: obj.eventTime,
      eventName: obj.eventName,
      eventSource: obj.eventSource,
      sourceIPAddress: obj.sourceIPAddress,
      userAgent: obj.userAgent,
      userName: obj.userIdentity?.userName,
      userType: obj.userIdentity?.type,
      ...obj.additionalEventData && { additionalEventData: obj.additionalEventData },
      ...obj.requestParameters && { requestParameters: obj.requestParameters },
      ...obj.responseElements && { responseElements: obj.responseElements }
    };
    
    return JSON.stringify(relevantFields, null, 2);
  };

  const getRiskLevelColor = (level: string) => {
    switch(level) {
      case 'CRITICAL': return 'text-red-400'
      case 'HIGH': return 'text-red-400'  // Changed from orange to red
      case 'MEDIUM': return 'text-yellow-400'
      case 'LOW': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'border-red-500 bg-red-500/10'
      case 'high': return 'border-red-500 bg-red-500/10'  // Changed from orange to red
      case 'medium': return 'border-yellow-500 bg-yellow-500/10'
      case 'low': return 'border-green-500 bg-green-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getSeverityTextColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'text-red-300'
      case 'high': return 'text-red-300'  // Changed from orange to red
      case 'medium': return 'text-yellow-300'
      case 'low': return 'text-green-300'
      default: return 'text-zinc-300'
    }
  }

  const getSeverityBgColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-red-500'  // Changed from orange to red
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-zinc-500'
    }
  }

  function getWhyCareContent(
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    criticalLogs: any[]
  ): WhyCareContent {
    const hasFailedLogins = criticalLogs.some(log => log.vertexLog?.event === 'login_failed');
    const hasRootActivity = criticalLogs.some(log => log.vertexLog?.user === 'Root' || log.vertexLog?.user === 'root');
    const hasExternalIPs = criticalLogs.some(log => 
      log.vertexLog?.ip && !log.vertexLog.ip.startsWith('192.168.') && 
      !log.vertexLog.ip.startsWith('10.') && !log.vertexLog.ip.startsWith('172.')
    );

    switch (riskLevel) {
      case 'CRITICAL':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-950/30',
          borderColor: 'border-red-900/50',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Critical Security Breach Detected',
          description: 'Immediate action required! Active security incidents detected with strong indicators of system compromise. Potential data breach or ongoing attack in progress.',
          actions: [
            'IMMEDIATELY isolate affected systems',
            'Activate incident response team',
            'Preserve forensic evidence',
            'Reset all potentially compromised credentials',
            'Contact law enforcement if data breach suspected',
            'Notify stakeholders and customers as required'
          ]
        };

      case 'HIGH':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-950/30',
          borderColor: 'border-red-900/50',
          icon: <Shield className="h-4 w-4" />,
          title: 'High Risk Security Events',
          description: hasExternalIPs && hasFailedLogins 
            ? 'Suspicious authentication patterns detected from external sources. While not definitively compromised, these events require urgent investigation to prevent potential breach.'
            : 'High-risk security activities detected that could indicate attack preparation or reconnaissance. Prompt investigation recommended.',
          actions: [
            'Investigate all flagged events within 2 hours',
            'Verify legitimacy of all external access attempts',
            'Enable enhanced monitoring for affected accounts',
            'Consider temporary access restrictions',
            'Review recent privilege changes',
            'Prepare incident response procedures'
          ]
        };

      case 'MEDIUM':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-950/30',
          borderColor: 'border-yellow-900/50',
          icon: <FileText className="h-4 w-4" />,
          title: 'Security Events Requiring Review',
          description: hasFailedLogins && hasRootActivity
            ? 'Failed authentication attempts and administrative activities detected, but analysis shows no correlation between events. While not immediately threatening, these warrant routine security review.'
            : 'Moderate security events detected. These appear to be isolated incidents but should be reviewed as part of regular security monitoring.',
          actions: [
            'Review events during next security check (within 24 hours)',
            'Verify administrative activities were authorized',
            'Monitor for repeat failed authentication attempts',
            'Update security monitoring rules if needed',
            'Document events for trend analysis',
            'Consider additional MFA enforcement'
          ]
        };

      case 'LOW':
      default:
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-950/30',
          borderColor: 'border-green-900/50',
          icon: <CheckCircle className="h-4 w-4" />,
          title: 'System Operating Normally',
          description: 'Security monitoring is active and no significant threats detected. All flagged events appear to be routine operations or isolated minor incidents with no indication of malicious activity.',
          actions: [
            'Continue standard security monitoring',
            'Review logs during regular security audits',
            'Maintain current security policies',
            'Consider security awareness training updates',
            'Document baseline activity patterns',
            'Schedule next security assessment'
          ]
        };
    }
  }

  function renderWhyCareSection(riskLevel: string, criticalLogs: any[]) {
    const content = getWhyCareContent(riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', criticalLogs);
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-3 text-zinc-300 space-y-3"
      >
        <div className={`${content.bgColor} border ${content.borderColor} rounded-lg p-4`}>
          <h3 className={`${content.color} font-medium mb-2 flex items-center`}>
            <span className="mr-2">{content.icon}</span>
            {content.title}
          </h3>
          <p className="text-zinc-300 mb-4">
            {content.description}
          </p>
        </div>

        <div className="bg-zinc-800/70 rounded-lg p-4 space-y-2">
          <h3 className="text-white font-medium">
            {riskLevel === 'CRITICAL' ? 'Immediate Actions Required:' : 
             riskLevel === 'HIGH' ? 'Urgent Actions Recommended:' :
             riskLevel === 'MEDIUM' ? 'Recommended Actions:' : 
             'Suggested Actions:'}
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-zinc-300">
            {content.actions.map((action, index) => (
              <li key={index} className={riskLevel === 'CRITICAL' ? 'font-medium' : ''}>
                {action}
              </li>
            ))}
          </ul>
        </div>

        {/* Additional context for specific scenarios */}
        {riskLevel === 'MEDIUM' && criticalLogs.some(log => log.vertexLog?.event === 'login_failed') && (
          <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3">
            <h4 className="text-blue-400 font-medium mb-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-2" />
              Context
            </h4>
            <p className="text-zinc-300 text-sm">
              The failed login attempt appears to be isolated and unrelated to other system activities. 
              This could be a legitimate user error, but monitoring for patterns is recommended.
            </p>
          </div>
        )}
      </motion.div>
    );
  }

  const firstLogDate = logLines.length > 0 ? logLines[0].timestamp : new Date().toISOString()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Logo />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
          <div className="md:col-span-6 lg:col-span-7 flex flex-col">
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-zinc-800/50 shadow-xl shadow-purple-900/5 flex flex-col h-[calc(100vh-140px)]">
              <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/90">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <h2 className="text-lg font-medium text-white">
                      {files && files.length > 0 ? files[0].name : "No file selected"}
                    </h2>
                    <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(riskLevel)} bg-current/10`}>
                      {riskLevel} RISK
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-800/70 border border-zinc-700/50 rounded-lg py-2 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 text-sm"
                      />
                    </div>
                    <button className="p-2 rounded-lg bg-zinc-800/70 text-zinc-400 hover:bg-zinc-700/50 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

             {/* Log Content */}
            <div className="flex-grow overflow-auto p-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
              <div className="font-mono text-sm">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="mb-0.5">
                    <div
                      className={`group px-3 py-1.5 border-l-2 ${
                        log.important
                          ? getSeverityColor(log.severity)
                          : "border-transparent hover:bg-zinc-800/40"
                      } transition-colors flex items-center`}
                    >
                      <button 
                        onClick={() => toggleExpand(log.id)}
                        className="mr-2 p-1 rounded hover:bg-zinc-700/50 transition-colors focus:outline-none"
                        aria-label={expandedLogs[log.id] ? "Collapse log details" : "Expand log details"}
                      >
                        {expandedLogs[log.id] ? 
                          <ChevronDown className="h-3 w-3 text-zinc-400" /> : 
                          <ChevronRight className="h-3 w-3 text-zinc-400" />
                        }
                      </button>
                      <span className="text-zinc-500 mr-4">{log.id.toString().padStart(3, "0")}</span>
                      <span className="text-zinc-400 mr-4">{formatTimestamp(log.timestamp)}</span>
                      <div className="flex items-center flex-grow">
                        <span className={log.important ? getSeverityTextColor(log.severity) : "text-zinc-300"}>
                          {log.content}
                        </span>
                        {log.important && (
                          <div className="ml-2 flex items-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getSeverityColor(log.severity)} text-current`}>
                              {log.severity?.toUpperCase()}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-xs bg-zinc-700 text-zinc-300">
                              {log.category?.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded Details View */}
                    {expandedLogs[log.id] && (
                      <div className="ml-12 px-3 py-3 bg-zinc-800/50 border-l-2 border-zinc-700 my-1 rounded-r-md overflow-x-auto relative">
                        <button
                          onClick={() => toggleExpand(log.id)} 
                          className="absolute right-2 top-2 p-1 rounded-full hover:bg-zinc-700/70 transition-colors"
                          aria-label="Close details"
                        >
                          <X className="h-3 w-3 text-zinc-500" />
                        </button>
                        <div className="mb-2">
                          <h4 className="text-sm font-medium text-white mb-1">Event Details</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-zinc-400">Event:</span> <span className="text-white">{log.vertexLog.event}</span></div>
                            <div><span className="text-zinc-400">Severity:</span> <span className={getSeverityTextColor(log.severity)}>{log.severity}</span></div>
                            <div><span className="text-zinc-400">Category:</span> <span className="text-zinc-300">{log.category}</span></div>
                            <div><span className="text-zinc-400">User:</span> <span className="text-white">{log.vertexLog.user}</span></div>
                          </div>
                        </div>
                        <h4 className="text-sm font-medium text-white mb-1">Raw Data</h4>
                        <pre className="text-xs text-zinc-300 whitespace-pre-wrap">
                          {formatJsonForDisplay(log.rawData)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

              {/* Log Footer */}
              <div className="p-3 border-t border-zinc-800/50 bg-zinc-900/90 text-xs text-zinc-500 flex justify-between items-center">
                <div>
                  Showing {filteredLogs.length} of {logLines.length} lines • {logLines.filter(log => log.important).length} critical events
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Last updated: 2 minutes ago</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Narrative (Right Side) */}
          <div className="md:col-span-6 lg:col-span-5">
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800/50 shadow-xl shadow-purple-900/5 p-6 h-[calc(100vh-140px)] flex flex-col">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-purple-300">
                    Security Analysis
                  </h1>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(riskLevel)} bg-current/10`}>
                    {riskLevel} RISK
                  </div>
                </div>
                <p className="text-zinc-400">
                  {formatDate(firstLogDate)} • {filteredLogs.length} events analyzed
                </p>
              </div>

              <div className="flex-grow overflow-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {/* What Happened Section */}
                <div className="mb-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("what-happened")}
                  >
                    <h2 className="text-lg font-semibold text-white">What Happened</h2>
                    {expandedSection === "what-happened" ? (
                      <ChevronUp className="h-5 w-5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-500" />
                    )}
                  </div>
                  {expandedSection === "what-happened" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 text-zinc-300 space-y-3"
                    >
                      <div className="whitespace-pre-line">
                        {renderMarkdown(narrative || "Analysis in progress...")}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Timeline Section */}
                <div className="mb-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("timeline")}
                  >
                    <h2 className="text-lg font-semibold text-white">Event Timeline</h2>
                    {expandedSection === "timeline" ? (
                      <ChevronUp className="h-5 w-5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-500" />
                    )}
                  </div>
                  {expandedSection === "timeline" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3"
                    >
                      <div className="pl-2 border-l border-zinc-700 space-y-3">
                        {logLines.filter(log => log.important).slice(0, 10).map((log, idx) => (
                          <div key={idx} className="relative">
                            <div className={`absolute left-[-9px] top-2 w-4 h-4 rounded-full ${getSeverityBgColor(log.severity)}`}></div>
                            <div className="pl-4">
                              <div className="flex items-center gap-2">
                                <p className="text-zinc-400 text-xs">{formatTimestamp(log.timestamp)}</p>
                                <span className={`px-1.5 py-0.5 rounded text-xs ${getSeverityColor(log.severity)}`}>
                                  {log.severity?.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-zinc-300 text-sm mt-1">{getHumanReadableDescription(log)}</p>
                            </div>
                          </div>
                        ))}
                        {logLines.filter(log => log.important).length === 0 && (
                          <div className="pl-4">
                            <p className="text-zinc-400 text-sm">No critical events found in timeline</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Why You Should Care Section */}
                <div className="mb-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("why-care")}
                  >
                    <h2 className="text-lg font-semibold text-white">Why You Should Care</h2>
                    {expandedSection === "why-care" ? (
                      <ChevronUp className="h-5 w-5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-500" />
                    )}
                  </div>
                  {expandedSection === "why-care" && renderWhyCareSection(riskLevel, logLines.filter(log => log.important))}
                </div>

                {/* Related Incidents Section */}
                <div>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("recommendations")}
                  >
                    <h2 className="text-lg font-semibold text-white">Related Incidents</h2>
                    {expandedSection === "recommendations" ? (
                      <ChevronUp className="h-5 w-5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-500" />
                    )}
                  </div>
                  {expandedSection === "recommendations" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 space-y-3"
                    >
                      <div className="bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-medium">Similar patterns in previous logs</h3>
                            <p className="text-zinc-400 text-sm mt-1">Last week • View analysis</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-zinc-500" />
                        </div>
                      </div>

                      <div className="bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-medium">Security best practices</h3>
                            <p className="text-zinc-400 text-sm mt-1">Documentation • Updated recently</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-zinc-500" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center text-xs text-zinc-500">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-2" />
                  <span>Generated just now</span>
                </div>
                <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Return to dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}