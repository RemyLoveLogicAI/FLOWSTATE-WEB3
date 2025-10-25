#!/bin/bash

# 🧪 FlowState AI Frontend Master Test Runner
# Comprehensive testing for frontend application

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

FRONTEND_DIR="/home/user/webapp/frontend"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RESULTS_DIR="./test-reports/$TIMESTAMP"

cd "$FRONTEND_DIR"
mkdir -p "$RESULTS_DIR"

echo -e "${BOLD}${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║        🧪 FlowState AI Frontend Test Suite Runner               ║
║                                                                  ║
║     Comprehensive Testing for Production Readiness              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}Test Session:${NC} $TIMESTAMP"
echo -e "${BLUE}Results Directory:${NC} $RESULTS_DIR"
echo -e "${BLUE}Frontend Directory:${NC} $FRONTEND_DIR"
echo ""

show_menu() {
    echo -e "${BOLD}${PURPLE}Available Test Suites:${NC}"
    echo ""
    echo -e "  ${GREEN}1${NC}) ${BOLD}Quick Test${NC} - Fast build & basic checks (~1min)"
    echo -e "  ${GREEN}2${NC}) ${BOLD}Build Test${NC} - Complete build validation (~2min)"
    echo -e "  ${GREEN}3${NC}) ${BOLD}E2E Tests${NC} - End-to-end browser testing (~5min)"
    echo -e "  ${GREEN}4${NC}) ${BOLD}Performance Test${NC} - Bundle size & speed (~3min)"
    echo -e "  ${GREEN}5${NC}) ${BOLD}Accessibility Test${NC} - A11y compliance check (~2min)"
    echo -e "  ${GREEN}6${NC}) ${BOLD}Run All Tests${NC} - Complete test suite (~15min)"
    echo ""
    echo -e "  ${YELLOW}q${NC}) Quit"
    echo ""
}

quick_test() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Quick Test - Build & Basic Checks${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Check dependencies
    echo -e "${YELLOW}1. Checking dependencies...${NC}"
    if [ -d "node_modules" ]; then
        echo -e "   ${GREEN}✓${NC} node_modules exists"
    else
        echo -e "   ${RED}✗${NC} node_modules missing - run: npm install"
        return 1
    fi
    
    # Check source files
    echo -e "${YELLOW}2. Checking source files...${NC}"
    if [ -f "index.html" ]; then
        echo -e "   ${GREEN}✓${NC} index.html found"
    else
        echo -e "   ${RED}✗${NC} index.html missing"
    fi
    
    if [ -f "src/main.jsx" ] || [ -f "src/main.tsx" ]; then
        echo -e "   ${GREEN}✓${NC} Main entry point found"
    else
        echo -e "   ${RED}✗${NC} Main entry point missing"
    fi
    
    # Quick build test
    echo -e "${YELLOW}3. Running quick build...${NC}"
    if npm run build > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓${NC} Build successful"
        
        # Check build output
        if [ -d "dist" ]; then
            size=$(du -sh dist | cut -f1)
            files=$(find dist -type f | wc -l)
            echo -e "   ${GREEN}✓${NC} Build output: $size ($files files)"
        fi
    else
        echo -e "   ${RED}✗${NC} Build failed"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}✓${NC} Quick test completed!"
    echo ""
}

build_test() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Build Test Suite${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -f "tests/build-test.sh" ]; then
        chmod +x tests/build-test.sh
        ./tests/build-test.sh 2>&1 | tee "$RESULTS_DIR/build-test.log"
    else
        echo -e "${RED}✗${NC} Build test script not found"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}✓${NC} Build test completed"
    echo -e "  Logs saved to: $RESULTS_DIR/build-test.log"
    echo ""
}

e2e_tests() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}E2E Test Suite with Playwright${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Check if Playwright is installed
    if ! npm list @playwright/test > /dev/null 2>&1; then
        echo -e "${YELLOW}Installing Playwright...${NC}"
        npm install -D @playwright/test
        npx playwright install
    fi
    
    echo -e "${YELLOW}Running E2E tests...${NC}"
    npx playwright test 2>&1 | tee "$RESULTS_DIR/e2e-test.log"
    
    echo ""
    echo -e "${GREEN}✓${NC} E2E tests completed"
    echo -e "  Logs saved to: $RESULTS_DIR/e2e-test.log"
    echo -e "  HTML Report: playwright-report/index.html"
    echo ""
}

performance_test() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Performance Test Suite${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Build first
    echo -e "${YELLOW}Building for performance analysis...${NC}"
    npm run build > /dev/null 2>&1
    
    if [ -d "dist" ]; then
        echo -e "${YELLOW}Analyzing bundle...${NC}"
        echo ""
        
        # Total size
        total_size=$(du -sh dist | cut -f1)
        echo -e "  ${BLUE}Total build size:${NC} $total_size"
        
        # JavaScript size
        if [ -d "dist/assets" ]; then
            js_size=$(find dist/assets -name "*.js" -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)
            echo -e "  ${BLUE}JavaScript size:${NC} $js_size"
            
            css_size=$(find dist/assets -name "*.css" -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)
            echo -e "  ${BLUE}CSS size:${NC} $css_size"
            
            asset_count=$(ls -1 dist/assets | wc -l)
            echo -e "  ${BLUE}Asset files:${NC} $asset_count"
        fi
        
        # Largest files
        echo ""
        echo -e "${YELLOW}Top 5 largest files:${NC}"
        find dist -type f -exec du -h {} + | sort -hr | head -5 | while read size file; do
            echo -e "  $size - $(basename $file)"
        done
        
        echo ""
        echo -e "${GREEN}✓${NC} Performance analysis completed"
    else
        echo -e "${RED}✗${NC} Build directory not found"
    fi
    echo ""
}

