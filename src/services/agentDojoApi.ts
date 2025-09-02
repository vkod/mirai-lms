const API_BASE_URL = 'http://localhost:8000/api';

export interface AgentConfig {
  name: string;
  role: string;
  capabilities: string[];
  parameters: Record<string, any>;
  dependencies?: string[];
}

export interface SwarmConfig {
  orchestration_type?: string;
  max_iterations?: number;
  timeout_seconds?: number;
  retry_policy?: Record<string, any>;
  environment_variables?: Record<string, string>;
}

export interface AgentSwarmCreate {
  name: string;
  description?: string;
  config?: Record<string, any>;
  agents?: Record<string, any>[];
  status?: string;
}

export interface AgentSwarmUpdate {
  name?: string;
  description?: string;
  config?: Record<string, any>;
  agents?: Record<string, any>[];
  status?: string;
}

export interface AgentSwarmResponse {
  id: number;
  name: string;
  description?: string;
  config: Record<string, any>;
  agents: Record<string, any>[];
  status: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface TrainSwarmRequest {
  training_data?: Record<string, any>;
  hyperparameters?: Record<string, any>;
  validation_split?: number;
  epochs?: number;
  batch_size?: number;
}

export interface TrainSwarmResponse {
  swarm_id: number;
  status: string;
  message: string;
  training_job_id: string;
  estimated_completion_time: string;
}

class AgentDojoAPI {
  private async fetchWithError(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Create a new agent swarm
  async createSwarm(swarm: AgentSwarmCreate): Promise<AgentSwarmResponse> {
    return this.fetchWithError(`${API_BASE_URL}/swarms`, {
      method: 'POST',
      body: JSON.stringify(swarm),
    });
  }

  // Get all agent swarms
  async getSwarms(status?: string): Promise<AgentSwarmResponse[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const url = `${API_BASE_URL}/swarms${params.toString() ? `?${params.toString()}` : ''}`;
    return this.fetchWithError(url);
  }

  // Get a specific agent swarm
  async getSwarm(swarmId: number): Promise<AgentSwarmResponse> {
    return this.fetchWithError(`${API_BASE_URL}/swarms/${swarmId}`);
  }

  // Update an agent swarm
  async updateSwarm(swarmId: number, update: AgentSwarmUpdate): Promise<AgentSwarmResponse> {
    return this.fetchWithError(`${API_BASE_URL}/swarms/${swarmId}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  // Delete an agent swarm
  async deleteSwarm(swarmId: number): Promise<{ message: string }> {
    return this.fetchWithError(`${API_BASE_URL}/swarms/${swarmId}`, {
      method: 'DELETE',
    });
  }

  // Train an agent swarm
  async trainSwarm(swarmId: number, request: TrainSwarmRequest): Promise<TrainSwarmResponse> {
    return this.fetchWithError(`${API_BASE_URL}/swarms/${swarmId}/train`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Update swarm status
  async updateSwarmStatus(swarmId: number, status: string): Promise<AgentSwarmResponse> {
    return this.fetchWithError(`${API_BASE_URL}/swarms/${swarmId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Deploy a swarm
  async deploySwarm(swarmId: number): Promise<AgentSwarmResponse> {
    return this.fetchWithError(`${API_BASE_URL}/swarms/${swarmId}/deploy`, {
      method: 'POST',
    });
  }

  // Pause a swarm
  async pauseSwarm(swarmId: number): Promise<AgentSwarmResponse> {
    return this.fetchWithError(`${API_BASE_URL}/swarms/${swarmId}/pause`, {
      method: 'POST',
    });
  }

  // Helper method to convert UI swarm format to API format
  convertToAPIFormat(uiSwarm: any): AgentSwarmCreate {
    return {
      name: uiSwarm.name,
      description: uiSwarm.description || uiSwarm.goal,
      config: {
        goal: uiSwarm.goal,
        purpose: uiSwarm.goal,
        tools: uiSwarm.tools?.map((toolId: string) => ({
          name: toolId,
          description: '',
        })) || [],
        events: uiSwarm.eventTriggers?.map((trigger: any) => ({
          name: trigger.name || trigger.subType,
          description: `${trigger.type}: ${trigger.subType}`,
        })) || [],
        eventTriggers: uiSwarm.eventTriggers || [],
        deployment: uiSwarm.deployment || {},
        trainingDataset: uiSwarm.trainingDataset || {},
      },
      agents: uiSwarm.agents || [],
      status: uiSwarm.status || 'draft',
    };
  }

  // Helper method to convert API swarm format to UI format
  convertToUIFormat(apiSwarm: AgentSwarmResponse): any {
    const config = apiSwarm.config || {};
    return {
      id: apiSwarm.id.toString(),
      name: apiSwarm.name,
      goal: config.goal || apiSwarm.description || '',
      description: apiSwarm.description || '',
      status: apiSwarm.status as any,
      tools: config.tools || [],
      trainingDataset: config.trainingDataset || {
        id: 'ds_001',
        name: 'Default Dataset',
        size: 10000,
        lastUpdated: apiSwarm.updated_at,
      },
      eventTriggers: config.eventTriggers || [],
      agents: apiSwarm.agents || [],
      performance: config.performance || {
        totalProcessed: 0,
        successRate: 0,
        avgResponseTime: 0,
        leadConversion: 0,
        customerSatisfaction: 0,
      },
      deployment: config.deployment || {
        environment: 'development',
        resources: '2 vCPU, 4GB RAM',
      },
      created: apiSwarm.created_at,
      modified: apiSwarm.updated_at,
    };
  }
}

export const agentDojoAPI = new AgentDojoAPI();