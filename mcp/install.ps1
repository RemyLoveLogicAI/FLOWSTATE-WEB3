# FlowState AI Voice MCP Installation Script (Windows)

Write-Host "🚀 Installing FlowState AI Voice MCP..." -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

Write-Host "🔨 Building MCP server..." -ForegroundColor Blue
npm run build

Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Set up your API keys in .env file:"
Write-Host "   OPENAI_API_KEY=your-key-here"
Write-Host "   ELEVENLABS_API_KEY=your-key-here (optional)"
Write-Host ""
Write-Host "2. Configure your IDE:"
Write-Host ""
Write-Host "   Claude Desktop:" -ForegroundColor Yellow
Write-Host "   Copy config/claude-desktop.json settings to:"
Write-Host "   $env:APPDATA\Claude\claude_desktop_config.json"
Write-Host ""
Write-Host "   VSCode:" -ForegroundColor Yellow
Write-Host "   Add config/vscode-settings.json to your .vscode/settings.json"
Write-Host ""
Write-Host "   Cursor:" -ForegroundColor Yellow
Write-Host "   Add config/cursor-settings.json to your settings"
Write-Host ""
Write-Host "3. Try the CLI:"
Write-Host "   npm run cli interactive"
Write-Host ""
Write-Host "🎤 Voice capabilities ready!" -ForegroundColor Green
