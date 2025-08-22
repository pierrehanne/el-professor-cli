import * as readline from 'readline';
import { ElProfessor } from '../agent/ElProfessor';

/**
 * CLIInterface
 *
 * Simple command-line interface that exposes ElProfessor functionality to a user.
 * - Initializes the ElProfessor and its MCP servers
 * - Provides an interactive prompt for free-form questions or slash commands
 * - Supports streaming responses and maintains access to conversation history
 */
export class CLIInterface {
  
  /** The ElProfessor that performs LLM calls and MCP orchestration. */
  private agent: ElProfessor;

  /** Readline interface used for user I/O. */
  private rl: readline.Interface;

  /**
   * Construct a CLIInterface.
   * Instantiates an ElProfessor and a readline interface bound to stdin/stdout.
   */
  constructor() {
    this.agent = new ElProfessor();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Start the CLI:
   *  - Initialize the underlying agent (starts MCP servers)
   *  - Print welcome/help text
   *  - Enter the interactive prompt loop
   *
   * @returns Promise<void>
   */
  public async start(): Promise<void> {
    await this.agent.initialize();
    this.showWelcome();
    this.startInteractiveSession();
  }

  /**
   * Output a welcome banner and available commands to the console.
   * Designed to be human-readable for CLI users.
   */
  private showWelcome(): void {
    console.log('\n🤖 ElProfessor CLI - Ready to assist!');
    console.log('Connected MCP Servers:', this.agent.getConnectedServers().join(', '));
    console.log('\nAvailable commands:');
    console.log('  /terraform <description>  - Generate Terraform code');
    console.log('  /cdk <description>        - Generate CDK code');
    console.log('  /diagram <description>    - Create architecture diagram');
    console.log('  /docs <code>              - Generate documentation');
    console.log('  /stream <message>         - Stream response');
    console.log('  /history                  - Show conversation history');
    console.log('  /clear                    - Clear history');
    console.log('  /exit                     - Exit the application');
    console.log('\nType your questions or use commands above:\n');
  }

  /**
   * Start the readline question loop.
   * Each input is dispatched to handleInput, after which the loop continues.
   */
  private startInteractiveSession(): void {
    this.rl.question('> ', async (input) => {
      await this.handleInput(input.trim());
      this.startInteractiveSession();
    });
  }

  /**
   * High-level dispatcher for user input.
   * - Empty input is ignored.
   * - Inputs starting with '/' are treated as commands.
   * - Otherwise the input is treated as a free-form AWS question.
   *
   * Errors are caught and printed to the console to avoid crashing the CLI.
   *
   * @param input - Raw user input string
   */
  private async handleInput(input: string): Promise<void> {
    if (!input) {
      return;
    }

    try {
      if (input.startsWith('/')) {
        await this.handleCommand(input);
      } else {
        await this.handleChat(input);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  /**
   * Parse and execute a slash-command.
   *
   * Supported commands:
   * - /terraform <description>
   * - /cdk <description>
   * - /diagram <description>
   * - /docs <codeOrDescription>
   * - /stream <message>
   * - /history
   * - /clear
   * - /exit
   *
   * @param command - Full command string (leading '/')
   */
  private async handleCommand(command: string): Promise<void> {
    const [cmd, ...args] = command.split(' ');
    const content = args.join(' ');

    switch (cmd) {
      case '/terraform':
        if (!content) {
          console.log('Usage: /terraform <description>');
          return;
        }
        console.log('🔧 Generating Terraform configuration...');
        const terraformResponse = await this.agent.generateTerraform(content);
        this.printResponse(terraformResponse);
        break;

      case '/cdk':
        if (!content) {
          console.log('Usage: /cdk <description>');
          return;
        }
        console.log('🏗️ Generating CDK code...');
        const cdkResponse = await this.agent.generateCDK(content);
        this.printResponse(cdkResponse);
        break;

      case '/diagram':
        if (!content) {
          console.log('Usage: /diagram <description>');
          return;
        }
        console.log('📊 Creating architecture diagram...');
        const diagramResponse = await this.agent.createArchitectureDiagram(content);
        this.printResponse(diagramResponse);
        break;

      case '/docs':
        if (!content) {
          console.log('Usage: /docs <code or description>');
          return;
        }
        console.log('📝 Generating documentation...');
        const docsResponse = await this.agent.generateDocumentation(content);
        this.printResponse(docsResponse);
        break;

      case '/stream':
        if (!content) {
          console.log('Usage: /stream <message>');
          return;
        }
        console.log('💬 Streaming response...\n');
        const stream = await this.agent.chatStream(content);
        for await (const chunk of stream) {
          process.stdout.write(chunk);
        }
        console.log('\n');
        break;

      case '/history':
        this.showHistory();
        break;

      case '/clear':
        this.agent.clearHistory();
        console.log('✓ History cleared');
        break;

      case '/exit':
        await this.shutdown();
        process.exit(0);

      default:
        console.log('❓ Unknown command. Type a question or use available commands.');
    }
  }

  /**
   * Handle a free-form chat message (non-command).
   * Uses `askAWSQuestion` to wrap the message with the AWS expert prompt.
   *
   * @param message - The user's question
   */
  private async handleChat(message: string): Promise<void> {
    console.log('🤔 Thinking...');
    const response = await this.agent.askAWSQuestion(message);
    this.printResponse(response);
  }

  /**
   * Print an AgentResponse to stdout.
   * - Prints `response.text`
   * - If function calls are present, prints them as formatted JSON
   *
   * @param response - The AgentResponse or compatible object
   */
  private printResponse(response: any): void {
    console.log('\n📋 Response:');
    console.log(response.text);

    if (response.functionCalls && response.functionCalls.length > 0) {
      console.log('\n🔧 Function Calls:', JSON.stringify(response.functionCalls, null, 2));
    }
    console.log('');
  }

  /**
   * Show the bounded conversation history (last 20 messages).
   * Each message shows an index, timestamp, role icon, and truncated content.
   */
  private showHistory(): void {
    const history = this.agent.getConversationHistory();
    if (history.length === 0) {
      console.log('📝 No conversation history');
      return;
    }

    console.log('\n📝 Conversation History:');
    history.forEach((msg, index) => {
      const timestamp = msg.timestamp.toLocaleTimeString();
      const role = msg.role === 'user' ? '👤' : '🤖';
      console.log(`${index + 1}. [${timestamp}] ${role} ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
    });
    console.log('');
  }

  /**
   * Gracefully shutdown the CLI and the underlying agent.
   * - Instructs ElProfessor to shutdown (closing MCP connections)
   * - Closes the readline interface
   *
   * @returns Promise<void>
   */
  private async shutdown(): Promise<void> {
    console.log('👋 Goodbye!');
    await this.agent.shutdown();
    this.rl.close();
  }
}
