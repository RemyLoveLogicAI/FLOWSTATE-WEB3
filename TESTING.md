# 🧪 FlowState AI Testing Guide

Complete testing documentation for the FlowState AI Worker deployment.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Test Suites](#test-suites)
3. [Test Scenarios](#test-scenarios)
4. [Running Tests](#running-tests)
5. [Understanding Results](#understanding-results)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Run All Tests (Interactive)

```bash
./run-tests.sh
```

This launches an interactive menu where you can choose which tests to run.

### Run Quick Test (30 seconds)

```bash
./run-tests.sh
# Select option 1
```

### Run Individual Test Suites

```bash
# Comprehensive functional tests
./tests/comprehensive-test.sh

# Stress and load tests  
./tests/stress-test.sh

# Model performance comparison
./tests/model-comparison.sh
```

---

## 🎯 Test Suites

### 1. Quick Test (30 seconds)

**Purpose**: Rapid health check for core functionality

**What it tests**:
- ✅ Health endpoint accessibility
- ✅ API version and status
- ✅ Available AI models
- ✅ Basic chat functionality
- ✅ API key configuration

**When to use**:
- Before deployments
- After configuration changes
- Quick smoke testing

**Command**:
```bash
./run-tests.sh
# Select: 1
```

---

### 2. Comprehensive Test (~3 minutes)

**Purpose**: Complete functional validation

**Test Categories**:

#### A. Connectivity & Health (5 tests)
- Health endpoint connectivity
- JSON response structure
- API keys configuration
- Version information
- Features enumeration

#### B. Models API (5 tests)
- API accessibility
- Model availability count
- Data structure validation
- Multi-provider support
- Speed indicators

#### C. Chat API Functional (6 tests)
- Basic chat request
- Empty message validation
- Missing field validation
- Long message handling
- Special characters
- JSON injection protection

#### D. Chat API Quality (4 tests)
- Mathematical reasoning
- Code generation
- Creative writing
- Streaming consistency

#### E. Performance & Load (3 tests)
- Average response time (3 samples)
- Concurrent requests (5 parallel)
- Cold start performance

#### F. Error Handling (5 tests)
- Invalid endpoint (404)
- Invalid HTTP method
- Malformed JSON
- Missing Content-Type
- Large payload handling

#### G. Security (4 tests)
- CORS headers
- SQL injection protection
- XSS protection
- Rate limiting

#### H. Super Agent (2 tests)
- Endpoint accessibility
- Query validation

**Total**: 34 tests

**Command**:
```bash
./tests/comprehensive-test.sh
```

**Output**:
- Console output with pass/fail indicators
- JSON file with detailed results
- Success rate and grade

**Example Output**:
```
✓ Health endpoint connectivity [PASS] (0.124s)
✓ Chat streaming [PASS] (0.368s)
✗ Super agent tools [FAIL] (0.052s)

Success Rate: 94.1%
Grade: A
```

---

### 3. Stress Test (~15 minutes)

**Purpose**: Evaluate system performance under load

**Test Phases**:

#### Phase 1: Sustained Load (30s)
- 60 requests over 30 seconds
- ~2 requests per second
- Measures: success rate, avg response time

#### Phase 2: Burst Test (instant)
- 50 concurrent requests
- All fired simultaneously
- Measures: handling capacity, response times

#### Phase 3: Spike Test (gradual)
- Ramp-up: 5 → 10 → 20 → 30 concurrent
- Tests increasing load
- 5-second cool-down between phases

#### Phase 4: Endurance Test (5min)
- 300 requests over 5 minutes
- 1 request per second sustained
- Tests stability over time

**Command**:
```bash
./tests/stress-test.sh
```

**Output Files**:
- `sustained-load-TIMESTAMP.csv`
- `burst-test-TIMESTAMP.csv`
- `spike-test-TIMESTAMP.csv`
- `endurance-test-TIMESTAMP.csv`
- `summary-TIMESTAMP.txt`

**What to look for**:
- Success rate > 95%
- Avg response time < 2s
- No performance degradation over time
- Graceful handling of bursts

---

### 4. Model Comparison (~5 minutes)

**Purpose**: Compare performance of all AI models

**Test Categories**:
1. **Simple Response** - Basic greeting
2. **Mathematical** - Arithmetic calculation
3. **Code Generation** - Python function
4. **Creative Writing** - Haiku composition
5. **Reasoning** - Scientific explanation

**For Each Model Tests**:
- Response time
- Response quality
- Response length
- Success/failure rate

**Command**:
```bash
./tests/model-comparison.sh
```

**Output**:
- Markdown report with comparison table
- Detailed results for each model
- Recommendations by use case

**Example Table**:
```
| Model              | Simple | Math | Code | Creative | Reasoning | Avg Time | Grade |
|--------------------|--------|------|------|----------|-----------|----------|-------|
| Llama 3.3 70B      | ✓      | ✓    | ✓    | ✓        | ✓         | 0.42s    | A+    |
| Llama 3.1 8B       | ✓      | ✓    | ✓    | ✓        | ✓         | 0.18s    | A+    |
```

---

### 5. Security Audit (~2 minutes)

**Purpose**: Validate security measures

**Security Tests**:
1. **CORS Configuration** - Cross-origin headers
2. **HTTPS Enforcement** - Secure connections
3. **Input Validation** - Empty/invalid inputs
4. **SQL Injection** - Malicious SQL patterns
5. **XSS Protection** - Script injection
6. **JSON Validation** - Malformed payloads
7. **Rate Limiting** - Rapid request handling

**Command**:
```bash
./run-tests.sh
# Select: 5
```

**What to expect**:
- ✅ All security measures active
- ⚠️ Warnings for missing optional features
- ❌ Critical issues (should be none)

---

## 📊 Test Scenarios

### Scenario 1: Pre-Deployment Check

**Goal**: Verify system is ready for deployment

**Steps**:
1. Run Quick Test
2. Run Comprehensive Test
3. Check success rate > 90%
4. Deploy if passing

```bash
./run-tests.sh
# Select: 1 (Quick Test)
# Select: 2 (Comprehensive Test)
```

---

### Scenario 2: Post-Deployment Validation

**Goal**: Confirm deployment was successful

**Steps**:
1. Run Quick Test
2. Verify health endpoint
3. Test chat functionality
4. Check model availability

```bash
./run-tests.sh
# Select: 1
```

---

### Scenario 3: Performance Benchmarking

**Goal**: Measure system performance

**Steps**:
1. Run Model Comparison
2. Run Stress Test
3. Analyze response times
4. Document baseline metrics

```bash
./tests/model-comparison.sh
./tests/stress-test.sh
```

---

### Scenario 4: Security Audit

**Goal**: Verify security posture

**Steps**:
1. Run Security Audit
2. Run Comprehensive Test
3. Review security test results
4. Address any issues

```bash
./run-tests.sh
# Select: 5 (Security Audit)
```

---

### Scenario 5: Model Selection

**Goal**: Choose best model for use case

**Steps**:
1. Run Model Comparison
2. Review performance table
3. Test specific use cases
4. Document recommendation

```bash
./tests/model-comparison.sh
```

---

## 🏃 Running Tests

### Prerequisites

```bash
# Ensure scripts are executable
chmod +x run-tests.sh
chmod +x tests/*.sh

# Check dependencies
which curl    # Required
which jq      # Required for JSON parsing
which bc      # Required for calculations
```

### Environment Variables

Tests use these environment variables (optional):

```bash
# Override worker URL
export WORKER_URL="https://your-worker.workers.dev"

# Set output directory
export RESULTS_DIR="./my-test-results"

# Enable verbose output
export TEST_VERBOSE=true
```

### Running in CI/CD

**GitHub Actions Example**:

```yaml
name: Test Worker

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y jq bc curl
      
      - name: Run comprehensive tests
        run: ./tests/comprehensive-test.sh
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results-*.json
```

---

## 📈 Understanding Results

### Test Output Format

#### Console Output
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. CONNECTIVITY & HEALTH TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Health endpoint connectivity [PASS] (0.124s)
✓ Health endpoint JSON structure [PASS] (0.003s)
✗ API keys configuration [FAIL] (0.001s)
  └─ No keys configured
```

**Symbols**:
- ✓ = Test passed
- ✗ = Test failed
- ⚠ = Warning (non-critical)

**Timing**: Response time in seconds shown in parentheses

#### JSON Output

```json
{
  "timestamp": "2025-10-25T01:30:00Z",
  "worker_url": "https://...",
  "summary": {
    "total": 34,
    "passed": 32,
    "failed": 2,
    "success_rate": 94.1,
    "grade": "A"
  },
  "tests": [
    {
      "name": "Health endpoint connectivity",
      "status": "PASS",
      "time": 0.124,
      "details": ""
    }
  ]
}
```

### Grading System

| Success Rate | Grade | Meaning |
|--------------|-------|---------|
| 95-100% | A+ | Excellent - Production ready |
| 85-94% | A | Good - Minor issues |
| 75-84% | B | Acceptable - Some failures |
| 65-74% | C | Poor - Multiple issues |
| < 65% | F | Failed - Critical problems |

### Performance Thresholds

| Metric | Excellent | Good | Acceptable | Poor |
|--------|-----------|------|------------|------|
| Response Time | < 0.5s | 0.5-1.0s | 1.0-2.0s | > 2.0s |
| Success Rate | > 99% | 95-99% | 90-95% | < 90% |
| Availability | 100% | 99.9% | 99.5% | < 99.5% |

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "curl: command not found"

**Solution**:
```bash
# Ubuntu/Debian
sudo apt-get install curl

# macOS
brew install curl

# Alpine
apk add curl
```

#### 2. "jq: command not found"

**Solution**:
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq

# Alpine
apk add jq
```

#### 3. Tests timing out

**Causes**:
- Worker is cold starting
- Network latency
- Worker is overloaded

**Solutions**:
- Increase timeout in scripts
- Run tests again after warm-up
- Check worker logs

#### 4. High failure rate

**Causes**:
- API keys not configured
- Worker deployment issue
- Model unavailable

**Solutions**:
```bash
# Check health endpoint
curl https://your-worker.workers.dev/health | jq .

# Verify API keys in Cloudflare dashboard
wrangler secret list

# Check worker logs
wrangler tail
```

#### 5. "Permission denied" error

**Solution**:
```bash
chmod +x run-tests.sh
chmod +x tests/*.sh
```

---

## 🎓 Best Practices

### Testing Workflow

1. **Pre-Commit**: Run Quick Test
2. **Pre-Deploy**: Run Comprehensive Test
3. **Post-Deploy**: Run Quick Test + Security Audit
4. **Weekly**: Run Model Comparison
5. **Monthly**: Run Full Stress Test

### Test Frequency

| Test Type | Frequency | Duration |
|-----------|-----------|----------|
| Quick Test | Every commit | 30s |
| Comprehensive | Before deployment | 3min |
| Model Comparison | Weekly | 5min |
| Security Audit | After config changes | 2min |
| Stress Test | Monthly | 15min |

### Recording Baselines

Create baseline measurements:

```bash
# Run tests and save results
./tests/comprehensive-test.sh > baseline-$(date +%Y%m%d).txt

# Compare with baseline
diff baseline-20251025.txt current-results.txt
```

---

## 📚 Additional Resources

### Worker URL
https://flowstate-ai-backend.jmjones925.workers.dev

### Test Files Location
```
/home/user/webapp/
├── run-tests.sh                 # Master test runner
├── test-worker.sh              # Simple test script
├── tests/
│   ├── comprehensive-test.sh   # Full functional tests
│   ├── stress-test.sh         # Load tests
│   └── model-comparison.sh    # Model benchmarks
└── test-reports/              # Results directory
```

### Related Documentation
- [README.md](./README.md) - Project overview
- [TEST_RESULTS.md](./TEST_RESULTS.md) - Latest test results
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

---

## 🤝 Contributing

### Adding New Tests

1. Create test script in `tests/` directory
2. Make executable: `chmod +x tests/your-test.sh`
3. Add to `run-tests.sh` menu
4. Update this documentation

### Test Script Template

```bash
#!/bin/bash

# Test name and description
WORKER_URL="https://flowstate-ai-backend.jmjones925.workers.dev"

echo "Running your test..."

# Your test logic here
response=$(curl -s "$WORKER_URL/your-endpoint")

if [ condition ]; then
    echo "✓ Test passed"
    exit 0
else
    echo "✗ Test failed"
    exit 1
fi
```

---

## 📝 Support

### Getting Help

1. **Check logs**: Review test output files
2. **Worker logs**: `wrangler tail`
3. **Health check**: `curl .../health | jq .`
4. **Test verbose**: Set `TEST_VERBOSE=true`

### Reporting Issues

Include:
- Test suite that failed
- Complete error output
- Worker URL
- Test timestamp
- Environment details

---

*Last Updated: October 25, 2025*  
*Version: 3.0.0*
