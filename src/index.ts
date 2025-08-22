import { CLIInterface } from './cli/CLIInterface.ts';

/**
 * Main entrypoint for the ElProfessor CLI application.
 *
 * - Initializes the CLI interface.
 * - Sets up graceful shutdown on `SIGINT` (Ctrl+C) and `SIGTERM` (kill).
 * - Starts the CLI and handles startup errors.
 *
 * @returns A promise that resolves when the application completes execution.
 */
async function main(): Promise<void> {
  const cli = new CLIInterface();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    process.exit(0);
  });

  try {
    await cli.start();
  } catch (error) {
    console.error('Failed to start ElProfessor CLI:', error);
    process.exit(1);
  }
}

/**
 * Executes `main()` only when this file is run directly via Node.
 * 
 * This check ensures that if the file is imported as a module, 
 * `main()` will not run automatically.
 */
if (require.main === module) {
  main();
}