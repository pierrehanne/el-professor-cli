# 🤖 ElProfessor CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

### 💻 **Interactive CLI**
- **Specialized Commands**: Purpose-built commands for different AWS tasks
- **Streaming Responses**: Real-time response streaming
- **History Management**: View and manage conversation history
- **Professional Interface**: Clean, intuitive command-line experience

### 🧠 **AI-Powered AWS Expertise**
- **Google GenAI Integration**: Uses Gemini models for intelligent AWS responses
- **Streaming Support**: Real-time response streaming for better UX
- **Context Awareness**: Maintains conversation history for better assistance

### 🔗 **AWS MCP Server Integrations**
- **AWS Documentation**: Access to comprehensive AWS service documentation
- **Terraform Generator**: Create production-ready Terraform configurations
- **CDK Generator**: Generate AWS CDK code in multiple languages
- **Architecture Diagrams**: Create visual AWS architecture diagrams  
- **Code Documentation**: Generate comprehensive code documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm
- Python 3.10+ and pip (for MCP servers)
- Gemini API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd el-professor-cli

# Quick setup
npm install
pip install uvx
```

### Configuration

Add your Gemini API key to `.env`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-pro
```

### Run

```bash
# Development mode
npm run dev
```

## 📖 Usage

### CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/terraform <description>` | Generate Terraform code | `/terraform create VPC with subnets` |
| `/cdk <description>` | Generate CDK code | `/cdk serverless API with Lambda` |
| `/diagram <description>` | Create architecture diagrams | `/diagram microservices on EKS` |
| `/docs <code>` | Generate documentation | `/docs explain this Lambda function` |
| `/stream <message>` | Stream responses | `/stream explain AWS networking` |
| `/history` | Show conversation history | `/history` |
| `/clear` | Clear history | `/clear` |
| `/exit` | Exit application | `/exit` |

### Example Interactions

```bash
🤖 ElProfessor CLI - Ready to assist!
Connected MCP Servers: aws-documentation, terraform, cdk, aws-diagram, code-doc-gen

> What's the best way to set up a highly available web application on AWS?

> /terraform create a VPC with public and private subnets, ALB, and auto scaling group

> /cdk create a serverless API with Lambda, API Gateway, and DynamoDB

> /diagram show me a microservices architecture using EKS and RDS
```

## 🏗️ Architecture

```
src/
├── agent/          
│   └── ElProfessor.ts
├── cli/
│   └── CLIInterface.ts
├── config/
│   └── ConfigManager.ts
├── mcp/t
│   └── MCPManager.ts 
├── services/
│   └── GenAIService.ts
├── types/
│   └── index.ts
└── utils/
    ├── Logger.ts
    ├── ErrorHandler.ts
    └── RetryHelper.ts
```

## 🧪 Development

### Testing

```bash
npm test                   # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run tests and linting: `make test lint`
5. Commit changes: `git commit -m 'feat: add amazing feature'`
6. Push and create a PR

## 🙏 Acknowledgments

- [Google GenAI](https://github.com/google/genai) - AI integration
- [Model Context Protocol](https://github.com/modelcontextprotocol/sdk) - MCP framework
- [AWS Labs](https://github.com/awslabs) - MCP servers

## 🔗 Links

- [Documentation](README.md)
- [Changelog](CHANGELOG.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Issues](https://github.com/pierrehanne/el-professor-cli/issues)