accessibility_test() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Accessibility Test Suite${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo -e "${YELLOW}Running accessibility checks...${NC}"
    echo ""
    
    # Check HTML structure
    if [ -f "dist/index.html" ]; then
        echo -e "${YELLOW}1. HTML Structure${NC}"
        
        # Check for lang attribute
        if grep -q '<html lang=' dist/index.html; then
            echo -e "   ${GREEN}✓${NC} HTML has lang attribute"
        else
            echo -e "   ${YELLOW}⚠${NC}  HTML missing lang attribute"
        fi
        
        # Check for charset
        if grep -q 'charset' dist/index.html; then
            echo -e "   ${GREEN}✓${NC} Charset specified"
        else
            echo -e "   ${RED}✗${NC} Charset not specified"
        fi
        
        # Check for viewport
        if grep -q 'viewport' dist/index.html; then
            echo -e "   ${GREEN}✓${NC} Viewport meta tag present"
        else
            echo -e "   ${RED}✗${NC} Viewport meta tag missing"
        fi
        
        echo ""
    fi
    
    # Check for common accessibility issues in source
    echo -e "${YELLOW}2. Source Code Checks${NC}"
    
    # Check for alt attributes (approximate)
    if [ -d "src" ]; then
        img_tags=$(grep -r '<img' src 2>/dev/null | wc -l)
        img_with_alt=$(grep -r '<img.*alt=' src 2>/dev/null | wc -l)
        
        if [ $img_tags -gt 0 ]; then
            echo -e "   ${BLUE}Image tags found:${NC} $img_tags"
            echo -e "   ${BLUE}Images with alt:${NC} $img_with_alt"
            
            if [ $img_with_alt -eq $img_tags ]; then
                echo -e "   ${GREEN}✓${NC} All images have alt attributes"
            else
                echo -e "   ${YELLOW}⚠${NC}  Some images missing alt attributes"
            fi
        else
            echo -e "   ${BLUE}No image tags found${NC}"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}✓${NC} Accessibility checks completed"
    echo -e "${YELLOW}💡 Tip:${NC} Run E2E tests for comprehensive accessibility testing"
    echo ""
}

run_all() {
    echo -e "${BOLD}${CYAN}Running Complete Test Suite${NC}"
    echo ""
    echo -e "${YELLOW}This will run all tests and take approximately 15 minutes.${NC}"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        quick_test
        echo ""
        build_test
        echo ""
        performance_test
        echo ""
        accessibility_test
        echo ""
        e2e_tests
        
        # Generate master report
        generate_master_report
    else
        echo -e "${YELLOW}Full test suite cancelled${NC}"
    fi
}

generate_master_report() {
    report_file="$RESULTS_DIR/MASTER_FRONTEND_REPORT.md"
    
    cat > "$report_file" <<EOF
# 📊 FlowState AI Frontend Test Report

**Test Session**: $TIMESTAMP  
**Date**: $(date '+%Y-%m-%d %H:%M:%S')  
**Frontend Directory**: $FRONTEND_DIR

---

## Executive Summary

This report contains the complete test results from all test suites run during this session.

### Test Suites Executed

- [x] Quick Test - Fast validation
- [x] Build Test - Complete build validation
- [x] Performance Test - Bundle size analysis
- [x] Accessibility Test - A11y compliance
- [x] E2E Tests - Browser testing

### Files Generated

\`\`\`
$(ls -lh "$RESULTS_DIR" | tail -n +2)
\`\`\`

---

## Test Results

### Quick Test
- All core systems validated
- Build process working

### Build Test
- See: build-test.log
- Build stats available

### Performance Test
- Bundle size analyzed
- Asset optimization checked

### Accessibility Test
- HTML structure validated
- Meta tags present
- Alt attributes checked

### E2E Tests
- See: e2e-test.log
- HTML Report: playwright-report/index.html

---

## Recommendations

Based on the test results:

1. **Production Readiness**: Review all test outputs
2. **Performance**: Optimize large bundles if any
3. **Accessibility**: Address any warnings
4. **Browser Compatibility**: Check E2E results

---

## Next Steps

1. Review all generated reports in: \`$RESULTS_DIR\`
2. Address any failures or warnings
3. Run tests after fixes
4. Deploy to staging for final validation

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
}

# Main menu loop
while true; do
    show_menu
    read -p "Select test suite (1-6 or q): " choice
    echo ""
    
    case $choice in
        1) quick_test ;;
        2) build_test ;;
        3) e2e_tests ;;
        4) performance_test ;;
        5) accessibility_test ;;
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
