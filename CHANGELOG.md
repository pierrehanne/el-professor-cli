# Changelog

All notable changes to ElProfessor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2025-08-22

### 🚀 Added
- Initial release of ElProfessor
- Google GenAI (Gemini) integration with streaming support
- AWS MCP server integrations:
  - AWS Documentation MCP Server
  - Terraform MCP Server  
  - CDK MCP Server
  - AWS Diagram MCP Server
  - Code Documentation Generator MCP Server
- Interactive CLI interface with specialized commands:
  - `/terraform` - Generate Terraform configurations
  - `/cdk` - Generate AWS CDK code
  - `/diagram` - Create architecture diagrams
  - `/docs` - Generate documentation
  - `/stream` - Stream responses
  - `/history` - View conversation history
  - `/clear` - Clear conversation history
- Comprehensive test suite with Jest

### ✨ Features
- **Multi-MCP Integration**: Connects to 5 specialized AWS MCP servers
- **Intelligent Responses**: Uses Gemini 2.5 for AWS expertise
- **Streaming Support**: Real-time response streaming
- **Conversation Memory**: Maintains chat context and history
- **Error Recovery**: Automatic retry for transient failures
- **Professional Logging**: Structured logging with configurable levels

### 🛠 Technical Details
- Node.js 20+ with TypeScript 5.3+
- Google GenAI SDK 1.15.0
- Model Context Protocol SDK 1.17.3
- Jest 29.4.1 for testing
- ESLint for code quality