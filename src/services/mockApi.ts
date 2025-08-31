import { nanoid } from 'nanoid';

export interface Swarm {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  agentCount: number;
  configuration: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingData {
  id: string;
  name: string;
  type: 'dataset' | 'model' | 'config';
  size: number;
  status: 'ready' | 'processing' | 'error';
  uploadedAt: string;
  version: string;
}

export interface EventTrigger {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    type: string;
    params: Record<string, any>;
  }>;
  lastTriggered?: string;
}

export interface AgentDecision {
  id: string;
  agentId: string;
  timestamp: string;
  decision: string;
  confidence: number;
  reasoning: string;
  input: Record<string, any>;
  output: Record<string, any>;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  source: string;
  message: string;
  details?: Record<string, any>;
}

class MockAPI {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  private swarms: Swarm[] = [
    {
      id: '1',
      name: 'Production Swarm',
      description: 'Main production swarm for processing',
      status: 'active',
      agentCount: 12,
      configuration: { maxAgents: 20, timeout: 30000 },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
    },
    {
      id: '2',
      name: 'Development Swarm',
      description: 'Development and testing swarm',
      status: 'inactive',
      agentCount: 5,
      configuration: { maxAgents: 10, timeout: 15000 },
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-18T12:00:00Z',
    },
  ];

  private trainingData: TrainingData[] = [
    {
      id: '1',
      name: 'dataset_v1.json',
      type: 'dataset',
      size: 1024000,
      status: 'ready',
      uploadedAt: '2024-01-20T10:00:00Z',
      version: '1.0.0',
    },
    {
      id: '2',
      name: 'model_weights.pkl',
      type: 'model',
      size: 5242880,
      status: 'processing',
      uploadedAt: '2024-01-19T14:30:00Z',
      version: '2.1.0',
    },
  ];

  private eventTriggers: EventTrigger[] = [
    {
      id: '1',
      name: 'High Load Alert',
      description: 'Trigger when system load exceeds threshold',
      enabled: true,
      conditions: [
        { field: 'cpu_usage', operator: '>', value: 80 },
      ],
      actions: [
        { type: 'alert', params: { channel: 'email' } },
      ],
      lastTriggered: '2024-01-20T12:00:00Z',
    },
  ];

  private decisions: AgentDecision[] = [
    {
      id: '1',
      agentId: 'agent-001',
      timestamp: '2024-01-20T15:30:00Z',
      decision: 'APPROVE',
      confidence: 0.95,
      reasoning: 'All validation checks passed. Risk score below threshold.',
      input: { request: 'process_data', riskScore: 0.2, dataSize: 1024 },
      output: { status: 'approved', processingTime: 234 },
    },
    {
      id: '2',
      agentId: 'agent-002',
      timestamp: '2024-01-20T15:31:00Z',
      decision: 'REJECT',
      confidence: 0.88,
      reasoning: 'Insufficient data quality. Missing required fields.',
      input: { request: 'validate_input', dataQuality: 0.4 },
      output: { status: 'rejected', errors: ['missing_field_x', 'invalid_format_y'] },
    },
    {
      id: '3',
      agentId: 'agent-001',
      timestamp: '2024-01-20T15:32:00Z',
      decision: 'ESCALATE',
      confidence: 0.67,
      reasoning: 'Confidence below threshold. Human review required.',
      input: { request: 'complex_analysis', complexity: 0.9 },
      output: { status: 'escalated', escalationReason: 'low_confidence' },
    },
    {
      id: '4',
      agentId: 'agent-003',
      timestamp: '2024-01-20T15:33:00Z',
      decision: 'APPROVE',
      confidence: 0.92,
      reasoning: 'Pattern matches historical approvals.',
      input: { request: 'classify_document', documentType: 'invoice' },
      output: { status: 'approved', category: 'financial' },
    },
    {
      id: '5',
      agentId: 'agent-002',
      timestamp: '2024-01-20T15:34:00Z',
      decision: 'DEFER',
      confidence: 0.75,
      reasoning: 'Awaiting additional context from dependent service.',
      input: { request: 'process_transaction', amount: 5000 },
      output: { status: 'deferred', retryAfter: 300 },
    },
  ];

