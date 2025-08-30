export interface Assistant {
  id: string;
  name: string;
  model?: {
    provider: string;
    model: string;
    systemPrompt?: string;
    temperature?: number;
  };
  voice?: {
    provider: string;
    voiceId: string;
  };
  firstMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export class AssistantsAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async getAssistants(): Promise<Assistant[]> {
    try {
      const response = await fetch(`${this.baseUrl}/assistant`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch assistants: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching assistants:', error);
      return [];
    }
  }

  async getAssistant(id: string): Promise<Assistant | null> {
    try {
      const response = await fetch(`${this.baseUrl}/assistant/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch assistant: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching assistant:', error);
      return null;
    }
  }
}
