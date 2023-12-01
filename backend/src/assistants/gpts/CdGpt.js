import Assistant from '../Assistant';

/**
 * CDGPT Chat Assistant
 */
export default class CdGpt extends Assistant {
  constructor(bearer, model, temperature, persona) {
    super(bearer, model, temperature);
    this.contentType = 'application/json';
    this.persona = persona;
  }
}