  private logs: SystemLog[] = [
    {
      id: '1',
      timestamp: '2024-01-20T16:00:00Z',
      level: 'info',
      source: 'SwarmManager',
      message: 'Swarm initialized successfully',
    },
    {
      id: '2',
      timestamp: '2024-01-20T16:01:00Z',
      level: 'warning',
      source: 'AgentMonitor',
      message: 'Agent response time exceeding threshold',
      details: { agentId: 'agent-003', responseTime: 5000 },
    },
  ];

  // Swarm APIs
  async getSwarms(): Promise<Swarm[]> {
    await this.delay(500);
    return [...this.swarms];
  }

  async getSwarm(id: string): Promise<Swarm | null> {
    await this.delay(300);
    return this.swarms.find(s => s.id === id) || null;
  }

  async createSwarm(data: Omit<Swarm, 'id' | 'createdAt' | 'updatedAt'>): Promise<Swarm> {
    await this.delay(800);
    const newSwarm: Swarm = {
      ...data,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.swarms.push(newSwarm);
    return newSwarm;
  }

  async updateSwarm(id: string, data: Partial<Swarm>): Promise<Swarm | null> {
    await this.delay(600);
    const index = this.swarms.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    this.swarms[index] = {
      ...this.swarms[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    return this.swarms[index];
  }

  async deleteSwarm(id: string): Promise<boolean> {
    await this.delay(500);
    const index = this.swarms.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.swarms.splice(index, 1);
    return true;
  }

  // Training Data APIs
  async getTrainingData(): Promise<TrainingData[]> {
    await this.delay(400);
    return [...this.trainingData];
  }

  async uploadTrainingData(file: File): Promise<TrainingData> {
    await this.delay(2000);
    const newData: TrainingData = {
      id: nanoid(),
      name: file.name,
      type: 'dataset',
      size: file.size,
      status: 'processing',
      uploadedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    this.trainingData.push(newData);
    
    // Simulate processing completion
    setTimeout(() => {
      const index = this.trainingData.findIndex(d => d.id === newData.id);
      if (index !== -1) {
        this.trainingData[index].status = 'ready';
      }
    }, 5000);
    
    return newData;
  }

  // Event Trigger APIs
  async getEventTriggers(): Promise<EventTrigger[]> {
    await this.delay(300);
    return [...this.eventTriggers];
  }

  async createEventTrigger(data: Omit<EventTrigger, 'id'>): Promise<EventTrigger> {
    await this.delay(500);
    const newTrigger: EventTrigger = {
      ...data,
      id: nanoid(),
    };
    this.eventTriggers.push(newTrigger);
    return newTrigger;
  }

  async updateEventTrigger(id: string, data: Partial<EventTrigger>): Promise<EventTrigger | null> {
    await this.delay(400);
    const index = this.eventTriggers.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    this.eventTriggers[index] = {
      ...this.eventTriggers[index],
      ...data,
      id,
    };
    return this.eventTriggers[index];
  }

  // Agent Decision APIs
  async getAgentDecisions(filters?: { agentId?: string; startDate?: string; endDate?: string }): Promise<AgentDecision[]> {
    await this.delay(400);
    
    // Generate some random new decisions occasionally
    if (Math.random() > 0.8 && this.decisions.length < 50) {
      const agents = ['agent-001', 'agent-002', 'agent-003', 'agent-004'];
      const decisions = ['APPROVE', 'REJECT', 'ESCALATE', 'DEFER'];
      const newDecision: AgentDecision = {
        id: nanoid(),
        agentId: agents[Math.floor(Math.random() * agents.length)],
        timestamp: new Date().toISOString(),
        decision: decisions[Math.floor(Math.random() * decisions.length)],
        confidence: 0.5 + Math.random() * 0.5,
        reasoning: 'Automated decision based on pattern analysis.',
        input: { 
          request: 'auto_process',
          score: Math.random(),
          priority: Math.floor(Math.random() * 5) + 1,
        },
        output: { 
          status: 'processed',
          duration: Math.floor(Math.random() * 1000) + 100,
        },
      };
      this.decisions.unshift(newDecision);
    }
    
    let results = [...this.decisions];
    
    if (filters?.agentId) {
      results = results.filter(d => d.agentId === filters.agentId);
    }
    
    if (filters?.startDate) {
      results = results.filter(d => new Date(d.timestamp) >= new Date(filters.startDate!));
    }
    
    if (filters?.endDate) {
      results = results.filter(d => new Date(d.timestamp) <= new Date(filters.endDate!));
    }
    
    return results.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  async getDecisionById(id: string): Promise<AgentDecision | null> {
    await this.delay(200);
    return this.decisions.find(d => d.id === id) || null;
  }
  
  async getDecisionStats() {
    await this.delay(300);
    const total = this.decisions.length;
    const approved = this.decisions.filter(d => d.decision === 'APPROVE').length;
    const rejected = this.decisions.filter(d => d.decision === 'REJECT').length;
    const escalated = this.decisions.filter(d => d.decision === 'ESCALATE').length;
    const deferred = this.decisions.filter(d => d.decision === 'DEFER').length;
    
    const avgConfidence = this.decisions.reduce((acc, d) => acc + d.confidence, 0) / total;
    
    const agentStats = this.decisions.reduce((acc, d) => {
      if (!acc[d.agentId]) {
        acc[d.agentId] = { total: 0, avgConfidence: 0, decisions: {} };
      }
      acc[d.agentId].total++;
      acc[d.agentId].avgConfidence += d.confidence;
      acc[d.agentId].decisions[d.decision] = (acc[d.agentId].decisions[d.decision] || 0) + 1;
      return acc;
    }, {} as Record<string, any>);
    
    Object.keys(agentStats).forEach(agentId => {
      agentStats[agentId].avgConfidence /= agentStats[agentId].total;
    });
    
    return {
      total,
      approved,
      rejected,
      escalated,
      deferred,
      avgConfidence,
      agentStats,
      hourlyDistribution: this.generateHourlyDistribution(),
      confidenceDistribution: this.generateConfidenceDistribution(),
    };
  }
  
  private generateHourlyDistribution() {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: Math.floor(Math.random() * 20) + 5,
    }));
  }
  
  private generateConfidenceDistribution() {
    return [
      { range: '0-20%', count: 2 },
      { range: '20-40%', count: 5 },
      { range: '40-60%', count: 8 },
      { range: '60-80%', count: 15 },
      { range: '80-100%', count: 25 },
    ];
  }

  // System Log APIs
  async getSystemLogs(filters?: { level?: string; source?: string; limit?: number }): Promise<SystemLog[]> {
    await this.delay(300);
    let results = [...this.logs];
    
    if (filters?.level) {
      results = results.filter(l => l.level === filters.level);
    }
    if (filters?.source) {
      results = results.filter(l => l.source === filters.source);
    }
    if (filters?.limit) {
      results = results.slice(0, filters.limit);
    }
    
    return results;
  }

  // Business Metrics API for Lead Management
  async getBusinessMetrics(_period: string = 'today') {
    await this.delay(600);
    
    const names = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emma Wilson', 'Robert Brown', 'Lisa Anderson'];
    const companies = ['TechCorp', 'Global Solutions', 'Innovate Inc', 'Future Systems', 'Digital Dynamics'];
    const statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won'];
    const agents = ['Agent Smith', 'Agent Johnson', 'Agent Williams', 'Agent Davis'];
    
    // Generate hot leads
    const hotLeads = Array.from({ length: 5 }, (_, i) => ({
      id: `lead-${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      company: companies[Math.floor(Math.random() * companies.length)],
      score: 70 + Math.floor(Math.random() * 30),
      status: statuses[Math.floor(Math.random() * 3) + 1],
      value: Math.floor(Math.random() * 50000) + 10000,
      assignedTo: agents[Math.floor(Math.random() * agents.length)],
    }));
    
    // Generate recent activity
    const activities = ['New lead captured', 'Lead contacted', 'Meeting scheduled', 'Proposal sent', 'Deal closed'];
    const recentActivity = Array.from({ length: 10 }, (_, i) => ({
      id: `activity-${i}`,
      time: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      activity: activities[Math.floor(Math.random() * activities.length)],
      details: `${names[Math.floor(Math.random() * names.length)]} from ${companies[Math.floor(Math.random() * companies.length)]}`,
      type: ['lead_created', 'lead_assigned', 'lead_contacted', 'lead_qualified', 'deal_won'][Math.floor(Math.random() * 5)],
    }));
    
    // Generate agent performance
    const agentPerformance = agents.map(agent => ({
      name: agent,
      leadsHandled: Math.floor(Math.random() * 50) + 20,
      dealsWon: Math.floor(Math.random() * 15) + 5,
      conversionRate: Math.floor(Math.random() * 30) + 15,
      revenue: Math.floor(Math.random() * 500000) + 100000,
    }));
    
    // Generate insurance agent stats
    const insuranceAgentNames = ['David Miller', 'Jessica Brown', 'Michael Davis', 'Emily Wilson', 'James Taylor'];
    const specialties = ['life', 'auto', 'home', 'health', 'business'];
    const insuranceAgentStats = insuranceAgentNames.slice(0, 5).map((name, i) => ({
      name,
      status: Math.random() > 0.3 ? 'online' : 'offline',
      specialty: specialties[i % specialties.length],
      activeLeads: Math.floor(Math.random() * 15) + 5,
      closedDeals: Math.floor(Math.random() * 10) + 2,
      conversionRate: Math.floor(Math.random() * 20) + 25,
    }));
    
    return {
      // Agent Swarm metrics
      activeSwarms: 3,
      totalSwarms: 5,
      prospectToLead: 42.5,
      leadToCustomer: 18.3,
      swarmEfficiency: 87,
      automationRate: 73,
      swarmAccuracy: 92,
      
      // Insurance Agent metrics
      insuranceAgents: 24,
      agentsOnline: 18,
      insuranceAgentStats,
      avgInsuranceConversion: 31.2,
      
      // Key metrics
      newLeadsToday: Math.floor(Math.random() * 30) + 15,
      leadGrowth: Math.floor(Math.random() * 20) + 5,
      qualifiedLeads: Math.floor(Math.random() * 20) + 10,
      totalLeads: Math.floor(Math.random() * 100) + 50,
      conversionRate: Math.floor(Math.random() * 15) + 15,
      pipelineValue: Math.floor(Math.random() * 1000000) + 500000,
      
      // Performance metrics
      avgResponseTime: Math.floor(Math.random() * 20) + 5,
      avgLeadScore: Math.floor(Math.random() * 30) + 60,
      followUpRate: Math.floor(Math.random() * 20) + 75,
      closeRate: Math.floor(Math.random() * 10) + 20,
      
      // Lists
      hotLeads,
      recentActivity,
      agentPerformance,
    };
  }
  
  // Dashboard Metrics API (keeping for backward compatibility)
  async getDashboardMetrics() {
    await this.delay(600);
    
    // Generate some dynamic logs
    if (Math.random() > 0.7) {
      const levels = ['info', 'warning', 'error', 'debug'] as const;
      const sources = ['SwarmManager', 'AgentMonitor', 'DataProcessor', 'EventHandler'];
      const messages = [
        'Processing completed successfully',
        'Agent response time exceeding threshold',
        'New configuration applied',
        'Cache cleared',
        'Connection established',
      ];
      
      this.logs.unshift({
        id: nanoid(),
        timestamp: new Date().toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
      });
      
      // Keep only last 100 logs
      if (this.logs.length > 100) {
        this.logs = this.logs.slice(0, 100);
      }
    }
    
    return {
      totalSwarms: this.swarms.length,
      activeSwarms: this.swarms.filter(s => s.status === 'active').length,
      totalAgents: this.swarms.reduce((acc, s) => acc + s.agentCount, 0),
      totalDecisions: Math.floor(Math.random() * 50) + 100,
      recentLogs: this.logs.slice(0, 5),
      systemHealth: {
        cpu: 30 + Math.random() * 40,
        memory: 40 + Math.random() * 30,
        network: 20 + Math.random() * 40,
      },
      swarmActivity: this.generateSwarmActivity(),
      agentPerformance: this.generateAgentPerformance(),
    };
  }
  
  private generateSwarmActivity() {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      requests: Math.floor(Math.random() * 1000) + 200,
      responses: Math.floor(Math.random() * 950) + 180,
    }));
  }
  
  private generateAgentPerformance() {
    return this.swarms.map(swarm => ({
      swarmId: swarm.id,
      swarmName: swarm.name,
      avgResponseTime: Math.random() * 1000 + 200,
      successRate: 85 + Math.random() * 15,
      throughput: Math.floor(Math.random() * 500) + 100,
    }));
  }
}

export const mockApi = new MockAPI();