import Assistant from '../Assistant.js';

const seed = 'As a therapy assistant, your role involves analyzing a thought for a patient. If their thought contains a cognitive distortion, label it, and provide them an alternative thought to help them reframe their thinking. For thoughts without distortions, give them an affirmation.';

const formatInstructions = {
  title: 'Brief Summary of Thought',
  analysis_content: 'Detailed Analysis',
  mood: 'Inferred Mood from Thought',
  tags: ['Array', 'of', 'Relevant', 'Tags']
};

/**
 * CDGPT Chat Assistant
 */
export default class CdGpt extends Assistant {
  constructor(bearer, model, persona = '', temperature) {
    super(bearer, model, temperature);
    this.method = 'POST';
    this.contentType = 'application/json';
    this.persona = persona;
    this.messages = [];
  }

  /**
   * Seed the chat completion messages to provide context.
   */
  seedMessages(messages = []) {
    // Set the context
    this.messages.push({ role: 'system', content: seed });

    // Add the format instructions
    this.messages.push({ role: 'system', content: `Format: ${ this.contentType }, Data Structure: ${ JSON.stringify(formatInstructions) }` });

    // Add custom context
    if (this.persona) {
      this.messages.push({ role: 'system', content: `Persona: ${ this.persona }` });
    }

    // Add existing messages
    if (messages.length > 0) {
      this.messages = this.messages.concat(messages);
    }
  }

  /**
   * Add a user message to the messages.
   */
  addUserMessage(prompt) {
    this.messages.push({ role: 'user', content: prompt });
  }

  /**
   * Get the chat completion.
   */
  async getChatCompletion() {
    const body = {
      model: this.model,
      response_format: { type: 'json_object' },
      temperature: this.temperature,
      messages: this.messages
    };

    const response = await fetch(
      this.baseUrl + '/chat/completions',
      {
        headers: {
          'Content-Type': this.contentType,
          Authorization: this.bearer
        },
        method: this.method,
        body: JSON.stringify(body)
      }
    );

    return await response.json();
  }
}
