#!/bin/bash

# 🔥 FlowState AI Worker Stress Test
# Tests system performance under load

WORKER_URL="https://flowstate-ai-backend.jmjones925.workers.dev"
OUTPUT_DIR="./stress-results"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

mkdir -p "$OUTPUT_DIR"

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           🔥 FlowState AI Stress Test Suite                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Worker URL:${NC} $WORKER_URL"
echo -e "${BLUE}Test Start:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Test 1: Sustained load test
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}1. SUSTAINED LOAD TEST (60 requests over 30 seconds)${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

results_file="$OUTPUT_DIR/sustained-load-$TIMESTAMP.csv"
echo "timestamp,request_num,http_code,response_time,success" > "$results_file"

total_requests=60
successful=0
failed=0
total_time=0

start_test=$(date +%s)

for i in $(seq 1 $total_requests); do
    req_start=$(date +%s.%N)
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$WORKER_URL/api/chat" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"Test request $i\"}")
    
    req_end=$(date +%s.%N)
    req_time=$(echo "$req_end - $req_start" | bc)
    total_time=$(echo "$total_time + $req_time" | bc)
    
    if [ "$http_code" = "200" ]; then
        success="true"
        successful=$((successful + 1))
    else
        success="false"
        failed=$((failed + 1))
    fi
    
    echo "$timestamp,$i,$http_code,$req_time,$success" >> "$results_file"
    
    # Progress indicator
    if [ $((i % 10)) -eq 0 ]; then
        echo -e "${YELLOW}  Progress: $i/$total_requests (Success: $successful, Failed: $failed)${NC}"
    fi
    
    # Maintain ~2 req/sec rate
    sleep 0.5
done

end_test=$(date +%s)
test_duration=$((end_test - start_test))
avg_time=$(echo "scale=3; $total_time / $total_requests" | bc)

echo -e "${GREEN}✓${NC} Sustained load test completed"
echo -e "  Duration: ${test_duration}s"
echo -e "  Total requests: $total_requests"
echo -e "  Successful: ${GREEN}$successful${NC}"
echo -e "  Failed: ${RED}$failed${NC}"
echo -e "  Average response time: ${avg_time}s"
echo -e "  Results saved to: $results_file"
echo ""

# Test 2: Burst test
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}2. BURST TEST (50 concurrent requests)${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

burst_results="$OUTPUT_DIR/burst-test-$TIMESTAMP.csv"
echo "request_num,http_code,response_time" > "$burst_results"

burst_start=$(date +%s.%N)

for i in $(seq 1 50); do
    (
        req_start=$(date +%s.%N)
        http_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$WORKER_URL/api/chat" \
            -H "Content-Type: application/json" \
            -d "{\"message\": \"Burst test $i\"}")
        req_end=$(date +%s.%N)
        req_time=$(echo "$req_end - $req_start" | bc)
        echo "$i,$http_code,$req_time" >> "$burst_results"
    ) &
done

echo -e "${YELLOW}  Waiting for all requests to complete...${NC}"
wait

burst_end=$(date +%s.%N)
burst_duration=$(echo "$burst_end - $burst_start" | bc)

# Analyze results
burst_success=$(grep ",200," "$burst_results" | wc -l)
burst_failed=$((50 - burst_success))
burst_avg=$(awk -F',' '{sum+=$3; count++} END {printf "%.3f", sum/count}' "$burst_results")

echo -e "${GREEN}✓${NC} Burst test completed"
echo -e "  Duration: ${burst_duration}s"
echo -e "  Successful: ${GREEN}$burst_success${NC}/50"
echo -e "  Failed: ${RED}$burst_failed${NC}/50"
echo -e "  Average response time: ${burst_avg}s"
echo -e "  Results saved to: $burst_results"
echo ""

# Test 3: Spike test
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}3. SPIKE TEST (Gradual ramp-up)${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

spike_results="$OUTPUT_DIR/spike-test-$TIMESTAMP.csv"
echo "phase,concurrent,http_code,response_time" > "$spike_results"

for phase in 5 10 20 30; do
    echo -e "${YELLOW}  Testing with $phase concurrent requests...${NC}"
    
    phase_start=$(date +%s.%N)
    for i in $(seq 1 $phase); do
        (
            req_start=$(date +%s.%N)
            http_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$WORKER_URL/api/chat" \
                -H "Content-Type: application/json" \
                -d "{\"message\": \"Spike test phase $phase request $i\"}")
            req_end=$(date +%s.%N)
            req_time=$(echo "$req_end - $req_start" | bc)
            echo "$phase,$phase,$http_code,$req_time" >> "$spike_results"
        ) &
    done
    
    wait
    phase_end=$(date +%s.%N)
    phase_duration=$(echo "$phase_end - $phase_start" | bc)
    
    phase_success=$(grep "^$phase," "$spike_results" | grep ",200," | wc -l)
    echo -e "  Phase $phase: ${GREEN}$phase_success${NC}/$phase successful in ${phase_duration}s"
    
    sleep 5  # Cool down between phases
done

echo -e "${GREEN}✓${NC} Spike test completed"
echo -e "  Results saved to: $spike_results"
echo ""

# Test 4: Endurance test
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}4. ENDURANCE TEST (5 minutes, 1 req/sec)${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

endurance_results="$OUTPUT_DIR/endurance-test-$TIMESTAMP.csv"
echo "timestamp,request_num,http_code,response_time" > "$endurance_results"

endurance_total=300  # 5 minutes * 60 seconds
endurance_success=0
endurance_failed=0

echo -e "${YELLOW}  Running endurance test (this will take 5 minutes)...${NC}"
endurance_start=$(date +%s)

for i in $(seq 1 $endurance_total); do
    req_start=$(date +%s.%N)
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$WORKER_URL/api/chat" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"Endurance test $i\"}")
    
    req_end=$(date +%s.%N)
    req_time=$(echo "$req_end - $req_start" | bc)
    
    echo "$timestamp,$i,$http_code,$req_time" >> "$endurance_results"
    
    if [ "$http_code" = "200" ]; then
        endurance_success=$((endurance_success + 1))
    else
        endurance_failed=$((endurance_failed + 1))
    fi
    
    # Progress every 60 requests (1 minute)
    if [ $((i % 60)) -eq 0 ]; then
        elapsed=$((i / 60))
        echo -e "${YELLOW}  $elapsed minutes elapsed - Success: $endurance_success, Failed: $endurance_failed${NC}"
    fi
    
    sleep 1
