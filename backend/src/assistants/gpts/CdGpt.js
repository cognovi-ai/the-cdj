import Assistant from '../Assistant.js';

const analysisSeed = 'As a therapy assistant, your role involves analyzing a thought for a patient. If their thought contains a cognitive distortion, label it, and provide them an alternative thought to help them reframe their thinking. For thoughts without distortions, give them an affirmation.';

const chatSeed = 'As a therapy assistant, your role involves chatting with a patient. Stay focused on the entry topic and the assistant\'s analysis. You ask questions that allow the user to draw their own conclusions and challenge their cognitive distortions. You respond concisely, under 180 characters.';

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
    this.analysisMessages = [];
    this.chatMessages = [];
  }

  /**
   * Seed the analysis completion messages to provide context.
   */
  seedAnalysisMessages(messages = []) {
    // Set the context
    this.analysisMessages.push({ role: 'system', content: analysisSeed });

    // Add the format instructions
    this.analysisMessages.push({ role: 'system', content: `Format: ${ this.contentType }, Data Structure: ${ JSON.stringify(formatInstructions) }` });

    // Add custom context
    if (this.persona) {
      this.analysisMessages.push({ role: 'system', content: `Persona: ${ this.persona }` });
    }

    // Add existing messages
    if (messages.length > 0) {
      this.analysisMessages = this.analysisMessages.concat(messages);
    }
  }

  /**
   * Seed the chat completion messages to provide context.
   *
   * @param {Object} entryAnalysis the entry and analysis content
   * @param {Array} messages existing messages in the conversation
   */
  seedChatMessages(entryAnalysis, messages = []) {
    // Set the context
    this.chatMessages.push({ role: 'system', content: chatSeed });

    // Add custom context
    if (this.persona) {
      this.chatMessages.push({ role: 'system', content: `Persona: ${ this.persona }` });
    }

    // Specify the topic of the conversation using the entry
    this.chatMessages.push({ role: 'user', content: `Entry Topic: ${ entryAnalysis.entry }` });

    // Add the analysis content
    this.chatMessages.push({ role: 'assistant', content: `Analysis Topic: ${ entryAnalysis.analysis_content }` });

    // Add existing messages
    if (messages.length > 0) {
      messages.forEach(message => {
        this.chatMessages.push({ role: 'user', content: message.message_content });
        this.chatMessages.push({ role: 'assistant', content: message.llm_response });
      });
    }
  }

  /**
   * Add a user message to the messages.
   */
  addUserMessage(prompt) {
    const { analysis, chat } = prompt;

    if (analysis) {
      this.analysisMessages.push({ role: 'user', content: analysis });
    } else if (chat) {
      this.chatMessages.push({ role: 'user', content: chat });
    }
  }

  /**
   * Get the chat completion.
   */
  async getAnalysisCompletion() {
    const body = {
      model: this.model,
      response_format: { type: 'json_object' },
      temperature: this.temperature,
      messages: this.analysisMessages
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

  async getChatCompletion() {
    const body = {
      model: this.model,
      temperature: this.temperature,
      messages: this.chatMessages
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
