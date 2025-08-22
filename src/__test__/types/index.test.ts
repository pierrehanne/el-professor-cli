import { MCPServerConfig, AgentConfig, ChatMessage, AgentResponse } from '../../types/index';

describe('Type Definitions', () => {
    describe('MCPServerConfig', () => {
        it('should create valid MCPServerConfig object', () => {
            const config: MCPServerConfig = {
                name: 'test-server',
                command: 'node',
                args: ['server.js'],
                env: { PORT: '3000' },
                disabled: false,
                autoApprove: ['command1', 'command2']
            };
            
            expect(config.name).toBeDefined();
            expect(config.command).toBeDefined();
            expect(Array.isArray(config.args)).toBeTruthy();
        });
    });

    describe('AgentConfig', () => {
        it('should create valid AgentConfig object', () => {
            const config: AgentConfig = {
                geminiApiKey: 'test-key',
                model: 'gemini-pro',
                mcpServers: [{
                    name: 'test',
                    command: 'node',
                    args: []
                }]
            };

            expect(config.geminiApiKey).toBeDefined();
            expect(config.model).toBeDefined();
            expect(Array.isArray(config.mcpServers)).toBeTruthy();
        });
    });

    describe('ChatMessage', () => {
        it('should create valid ChatMessage object', () => {
            const message: ChatMessage = {
                role: 'user',
                content: 'Hello',
                timestamp: new Date()
            };

            expect(message.role).toMatch(/^(user|assistant)$/);
            expect(message.content).toBeDefined();
            expect(message.timestamp instanceof Date).toBeTruthy();
        });
    });

    describe('AgentResponse', () => {
        it('should create valid AgentResponse object', () => {
            const response: AgentResponse = {
                text: 'Response',
                functionCalls: [],
                metadata: {
                    model: 'test-model',
                    timestamp: new Date(),
                    tokensUsed: 100
                }
            };

            expect(response.text).toBeDefined();
            expect(Array.isArray(response.functionCalls)).toBeTruthy();
            expect(response.metadata?.model).toBeDefined();
            expect(response.metadata?.timestamp instanceof Date).toBeTruthy();
        });
    });
});