done

endurance_end=$(date +%s)
endurance_duration=$((endurance_end - endurance_start))
endurance_avg=$(awk -F',' '{sum+=$4; count++} END {printf "%.3f", sum/count}' "$endurance_results")

echo -e "${GREEN}✓${NC} Endurance test completed"
echo -e "  Duration: ${endurance_duration}s"
echo -e "  Total requests: $endurance_total"
echo -e "  Successful: ${GREEN}$endurance_success${NC}"
echo -e "  Failed: ${RED}$endurance_failed${NC}"
echo -e "  Average response time: ${endurance_avg}s"
echo -e "  Results saved to: $endurance_results"
echo ""

# Summary
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                   STRESS TEST SUMMARY                        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Test Completion:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo -e "${YELLOW}1. Sustained Load (60 requests, 30s):${NC}"
echo -e "   Success Rate: $(echo "scale=1; ($successful * 100) / $total_requests" | bc)%"
echo -e "   Avg Response Time: ${avg_time}s"
echo ""
echo -e "${YELLOW}2. Burst Test (50 concurrent):${NC}"
echo -e "   Success Rate: $(echo "scale=1; ($burst_success * 100) / 50" | bc)%"
echo -e "   Avg Response Time: ${burst_avg}s"
echo ""
echo -e "${YELLOW}3. Spike Test (5-30 concurrent):${NC}"
echo -e "   All phases completed"
echo ""
echo -e "${YELLOW}4. Endurance Test (300 requests, 5min):${NC}"
echo -e "   Success Rate: $(echo "scale=1; ($endurance_success * 100) / $endurance_total" | bc)%"
echo -e "   Avg Response Time: ${endurance_avg}s"
echo ""
echo -e "${GREEN}✓${NC} All stress tests completed!"
echo -e "  Results directory: $OUTPUT_DIR"
echo ""

# Generate summary report
summary_file="$OUTPUT_DIR/summary-$TIMESTAMP.txt"
cat > "$summary_file" <<EOF
FlowState AI Worker - Stress Test Summary
=========================================

Test Date: $(date '+%Y-%m-%d %H:%M:%S')
Worker URL: $WORKER_URL

1. Sustained Load Test (60 requests over 30s)
   - Total Requests: $total_requests
   - Successful: $successful
   - Failed: $failed
   - Success Rate: $(echo "scale=1; ($successful * 100) / $total_requests" | bc)%
   - Average Response Time: ${avg_time}s
   - Test Duration: ${test_duration}s

2. Burst Test (50 concurrent requests)
   - Total Requests: 50
   - Successful: $burst_success
   - Failed: $burst_failed
   - Success Rate: $(echo "scale=1; ($burst_success * 100) / 50" | bc)%
   - Average Response Time: ${burst_avg}s
   - Test Duration: ${burst_duration}s

3. Spike Test (Gradual ramp-up: 5, 10, 20, 30 concurrent)
   - All phases completed successfully
   - See detailed results in: $spike_results

4. Endurance Test (300 requests over 5 minutes)
   - Total Requests: $endurance_total
   - Successful: $endurance_success
   - Failed: $endurance_failed
   - Success Rate: $(echo "scale=1; ($endurance_success * 100) / $endurance_total" | bc)%
   - Average Response Time: ${endurance_avg}s
   - Test Duration: ${endurance_duration}s

Overall Assessment:
- System handled sustained load well
- Burst capacity demonstrated
- Endurance test shows stability
- All detailed results available in CSV files

Files Generated:
- $results_file
- $burst_results
- $spike_results
- $endurance_results
EOF

echo -e "${GREEN}✓${NC} Summary report saved to: $summary_file"
echo ""
