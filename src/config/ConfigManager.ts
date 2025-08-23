import * as fs from 'fs';
import * as os from 'os';

import { config } from 'dotenv';

import { AgentConfig, MCPServerConfig } from '../types';

config();

/**
 * Runtime environment as a string union to avoid unused-vars false positives.
 */
type RuntimeEnvironment = 'docker' | 'windows' | 'unix';

/**
 * ConfigManager is a singleton class responsible for
 * loading, storing, and providing configuration for the application.
 *
 * It pulls environment variables (e.g., Gemini API key and model name)
 * and constructs configuration for MCP (Model Control Plane) servers
 * based on the detected runtime environment (Docker, Windows, or Unix-like).
 */
export class ConfigManager {
  /** Singleton instance of ConfigManager */
  private static instance: ConfigManager;

  /** Cached configuration object */
  private config: AgentConfig;

  /** Detected runtime environment */
  private runtimeEnvironment: RuntimeEnvironment;

  /**
   * Private constructor to enforce singleton pattern.
   * Automatically loads configuration during initialization.
   */
  private constructor() {
    this.runtimeEnvironment = this.detectRuntimeEnvironment();
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
   * Detects the current runtime environment.
   *
   * @returns {RuntimeEnvironment} The detected environment
   */
  private detectRuntimeEnvironment(): RuntimeEnvironment {
    // Check for Docker first
    if (this.isRunningInDocker()) {
      return 'docker';
    }

    // Check for Windows
    if (os.platform() === 'win32') {
      return 'windows';
    }

    // Default to Unix-like systems (Linux, macOS, etc.)
    return 'unix';
  }

  /**
   * Determines if the application is running inside a Docker container.
   * Uses multiple detection methods for reliability.
   *
   * @returns {boolean} True if running in Docker, false otherwise
   */
  private isRunningInDocker(): boolean {
    // Method 1: Check for .dockerenv file
    if (fs.existsSync('/.dockerenv')) {
      return true;
    }

    // Method 2: Check cgroup information (Linux containers)
    try {
      const cgroup = fs.readFileSync('/proc/1/cgroup', 'utf8');
      if (cgroup.includes('docker') || cgroup.includes('containerd')) {
        return true;
      }
    } catch {
      // File doesn't exist or can't be read - not necessarily an error
      // intentionally ignore the error (e.g., non-Linux or permission issues)
    }

    // Method 3: Check environment variables commonly set by Docker
    if (process.env.DOCKER_CONTAINER === 'true' || process.env.CONTAINER === 'docker') {
      return true;
    }

    return false;
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

    console.log(`🔍 Detected runtime environment: ${this.runtimeEnvironment}`);

    return {
      geminiApiKey,
      model: process.env.GEMINI_MODEL ?? 'gemini-2.5-pro',
      mcpServers: this.getMCPServers(),
    };
  }

  /**
   * Creates MCP server configuration for Docker environment.
   *
   * @returns {MCPServerConfig[]} Docker-specific server configurations
   */
  private getDockerMCPServers(): MCPServerConfig[] {
    return [
      {
        name: 'aws-documentation',
        command: 'docker',
        args: [
          'run',
          '--rm',
          '--interactive',
          '--env',
          'FASTMCP_LOG_LEVEL=ERROR',
          '--env',
          'AWS_DOCUMENTATION_PARTITION=aws',
          'mcp/aws-documentation:latest',
        ],
        env: {},
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
      {
        name: 'terraform',
        command: 'docker',
        args: [
          'run',
          '--rm',
          '--interactive',
          '--env',
          'FASTMCP_LOG_LEVEL=ERROR',
          'mcp/terraform:latest',
        ],
        env: {},
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
      {
        name: 'cdk',
        command: 'docker',
        args: [
          'run',
          '--rm',
          '--interactive',
          '--env',
          'FASTMCP_LOG_LEVEL=ERROR',
          'mcp/cdk:latest',
        ],
        env: {},
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
      {
        name: 'aws-diagram',
        command: 'docker',
        args: [
          'run',
          '--rm',
          '--interactive',
          '--env',
          'FASTMCP_LOG_LEVEL=ERROR',
          'mcp/aws-diagram:latest',
        ],
        env: {},
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
      {
        name: 'code-doc-gen',
        command: 'docker',
        args: [
          'run',
          '--rm',
          '--interactive',
          '--env',
          'FASTMCP_LOG_LEVEL=ERROR',
          'mcp/code-doc-gen:latest',
        ],
        env: {},
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
    ];
  }

  /**
   * Creates MCP server configuration for Windows environment.
   *
   * @returns {MCPServerConfig[]} Windows-specific server configurations
   */
  private getWindowsMCPServers(): MCPServerConfig[] {
    return [
      {
        name: 'aws-documentation',
        command: 'uv',
        args: [
          'tool',
          'run',
          '--from',
          'awslabs.aws-documentation-mcp-server@latest',
          'awslabs.aws-documentation-mcp-server.exe',
        ],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR',
          AWS_DOCUMENTATION_PARTITION: 'aws',
        },
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
      {
        name: 'terraform',
        command: 'uv',
        args: [
          'tool',
          'run',
          '--from',
          'awslabs.terraform-mcp-server@latest',
          'awslabs.terraform-mcp-server.exe',
        ],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR',
        },
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
      {
        name: 'cdk',
        command: 'uv',
        args: [
          'tool',
          'run',
          '--from',
          'awslabs.cdk-mcp-server@latest',
          'awslabs.cdk-mcp-server.exe',
        ],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR',
        },
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
      {
        name: 'aws-diagram',
        command: 'uv',
        args: [
          'tool',
          'run',
          '--from',
          'awslabs.aws-diagram-mcp-server@latest',
          'awslabs.aws-diagram-mcp-server.exe',
        ],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR',
        },
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
      {
        name: 'code-doc-gen',
        command: 'uv',
        args: [
          'tool',
          'run',
          '--from',
          'awslabs.code-doc-gen-mcp-server@latest',
          'awslabs.code-doc-gen-mcp-server.exe',
        ],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR',
        },
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
    ];
  }

  /**
   * Creates MCP server configuration for Unix-like environments (Linux, macOS).
   *
   * @returns {MCPServerConfig[]} Unix-specific server configurations
   */
  private getUnixMCPServers(): MCPServerConfig[] {
    return [
      {
        name: 'aws-documentation',
        command: 'uvx',
        args: ['awslabs.aws-documentation-mcp-server@latest'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR',
          AWS_DOCUMENTATION_PARTITION: 'aws',
        },
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
      {
        name: 'terraform',
        command: 'uvx',
        args: ['awslabs.terraform-mcp-server@latest'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR',
        },
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
      {
        name: 'cdk',
        command: 'uvx',
        args: ['awslabs.cdk-mcp-server@latest'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR',
        },
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
      {
        name: 'aws-diagram',
        command: 'uvx',
        args: ['awslabs.aws-diagram-mcp-server'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR',
        },
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
      {
        name: 'code-doc-gen',
        command: 'uvx',
        args: ['awslabs.code-doc-gen-mcp-server@latest'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR',
        },
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      },
    ];
  }

  /**
   * Defines the set of available MCP (Model Control Plane) servers
   * based on the detected runtime environment.
   *
   * @returns {MCPServerConfig[]} Array of platform-specific MCP server configurations
   */
  private getMCPServers(): MCPServerConfig[] {
    switch (this.runtimeEnvironment) {
      case 'docker':
        return this.getDockerMCPServers();
      case 'windows':
        return this.getWindowsMCPServers();
      case 'unix':
      default:
        return this.getUnixMCPServers();
    }
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

  /**
   * Gets the detected runtime environment.
   *
   * @returns {RuntimeEnvironment} Current runtime environment
   */
  public getRuntimeEnvironment(): RuntimeEnvironment {
    return this.runtimeEnvironment;
  }

  /**
   * Allows manual override of the runtime environment detection.
   * Useful for testing or when automatic detection fails.
   *
   * @param environment - The environment to force
   */
  public forceRuntimeEnvironment(environment: RuntimeEnvironment): void {
    console.log(`🔧 Overriding runtime environment: ${this.runtimeEnvironment} → ${environment}`);
    this.runtimeEnvironment = environment;
    this.config = this.loadConfig();
  }
}
