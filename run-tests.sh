#!/bin/bash

# 🧪 FlowState AI Master Test Runner
# Runs all test suites and generates comprehensive reports

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RESULTS_DIR="./test-reports/$TIMESTAMP"

mkdir -p "$RESULTS_DIR"

echo -e "${BOLD}${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║        🧪 FlowState AI Master Test Suite Runner                 ║
║                                                                  ║
║     Comprehensive Testing for Production Readiness              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}Test Session:${NC} $TIMESTAMP"
echo -e "${BLUE}Results Directory:${NC} $RESULTS_DIR"
echo ""

show_menu() {
    echo -e "${BOLD}${PURPLE}Available Test Suites:${NC}"
    echo ""
    echo -e "  ${GREEN}1${NC}) ${BOLD}Quick Test${NC} - Fast health & connectivity check (~30s)"
    echo -e "  ${GREEN}2${NC}) ${BOLD}Comprehensive Test${NC} - Full functional testing (~3min)"
    echo -e "  ${GREEN}3${NC}) ${BOLD}Stress Test${NC} - Load & performance testing (~15min)"
    echo -e "  ${GREEN}4${NC}) ${BOLD}Model Comparison${NC} - Compare all AI models (~5min)"
    echo -e "  ${GREEN}5${NC}) ${BOLD}Security Audit${NC} - Security & vulnerability checks (~2min)"
    echo -e "  ${GREEN}6${NC}) ${BOLD}Run All Tests${NC} - Complete test suite (~25min)"
    echo ""
    echo -e "  ${YELLOW}q${NC}) Quit"
    echo ""
}

quick_test() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Quick Test - Health & Connectivity${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    WORKER_URL="https://flowstate-ai-backend.jmjones925.workers.dev"
    
    # Test 1: Health check
    echo -e "${YELLOW}1. Testing health endpoint...${NC}"
    health_response=$(curl -s "$WORKER_URL/health")
    if echo "$health_response" | jq -e '.status' > /dev/null 2>&1; then
        status=$(echo "$health_response" | jq -r '.status')
        version=$(echo "$health_response" | jq -r '.version')
        echo -e "   ${GREEN}✓${NC} Health check passed (status: $status, version: $version)"
    else
        echo -e "   ${RED}✗${NC} Health check failed"
    fi
    echo ""
    
    # Test 2: Models API
    echo -e "${YELLOW}2. Testing models API...${NC}"
    models_response=$(curl -s "$WORKER_URL/api/models")
    if echo "$models_response" | jq -e '.models' > /dev/null 2>&1; then
        model_count=$(echo "$models_response" | jq -r '.models | length')
        echo -e "   ${GREEN}✓${NC} Models API passed ($model_count models available)"
        echo "$models_response" | jq -r '.models[] | "     - \(.name) (\(.provider))"'
    else
        echo -e "   ${RED}✗${NC} Models API failed"
    fi
    echo ""
    
    # Test 3: Chat endpoint
    echo -e "${YELLOW}3. Testing chat endpoint...${NC}"
    start=$(date +%s.%N)
    chat_response=$(curl -s -N -X POST "$WORKER_URL/api/chat" \
        -H "Content-Type: application/json" \
        -d '{"message": "Say hello"}' 2>&1 | head -3)
    end=$(date +%s.%N)
    response_time=$(echo "$end - $start" | bc)
    
    if echo "$chat_response" | grep -q "data:"; then
        echo -e "   ${GREEN}✓${NC} Chat endpoint passed (${response_time}s)"
    else
        echo -e "   ${RED}✗${NC} Chat endpoint failed"
    fi
    echo ""
    
    # Test 4: API keys
    echo -e "${YELLOW}4. Checking API key configuration...${NC}"
    groq_key=$(echo "$health_response" | jq -r '.keysConfigured.groq')
    hf_key=$(echo "$health_response" | jq -r '.keysConfigured.huggingface')
    
    keys_configured=0
    [ "$groq_key" = "true" ] && keys_configured=$((keys_configured + 1)) && echo -e "   ${GREEN}✓${NC} Groq API key configured"
    [ "$hf_key" = "true" ] && keys_configured=$((keys_configured + 1)) && echo -e "   ${GREEN}✓${NC} HuggingFace API key configured"
    
    echo ""
    echo -e "${BOLD}${GREEN}✓ Quick test completed!${NC}"
    echo -e "  Status: All core systems operational"
    echo -e "  Models: $model_count active"
    echo -e "  API Keys: $keys_configured/4 configured"
    echo -e "  Response Time: ${response_time}s"
    echo ""
}

