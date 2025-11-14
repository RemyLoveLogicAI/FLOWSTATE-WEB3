#!/bin/bash

# FlowState AI Worker Test Script
# Quick commands to test your deployed worker

WORKER_URL="https://flowstate-ai-backend.jmjones925.workers.dev"

echo "🚀 FlowState AI Worker Test Suite"
echo "=================================="
echo ""
echo "Worker URL: $WORKER_URL"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function test_health() {
    echo -e "${YELLOW}Testing Health Check...${NC}"
    curl -s "$WORKER_URL/health" | jq .
    echo ""
}

function test_models() {
    echo -e "${YELLOW}Testing Available Models...${NC}"
    curl -s "$WORKER_URL/api/models" | jq .
    echo ""
}

function test_chat() {
    echo -e "${YELLOW}Testing Chat Endpoint...${NC}"
    echo "Message: $1"
    curl -s -N -X POST "$WORKER_URL/api/chat" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"$1\"}" | head -20
    echo ""
    echo ""
}

function test_agent() {
    echo -e "${YELLOW}Testing Super Agent...${NC}"
    echo "Query: $1"
    curl -s -X POST "$WORKER_URL/api/agent" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$1\", \"maxSteps\": 3}" | jq .
    echo ""
}

# Main menu
case "$1" in
    health)
        test_health
        ;;
    models)
        test_models
        ;;
    chat)
        test_chat "${2:-Hello! How are you?}"
        ;;
    agent)
        test_agent "${2:-Calculate 123 times 456}"
        ;;
    all)
        test_health
        test_models
        test_chat "Hello! Respond in 10 words."
        ;;
    *)
        echo "Usage: $0 {health|models|chat|agent|all} [message]"
        echo ""
        echo "Examples:"
        echo "  $0 health                    # Check worker health"
        echo "  $0 models                    # List available models"
        echo "  $0 chat 'Hello AI!'          # Test chat"
        echo "  $0 agent 'Calculate 5+5'     # Test super agent"
        echo "  $0 all                       # Run all tests"
        echo ""
        exit 1
        ;;
esac
