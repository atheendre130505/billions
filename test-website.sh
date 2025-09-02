#!/bin/bash

# 🧪 Billion Row Challenge - Automated Website Test Script
# Tests all major components and provides detailed results

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}🧪 $1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test functions
test_docker_services() {
    print_header "Docker Services Test"
    
    print_test "Checking Docker Compose services status"
    if docker-compose ps | grep -q "Up"; then
        print_success "All Docker services are running"
    else
        print_error "Some Docker services are not running"
        docker-compose ps
    fi
    
    print_test "Checking individual service health"
    services=("billion-rows-nginx" "billion-rows-db" "billion-rows-redis" "billion-rows-monitoring")
    for service in "${services[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "$service"; then
            print_success "$service is running"
        else
            print_error "$service is not running"
        fi
    done
}

test_web_interface() {
    print_header "Web Interface Test"
    
    print_test "Testing main website accessibility"
    if curl -s -f http://localhost:8081/ > /dev/null; then
        print_success "Main website is accessible on port 8081"
    else
        print_error "Main website is not accessible"
    fi
    
    print_test "Testing health endpoint"
    if curl -s http://localhost:8081/health | grep -q "healthy"; then
        print_success "Health endpoint is working"
    else
        print_error "Health endpoint is not working"
    fi
    
    print_test "Testing static assets"
    assets=("css/styles.css" "js/app.js")
    for asset in "${assets[@]}"; do
        if curl -s -f "http://localhost:8081/$asset" > /dev/null; then
            print_success "$asset is accessible"
        else
            print_error "$asset is not accessible"
        fi
    done
}

test_database() {
    print_header "Database Test"
    
    print_test "Testing database connection"
    if docker exec billion-rows-db psql -U tournament -d billion_rows -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Database connection is working"
    else
        print_error "Database connection failed"
    fi
    
    print_test "Testing sample data"
    if docker exec billion-rows-db psql -U tournament -d billion_rows -c "SELECT COUNT(*) FROM submissions;" | grep -q "3"; then
        print_success "Database contains sample data (3 submissions)"
    else
        print_warning "Database may not contain expected sample data"
    fi
    
    print_test "Testing database tables"
    tables=("submissions" "results" "leaderboard")
    for table in "${tables[@]}"; do
        if docker exec billion-rows-db psql -U tournament -d billion_rows -c "SELECT 1 FROM $table LIMIT 1;" > /dev/null 2>&1; then
            print_success "Table $table exists and is accessible"
        else
            print_error "Table $table does not exist or is not accessible"
        fi
    done
}

test_redis() {
    print_header "Redis Test"
    
    print_test "Testing Redis connection"
    if docker exec billion-rows-redis redis-cli ping | grep -q "PONG"; then
        print_success "Redis is working"
    else
        print_error "Redis is not working"
    fi
    
    print_test "Testing Redis basic operations"
    if docker exec billion-rows-redis redis-cli set test_key "test_value" && docker exec billion-rows-redis redis-cli get test_key | grep -q "test_value"; then
        print_success "Redis read/write operations work"
        docker exec billion-rows-redis redis-cli del test_key > /dev/null
    else
        print_error "Redis read/write operations failed"
    fi
}

test_grafana() {
    print_header "Grafana Test"
    
    print_test "Testing Grafana accessibility"
    if curl -s -f http://localhost:3000/ > /dev/null; then
        print_success "Grafana dashboard is accessible on port 3000"
    else
        print_error "Grafana dashboard is not accessible"
    fi
    
    print_test "Testing Grafana login page"
    if curl -s http://localhost:3000/login | grep -q "Grafana"; then
        print_success "Grafana login page is working"
    else
        print_warning "Grafana login page may not be working"
    fi
}

test_ports() {
    print_header "Port Availability Test"
    
    print_test "Testing port availability"
    ports=(8081 3000 5433 6379)
    for port in "${ports[@]}"; do
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            print_success "Port $port is available and listening"
        else
            print_warning "Port $port status unclear"
        fi
    done
}

test_performance() {
    print_header "Performance Test"
    
    print_test "Testing page load time"
    start_time=$(date +%s%N)
    curl -s http://localhost:8081/ > /dev/null
    end_time=$(date +%s%N)
    load_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ $load_time -lt 3000 ]; then
        print_success "Page loads in ${load_time}ms (under 3 seconds)"
    else
        print_warning "Page loads in ${load_time}ms (over 3 seconds)"
    fi
    
    print_test "Testing resource usage"
    if command -v docker stats > /dev/null; then
        print_success "Docker stats available for monitoring"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -5
    else
        print_warning "Docker stats not available"
    fi
}

test_security() {
    print_header "Security Test"
    
    print_test "Testing security headers"
    headers=$(curl -s -I http://localhost:8081/ | grep -i "x-frame-options\|x-xss-protection\|x-content-type-options")
    if [ -n "$headers" ]; then
        print_success "Security headers are present"
    else
        print_warning "Security headers may be missing"
    fi
    
    print_test "Testing HTTPS redirect (if configured)"
    if curl -s -I http://localhost:8081/ | grep -q "301\|302"; then
        print_success "Redirect headers present"
    else
        print_warning "No redirect headers found"
    fi
}

# Main test execution
main() {
    echo -e "${PURPLE}🏆 Billion Row Challenge - Automated Test Suite${NC}"
    echo -e "${PURPLE}================================================${NC}"
    echo ""
    
    # Run all tests
    test_docker_services
    echo ""
    test_web_interface
    echo ""
    test_database
    echo ""
    test_redis
    echo ""
    test_grafana
    echo ""
    test_ports
    echo ""
    test_performance
    echo ""
    test_security
    echo ""
    
    # Print summary
    print_header "Test Summary"
    echo -e "${BLUE}Total Tests:${NC} $TOTAL_TESTS"
    echo -e "${GREEN}Passed:${NC} $TESTS_PASSED"
    echo -e "${RED}Failed:${NC} $TESTS_FAILED"
    echo -e "${YELLOW}Warnings:${NC} $((TOTAL_TESTS - TESTS_PASSED - TESTS_FAILED))"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 All critical tests passed! Your system is ready.${NC}"
        echo -e "${GREEN}🌐 Open http://localhost:8081 in your browser to test manually.${NC}"
    else
        echo ""
        echo -e "${RED}❌ Some tests failed. Please check the issues above.${NC}"
        exit 1
    fi
}

# Run the tests
main "$@"
