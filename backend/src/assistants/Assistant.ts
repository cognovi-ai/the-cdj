import { Model, ModelsResponse } from '../interfaces/assistants/Model.js';

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