/**
 * Configuration for a Model Control Protocol (MCP) server.
 */
export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  disabled?: boolean;
  autoApprove?: string[];
}

/**
 * Agent configuration, including API keys, model choice, and connected MCP servers.
 */
export interface AgentConfig {
  geminiApiKey: string;
  model: string;
  mcpServers: MCPServerConfig[];
}

/**
 * Represents a single chat message between a user and the assistant.
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Response from the agent after processing a message or request.
 */
export interface AgentResponse {
  text: string;
  functionCalls?: any[];
  metadata?: {
    model: string;
    timestamp: Date;
    tokensUsed?: number;
  };
}