import { Logger, LogLevel } from '../../utils/Logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: {
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
    log: jest.SpyInstance;
  };
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    // Reset singleton instance
    (Logger as any).instance = undefined;

    // Mock console methods
    consoleSpy = {
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      log: jest.spyOn(console, 'log').mockImplementation(),
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('should create a singleton instance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(Logger);
    });
  });

  describe('log level configuration', () => {
    it('should default to INFO level when LOG_LEVEL is not set', () => {
      delete process.env.LOG_LEVEL;
      logger = Logger.getInstance();

      logger.info('info message');
      logger.debug('debug message');

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[INFO] info message'));
      expect(consoleSpy.log).not.toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] debug message')
      );
    });

    it('should set ERROR level from environment', () => {
      process.env.LOG_LEVEL = 'ERROR';
      logger = Logger.getInstance();

      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message');

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] error message')
      );
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should set WARN level from environment', () => {
      process.env.LOG_LEVEL = 'WARN';
      logger = Logger.getInstance();

      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should set DEBUG level from environment', () => {
      process.env.LOG_LEVEL = 'DEBUG';
      logger = Logger.getInstance();

      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message');
      logger.debug('debug message');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledTimes(2); // info and debug
    });

    it('should handle case insensitive log levels', () => {
      process.env.LOG_LEVEL = 'debug';
      logger = Logger.getInstance();

      logger.debug('debug message');

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[DEBUG] debug message'));
    });
  });

  describe('logging methods', () => {
    beforeEach(() => {
      process.env.LOG_LEVEL = 'DEBUG';
      logger = Logger.getInstance();
    });

    it('should log error messages', () => {
      logger.error('test error');

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[ERROR\] test error/
        )
      );
    });

    it('should log warn messages', () => {
      logger.warn('test warning');

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[WARN\] test warning/
        )
      );
    });

    it('should log info messages', () => {
      logger.info('test info');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] test info/)
      );
    });

    it('should log debug messages', () => {
      logger.debug('test debug');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[DEBUG\] test debug/
        )
      );
    });
  });

  describe('message formatting with arguments', () => {
    beforeEach(() => {
      process.env.LOG_LEVEL = 'DEBUG';
      logger = Logger.getInstance();
    });

    it('should format messages with string arguments', () => {
      logger.info('test message', 'arg1', 'arg2');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] test message arg1 arg2')
      );
    });

    it('should format messages with number arguments', () => {
      logger.info('test message', 123, 456);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] test message 123 456')
      );
    });

    it('should format messages with object arguments', () => {
      const obj = { key: 'value', nested: { prop: 123 } };
      logger.info('test message', obj);

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[INFO] test message'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"key": "value"'));
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('"nested": {\n    "prop": 123\n  }')
      );
    });

    it('should handle mixed argument types', () => {
      logger.error('error occurred', { error: 'details' }, 500, 'additional info');

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] error occurred')
      );
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('"error": "details"'));
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('500 additional info'));
    });

    it('should handle empty arguments', () => {
      logger.info('test message');

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringMatching(/\[INFO\] test message$/));
    });

    it('should handle undefined and null arguments', () => {
      logger.warn('test', undefined, null);

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] test undefined null')
      );
    });
  });

  describe('setLogLevel', () => {
    beforeEach(() => {
      logger = Logger.getInstance();
    });

    it('should dynamically change log level', () => {
      logger.setLogLevel(LogLevel._ERROR);
      logger.error('error message');
      logger.info('info message');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should allow increasing log verbosity', () => {
      logger.setLogLevel(LogLevel._ERROR);
      logger.debug('debug message 1');
      expect(consoleSpy.log).not.toHaveBeenCalled();

      logger.setLogLevel(LogLevel._DEBUG);
      logger.debug('debug message 2');
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] debug message 2')
      );
    });
  });

  describe('timestamp formatting', () => {
    beforeEach(() => {
      logger = Logger.getInstance();
    });

    it('should include valid ISO timestamp', () => {
      const beforeLog = new Date();
      logger.info('test message');
      const afterLog = new Date();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/)
      );

      // Extract timestamp from logged message
      const loggedMessage = consoleSpy.log.mock.calls[0][0] as string;
      const timestampMatch = loggedMessage.match(/^\[([^\]]+)\]/);
      expect(timestampMatch).not.toBeNull();

      const loggedTimestamp = new Date(timestampMatch![1]);
      expect(loggedTimestamp.getTime()).toBeGreaterThanOrEqual(beforeLog.getTime());
      expect(loggedTimestamp.getTime()).toBeLessThanOrEqual(afterLog.getTime());
    });
  });

  describe('LogLevel enum', () => {
    it('should have correct numeric values', () => {
      expect(LogLevel._ERROR).toBe(0);
      expect(LogLevel._WARN).toBe(1);
      expect(LogLevel._INFO).toBe(2);
      expect(LogLevel._DEBUG).toBe(3);
    });
  });
});
