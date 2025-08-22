import { GoogleGenAI, FunctionCallingConfigMode, mcpToTool } from '@google/genai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { AgentResponse } from '../types';
import { ConfigManager } from '../config/ConfigManager';

/**
 * GenAIService
 *
 * Thin wrapper around the Google GenAI client that:
 *  - Reads API and model configuration from ConfigManager
 *  - Supports optional Model Control Plane (MCP) clients converted to tools
 *  - Exposes synchronous (single response) and streaming generation methods
 *
 * Responsibilities:
 *  - Construct the GoogleGenAI client with API key from ConfigManager
 *  - Build tool-enabled config when MCP clients are provided
 *  - Normalize outputs into AgentResponse
 */
export class GenAIService {

  /** Underlying Google GenAI client instance. */
  private ai: GoogleGenAI;

  /** ConfigManager singleton used to retrieve API key & model name. */
  private config: ConfigManager;

  /**
   * Create a GenAIService.
   * The underlying GoogleGenAI client is created using the GEMINI API key
   * provided by ConfigManager.
   */
  constructor() {
    this.config = ConfigManager.getInstance();
    this.ai = new GoogleGenAI({
      apiKey: this.config.getGeminiApiKey()
    });
  }

  /**
   * Generate content (single response).
   *
   * If `mcpClients` are provided, each is converted to a tool via `mcpToTool`
   * and passed in the request config. When tools are present, `functionCallingConfig`
   * is set to `AUTO` so the model can call tools automatically.
   *
   * @param prompt - The textual prompt to send to the model (string).
   * @param mcpClients - Optional array of MCP Client instances to expose as tools.
   * @returns Promise<AgentResponse> Resolves to a normalized response object:
   *          { text, functionCalls, metadata }
   *
   * @throws Error when the underlying call fails — the error message will include
   *         the original thrown error.
   */
  public async generateContent(
    prompt: string,
    mcpClients?: Client[]
  ): Promise<AgentResponse> {
    try {

      // Convert any MCP clients into "tools" expected by the GenAI SDK.
      const tools = mcpClients?.map(client => mcpToTool(client)) || [];

      // Build request payload. Include tools/config only if present.
      const response = await this.ai.models.generateContent({
        model: this.config.getModel(),
        contents: prompt,
        config: tools.length > 0 ? {
          tools,
          toolConfig: {
            functionCallingConfig: {
              mode: FunctionCallingConfigMode.AUTO
            }
          }
        } : undefined
      });

      return {
        text: response.text || '',
        functionCalls: response.functionCalls,
        metadata: {
          model: this.config.getModel(),
          timestamp: new Date()
        }
      };
    } catch (error) {
      // Surface useful console output for debugging and rethrow a clearer message.
      console.error('Error generating content:', error);
      throw new Error(`Failed to generate content: ${error}`);
    }
  }

  /**
   * Generate content as a stream (AsyncIterable of strings).
   *
   * Similar behavior to `generateContent`, but uses `generateContentStream` on the SDK.
   * The returned AsyncIterable yields strings representing chunks of text as they arrive.
   *
   * Usage:
   * ```ts
   * const stream = await genAIService.generateContentStream(prompt, mcpClients);
   * for await (const chunk of stream) {
   *   console.log('chunk:', chunk);
   * }
   * ```
   *
   * @param prompt - The textual prompt to stream.
   * @param mcpClients - Optional MCP clients to expose as tools while streaming.
   * @returns Promise<AsyncIterable<string>> An async iterable of text chunks.
   *
   * @throws Error when the underlying streaming call fails.
   */
  public async generateContentStream(
    prompt: string,
    mcpClients?: Client[]
  ): Promise<AsyncIterable<string>> {
    try {

      const tools = mcpClients?.map(client => mcpToTool(client)) || [];

      const response = await this.ai.models.generateContentStream({
        model: this.config.getModel(),
        contents: prompt,
        config: tools.length > 0 ? {
          tools,
          toolConfig: {
            functionCallingConfig: {
              mode: FunctionCallingConfigMode.AUTO
            }
          }
        } : undefined
      });

      return this.createStreamIterable(response);
    } catch (error) {
      console.error('Error generating streaming content:', error);
      throw new Error(`Failed to generate streaming content: ${error}`);
    }
  }

  /**
   * Convert the SDK's streaming response into an AsyncIterable<string>.
   *
   * The underlying `response` is expected to be an async iterable of chunks/objects.
   * For each chunk that contains `.text`, yield that text value.
   *
   * @param response - The streaming response returned by the GenAI SDK.
   * @returns AsyncIterable<string> that yields chunk.text for each chunk.
   */
  private async* createStreamIterable(response: any): AsyncIterable<string> {
    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }
}