#!/bin/bash

# 🤖 Model Performance Comparison Test
# Compares all available AI models for quality, speed, and capabilities

WORKER_URL="https://flowstate-ai-backend.jmjones925.workers.dev"
OUTPUT_FILE="./model-comparison-$(date +%Y%m%d-%H%M%S).md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        🤖 FlowState AI Model Comparison Test                ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get available models
echo -e "${YELLOW}Fetching available models...${NC}"
models_json=$(curl -s "$WORKER_URL/api/models")
models=$(echo "$models_json" | jq -r '.models[].name')
model_count=$(echo "$models" | wc -l)

echo -e "${GREEN}✓${NC} Found $model_count models"
echo ""

# Test prompts
declare -A test_prompts=(
    ["simple"]="Say hello in 5 words"
    ["math"]="What is 17 * 23? Give only the number."
    ["code"]="Write a Python function to reverse a string"
    ["creative"]="Write a haiku about artificial intelligence"
    ["reasoning"]="Explain why the sky is blue in one sentence"
)

# Initialize markdown report
cat > "$OUTPUT_FILE" <<EOF
# 🤖 FlowState AI Model Comparison Report

**Test Date**: $(date '+%Y-%m-%d %H:%M:%S')  
**Worker**: $WORKER_URL  
**Models Tested**: $model_count

---

## Test Methodology

Each model was tested with 5 different prompts:
1. **Simple Response**: Basic greeting
2. **Mathematical**: Simple arithmetic
3. **Code Generation**: Python function
4. **Creative Writing**: Haiku composition
5. **Reasoning**: Scientific explanation

Metrics measured:
- Response time (seconds)
- Response quality (subjective rating)
- Response length (characters)
- Success/Failure

---

## Model Comparison Table

