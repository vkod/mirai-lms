const API_BASE_URL = 'http://localhost:8000/api';

export interface Tool {
  id: number;
  name: string;
  description: string;
  category: string | null;
  parameters: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ToolCreate {
  name: string;
  description: string;
  category?: string;
  parameters?: Record<string, any>;
}

export interface ToolUpdate {
  name?: string;
  description?: string;
  category?: string;
  parameters?: Record<string, any>;
}

class ToolsAPI {
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

  async getTools(category?: string): Promise<Tool[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    
    const url = `${API_BASE_URL}/tools${params.toString() ? `?${params.toString()}` : ''}`;
    return this.fetchWithError(url);
  }

  async getTool(id: number): Promise<Tool> {
    return this.fetchWithError(`${API_BASE_URL}/tools/${id}`);
  }

  async createTool(tool: ToolCreate): Promise<Tool> {
    return this.fetchWithError(`${API_BASE_URL}/tools`, {
      method: 'POST',
      body: JSON.stringify({
        ...tool,
        parameters: tool.parameters || {}
      }),
    });
  }

  async updateTool(id: number, update: ToolUpdate): Promise<Tool> {
    return this.fetchWithError(`${API_BASE_URL}/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  async deleteTool(id: number): Promise<{ message: string }> {
    return this.fetchWithError(`${API_BASE_URL}/tools/${id}`, {
      method: 'DELETE',
    });
  }
}

export const toolsApi = new ToolsAPI();