export interface Permission {
  id: string;
  object: string;
  created: number;
  allow_create_engine: boolean;
  allow_sampling: boolean;
  allow_logprobs: boolean;
  allow_search_indices: boolean;
  allow_view: boolean;
  allow_fine_tuning: boolean;
  organization: string;
  group?: string | null;
  is_blocking: boolean;
}

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: Permission[];
  root: string;
  parent?: string | null;
}

export interface ModelsResponse {
  object: string;
  data: Model[];
}

export default class Assistant {
  baseUrl: string;
  bearer: string;
  model: string;
  temperature: number;

  constructor(bearer: string, model: string = '', temperature: number = 0.7) {
    this.baseUrl = process.env.OPENAI_API_URL as string;
    this.bearer = `Bearer ${bearer}`;
    this.model = model;
    this.temperature = temperature;
  }

  /**
   * Test the connection is authenticated.
   */
  async testConnection(): Promise<ModelsResponse> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        Authorization: this.bearer,
      },
    });

    const data: ModelsResponse = await response.json();
    return data;
  }

  /**
   * Test the model availability.
   */
  testModelAvailability(models: Model[]): Model[] {
    const filteredModel = models.filter(
      (model) => model.id.toLowerCase() === this.model.toLowerCase()
    );

    return filteredModel.length > 0 ? filteredModel : models;
  }
}