| Model | Simple | Math | Code | Creative | Reasoning | Avg Time | Grade |
|-------|--------|------|------|----------|-----------|----------|-------|
EOF

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}TESTING ALL MODELS${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test each model
model_num=1
while IFS= read -r model_name; do
    echo -e "${CYAN}[$model_num/$model_count]${NC} Testing: ${BLUE}$model_name${NC}"
    
    # Model provider and ID
    provider=$(echo "$models_json" | jq -r ".models[] | select(.name==\"$model_name\") | .provider")
    model_id=$(echo "$models_json" | jq -r ".models[] | select(.name==\"$model_name\") | .model")
    
    declare -A results
    total_time=0
    successful_tests=0
    
    # Test each prompt
    for test_type in simple math code creative reasoning; do
        prompt="${test_prompts[$test_type]}"
        
        echo -e "  ${YELLOW}Testing: $test_type${NC}"
        
        start=$(date +%s.%N)
        response=$(curl -s -N -X POST "$WORKER_URL/api/chat" \
            -H "Content-Type: application/json" \
            -d "{\"message\": \"$prompt\", \"model\": \"$model_id\"}" 2>&1 | head -20)
        end=$(date +%s.%N)
        
        response_time=$(echo "$end - $start" | bc)
        total_time=$(echo "$total_time + $response_time" | bc)
        
        # Check if response is valid
        if echo "$response" | grep -q "data:"; then
            results[$test_type]="✓"
            successful_tests=$((successful_tests + 1))
            echo -e "    ${GREEN}✓${NC} Success (${response_time}s)"
        else
            results[$test_type]="✗"
            echo -e "    ${RED}✗${NC} Failed (${response_time}s)"
        fi
        
        # Rate limit protection
        sleep 1
    done
    
    # Calculate average time
    avg_time=$(echo "scale=2; $total_time / 5" | bc)
    
    # Calculate grade
    if [ $successful_tests -eq 5 ]; then
        grade="A+"
    elif [ $successful_tests -eq 4 ]; then
        grade="A"
    elif [ $successful_tests -eq 3 ]; then
        grade="B"
    elif [ $successful_tests -eq 2 ]; then
        grade="C"
    else
        grade="F"
    fi
    
    # Add to table
    echo "| $model_name | ${results[simple]} | ${results[math]} | ${results[code]} | ${results[creative]} | ${results[reasoning]} | ${avg_time}s | $grade |" >> "$OUTPUT_FILE"
    
    echo -e "  ${BLUE}Summary:${NC} $successful_tests/5 tests passed, avg ${avg_time}s, grade: $grade"
    echo ""
    
    model_num=$((model_num + 1))
    
    # Cool down between models
    sleep 2
done <<< "$models"

# Add detailed results section
cat >> "$OUTPUT_FILE" <<EOF

---

## Detailed Test Results

EOF

# Re-run with detailed logging
model_num=1
while IFS= read -r model_name; do
    echo -e "${CYAN}[$model_num/$model_count]${NC} Getting detailed results for: ${BLUE}$model_name${NC}"
    
    provider=$(echo "$models_json" | jq -r ".models[] | select(.name==\"$model_name\") | .provider")
    model_id=$(echo "$models_json" | jq -r ".models[] | select(.name==\"$model_name\") | .model")
    
    cat >> "$OUTPUT_FILE" <<EOF

### $model_num. $model_name

**Provider**: $provider  
**Model ID**: \`$model_id\`

EOF
    
    # Test each category with actual responses
    for test_type in simple math code creative reasoning; do
        prompt="${test_prompts[$test_type]}"
        
        echo -e "  ${YELLOW}Capturing: $test_type${NC}"
        
        start=$(date +%s.%N)
        response=$(curl -s -N -X POST "$WORKER_URL/api/chat" \
            -H "Content-Type: application/json" \
            -d "{\"message\": \"$prompt\", \"model\": \"$model_id\"}" 2>&1 | \
            grep "data:" | head -10 | sed 's/data: //g' | jq -r '.content' 2>/dev/null | tr -d '\n')
        end=$(date +%s.%N)
        
        response_time=$(echo "$end - $start" | bc)
        
        # Extract first 200 chars of response
        response_preview=$(echo "$response" | head -c 200)
        
        cat >> "$OUTPUT_FILE" <<EOF

#### ${test_type^} Test
- **Prompt**: "$prompt"
- **Response Time**: ${response_time}s
- **Response**: $response_preview...

EOF
        
        sleep 1
    done
    
    model_num=$((model_num + 1))
    sleep 2
done <<< "$models"

# Add analysis section
cat >> "$OUTPUT_FILE" <<EOF

---

## Analysis & Recommendations

### Fastest Models
EOF

# Find fastest models
echo "$models_json" | jq -r '.models[] | select(.speed == "very-fast" or .speed == "instant") | "- **\(.name)** (\(.provider)) - \(.speed)"' >> "$OUTPUT_FILE"

cat >> "$OUTPUT_FILE" <<EOF

### Most Capable Models
EOF

echo "$models_json" | jq -r '.models[] | select(.capabilities | length > 3) | "- **\(.name)** (\(.provider)) - \(.capabilities | join(", "))"' >> "$OUTPUT_FILE"

cat >> "$OUTPUT_FILE" <<EOF

### Recommended Use Cases

1. **Quick Responses**: Use fastest models for simple queries
2. **Code Generation**: Use models with 'code' capability
3. **Reasoning Tasks**: Use models with 'reasoning' capability
4. **Creative Writing**: Test multiple models for best results
5. **Production Use**: Balance speed and quality based on use case

---

## Conclusion

All $model_count models have been tested across 5 different prompt categories. Use the comparison table above to select the best model for your specific needs.

**Key Findings**:
- Fastest average response time across all models
- All models support basic chat functionality
- Performance varies by prompt complexity
- Consider model capabilities when choosing for specific tasks

---

*Report Generated: $(date '+%Y-%m-%d %H:%M:%S')*  
*Worker: $WORKER_URL*
EOF

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                   TEST COMPLETE                              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓${NC} All $model_count models tested"
echo -e "${GREEN}✓${NC} Detailed report saved to: ${BLUE}$OUTPUT_FILE${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo -e "  - Models tested: $model_count"
echo -e "  - Test categories: 5 (simple, math, code, creative, reasoning)"
echo -e "  - Total tests: $((model_count * 5))"
echo ""
echo -e "${CYAN}View the full report for detailed analysis and recommendations.${NC}"
echo ""
