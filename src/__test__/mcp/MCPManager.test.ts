import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

import { MCPManager } from '../../mcp/MCPManager';

jest.mock('@modelcontextprotocol/sdk/client/index.js');
jest.mock('@modelcontextprotocol/sdk/client/stdio.js');

describe('MCPManager', () => {
  let manager: MCPManager;
  let mockClient: jest.Mocked<Client>;
  let mockTransport: jest.Mocked<StdioClientTransport>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    manager = new MCPManager();

    // lightweight mock objects instead of constructing real instances
    mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      // add any additional Client members used by MCPManager if needed
    } as unknown as jest.Mocked<Client>;

    mockTransport = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      send: jest.fn(),
      on: jest.fn(),
      // add any additional StdioClientTransport members used by MCPManager if needed
    } as unknown as jest.Mocked<StdioClientTransport>;

    // make the mocked classes return our mocks when instantiated
    (Client as unknown as jest.Mock).mockImplementation(() => mockClient);
    (StdioClientTransport as unknown as jest.Mock).mockImplementation(() => mockTransport);

    // Suppress console.error output for clean test runs and keep a spy so we can assert calls
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // restore & clear mocks so tests don't leak state
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('initializeServers', () => {
    it('should initialize multiple servers successfully', async () => {
      const configs = [
        { name: 'server1', command: 'cmd1', args: [], env: {}, disabled: false, autoApprove: [] },
        { name: 'server2', command: 'cmd2', args: [], env: {}, disabled: false, autoApprove: [] },
      ];

      await manager.initializeServers(configs);

      expect(StdioClientTransport).toHaveBeenCalledTimes(2);
      expect(Client).toHaveBeenCalledTimes(2);
      expect(mockClient.connect).toHaveBeenCalledTimes(2);
      // no console.error calls expected for successful initialization
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle initialization failures gracefully', async () => {
      const configs = [
        { name: 'server1', command: 'cmd1', args: [], env: {}, disabled: false, autoApprove: [] },
      ];
      mockClient.connect.mockRejectedValue(new Error('Connection failed'));

      await manager.initializeServers(configs);

      expect(manager.isServerConnected('server1')).toBe(false);
      // assert that the error path logged the problem
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('✗ Failed to initialize MCP server server1:'),
        expect.any(Error)
      );
    });
  });

  describe('client management methods', () => {
    beforeEach(async () => {
      // Ensure initializeServers resolves using our mocked client/transport
      await manager.initializeServers([
        {
          name: 'test-server',
          command: 'cmd',
          args: [],
          env: {},
          disabled: false,
          autoApprove: [],
        },
      ]);
    });

    it('should get client by server name', () => {
      expect(manager.getClient('test-server')).toBeDefined();
      expect(manager.getClient('non-existent')).toBeUndefined();
    });

    it('should get all clients', () => {
      const clients = manager.getAllClients();
      expect(clients).toHaveLength(1);
      expect(clients[0]).toBe(mockClient);
    });

    it('should check server connection status', () => {
      expect(manager.isServerConnected('test-server')).toBe(true);
      expect(manager.isServerConnected('non-existent')).toBe(false);
    });

    it('should get connected server names', () => {
      const servers = manager.getConnectedServers();
      expect(servers).toEqual(['test-server']);
    });
  });

  describe('closeAll', () => {
    beforeEach(async () => {
      await manager.initializeServers([
        { name: 'server1', command: 'cmd1', args: [], env: {}, disabled: false, autoApprove: [] },
        { name: 'server2', command: 'cmd2', args: [], env: {}, disabled: false, autoApprove: [] },
      ]);
    });

    it('should close all clients and clear maps', async () => {
      await manager.closeAll();

      expect(mockClient.close).toHaveBeenCalledTimes(2);
      expect(manager.getAllClients()).toHaveLength(0);
      expect(manager.getConnectedServers()).toHaveLength(0);
      // closeAll succeeded so no console.error for closing expected
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle closure errors gracefully', async () => {
      // simulate close failing for the underlying client
      mockClient.close.mockRejectedValue(new Error('Close failed'));

      await manager.closeAll();

      // clients should be cleared even if close rejects
      expect(manager.getAllClients()).toHaveLength(0);

      // console.error should have been called to report the failure
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error closing MCP client:'),
        expect.any(Error)
      );
    });
  });
});
