#!/bin/bash

echo "🧪 Complete System Test - Billion Row Challenge"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

echo ""
echo "📁 File Structure Tests"
echo "----------------------"

run_test "Firebase config files" "[ -f firebase.json ]"
run_test "Firestore rules" "[ -f firestore.rules ]"
run_test "Firestore indexes" "[ -f firestore.indexes.json ]"
run_test "Firebase setup guide" "[ -f FIREBASE_SETUP.md ]"
run_test "Website index.html" "[ -f website/index.html ]"
run_test "Website CSS" "[ -f website/css/styles.css ]"
run_test "Website JavaScript" "[ -f website/js/app.js ]"
run_test "GitHub Actions deploy" "[ -f .github/workflows/deploy.yml ]"
run_test "GitHub Actions tournament" "[ -f .github/workflows/tournamentsecure.yml ]"

echo ""
echo "🌐 Web Server Tests"
echo "------------------"

run_test "Local web server" "curl -s http://localhost:8082/ > /dev/null"
run_test "Website HTML structure" "curl -s http://localhost:8082/ | grep -q '<!DOCTYPE html>'"
run_test "Firebase SDK integration" "curl -s http://localhost:8082/ | grep -q 'firebase'"
run_test "CSS file accessible" "curl -s http://localhost:8082/css/styles.css > /dev/null"
run_test "JavaScript file accessible" "curl -s http://localhost:8082/js/app.js > /dev/null"

echo ""
echo "🔧 System Tests"
echo "---------------"

run_test "Python 3 available" "python3 --version"
run_test "Node.js available" "node --version"
run_test "Git repository" "[ -d .git ]"
run_test "Docker available" "docker --version"

echo ""
echo "📊 YAML Syntax Tests"
echo "-------------------"

# Test YAML files for syntax
if command -v python3 &> /dev/null; then
    run_test "deploy.yml syntax" "python3 -c 'import yaml; yaml.safe_load(open(\".github/workflows/deploy.yml\"))'"
    run_test "tournamentsecure.yml syntax" "python3 -c 'import yaml; yaml.safe_load(open(\".github/workflows/tournamentsecure.yml\"))'"
    run_test "firebase.json syntax" "python3 -c 'import json; json.load(open(\"firebase.json\"))'"
else
    echo "⚠️  Python3 not available for YAML syntax testing"
fi

echo ""
echo "🔥 Firebase Integration Tests"
echo "----------------------------"

# Check if Firebase config is properly set up
if grep -q "YOUR_API_KEY" website/index.html; then
    echo -e "Firebase config: ${YELLOW}⚠️  NEEDS CONFIGURATION${NC}"
    ((TESTS_FAILED++))
else
    echo -e "Firebase config: ${GREEN}✅ CONFIGURED${NC}"
    ((TESTS_PASSED++))
fi

# Check if Firebase SDK is properly integrated
if grep -q "firebase" website/index.html && grep -q "firebase" website/js/app.js; then
    echo -e "Firebase SDK integration: ${GREEN}✅ INTEGRATED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Firebase SDK integration: ${RED}❌ NOT INTEGRATED${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "📈 Test Results Summary"
echo "======================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}ALL TESTS PASSED!${NC} System is ready!"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Configure Firebase (see FIREBASE_SETUP.md)"
    echo "2. Update Firebase config in website/index.html"
    echo "3. Deploy with: firebase deploy"
    echo ""
    echo "🌐 Your website: http://localhost:8082"
else
    echo -e "\n⚠️  ${YELLOW}Some tests failed.${NC} Please check the issues above."
    echo ""
    echo "🔧 Common fixes:"
    echo "1. Make sure all files are in place"
    echo "2. Check file permissions"
    echo "3. Verify web server is running"
    echo "4. Follow FIREBASE_SETUP.md for Firebase configuration"
fi

echo ""
echo "📖 Documentation:"
echo "- Firebase Setup: FIREBASE_SETUP.md"
echo "- System Test: test-firebase.sh"
echo "- Complete Guide: README.md"
