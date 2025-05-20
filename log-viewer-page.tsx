"use client"

import Logo from '@/Logo';
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, AlertCircle, ChevronDown, ChevronUp, Search, Download, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useAnalysisStore } from '@/lib/store'
import { normalize, humanize, type VertexLog } from '@/lib/normalize';
import { highlight } from '@/lib/highlight'

export default function LogNarrativePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("what-happened")
  const [searchTerm, setSearchTerm] = useState("")
  const [showTimeline, setShowTimeline] = useState(true)
  const [logLines, setLogLines] = useState<any[]>([])
  const { files } = useAnalysisStore()
  

  
  // Load and process log file
  useEffect(() => {
    // Update the loadLogFile function in log-viewer-page.tsx
    const loadLogFile = async () => {
      if (!files || files.length === 0) return
      
      try {
        // Read the file content
        const file = files[0] as File
        const fileContent = await file.text()
        
        // Parse the JSON
        const parsedData = JSON.parse(fileContent)
        
        // Handle the CloudTrail format which has a "Records" property containing the array of log entries
        const records = parsedData.Records || parsedData
        
        // Make sure we're dealing with an array
        const recordsArray = Array.isArray(records) ? records : [records]
        
        console.log("Raw data format:", parsedData)
        console.log("Records to process:", recordsArray.length)
        
        // Use normalize utility to convert to standard format
        const normalizedLogs = normalize(recordsArray)
        
        // Use highlight utility to identify important logs
        const criticalIndices = highlight(normalizedLogs)
        
        // Convert to the format expected by the UI
        const formattedLogs = normalizedLogs.map((log, index) => ({
          id: index + 1,
          timestamp: log.timestamp,
          content: `${log.user || 'Unknown user'} from ${log.ip || 'unknown IP'} - ${log.event}${log.detail ? ': ' + log.detail : ''}`,
          important: criticalIndices.includes(index)
        }))
        
        console.log("Normalized logs:", normalizedLogs.length)
        console.log("First log:", normalizedLogs[0])
        
        setLogLines(formattedLogs)
      } catch (error) {
        console.error('Error loading log file:', error)
        // Keep existing logs if there's an error
      }
    }

    loadLogFile()
  }, [files])

  // Filter logs based on search term
  const filteredLogs = logLines.filter(
    (log) => searchTerm === "" || log.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  // Format date for display
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  // Get the first log date for the header
  const firstLogDate = logLines.length > 0 ? logLines[0].timestamp : new Date().toISOString()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-2xl font-light tracking-wider">
            <span className="font-semibold">Vertex</span>
          </h1>
        </div>
      </div>
      
      
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
          {/* Log Display (Left Side) */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col">
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-zinc-800/50 shadow-xl shadow-purple-900/5 flex flex-col h-[calc(100vh-140px)]">
              {/* Log Header with Search */}
              <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/90">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <h2 className="text-lg font-medium text-white">
                      {files && files.length > 0 ? files[0].name : "No file selected"}
                    </h2>
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
                    <div
                      key={log.id}
                      className={`px-3 py-1.5 border-l-2 ${
                        log.important
                          ? "border-green-500 bg-green-500/10 hover:bg-green-500/15"
                          : "border-transparent hover:bg-zinc-800/40"
                      } transition-colors`}
                    >
                      <span className="text-zinc-500 mr-4">{log.id.toString().padStart(3, "0")}</span>
                      <span className="text-zinc-400 mr-4">{formatTimestamp(log.timestamp)}</span>
                      <span className={log.important ? "text-green-300" : "text-zinc-300"}>{log.content}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Log Footer */}
              <div className="p-3 border-t border-zinc-800/50 bg-zinc-900/90 text-xs text-zinc-500 flex justify-between items-center">
                <div>
                  Showing {filteredLogs.length} of {logLines.length} lines
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
                <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                  Log Narrative
                </h1>
                <p className="text-zinc-400">
                  {formatDate(firstLogDate)} • {filteredLogs.length} events
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
                      <p>
                        {logLines.filter(log => log.important).length > 0 ? (
                          <>A <span className="text-purple-400 font-medium">security event</span> was detected in your logs. 
                          There are {logLines.filter(log => log.important).length} important events that require attention.</>
                        ) : (
                          <>No critical security events were detected in the analyzed logs.</>
                        )}
                      </p>
                      {logLines.filter(log => log.important).length > 0 && (
                        <p>
                          The logs show potential security concerns that should be reviewed by your security team.
                          These include failed login attempts and potential access violations.
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* When It Happened Section */}
                <div className="mb-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("when-happened")}
                  >
                    <h2 className="text-lg font-semibold text-white">When It Happened</h2>
                    {expandedSection === "when-happened" ? (
                      <ChevronUp className="h-5 w-5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-500" />
                    )}
                  </div>
                  {expandedSection === "when-happened" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3"
                    >
                      <div className="text-zinc-300 mb-3">
                        <p>
                          The analyzed logs are from <span className="text-white font-medium">{formatDate(firstLogDate)}</span>.
                        </p>
                      </div>

                      {/* Timeline */}
                      <div className="mt-4">
                        <div
                          className="flex items-center justify-between cursor-pointer mb-2"
                          onClick={() => setShowTimeline(!showTimeline)}
                        >
                          <h3 className="text-sm font-medium text-zinc-400">Timeline</h3>
                          {showTimeline ? (
                            <ChevronUp className="h-4 w-4 text-zinc-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-zinc-500" />
                          )}
                        </div>

                        {showTimeline && (
                          <div className="pl-2 border-l border-zinc-700 space-y-3">
                            {logLines.filter(log => log.important).slice(0, 8).map((log, idx) => (
                              <div key={idx} className="relative">
                                <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-purple-500"></div>
                                <div className="pl-4">
                                  <p className="text-zinc-400 text-xs">{formatTimestamp(log.timestamp)}</p>
                                  <p className="text-zinc-300 text-sm">{humanize(log)}</p>
                                </div>
                              </div>
                            ))}
                            {logLines.filter(log => log.important).length === 0 && (
                              <div className="pl-4">
                                <p className="text-zinc-400 text-sm">No critical events found in timeline</p>
                              </div>
                            )}
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
                  {expandedSection === "why-care" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 text-zinc-300 space-y-3"
                    >
                      {logLines.filter(log => log.important).length > 0 ? (
                        <>
                          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4">
                            <h3 className="text-red-400 font-medium mb-2 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Security Risk Detected
                            </h3>
                            <p className="text-zinc-300">
                              The log analysis shows potential security concerns that require attention. 
                              These patterns may indicate unauthorized access attempts to your systems.
                            </p>
                          </div>

                          <div className="bg-zinc-800/70 rounded-lg p-4 space-y-2">
                            <h3 className="text-white font-medium">Recommended Actions:</h3>
                            <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                              <li>Review all successful logins from unusual locations</li>
                              <li>Enforce multi-factor authentication for all users</li>
                              <li>Consider implementing IP-based access controls</li>
                              <li>Check for any data exfiltration from compromised accounts</li>
                              <li>Update your security incident response plan</li>
                            </ul>
                          </div>
                        </>
                      ) : (
                        <p>
                          No critical security events were detected in the logs. Continue monitoring for any unusual activities.
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Related Incidents Section */}
                <div>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("related")}
                  >
                    <h2 className="text-lg font-semibold text-white">Related Incidents</h2>
                    {expandedSection === "related" ? (
                      <ChevronUp className="h-5 w-5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-500" />
                    )}
                  </div>
                  {expandedSection === "related" && (
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