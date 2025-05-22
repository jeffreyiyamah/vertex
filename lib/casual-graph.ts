// lib/causal-graph.ts
import { VertexLog } from './normalize'

export interface CausalNode {
  id: string
  event: VertexLog
  timestamp: Date
}

export interface CausalEdge {
  from: string  // node id
  to: string    // node id
  relationship: 'temporal' | 'actor' | 'resource' | 'privilege_escalation'
  confidence: number // 0-1
}

export class CausalGraph {
  private nodes: Map<string, CausalNode> = new Map()
  private edges: CausalEdge[] = []
  
  constructor(events: VertexLog[]) {
    this.buildNodes(events)
    this.buildEdges()
  }
  
  private buildNodes(events: VertexLog[]): void {
  events.forEach((vertexLog, index) => {
    const node: CausalNode = {
      id: `node_${index}`,
      event: vertexLog,
      timestamp: new Date(vertexLog.timestamp)
    }
    this.nodes.set(node.id, node)
  })
}

private buildEdges(): void {
  const nodeArray = Array.from(this.nodes.values())
  
  // Sort nodes by timestamp for temporal analysis
  nodeArray.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  
  for (let i = 0; i < nodeArray.length - 1; i++) {
    const currentNode = nodeArray[i]
    const nextNode = nodeArray[i + 1]
    
    // Check for relationships
    const edge = this.detectRelationship(currentNode, nextNode)
    if (edge) {
      this.edges.push(edge)
    }
  }
}

private detectRelationship(nodeA: CausalNode, nodeB: CausalNode): CausalEdge | null {
  const timeDiffMinutes = (nodeB.timestamp.getTime() - nodeA.timestamp.getTime()) / (1000 * 60)
  
  // Only look at events close in time (within 60 minutes)
  if (timeDiffMinutes > 60) {
    return null
  }
  
  // Same actor doing multiple actions
  if (nodeA.event.user === nodeB.event.user && nodeA.event.user !== '') {
    return {
      from: nodeA.id,
      to: nodeB.id,
      relationship: 'actor',
      confidence: 0.7
    }
  }
  
  // Failed login followed by root action (CRITICAL)
  if (nodeA.event.event === 'login_failed' && 
    (nodeB.event.user === 'root' || nodeB.event.user === '') && 
    timeDiffMinutes < 10) {
      return {
        from: nodeA.id,
        to: nodeB.id,
        relationship: 'privilege_escalation',
        confidence: 0.95
      }
  }
  
  // Temporal sequence (events close in time)
  if (timeDiffMinutes < 30) {
    return {
      from: nodeA.id,
      to: nodeB.id,
      relationship: 'temporal',
      confidence: 0.6
    }
  }
  
  return null
}
public getAttackChains(): CausalEdge[] {
  return this.edges.filter(edge => 
    edge.relationship === 'privilege_escalation' || 
    edge.confidence > 0.8
  )
}

private static ENHANCED_NARRATIVE_TEMPLATES = {
  privilege_escalation: (from: CausalNode, to: CausalNode, timeDiff: string, context: string, insights: string[]) => {
    const baseNarrative = `**Privilege escalation attack detected**: ${from.event.user || 'External user'} failed authentication from ${from.event.ip}, immediately followed by root account activation from ${to.event.ip || 'internal network'}.`
    
    const implications = [
      `This pattern indicates ${context.toLowerCase() || 'credential compromise or insider threat'}.`,
      `The ${timeDiff} gap suggests automated or pre-planned escalation.`,
      ...insights.map(insight => insight + '.')
    ]
    
    const riskAssessment = `**Risk Level: CRITICAL** - Root access compromised, immediate investigation required.`
    
    return `${baseNarrative} ${implications.join(' ')} ${riskAssessment}`
  }
}

private static formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

private getTimeDifference(nodeA: CausalNode, nodeB: CausalNode): string {
  const diffMinutes = Math.round((nodeB.timestamp.getTime() - nodeA.timestamp.getTime()) / 60000)
  
  if (diffMinutes < 1) return 'immediately'
  if (diffMinutes === 1) return '1 minute'
  if (diffMinutes < 60) return `${diffMinutes} minute`
  
  const hours = Math.floor(diffMinutes / 60)
  const remainingMinutes = diffMinutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hours`
}

public generateNarrative(): string {
  const attackChains = this.getAttackChains()
  
  if (attackChains.length === 0) {
    return "No significant security patterns detected in the analyzed logs."
  }
  
  const narratives: string[] = []
  
  attackChains.forEach(chain => {
    const fromNode = this.nodes.get(chain.from)!
    const toNode = this.nodes.get(chain.to)!
    const timeDiff = this.getTimeDifference(fromNode, toNode)
    
    if (chain.relationship === 'privilege_escalation') {
      const context = this.analyzeIPContext(fromNode, toNode)
      const insights = this.findRelatedEvents(chain)
      const template = CausalGraph.ENHANCED_NARRATIVE_TEMPLATES.privilege_escalation
      
      narratives.push(template(fromNode, toNode, timeDiff, context, insights))
    }
  })
  
  return narratives.join(' ')
}

private analyzeIPContext(nodeA: CausalNode, nodeB: CausalNode): string {
  const fromIP = nodeA.event.ip
  const toIP = nodeB.event.ip
  
  if (this.isExternalIP(fromIP) && this.isInternalIP(toIP)) {
    return "External attack followed by internal privilege escalation"
  }
  if (fromIP === toIP) {
    return "Same source executing coordinated actions"
  }
  return ""
}

private isExternalIP(ip: string): boolean {
  // Simple check - you could make this more sophisticated
  return !ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.startsWith('172.')
}

private isInternalIP(ip: string): boolean {
  return ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')
}

private findRelatedEvents(attackChain: CausalEdge): string[] {
  const insights: string[] = []
  const allNodes = this.getNodes()
  
  // Find if same IP appears in other events
  const attackerIP = this.nodes.get(attackChain.from)?.event.ip
  if (attackerIP) {
    const relatedEvents = allNodes.filter(node => 
      node.event.ip.startsWith(attackerIP.split('.').slice(0, 3).join('.')) && // Same network
      node.id !== attackChain.from
    )
    
    if (relatedEvents.length > 0) {
      insights.push(`Network access was subsequently granted to ${attackerIP.split('.').slice(0, 3).join('.')}.x range`)
    }
  }
  
  return insights
}


  // Getter for testing
  getNodes(): CausalNode[] {
    return Array.from(this.nodes.values())
  }
  // Add this getter for testing
  getEdges(): CausalEdge[] {
    return this.edges
  }
}