import { ConfigManager } from '../config/ConfigManager';
import { MCPManager } from '../mcp/MCPManager';
import { GenAIService } from '../services/GenAIService';
import { AgentResponse, ChatMessage } from '../types';

/**
 * ElProfessor
 *
 * Coordinates LLM interactions (via GenAIService), MCP server connectivity,
 * and in-memory conversational context for the ElProfessor CLI.
 *
 * Primary responsibilities:
 *  - Initialize MCP servers from configuration and maintain connections.
 *  - Orchestrate single-response and streaming content generation.
 *  - Maintain a rolling conversation history (bounded to last 20 messages).
 *  - Provide convenience methods for AWS-specific tasks like Terraform/CDK generation.
 */
export class ElProfessor {
  /** Service used to request content from the LLM. */
  private genAIService: GenAIService;

  /** Manager responsible for starting/stopping MCP servers and exposing clients. */
  private mcpManager: MCPManager;

  /** Singleton config manager (reads model, GEMINI API key, MCP server config). */
  private config: ConfigManager;

  /** Rolling conversation history; stores ChatMessage objects. */
  private conversationHistory: ChatMessage[] = [];

  /**
   * Create an ElProfessor.
   *
   * Instantiates default components:
   *  - GenAIService for LLM calls
   *  - MCPManager for MCP lifecycle & client access
   *  - ConfigManager singleton for configuration
   */
  constructor() {
    this.genAIService = new GenAIService();
    this.mcpManager = new MCPManager();
    this.config = ConfigManager.getInstance();
  }

  /**
   * Initialize the agent:
   *  - Retrieve MCP servers from configuration
   *  - Start / initialize MCP servers via MCPManager
   *
   * Logs initialization summary to console.
   *
   * @returns Promise<void>
   */
  public async initialize(): Promise<void> {
    console.log('🚀 Initializing ElProfessor CLI...');

    const mcpServers = this.config.getMCPServersConfig();
    await this.mcpManager.initializeServers(mcpServers);

    const connectedServers = this.mcpManager.getConnectedServers();
    console.log(
      `✓ ElProfessor CLI initialized with ${connectedServers.length} MCP servers:`,
      connectedServers
    );
  }

  /**
   * Send a single chat message and receive a unified AgentResponse.
   *
   * - Adds the user's message to conversation history.
   * - Retrieves all MCP clients and passes them to the GenAIService as tools.
   * - Adds the assistant's reply to conversation history.
   *
   * @param message - User input string
   * @returns Promise<AgentResponse> - normalized LLM response
   */
  public async chat(message: string): Promise<AgentResponse> {
    this.addToHistory('user', message);

    const mcpClients = this.mcpManager.getAllClients();
    const response = await this.genAIService.generateContent(message, mcpClients);

    this.addToHistory('assistant', response.text);

    return response;
  }

  /**
   * Streamed chat: returns an AsyncIterable<string> that yields text chunks.
   *
   * - Adds the user's message to history.
   * - Streams chunks from the GenAIService.
   * - Concatenates streamed chunks into a single assistant message and appends it to history after the stream completes.
   *
   * @param message - User input string
   * @returns Promise<AsyncIterable<string>> - async iterable of text chunks
   */
  public async chatStream(message: string): Promise<AsyncIterable<string>> {
    this.addToHistory('user', message);

    const mcpClients = this.mcpManager.getAllClients();
    const stream = await this.genAIService.generateContentStream(message, mcpClients);

    let fullResponse = '';
    const self = this;

    return {
      async *[Symbol.asyncIterator](): AsyncGenerator<string, void, unknown> {
        for await (const chunk of stream) {
          fullResponse += chunk;
          yield chunk;
        }
        // After stream completes, add the concatenated assistant response to history
        self.addToHistory('assistant', fullResponse);
      },
    };
  }

  /**
   * Ask an AWS-specific question. This wraps `chat()` with a prompt tailored to AWS expertise.
   *
   * @param question - The AWS-focused question
   * @returns Promise<AgentResponse>
   */
  public async askAWSQuestion(question: string): Promise<AgentResponse> {
    const awsPrompt = `As an AWS expert assistant, please help with this AWS-related question: ${question}`;
    return this.chat(awsPrompt);
  }

  /**
   * Generate Terraform code for a given description.
   *
   * @param description - What to model in Terraform (e.g., "multi-AZ VPC with public/private subnets")
   * @returns Promise<AgentResponse>
   */
  public async generateTerraform(description: string): Promise<AgentResponse> {
    const terraformPrompt = `Generate Terraform configuration for: ${description}. Please provide complete, production-ready Terraform code with proper resource definitions, variables, and outputs.`;
    return this.chat(terraformPrompt);
  }

  /**
   * Generate AWS CDK code in the specified language.
   *
   * @param description - What the CDK app should create
   * @param language - Target language for CDK (default: 'typescript')
   * @returns Promise<AgentResponse>
   */
  public async generateCDK(
    description: string,
    language: string = 'typescript'
  ): Promise<AgentResponse> {
    const cdkPrompt = `Generate AWS CDK code in ${language} for: ${description}. Please provide complete, production-ready CDK code with proper constructs, stacks, and best practices.`;
    return this.chat(cdkPrompt);
  }

  /**
   * Create architecture diagram instructions / description for a given system.
   *
   * @param description - System to depict in the architecture diagram
   * @returns Promise<AgentResponse>
   */
  public async createArchitectureDiagram(description: string): Promise<AgentResponse> {
    const diagramPrompt = `Create an AWS architecture diagram for: ${description}. Please provide a detailed architecture diagram showing AWS services, connections, and data flow.`;
    return this.chat(diagramPrompt);
  }

  /**
   * Generate documentation for provided code or system description.
   *
   * @param codeOrDescription - Code snippet or description to document
   * @returns Promise<AgentResponse>
   */
  public async generateDocumentation(codeOrDescription: string): Promise<AgentResponse> {
    const docPrompt = `Generate comprehensive documentation for: ${codeOrDescription}. Please include setup instructions, usage examples, and best practices.`;
    return this.chat(docPrompt);
  }

  /**
   * Append a new entry to the in-memory conversation history.
   * Keeps only the last 20 messages to avoid unbounded memory growth.
   *
   * @param role - 'user' | 'assistant'
   * @param content - Message text
   */
  private addToHistory(role: 'user' | 'assistant', content: string): void {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
    });

    // Keep last 20 messages to prevent memory issues
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  /**
   * Return a shallow copy of the current conversation history.
   *
   * @returns ChatMessage[] - array of messages in chronological order
   */
  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear the conversation history.
   */
  public clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get the list of connected MCP server names from MCPManager.
   *
   * @returns string[] - array of connected server names
   */
  public getConnectedServers(): string[] {
    return this.mcpManager.getConnectedServers();
  }

  /**
   * Gracefully shutdown the agent:
   *  - Close all MCP connections via MCPManager
   *  - Log shutdown progress to console
   *
   * @returns Promise<void>
   */
  public async shutdown(): Promise<void> {
    console.log('🛑 Shutting down ElProfessor CLI...');
    await this.mcpManager.closeAll();
    console.log('✓ ElProfessor CLI shut down complete');
  }
}