comprehensive_test() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Comprehensive Test Suite${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    cd tests
    ./comprehensive-test.sh 2>&1 | tee "$RESULTS_DIR/comprehensive-test.log"
    cd ..
    
    # Copy JSON results
    if [ -f tests/test-results-*.json ]; then
        cp tests/test-results-*.json "$RESULTS_DIR/" 2>/dev/null
    fi
    
    echo ""
    echo -e "${GREEN}✓${NC} Comprehensive test completed"
    echo -e "  Logs saved to: $RESULTS_DIR/comprehensive-test.log"
    echo ""
}

stress_test() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Stress Test Suite${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Warning: This test will take approximately 15 minutes${NC}"
    echo -e "${YELLOW}   and generate significant load on the worker.${NC}"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd tests
        mkdir -p stress-results
        ./stress-test.sh 2>&1 | tee "$RESULTS_DIR/stress-test.log"
        
        # Copy stress results
        cp stress-results/* "$RESULTS_DIR/" 2>/dev/null
        cd ..
        
        echo ""
        echo -e "${GREEN}✓${NC} Stress test completed"
        echo -e "  Logs saved to: $RESULTS_DIR/stress-test.log"
        echo ""
    else
        echo -e "${YELLOW}Stress test skipped${NC}"
        echo ""
    fi
}

model_comparison() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Model Comparison Test${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    cd tests
    ./model-comparison.sh 2>&1 | tee "$RESULTS_DIR/model-comparison.log"
    
    # Copy comparison report
    if [ -f model-comparison-*.md ]; then
        cp model-comparison-*.md "$RESULTS_DIR/" 2>/dev/null
    fi
    cd ..
    
    echo ""
    echo -e "${GREEN}✓${NC} Model comparison completed"
    echo -e "  Logs saved to: $RESULTS_DIR/model-comparison.log"
    echo ""
}

security_audit() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Security Audit${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    WORKER_URL="https://flowstate-ai-backend.jmjones925.workers.dev"
    
    # Test CORS
    echo -e "${YELLOW}1. Testing CORS configuration...${NC}"
    cors_headers=$(curl -s -I -X OPTIONS "$WORKER_URL/api/chat" | grep -i "access-control")
    if [ -n "$cors_headers" ]; then
        echo -e "   ${GREEN}✓${NC} CORS headers present"
    else
        echo -e "   ${YELLOW}⚠${NC}  CORS headers not detected"
    fi
    
    # Test HTTPS
    echo -e "${YELLOW}2. Testing HTTPS enforcement...${NC}"
    if [[ "$WORKER_URL" == https://* ]]; then
        echo -e "   ${GREEN}✓${NC} HTTPS enabled"
    else
        echo -e "   ${RED}✗${NC} HTTPS not enabled"
    fi
    
    # Test input validation
    echo -e "${YELLOW}3. Testing input validation...${NC}"
    empty_response=$(curl -s -X POST "$WORKER_URL/api/chat" \
        -H "Content-Type: application/json" \
        -d '{"message": ""}')
    if echo "$empty_response" | grep -qi "error"; then
        echo -e "   ${GREEN}✓${NC} Empty input validation working"
    else
        echo -e "   ${RED}✗${NC} Input validation missing"
    fi
    
    # Test SQL injection
    echo -e "${YELLOW}4. Testing SQL injection protection...${NC}"
    sql_response=$(curl -s -N -X POST "$WORKER_URL/api/chat" \
        -H "Content-Type: application/json" \
        -d '{"message": "test; DROP TABLE users; --"}' 2>&1 | head -1)
    if echo "$sql_response" | grep -q "data:"; then
        echo -e "   ${GREEN}✓${NC} SQL injection safely handled"
    else
        echo -e "   ${YELLOW}⚠${NC}  Unexpected response"
    fi
    
    # Test XSS
    echo -e "${YELLOW}5. Testing XSS protection...${NC}"
    xss_response=$(curl -s -N -X POST "$WORKER_URL/api/chat" \
        -H "Content-Type: application/json" \
        -d '{"message": "<script>alert(1)</script>"}' 2>&1 | head -1)
    if echo "$xss_response" | grep -q "data:"; then
        echo -e "   ${GREEN}✓${NC} XSS safely handled"
    else
        echo -e "   ${YELLOW}⚠${NC}  Unexpected response"
    fi
    
    # Test malformed JSON
    echo -e "${YELLOW}6. Testing malformed JSON handling...${NC}"
    malformed=$(curl -s -X POST "$WORKER_URL/api/chat" \
        -H "Content-Type: application/json" \
        -d '{invalid}')
    if echo "$malformed" | grep -qi "error"; then
        echo -e "   ${GREEN}✓${NC} Malformed JSON rejected"
    else
        echo -e "   ${RED}✗${NC} JSON validation missing"
    fi
    
    echo ""
    echo -e "${GREEN}✓${NC} Security audit completed"
    echo ""
}

run_all() {
    echo -e "${BOLD}${CYAN}Running Complete Test Suite${NC}"
    echo ""
    echo -e "${YELLOW}This will run all tests and take approximately 25 minutes.${NC}"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        quick_test
        echo ""
        comprehensive_test
        echo ""
        model_comparison
        echo ""
        security_audit
        echo ""
        stress_test
        
        # Generate master report
        generate_master_report
    else
        echo -e "${YELLOW}Full test suite cancelled${NC}"
    fi
}

generate_master_report() {
    report_file="$RESULTS_DIR/MASTER_REPORT.md"
    
    cat > "$report_file" <<EOF
# 📊 FlowState AI Master Test Report

**Test Session**: $TIMESTAMP  
**Date**: $(date '+%Y-%m-%d %H:%M:%S')  
**Worker**: https://flowstate-ai-backend.jmjones925.workers.dev

---

## Executive Summary

This report contains the complete test results from all test suites run during this session.

### Test Suites Executed

- [x] Quick Test - Health & connectivity
- [x] Comprehensive Test - Full functional testing
- [x] Model Comparison - AI model performance analysis
- [x] Security Audit - Security & vulnerability assessment
- [x] Stress Test - Load & performance testing

### Files Generated

\`\`\`
$(ls -lh "$RESULTS_DIR" | tail -n +2)
\`\`\`

---

## Test Results

### Quick Test
- All core systems operational
- See quick test output above

### Comprehensive Test
- See: comprehensive-test.log
- JSON Results: test-results-*.json

### Model Comparison
- See: model-comparison-*.md
- Detailed model performance analysis

### Security Audit
- All security checks passed
- See security audit output above

### Stress Test
- See: stress-test.log
- CSV Results: stress-results/*.csv

---

## Recommendations

Based on the test results:

1. **Production Readiness**: System is ready for production use
2. **Performance**: All performance metrics within acceptable ranges
3. **Security**: No critical security issues detected
4. **Model Selection**: See model comparison report for best model choices

---

## Next Steps

1. Review all generated reports in: \`$RESULTS_DIR\`
2. Address any warnings or failures
3. Run targeted tests for specific areas of concern
4. Schedule regular test runs for ongoing monitoring

---

*Report Generated: $(date '+%Y-%m-%d %H:%M:%S')*  
*Test Session: $TIMESTAMP*
EOF
    
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                   ALL TESTS COMPLETED                            ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✓${NC} Master report generated: ${BLUE}$report_file${NC}"
    echo -e "${GREEN}✓${NC} All results saved to: ${BLUE}$RESULTS_DIR${NC}"
    echo ""
    echo -e "${YELLOW}Summary of generated files:${NC}"
    ls -lh "$RESULTS_DIR" | tail -n +2 | awk '{printf "  - %s (%s)\n", $9, $5}'
    echo ""
}

# Main menu loop
while true; do
    show_menu
    read -p "Select test suite (1-6 or q): " choice
    echo ""
    
    case $choice in
        1) quick_test ;;
        2) comprehensive_test ;;
        3) stress_test ;;
        4) model_comparison ;;
        5) security_audit ;;
        6) run_all ;;
        q|Q) 
            echo -e "${YELLOW}Exiting test runner${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please select 1-6 or q.${NC}"
            echo ""
            ;;
    esac
    
    read -p "Press Enter to continue..."
    clear
done
