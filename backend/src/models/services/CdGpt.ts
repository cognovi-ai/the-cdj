import CdGpt, { ChatCompletionResponse } from '../../assistants/gpts/CdGpt.js';
import { ChatMessage } from '../entry/entryConversation.js';
import { Config } from '../index.js';
import ExpressError from '../../utils/ExpressError.js';

async function removeLegacyApiKey(configId: string) {
  const config = await Config.findById(configId);

  if (!config) {
    throw new Error('Configure your account settings to get an analysis.');
  } else if (config.apiKey) {
    try {
      // Remove an API key from a legacy config
      await Config.findByIdAndUpdate(config._id, { $unset: { apiKey: 1 } });
    } catch (err) {
      if (typeof err === 'string') {
        throw new Error(err);
      } else if (err instanceof Error) {
        throw new Error(err.message);
      }
    }
  }
  return config.model.analysis ? config.model.analysis : '';
}

async function getAnalysisCompletion(
  configModelAnalysis: string,
  content: string
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('API key is not available)');
  }

  const cdGpt = new CdGpt(
    process.env.OPENAI_API_KEY,
    configModelAnalysis
  );

  cdGpt.seedAnalysisMessages();
  cdGpt.addUserMessage({ analysis: content });

  const analysisCompletion = await cdGpt.getAnalysisCompletion();
  if (analysisCompletion.error) {
    throw new Error(analysisCompletion.error.message);
  }
  return analysisCompletion;
}

// Get the analysis content for an entry
// TODO: figure out more specific return type for this function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAnalysisContent(configId: string, content: string): Promise<any> {
  const configModelAnalysis = await removeLegacyApiKey(configId);
  const analysisCompletion = await getAnalysisCompletion(configModelAnalysis, content);

  /**
   * TODO: define a type for content field and refactor
   * The next two lines suggests that the message content
   * is missing a type because it gets unpacked into several expected fields
   * It would also make sense to extract the next few lines into their own function.
   */
  const response = JSON.parse(analysisCompletion.choices[0].message.content);
  const { reframed_thought: reframing, distortion_analysis: analysis, impact_assessment: impact, affirmation, is_healthy: isHealthy } = response;

  if (!isHealthy) {
    if (!analysis || !impact || !reframing) {
      throw new Error('Analysis content is not available.');
    }

    response.analysis_content = analysis + ' ' + impact + ' Think, "' + reframing + '"' || affirmation;
  } else response.analysis_content = affirmation;

  return response;
}

async function getChatCompletion(
  configModelAnalysis: string,
  analysisId: string,
  messages: ChatMessage[],
  content: string
) {
  if (process.env.OPENAI_API_KEY === undefined) {
    throw new Error(
      'OpenAI API Key not set. Cannot retrieve conversation response'
    );
  }
  const cdGpt = new CdGpt(
    process.env.OPENAI_API_KEY,
    configModelAnalysis
  );

  await cdGpt.seedChatMessages(analysisId, messages);
  cdGpt.addUserMessage({ chat: content });

  const response = await cdGpt.getChatCompletion();
  if (response.error) {
    throw new ExpressError(response.error.message, 400);
  }

  return response;
}

// Get the analysis content for an entry
export async function getChatContent(
  configId: string,
  analysisId: string,
  content: string,
  messages: ChatMessage[] = []
): Promise<string> {
  const configModelAnalysis = await removeLegacyApiKey(configId);
  const response: ChatCompletionResponse = await getChatCompletion(
    configModelAnalysis,
    analysisId,
    messages,
    content
  );

  return response.choices[0].message.content;
}
