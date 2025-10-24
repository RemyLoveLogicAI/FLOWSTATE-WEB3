#!/bin/bash
# FlowState AI Voice MCP Installation Script

set -e

echo "🚀 Installing FlowState AI Voice MCP..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo -e "${BLUE}🔨 Building MCP server...${NC}"
npm run build

echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo ""
echo "1. Set up your API keys in .env file:"
echo "   OPENAI_API_KEY=your-key-here"
echo "   ELEVENLABS_API_KEY=your-key-here (optional)"
echo ""
echo "2. Configure your IDE:"
echo ""
echo "   ${YELLOW}Claude Desktop:${NC}"
echo "   Copy config/claude-desktop.json settings to:"
echo "   - macOS: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "   - Windows: %APPDATA%\\Claude\\claude_desktop_config.json"
echo ""
echo "   ${YELLOW}VSCode:${NC}"
echo "   Add config/vscode-settings.json to your .vscode/settings.json"
echo ""
echo "   ${YELLOW}Cursor:${NC}"
echo "   Add config/cursor-settings.json to your settings"
echo ""
echo "3. Try the CLI:"
echo "   npm run cli interactive"
echo ""
echo -e "${GREEN}🎤 Voice capabilities ready!${NC}"
