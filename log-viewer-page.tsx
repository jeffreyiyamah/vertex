"use client"

import Logo from '@/Logo';
import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, AlertCircle, ChevronDown, ChevronUp, Search, Download, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function LogNarrativePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("what-happened")
  const [searchTerm, setSearchTerm] = useState("")
  const [showTimeline, setShowTimeline] = useState(true)

  // Sample log data with importance flags
  const logLines = [
    {
      id: 1,
      timestamp: "2025-04-14T08:00:00Z",
      content: "System startup completed successfully",
      important: false,
    },
    {
      id: 2,
      timestamp: "2025-04-14T08:01:15Z",
      content: "User bob@example.com logged in from 192.168.1.20 (London, UK)",
      important: false,
    },
    {
      id: 3,
      timestamp: "2025-04-14T08:02:34Z",
      content:
        "Failed login attempt for charlie@example.com from 192.168.1.30 (Sydney, Australia) - Invalid credentials",
      important: true,
    },
    {
      id: 4,
      timestamp: "2025-04-14T08:03:45Z",
      content: "User dana@example.com logged in from 192.168.1.40 (Berlin, Germany)",
      important: false,
    },
    {
      id: 5,
      timestamp: "2025-04-14T08:04:56Z",
      content: "User erin@example.com logged in from 192.168.1.50 (Tokyo, Japan)",
      important: false,
    },
    {
      id: 6,
      timestamp: "2025-04-14T08:06:05Z",
      content: "User fred@example.com logged in from 192.168.1.60 (Paris, France)",
      important: false,
    },
    {
      id: 7,
      timestamp: "2025-04-14T08:07:15Z",
      content: "Failed login attempt for gina@example.com from 192.168.1.70 (Toronto, Canada) - Password expired",
      important: true,
    },
    {
      id: 8,
      timestamp: "2025-04-14T08:08:30Z",
      content: "User harry@example.com logged in from 192.168.1.80 (Dublin, Ireland)",
      important: false,
    },
    {
      id: 9,
      timestamp: "2025-04-14T08:09:45Z",
      content: "User irene@example.com logged in from 192.168.1.90 (Madrid, Spain)",
      important: false,
    },
    {
      id: 10,
      timestamp: "2025-04-14T08:10:55Z",
      content: "User jack@example.com logged in from 192.168.1.100 (San Francisco, USA)",
      important: false,
    },
    {
      id: 11,
      timestamp: "2025-04-14T08:12:05Z",
      content: "Failed login attempt for kate@example.com from 192.168.1.110 (Amsterdam, Netherlands) - MFA required",
      important: true,
    },
    {
      id: 12,
      timestamp: "2025-04-14T08:13:20Z",
      content: "User leo@example.com logged in from 192.168.1.120 (Rome, Italy)",
      important: false,
    },
    {
      id: 13,
      timestamp: "2025-04-14T08:14:35Z",
      content: "User mia@example.com logged in from 192.168.1.130 (Vienna, Austria)",
      important: false,
    },
    {
      id: 14,
      timestamp: "2025-04-14T08:15:50Z",
      content: "User nick@example.com logged in from 192.168.1.140 (Zurich, Switzerland)",
      important: false,
    },
    {
      id: 15,
      timestamp: "2025-04-14T08:17:00Z",
      content: "Failed login attempt for olivia@example.com from 192.168.1.150 (Stockholm, Sweden) - Account locked",
      important: true,
    },
    {
      id: 16,
      timestamp: "2025-04-14T08:18:10Z",
      content: "User peter@example.com logged in from 192.168.1.160 (Brussels, Belgium)",
      important: false,
    },
    {
      id: 17,
      timestamp: "2025-04-14T08:19:25Z",
      content: "Failed login attempt for quincy@example.com from 192.168.1.170 (Moscow, Russia) - Invalid credentials",
      important: true,
    },
    {
      id: 18,
      timestamp: "2025-04-14T08:20:40Z",
      content: "User rachel@example.com logged in from 192.168.1.180 (Paris, France)",
      important: false,
    },
    {
      id: 19,
      timestamp: "2025-04-14T08:21:55Z",
      content: "User sam@example.com logged in from 192.168.1.190 (New York, USA)",
      important: false,
    },
    {
      id: 20,
      timestamp: "2025-04-14T08:23:05Z",
      content: "Failed login attempt for tina@example.com from 192.168.1.200 (London, UK) - MFA required",
      important: true,
    },
    {
      id: 21,
      timestamp: "2025-04-14T08:24:15Z",
      content: "User umar@example.com logged in from 192.168.1.210 (Sydney, Australia)",
      important: false,
    },
    {
      id: 22,
      timestamp: "2025-04-14T08:25:30Z",
      content: "User vicki@example.com logged in from 192.168.1.220 (Berlin, Germany)",
      important: false,
    },
    {
      id: 23,
      timestamp: "2025-04-14T08:30:10Z",
      content: "Multiple failed login attempts detected from 192.168.1.170 (Moscow, Russia)",
      important: true,
    },
    {
      id: 24,
      timestamp: "2025-04-14T08:32:45Z",
      content: "IP 192.168.1.170 temporarily blocked due to suspicious activity",
      important: true,
    },
    {
      id: 25,
      timestamp: "2025-04-14T08:35:22Z",
      content: "Security alert: Possible brute force attack detected from 192.168.1.170",
      important: true,
    },
  ]

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
                    <h2 className="text-lg font-medium text-white">auth_logs_2025-04-14.json</h2>
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
                  {formatDate(logLines[0].timestamp)} • {filteredLogs.length} events
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
                        A <span className="text-purple-400 font-medium">potential brute force attack</span> was detected
                        from IP address 192.168.1.170 (Moscow, Russia). The attack consisted of multiple failed login
                        attempts over a 30-minute period.
                      </p>
                      <p>
                        The system detected 6 failed login attempts, including 2 with invalid credentials, 2 requiring
                        MFA, 1 with an expired password, and 1 with a locked account. The suspicious IP was temporarily
                        blocked after multiple failures.
                      </p>
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
                          The incident occurred on <span className="text-white font-medium">April 14, 2025</span>,
                          between 08:02 AM and 08:35 AM UTC.
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
                            <div className="relative">
                              <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-purple-500"></div>
                              <div className="pl-4">
                                <p className="text-zinc-400 text-xs">08:02 AM</p>
                                <p className="text-zinc-300 text-sm">
                                  First failed login attempt (charlie@example.com)
                                </p>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-zinc-600"></div>
                              <div className="pl-4">
                                <p className="text-zinc-400 text-xs">08:07 AM</p>
                                <p className="text-zinc-300 text-sm">Failed login with expired password</p>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-zinc-600"></div>
                              <div className="pl-4">
                                <p className="text-zinc-400 text-xs">08:12 AM</p>
                                <p className="text-zinc-300 text-sm">Failed login requiring MFA</p>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-zinc-600"></div>
                              <div className="pl-4">
                                <p className="text-zinc-400 text-xs">08:17 AM</p>
                                <p className="text-zinc-300 text-sm">Failed login with locked account</p>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-zinc-600"></div>
                              <div className="pl-4">
                                <p className="text-zinc-400 text-xs">08:19 AM</p>
                                <p className="text-zinc-300 text-sm">
                                  Failed login from Moscow IP (invalid credentials)
                                </p>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-purple-500"></div>
                              <div className="pl-4">
                                <p className="text-zinc-400 text-xs">08:30 AM</p>
                                <p className="text-zinc-300 text-sm">Multiple failed logins detected from Moscow IP</p>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-purple-500"></div>
                              <div className="pl-4">
                                <p className="text-zinc-400 text-xs">08:32 AM</p>
                                <p className="text-zinc-300 text-sm">IP 192.168.1.170 temporarily blocked</p>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-red-500"></div>
                              <div className="pl-4">
                                <p className="text-zinc-400 text-xs">08:35 AM</p>
                                <p className="text-zinc-300 text-sm">Security alert: Possible brute force attack</p>
                              </div>
                            </div>
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
                      <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4">
                        <h3 className="text-red-400 font-medium mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          High Security Risk
                        </h3>
                        <p className="text-zinc-300">
                          Brute force attacks are systematic attempts to gain unauthorized access by trying multiple
                          password combinations. This incident suggests a targeted attempt to breach your system.
                        </p>
                      </div>

                      <p>
                        While the system automatically blocked the suspicious IP, this could be part of a larger attack
                        campaign. The attacker attempted to access multiple user accounts, suggesting they may have a
                        list of valid email addresses from your organization.
                      </p>

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
                            <h3 className="text-white font-medium">Similar attack pattern detected last week</h3>
                            <p className="text-zinc-400 text-sm mt-1">April 7, 2025 • 12 events</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-zinc-500" />
                        </div>
                      </div>

                      <div className="bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-medium">Global increase in brute force attempts</h3>
                            <p className="text-zinc-400 text-sm mt-1">Security Advisory • April 10, 2025</p>
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
                  <span>Generated 5 minutes ago</span>
                </div>
                <Link href="/results" className="text-purple-400 hover:text-purple-300 transition-colors">
                  View full analysis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
