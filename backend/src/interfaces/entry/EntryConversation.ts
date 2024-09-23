export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
  
export interface ChatMessage {
    message_content: string;
    llm_response: string;
}
  
export interface Prompt {
    analysis?: string;
    chat?: string;
}
  
export interface ChatCompletionChoice {
    index: number;
    message: Message;
    finish_reason: string;
}
  
export interface ChatCompletionUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}
  
export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: ChatCompletionChoice[];
    usage: ChatCompletionUsage;
}