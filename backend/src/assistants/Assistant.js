export default class Assistant {
  constructor(bearer, model = '', temperature = 0.7) {
    this.baseUrl = 'https://api.openai.com/v1';
    this.bearer = `Bearer ${ bearer }`;
    this.model = model;
    this.temperature = temperature;
  }

  /**
   * Test the connection is authenticated.
   */
  async testConnection() {
    const response = await fetch(
      this.baseUrl + '/models',
      {
        headers: {
          Authorization: this.bearer
        }
      }
    );

    return await response.json();
  }

  /**
   * Test the model availability.
   */
  testModelAvailability(models) {
    const filteredModel = models.filter((model) =>
      model.id === this.model.toLowerCase()
    );

    return filteredModel.length > 0 ? filteredModel : models;
  }
}
