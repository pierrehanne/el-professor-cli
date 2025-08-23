import { MCPServerConfig, AgentConfig, ChatMessage, AgentResponse } from '../../types/index';

describe('Type Definitions', () => {
  describe('MCPServerConfig', () => {
    it('should create valid MCPServerConfig object with required fields', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        command: 'node',
        args: ['server.js'],
        env: { PORT: '3000' },
        disabled: false,
        autoApprove: ['command1', 'command2'],
      };

      expect(config.name).toBe('test-server');
      expect(config.command).toBe('node');
      expect(Array.isArray(config.args)).toBeTruthy();
      expect(config.args).toEqual(['server.js']);
      expect(config.env).toEqual({ PORT: '3000' });
      expect(config.disabled).toBe(false);
      expect(Array.isArray(config.autoApprove)).toBeTruthy();
      expect(config.autoApprove).toEqual(['command1', 'command2']);
    });

    it('should create valid MCPServerConfig object with all optional fields', () => {
      const config: MCPServerConfig = {
        name: 'advanced-server',
        command: 'docker',
        args: ['run', '--rm', 'test-image'],
        env: {
          FASTMCP_LOG_LEVEL: 'ERROR',
          AWS_DOCUMENTATION_PARTITION: 'aws',
        },
        disabled: false,
        autoApprove: [],
        type: 'stdio',
        timeout: 60,
      };

      expect(config.name).toBe('advanced-server');
      expect(config.command).toBe('docker');
      expect(config.args).toEqual(['run', '--rm', 'test-image']);
      expect(config.env.FASTMCP_LOG_LEVEL).toBe('ERROR');
      expect(config.env.AWS_DOCUMENTATION_PARTITION).toBe('aws');
      expect(config.disabled).toBe(false);
      expect(config.autoApprove).toEqual([]);
      expect(config.type).toBe('stdio');
      expect(config.timeout).toBe(60);
    });

    it('should handle empty arrays and objects', () => {
      const config: MCPServerConfig = {
        name: 'minimal-server',
        command: 'uvx',
        args: [],
        env: {},
        disabled: true,
        autoApprove: [],
      };

      expect(config.args).toHaveLength(0);
      expect(Object.keys(config.env)).toHaveLength(0);
      expect(config.disabled).toBe(true);
      expect(config.autoApprove).toHaveLength(0);
    });

    it('should allow optional fields to be undefined', () => {
      const config: MCPServerConfig = {
        name: 'basic-server',
        command: 'node',
        args: ['app.js'],
        env: { NODE_ENV: 'production' },
        disabled: false,
        autoApprove: ['safe-command'],
        // type and timeout are optional and not provided
      };

      expect(config.type).toBeUndefined();
      expect(config.timeout).toBeUndefined();
    });
  });

  describe('AgentConfig', () => {
    it('should create valid AgentConfig object with complete MCPServerConfig', () => {
      const config: AgentConfig = {
        geminiApiKey: 'test-key-12345',
        model: 'gemini-2.5-pro',
        mcpServers: [
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
        ],
      };

      expect(config.geminiApiKey).toBe('test-key-12345');
      expect(config.model).toBe('gemini-2.5-pro');
      expect(Array.isArray(config.mcpServers)).toBeTruthy();
      expect(config.mcpServers).toHaveLength(1);

      const mcpServer = config.mcpServers[0];
      expect(mcpServer.name).toBe('aws-documentation');
      expect(mcpServer.command).toBe('uvx');
      expect(mcpServer.type).toBe('stdio');
      expect(mcpServer.timeout).toBe(60);
    });

    it('should handle multiple MCP servers with different configurations', () => {
      const config: AgentConfig = {
        geminiApiKey: 'multi-server-key',
        model: 'gemini-pro',
        mcpServers: [
          {
            name: 'terraform',
            command: 'uvx',
            args: ['awslabs.terraform-mcp-server@latest'],
            env: { FASTMCP_LOG_LEVEL: 'ERROR' },
            disabled: false,
            autoApprove: [],
          },
          {
            name: 'docker-server',
            command: 'docker',
            args: ['run', '--rm', 'mcp/cdk:latest'],
            env: {},
            disabled: true,
            autoApprove: ['safe-op'],
            type: 'stdio',
            timeout: 120,
          },
        ],
      };

      expect(config.mcpServers).toHaveLength(2);
      expect(config.mcpServers[0].name).toBe('terraform');
      expect(config.mcpServers[0].type).toBeUndefined();
      expect(config.mcpServers[1].name).toBe('docker-server');
      expect(config.mcpServers[1].timeout).toBe(120);
      expect(config.mcpServers[1].disabled).toBe(true);
    });

    it('should handle empty mcpServers array', () => {
      const config: AgentConfig = {
        geminiApiKey: 'empty-servers-key',
        model: 'gemini-flash',
        mcpServers: [],
      };

      expect(config.mcpServers).toHaveLength(0);
      expect(Array.isArray(config.mcpServers)).toBeTruthy();
    });
  });

  describe('ChatMessage', () => {
    it('should create valid ChatMessage object for user', () => {
      const message: ChatMessage = {
        role: 'user',
        content: 'Hello, how can you help me?',
        timestamp: new Date('2024-01-01T12:00:00Z'),
      };

      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, how can you help me?');
      expect(message.timestamp instanceof Date).toBeTruthy();
      expect(message.timestamp.toISOString()).toBe('2024-01-01T12:00:00.000Z');
    });

    it('should create valid ChatMessage object for assistant', () => {
      const message: ChatMessage = {
        role: 'assistant',
        content: 'I can help you with various tasks.',
        timestamp: new Date(),
      };

      expect(message.role).toBe('assistant');
      expect(message.content).toBe('I can help you with various tasks.');
      expect(message.timestamp instanceof Date).toBeTruthy();
    });

    it('should validate role values', () => {
      const userMessage: ChatMessage = {
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
      };

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: 'Response',
        timestamp: new Date(),
      };

      expect(userMessage.role).toMatch(/^(user|assistant)$/);
      expect(assistantMessage.role).toMatch(/^(user|assistant)$/);
    });

    it('should handle empty content', () => {
      const message: ChatMessage = {
        role: 'user',
        content: '',
        timestamp: new Date(),
      };

      expect(message.content).toBe('');
      expect(typeof message.content).toBe('string');
    });
  });

  describe('AgentResponse', () => {
    it('should create valid AgentResponse object with full metadata', () => {
      const response: AgentResponse = {
        text: 'Here is your response',
        functionCalls: [
          { name: 'searchDocuments', args: { query: 'AWS Lambda' } },
          { name: 'generateCode', args: { language: 'typescript' } },
        ],
        metadata: {
          model: 'gemini-2.5-pro',
          timestamp: new Date('2024-01-01T15:30:00Z'),
          tokensUsed: 250,
        },
      };

      expect(response.text).toBe('Here is your response');
      expect(Array.isArray(response.functionCalls)).toBeTruthy();
      expect(response.functionCalls?.length).toBe(2);
      expect(response.metadata?.model).toBe('gemini-2.5-pro');
      expect(response.metadata?.timestamp instanceof Date).toBeTruthy();
      expect(response.metadata?.tokensUsed).toBe(250);
    });

    it('should create valid AgentResponse object with minimal fields', () => {
      const response: AgentResponse = {
        text: 'Simple response',
      };

      expect(response.text).toBe('Simple response');
      expect(response.functionCalls).toBeUndefined();
      expect(response.metadata).toBeUndefined();
    });

    it('should handle empty function calls array', () => {
      const response: AgentResponse = {
        text: 'Response without function calls',
        functionCalls: [],
        metadata: {
          model: 'gemini-pro',
          timestamp: new Date(),
        },
      };

      expect(response.functionCalls?.length).toBe(0);
      expect(Array.isArray(response.functionCalls)).toBeTruthy();
      expect(response.metadata?.tokensUsed).toBeUndefined();
    });

    it('should handle metadata without tokensUsed', () => {
      const response: AgentResponse = {
        text: 'Response',
        metadata: {
          model: 'test-model',
          timestamp: new Date(),
          // tokensUsed is optional
        },
      };

      expect(response.metadata?.model).toBe('test-model');
      expect(response.metadata?.timestamp instanceof Date).toBeTruthy();
      expect(response.metadata?.tokensUsed).toBeUndefined();
    });
  });
});
