import { ElProfessorError, ConfigurationError, ErrorHandler, MCPConnectionError, GenAIError } from '../../utils/ErrorHandler';
import { Logger } from '../../utils/Logger';


export const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

describe('ElProfessorError - extended', () => {
    it('should correctly handle empty message', () => {
        const err = new ElProfessorError('');
        expect(err.message).toBe('');
        expect(err.code).toBe('UNKNOWN_ERROR');
    });

    it('should preserve custom code with default status', () => {
        const err = new ElProfessorError('msg', 'CUSTOM_CODE');
        expect(err.code).toBe('CUSTOM_CODE');
        expect(err.statusCode).toBe(500);
    });
});

describe('ConfigurationError - extended', () => {
    it('should handle multiline error messages', () => {
        const msg = 'Line 1\nLine 2';
        const err = new ConfigurationError(msg);
        expect(err.message).toBe(msg);
    });
});

describe('MCPConnectionError - extended', () => {
    it('should handle empty server name', () => {
        const err = new MCPConnectionError('failed', '');
        expect(err.message).toBe("MCP Server '': failed");
    });

    it('should handle special characters in server name', () => {
        const err = new MCPConnectionError('failed', 'server$#@1');
        expect(err.message).toBe("MCP Server 'server$#@1': failed");
    });
});

describe('ErrorHandler.isRetryableError - extended', () => {
    it('returns false for null/undefined error', () => {
        expect(ErrorHandler.isRetryableError(null as unknown as Error)).toBe(false);
        expect(ErrorHandler.isRetryableError(undefined as unknown as Error)).toBe(false);
    });

    it('returns false for non-Error objects', () => {
        expect(ErrorHandler.isRetryableError({message: 'fake error'} as Error)).toBe(false);
    });
});
