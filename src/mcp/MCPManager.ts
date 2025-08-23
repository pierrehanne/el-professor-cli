import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

import { MCPServerConfig } from '../types';

export class MCPManager {
  /** Map of server name → MCP client instance */
  private clients: Map<string, Client> = new Map();

  /** Map of server name → associated transport instance */
  private transports: Map<string, StdioClientTransport> = new Map();

  /**
   * Initializes multiple MCP servers based on provided configurations.
   *
   * @param serverConfigs - List of server configurations to initialize.
   * @returns A promise that resolves once all servers are initialized.
   */
  public async initializeServers(serverConfigs: MCPServerConfig[]): Promise<void> {
    const initPromises = serverConfigs.map(config => this.initializeServer(config));
    await Promise.all(initPromises);
  }

  /**
   * Initializes a single MCP server with the given configuration.
   *
   * @param config - The server configuration (command, args, env, etc.).
   * @returns A promise that resolves once the server is connected.
   *
   * @remarks
   * - Uses `StdioClientTransport` to spawn and communicate with the MCP server.
   * - Creates a `Client` instance and connects it to the transport.
   * - Stores both client and transport in internal maps for future reference.
   */
  private async initializeServer(config: MCPServerConfig): Promise<void> {
    try {
      const transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: config.env,
      });

      const client = new Client({
        name: `el-professor-cli-${config.name}`,
        version: '0.0.1',
      });

      await client.connect(transport);

      this.clients.set(config.name, client);
      this.transports.set(config.name, transport);

      console.log(`✓ Initialized MCP server: ${config.name}`);
    } catch (error) {
      console.error(`✗ Failed to initialize MCP server ${config.name}:`, error);
    }
  }

  /**
   * Retrieves the MCP client for a specific server.
   *
   * @param serverName - The name of the server.
   * @returns The `Client` instance if found, otherwise `undefined`.
   */
  public getClient(serverName: string): Client | undefined {
    return this.clients.get(serverName);
  }

  /**
   * Returns all active MCP client instances.
   *
   * @returns Array of connected `Client` instances.
   */
  public getAllClients(): Client[] {
    return Array.from(this.clients.values());
  }

  /**
   * Closes all active MCP clients and clears internal state.
   *
   * @returns A promise that resolves when all clients are closed.
   *
   * @remarks
   * - Errors during client closure are caught and logged.
   * - After completion, both `clients` and `transports` maps are cleared.
   */
  public async closeAll(): Promise<void> {
    const closePromises = Array.from(this.clients.values()).map(client =>
      client.close().catch(error => console.error('Error closing MCP client:', error))
    );

    await Promise.all(closePromises);
    this.clients.clear();
    this.transports.clear();
  }

  /**
   * Checks if a server is currently connected.
   *
   * @param serverName - The name of the server.
   * @returns True if the server is connected, false otherwise.
   */
  public isServerConnected(serverName: string): boolean {
    return this.clients.has(serverName);
  }

  /**
   * Gets the names of all connected MCP servers.
   *
   * @returns An array of server names that are currently connected.
   */
  public getConnectedServers(): string[] {
    return Array.from(this.clients.keys());
  }
}
