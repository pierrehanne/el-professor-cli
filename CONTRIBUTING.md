# Contributing to ElProfessor CLI

Thank you for your interest in contributing to ElProfessor CLI! This guide will help you get started.

## Development Setup

1. **Prerequisites**
   - Node.js 20+ and npm
   - Python 3.10+ and pip (for MCP servers)
   - Git

2. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd el-professor-cli
   ```

3. **Install Dependencies**
   ```bash
   npm install
   pip install uvx
   ```

4. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   # or use the helper script
   ./scripts/dev.sh
   ```

## Project Structure

```
src/
├── agent/          # Main ElProfessor Agent implementation
├── cli/            # Command-line interface
├── config/         # Configuration management
├── mcp/            # MCP server management
├── services/       # External service integrations
├── types/          # TypeScript type definitions
├── utils/          # Utility functions and helpers
└── __tests__/      # Test files
```

## Development Guidelines

### Code Style
- Use TypeScript with strict mode enabled
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Maintain consistent error handling patterns

### Testing
- Write unit tests for new features
- Maintain test coverage above 80%
- Use Jest for testing framework
- Mock external dependencies in tests

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Commit Messages
Follow conventional commit format:
```
feat: add new AWS service integration
fix: resolve MCP connection timeout
docs: update API documentation
test: add unit tests for GenAI service
```

## Adding New Features

### New MCP Server Integration
1. Add server configuration to `ConfigManager.getMCPServers()`
2. Update types if needed in `src/types/index.ts`
3. Add specialized methods to `ElProfessor` class
4. Update CLI commands in `CLIInterface`
5. Add tests and documentation

### New CLI Commands
1. Add command handler in `CLIInterface.handleCommand()`
2. Add corresponding method in `ElProfessor`
3. Update help text and documentation
4. Add tests for the new command

### New Utility Functions
1. Add to appropriate file in `src/utils/`
2. Export from the module
3. Add comprehensive tests
4. Update documentation

## Error Handling

### Custom Errors
Use the custom error classes:
```typescript
import { ConfigurationError, MCPConnectionError, GenAIError } from '../utils/ErrorHandler';

throw new ConfigurationError('Invalid API key format');
```

### Error Handling Pattern
```typescript
import { ErrorHandler } from '../utils/ErrorHandler';

try {
  await riskyOperation();
} catch (error) {
  ErrorHandler.handle(error, 'operation-context');
  // Handle gracefully or re-throw
}
```

## Logging

Use the centralized logger:
```typescript
import { Logger } from '../utils/Logger';

const logger = Logger.getInstance();
logger.info('Operation completed successfully');
logger.error('Operation failed', { context: 'additional-data' });
```

## Documentation

### Code Documentation
- Add JSDoc comments for all public methods
- Include parameter types and return types
- Provide usage examples for complex functions

### README Updates
- Update README.md for new features
- Add examples for new CLI commands
- Update installation or setup instructions

## Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement Changes**
   - Write code following guidelines
   - Add/update tests
   - Update documentation

3. **Test Changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **PR Requirements**
   - Fill out PR template
   - Ensure all tests pass
   - Request review from maintainers
   - Address review feedback

## Getting Help

- Check existing issues and discussions
- Create an issue for bugs or feature requests
- Contact maintainers for questions

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and contribute
- Follow project guidelines

Thank you for contributing to ElProfessor CLI ! 🚀