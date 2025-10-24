#!/bin/bash
# FlowState AI - Cloudflare Deployment Script

set -e

echo "🚀 FlowState AI - Cloudflare Deployment"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found${NC}"
    echo "Installing Wrangler..."
    npm install -g wrangler
fi

echo -e "${BLUE}📦 Step 1: Installing Dependencies${NC}"
npm install
cd frontend && npm install && cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}🔨 Step 2: Building Backend Worker${NC}"
npm run build:worker
echo -e "${GREEN}✓ Worker built${NC}"
echo ""

echo -e "${BLUE}🎨 Step 3: Building Frontend${NC}"
cd frontend
npm run build
cd ..
echo -e "${GREEN}✓ Frontend built${NC}"
echo ""

echo -e "${YELLOW}📋 Deployment Options:${NC}"
echo "1) Deploy Backend Worker only"
echo "2) Deploy Frontend Pages only"
echo "3) Deploy Both (Full Stack)"
echo "4) Deploy to Staging"
echo ""
read -p "Select option (1-4): " option

case $option in
    1)
        echo -e "${BLUE}🚀 Deploying Backend Worker...${NC}"
        wrangler deploy
        echo -e "${GREEN}✓ Backend deployed!${NC}"
        ;;
    2)
        echo -e "${BLUE}🚀 Deploying Frontend Pages...${NC}"
        cd frontend
        wrangler pages deploy dist --project-name=flowstate-ai
        cd ..
        echo -e "${GREEN}✓ Frontend deployed!${NC}"
        ;;
    3)
        echo -e "${BLUE}🚀 Deploying Full Stack...${NC}"
        
        # Deploy backend
        echo "  → Deploying backend worker..."
        wrangler deploy
        
        # Deploy frontend
        echo "  → Deploying frontend pages..."
        cd frontend
        wrangler pages deploy dist --project-name=flowstate-ai
        cd ..
        
        echo -e "${GREEN}✓ Full stack deployed!${NC}"
        ;;
    4)
        echo -e "${BLUE}🚀 Deploying to Staging...${NC}"
        
        # Deploy backend to staging
        wrangler deploy --env staging
        
        # Deploy frontend to staging
        cd frontend
        wrangler pages deploy dist --project-name=flowstate-ai --branch=staging
        cd ..
        
        echo -e "${GREEN}✓ Staging deployed!${NC}"
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}═══════════════════════════════════${NC}"
echo -e "${GREEN}   Deployment Complete! 🎉${NC}"
echo -e "${GREEN}═══════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📍 Your URLs:${NC}"
echo "   Frontend: https://flowstate-ai.pages.dev"
echo "   Backend: https://flowstate-ai-backend.workers.dev"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. Configure environment variables in Cloudflare dashboard"
echo "2. Set up custom domain (optional)"
echo "3. Configure R2 buckets and D1 database"
echo "4. Test your deployment"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   https://developers.cloudflare.com/pages"
echo "   https://developers.cloudflare.com/workers"
echo ""
