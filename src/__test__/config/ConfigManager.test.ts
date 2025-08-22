import { ConfigManager } from '../../config/ConfigManager';

describe('ConfigManager', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        // Reset singleton instance between tests
        (ConfigManager as any).instance = undefined;
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('getInstance', () => {
        it('should create singleton instance', () => {
            const instance1 = ConfigManager.getInstance();
            const instance2 = ConfigManager.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('loadConfig', () => {
        it('should throw error if GEMINI_API_KEY not set', () => {
            delete process.env.GEMINI_API_KEY;
            expect(() => ConfigManager.getInstance()).toThrow('GEMINI_API_KEY environment variable is required');
        });

        it('should load config with default model if GEMINI_MODEL not set', () => {
            process.env.GEMINI_API_KEY = 'test-key';
            delete process.env.GEMINI_MODEL;
            const config = ConfigManager.getInstance().getConfig();
            expect(config.model).toBe('gemini-2.5-pro');
        });

        it('should use custom model from env', () => {
            process.env.GEMINI_API_KEY = 'test-key';
            process.env.GEMINI_MODEL = 'custom-model';
            const config = ConfigManager.getInstance().getConfig();
            expect(config.model).toBe('custom-model');
        });
    });

    describe('getter methods', () => {
        beforeEach(() => {
            process.env.GEMINI_API_KEY = 'test-key';
            process.env.GEMINI_MODEL = 'test-model';
        });

        it('should get API key', () => {
            expect(ConfigManager.getInstance().getGeminiApiKey()).toBe('test-key');
        });

        it('should get model name', () => {
            expect(ConfigManager.getInstance().getModel()).toBe('test-model');
        });

        it('should get MCP servers config', () => {
            const servers = ConfigManager.getInstance().getMCPServersConfig();
            expect(servers).toBeInstanceOf(Array);
            expect(servers.length).toBeGreaterThan(0);
            expect(servers.every(server => !server.disabled)).toBe(true);
        });
    });
});