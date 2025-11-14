#!/bin/bash

# 🏗️ Frontend Build & Deployment Test
# Tests build process, bundle size, and deployment readiness

FRONTEND_DIR="/home/user/webapp/frontend"
OUTPUT_DIR="./test-results"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

mkdir -p "$OUTPUT_DIR"

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        🏗️  Frontend Build & Deployment Test Suite          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Frontend Directory:${NC} $FRONTEND_DIR"
echo -e "${BLUE}Test Start:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Helper function to record test result
record_test() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if [ "$status" = "PASS" ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✓${NC} $test_name ${GREEN}[PASS]${NC}"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}✗${NC} $test_name ${RED}[FAIL]${NC}"
        if [ -n "$details" ]; then
            echo -e "  ${RED}└─${NC} $details"
        fi
    fi
}

cd "$FRONTEND_DIR"

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}1. DEPENDENCIES CHECK${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 1.1: package.json exists
if [ -f "package.json" ]; then
    record_test "package.json exists" "PASS"
else
    record_test "package.json exists" "FAIL" "File not found"
fi

# Test 1.2: node_modules directory
if [ -d "node_modules" ]; then
    module_count=$(ls -1 node_modules | wc -l)
    record_test "node_modules installed" "PASS" "$module_count packages"
else
    record_test "node_modules installed" "FAIL" "Run npm install"
fi

# Test 1.3: Check critical dependencies
critical_deps=("react" "react-dom" "vite")
for dep in "${critical_deps[@]}"; do
    if [ -d "node_modules/$dep" ]; then
        record_test "Critical dependency: $dep" "PASS"
    else
        record_test "Critical dependency: $dep" "FAIL"
    fi
done

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}2. SOURCE CODE VALIDATION${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 2.1: index.html exists
if [ -f "index.html" ]; then
    record_test "index.html exists" "PASS"
else
    record_test "index.html exists" "FAIL"
fi

# Test 2.2: Main entry point
if [ -f "src/main.jsx" ] || [ -f "src/main.tsx" ]; then
    record_test "Main entry point exists" "PASS"
else
    record_test "Main entry point exists" "FAIL"
fi

# Test 2.3: Source directory structure
required_dirs=("src" "public")
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        record_test "Directory: $dir" "PASS"
    else
        record_test "Directory: $dir" "FAIL"
    fi
done

# Test 2.4: Count source files
jsx_count=$(find src -name "*.jsx" 2>/dev/null | wc -l)
tsx_count=$(find src -name "*.tsx" 2>/dev/null | wc -l)
total_src=$((jsx_count + tsx_count))

if [ $total_src -gt 0 ]; then
    record_test "Source files present" "PASS" "$total_src files"
else
    record_test "Source files present" "WARN" "No .jsx/.tsx files found"
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}3. BUILD PROCESS${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 3.1: Clean previous build
echo -e "${YELLOW}  Cleaning previous build...${NC}"
rm -rf dist
if [ ! -d "dist" ]; then
    record_test "Clean build directory" "PASS"
else
    record_test "Clean build directory" "FAIL"
fi

# Test 3.2: Run build
echo -e "${YELLOW}  Running build (this may take a minute)...${NC}"
build_start=$(date +%s)
if npm run build > "$OUTPUT_DIR/build-output-$TIMESTAMP.log" 2>&1; then
    build_end=$(date +%s)
    build_time=$((build_end - build_start))
    record_test "Build completes successfully" "PASS" "${build_time}s"
else
    record_test "Build completes successfully" "FAIL" "Check build log"
fi

# Test 3.3: Build output directory
if [ -d "dist" ]; then
    record_test "Build output directory created" "PASS"
else
    record_test "Build output directory created" "FAIL"
fi

# Test 3.4: Essential build files
if [ -f "dist/index.html" ]; then
    record_test "index.html in build output" "PASS"
else
    record_test "index.html in build output" "FAIL"
fi

# Test 3.5: Assets directory
if [ -d "dist/assets" ]; then
    asset_count=$(ls -1 dist/assets 2>/dev/null | wc -l)
    record_test "Assets directory created" "PASS" "$asset_count files"
else
    record_test "Assets directory created" "FAIL"
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}4. BUNDLE ANALYSIS${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 4.1: Calculate total bundle size
if [ -d "dist" ]; then
    total_size=$(du -sb dist 2>/dev/null | cut -f1)
    total_size_mb=$(echo "scale=2; $total_size / 1048576" | bc)
    
    if (( $(echo "$total_size_mb < 10" | bc -l) )); then
        record_test "Bundle size reasonable" "PASS" "${total_size_mb}MB"
    else
        record_test "Bundle size reasonable" "WARN" "${total_size_mb}MB (>10MB)"
    fi
fi

# Test 4.2: JavaScript bundle size
if [ -d "dist/assets" ]; then
    js_size=$(find dist/assets -name "*.js" -exec du -b {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}')
    if [ -n "$js_size" ] && [ "$js_size" -gt 0 ]; then
        js_size_mb=$(echo "scale=2; $js_size / 1048576" | bc)
        if (( $(echo "$js_size_mb < 5" | bc -l) )); then
            record_test "JavaScript bundle size" "PASS" "${js_size_mb}MB"
        else
            record_test "JavaScript bundle size" "WARN" "${js_size_mb}MB (>5MB)"
        fi
    fi
fi

# Test 4.3: CSS bundle size
if [ -d "dist/assets" ]; then
    css_size=$(find dist/assets -name "*.css" -exec du -b {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}')
    if [ -n "$css_size" ] && [ "$css_size" -gt 0 ]; then
        css_size_kb=$(echo "scale=2; $css_size / 1024" | bc)
        if (( $(echo "$css_size_kb < 500" | bc -l) )); then
            record_test "CSS bundle size" "PASS" "${css_size_kb}KB"
        else
            record_test "CSS bundle size" "WARN" "${css_size_kb}KB (>500KB)"
        fi
    fi
fi

# Test 4.4: Asset file count
if [ -d "dist/assets" ]; then
    asset_count=$(ls -1 dist/assets | wc -l)
    record_test "Asset files generated" "PASS" "$asset_count files"
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}5. DEPLOYMENT READINESS${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 5.1: wrangler.toml exists
if [ -f "wrangler.toml" ]; then
    record_test "wrangler.toml exists" "PASS"
else
    record_test "wrangler.toml exists" "FAIL"
fi

# Test 5.2: Build output matches config
if [ -f "wrangler.toml" ]; then
    output_dir=$(grep "pages_build_output_dir" wrangler.toml | cut -d '"' -f 2)
    if [ -d "$output_dir" ]; then
        record_test "Build output matches wrangler config" "PASS" "$output_dir"
    else
        record_test "Build output matches wrangler config" "FAIL"
    fi
fi

# Test 5.3: HTML has proper meta tags
if [ -f "dist/index.html" ]; then
    if grep -q "charset" dist/index.html; then
        record_test "HTML has charset meta tag" "PASS"
    else
        record_test "HTML has charset meta tag" "FAIL"
    fi
    
    if grep -q "viewport" dist/index.html; then
        record_test "HTML has viewport meta tag" "PASS"
    else
        record_test "HTML has viewport meta tag" "FAIL"
    fi
fi

# Test 5.4: Assets are fingerprinted
if [ -d "dist/assets" ]; then
    fingerprinted=$(ls dist/assets | grep -E '\-[a-f0-9]{8,}\.' | wc -l)
    if [ $fingerprinted -gt 0 ]; then
        record_test "Assets are fingerprinted" "PASS" "$fingerprinted files"
    else
        record_test "Assets are fingerprinted" "WARN" "No fingerprinting detected"
    fi
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}6. CONFIGURATION VALIDATION${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 6.1: Vite config exists
if [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
    record_test "Vite config exists" "PASS"
else
    record_test "Vite config exists" "FAIL"
fi

# Test 6.2: Tailwind config exists
if [ -f "tailwind.config.js" ] || [ -f "tailwind.config.ts" ]; then
    record_test "Tailwind config exists" "PASS"
else
    record_test "Tailwind config exists" "WARN"
fi

# Test 6.3: PostCSS config exists
if [ -f "postcss.config.js" ]; then
    record_test "PostCSS config exists" "PASS"
else
    record_test "PostCSS config exists" "WARN"
fi

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                     TEST RESULTS SUMMARY                     ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Test Completion:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${BLUE}Total Tests:${NC} $TESTS_TOTAL"
echo -e "${GREEN}Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Failed:${NC} $TESTS_FAILED"
echo ""

# Calculate success rate
success_rate=$(echo "scale=1; ($TESTS_PASSED * 100) / $TESTS_TOTAL" | bc)
echo -e "${BLUE}Success Rate:${NC} ${success_rate}%"

# Grade
if (( $(echo "$success_rate >= 95" | bc -l) )); then
    grade="A+"
    color=$GREEN
elif (( $(echo "$success_rate >= 85" | bc -l) )); then
    grade="A"
    color=$GREEN
elif (( $(echo "$success_rate >= 75" | bc -l) )); then
    grade="B"
    color=$YELLOW
else
    grade="C"
    color=$YELLOW
fi

echo -e "${BLUE}Grade:${NC} ${color}$grade${NC}"
echo ""

# Save build stats
if [ -d "dist" ]; then
    cat > "$OUTPUT_DIR/build-stats-$TIMESTAMP.txt" <<EOF
Frontend Build Statistics
=========================
Build Date: $(date '+%Y-%m-%d %H:%M:%S')
Build Time: ${build_time:-N/A}s

Bundle Sizes:
- Total: ${total_size_mb:-N/A}MB
- JavaScript: ${js_size_mb:-N/A}MB
- CSS: ${css_size_kb:-N/A}KB

File Counts:
- Assets: ${asset_count:-0}
- Source Files: ${total_src:-0}

Test Results:
- Total Tests: $TESTS_TOTAL
- Passed: $TESTS_PASSED
- Failed: $TESTS_FAILED
- Success Rate: ${success_rate}%
- Grade: $grade

Deployment Status: $([ $TESTS_FAILED -eq 0 ] && echo "READY" || echo "NEEDS FIXES")
EOF
    
    echo -e "${GREEN}✓${NC} Build stats saved to: $OUTPUT_DIR/build-stats-$TIMESTAMP.txt"
fi

echo ""

# Exit with proper code
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓${NC} All tests passed! Frontend is ready for deployment."
    exit 0
else
    echo -e "${YELLOW}⚠${NC}  Some tests failed. Review issues before deployment."
    exit 1
fi
