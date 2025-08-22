import { config } from 'dotenv';
import { AgentConfig, MCPServerConfig } from '../types';

config();

/**
 * ConfigManager is a singleton class responsible for
 * loading, storing, and providing configuration for the application.
 * 
 * It pulls environment variables (e.g., Gemini API key and model name)
 * and constructs configuration for MCP (Model Control Plane) servers.
 */
export class ConfigManager {

  /** Singleton instance of ConfigManager */
  private static instance: ConfigManager;

  /** Cached configuration object */
  private config: AgentConfig;

  /**
   * Private constructor to enforce singleton pattern.
   * Automatically loads configuration during initialization.
   */
  private constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Returns the single instance of ConfigManager.
   * Creates one if it doesn't already exist.
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Loads application configuration from environment variables
   * and MCP server definitions.
   * 
   * @throws Error if GEMINI_API_KEY is not defined in the environment
   * @returns {AgentConfig} Fully constructed configuration object
   */
  private loadConfig(): AgentConfig {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    return {
      geminiApiKey,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
      mcpServers: this.getMCPServers()
    };
  }

  /**
   * Defines the set of available MCP (Model Control Plane) servers.
   * These represent integrations for AWS, Terraform, CDK, diagrams,
   * and documentation/code generation.
   * 
   * @returns {MCPServerConfig[]} Array of MCP server configurations
   */
  private getMCPServers(): MCPServerConfig[] {
    return [
      // Official AWS Labs MCP Servers
      {
        name: 'aws-documentation',
        command: 'uvx',
        args: ['awslabs.aws-documentation-mcp-server@latest'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR',
          AWS_DOCUMENTATION_PARTITION: 'aws'
        },
        disabled: false,
        autoApprove: []
      },
      {
        name: 'terraform',
        command: 'uvx',
        args: ['awslabs.terraform-mcp-server@latest'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR'
        },
        disabled: false,
        autoApprove: []
      },
      {
        name: 'cdk',
        command: 'uvx',
        args: ['awslabs.cdk-mcp-server@latest'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR'
        },
        disabled: false,
        autoApprove: []
      },
      {
        name: 'aws-diagram',
        command: 'uvx',
        args: ['awslabs.aws-diagram-mcp-server'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR'
        },
        disabled: false,
        autoApprove: []
      },
      {
        name: 'code-doc-gen',
        command: 'uvx',
        args: ['awslabs.code-doc-gen-mcp-server@latest'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR'
        },
        disabled: false,
        autoApprove: []
      }
    ];
  }

  /**
   * Retrieves the full configuration object.
   * 
   * @returns {AgentConfig} Loaded configuration
   */
  public getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * Retrieves the Gemini API key from configuration.
   * 
   * @returns {string} Gemini API key
   */
  public getGeminiApiKey(): string {
    return this.config.geminiApiKey;
  }

  /**
   * Retrieves the configured Gemini model name.
   * Defaults to `gemini-2.5-pro` if not provided in env.
   * 
   * @returns {string} Gemini model name
   */
  public getModel(): string {
    return this.config.model;
  }

  /**
   * Retrieves all active (non-disabled) MCP server configurations.
   * 
   * @returns {MCPServerConfig[]} Enabled MCP servers
   */
  public getMCPServersConfig(): MCPServerConfig[] {
    return this.config.mcpServers.filter(server => !server.disabled);
  }

}