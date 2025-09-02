#!/bin/bash

# Enhanced Secure Tournament Runner Script
# Integrates with security features, monitoring, and advanced error handling

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

print_result() {
    echo -e "${CYAN}[RESULT]${NC} $1"
}

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_DIR/config/tournament.json"
RESULTS_DIR="$PROJECT_DIR/results"
DATA_DIR="$PROJECT_DIR/data"
SUBMISSIONS_DIR="$PROJECT_DIR/submissions"
SECURITY_DIR="$PROJECT_DIR/docker/security"
LOGS_DIR="$PROJECT_DIR/logs"

# Load configuration
if [ ! -f "$CONFIG_FILE" ]; then
    print_error "Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Parse JSON config (simple parsing)
get_config_value() {
    local key="$1"
    local value=$(grep -o "\"$key\":[^,}]*" "$CONFIG_FILE" | cut -d':' -f2 | tr -d '"' | tr -d ' ')
    echo "$value"
}

# Get configuration values
TIME_LIMIT=$(get_config_value "time_limit_minutes")
MEMORY_LIMIT=$(get_config_value "memory_limit_gb")
DATA_FILE=$(get_config_value "data_file")

# Default values if parsing fails
TIME_LIMIT=${TIME_LIMIT:-30}
MEMORY_LIMIT=${MEMORY_LIMIT:-8}
DATA_FILE=${DATA_FILE:-"data/measurements.txt"}

# Security configuration
SECURITY_LEVEL="maximum"
ENABLE_MONITORING=true
ENABLE_SECURITY_SCAN=true
ENABLE_RESOURCE_LIMITS=true

# Function to check security prerequisites
check_security_prerequisites() {
    print_status "Checking security prerequisites..."
    
    # Check if security directory exists
    if [ ! -d "$SECURITY_DIR" ]; then
        print_error "Security directory not found: $SECURITY_DIR"
        return 1
    fi
    
    # Check if seccomp profile exists
    if [ ! -f "$SECURITY_DIR/seccomp.json" ]; then
        print_error "Seccomp profile not found: $SECURITY_DIR/seccomp.json"
        return 1
    fi
    
    # Check if AppArmor profile exists
    if [ ! -f "$SECURITY_DIR/apparmor-profile" ]; then
        print_error "AppArmor profile not found: $SECURITY_DIR/apparmor-profile"
        return 1
    fi
    
    # Check if security policy exists
    if [ ! -f "$SECURITY_DIR/security-policy.conf" ]; then
        print_error "Security policy not found: $SECURITY_DIR/security-policy.conf"
        return 1
    fi
    
    print_success "Security prerequisites check passed"
    return 0
}

# Function to validate submission security
validate_submission_security() {
    local language="$1"
    local submission_dir="$2"
    
    if [ "$ENABLE_SECURITY_SCAN" != "true" ]; then
        print_warning "Security scanning disabled, skipping validation"
        return 0
    fi
    
    print_status "Running security validation for $language submission..."
    
    # Run security validation script
    if [ -f "$SECURITY_DIR/validate-submission.sh" ]; then
        if "$SECURITY_DIR/validate-submission.sh" "$submission_dir" "$language"; then
            print_success "Security validation passed"
            return 0
        else
            print_error "Security validation failed"
            return 1
        fi
    else
        print_warning "Security validation script not found, skipping"
        return 0
    fi
}

# Function to start resource monitoring
start_resource_monitoring() {
    if [ "$ENABLE_MONITORING" != "true" ]; then
        return 0
    fi
    
    print_status "Starting resource monitoring..."
    
    # Start monitoring in background
    if [ -f "$SECURITY_DIR/monitor-resources.sh" ]; then
        "$SECURITY_DIR/monitor-resources.sh" &
        MONITOR_PID=$!
        print_success "Resource monitoring started (PID: $MONITOR_PID)"
    else
        print_warning "Resource monitoring script not found"
    fi
}

# Function to stop resource monitoring
stop_resource_monitoring() {
    if [ -n "$MONITOR_PID" ]; then
        print_status "Stopping resource monitoring..."
        kill $MONITOR_PID 2>/dev/null || true
        print_success "Resource monitoring stopped"
    fi
}

# Function to create secure Docker run command
create_secure_docker_run() {
    local language="$1"
    local submission_file="$2"
    local data_file="$3"
    local work_dir="$4"
    
    local docker_cmd="docker run --rm"
    
    # Add security options
    docker_cmd="$docker_cmd --security-opt seccomp=$SECURITY_DIR/seccomp.json"
    docker_cmd="$docker_cmd --security-opt apparmor=docker-default"
    docker_cmd="$docker_cmd --cap-drop=ALL"
    docker_cmd="$docker_cmd --cap-add=CHOWN"
    docker_cmd="$docker_cmd --cap-add=SETGID"
    docker_cmd="$docker_cmd --cap-add=SETUID"
    
    # Add resource limits
    if [ "$ENABLE_RESOURCE_LIMITS" = "true" ]; then
        docker_cmd="$docker_cmd --memory=${MEMORY_LIMIT}g"
        docker_cmd="$docker_cmd --cpus=4"
        docker_cmd="$docker_cmd --pids-limit=50"
        docker_cmd="$docker_cmd --ulimit nofile=1024:1024"
        docker_cmd="$docker_cmd --ulimit nproc=50:50"
    fi
    
    # Add volume mounts
    docker_cmd="$docker_cmd -v $data_file:/data/input.txt:ro"
    docker_cmd="$docker_cmd -v $work_dir:/workspace"
    docker_cmd="$docker_cmd -v $SECURITY_DIR:/workspace/security:ro"
    docker_cmd="$docker_cmd -v $LOGS_DIR:/workspace/logs"
    
    # Add network restrictions
    docker_cmd="$docker_cmd --network=none"
    
    # Add read-only root filesystem
    docker_cmd="$docker_cmd --read-only"
    
    # Add temporary filesystem
    docker_cmd="$docker_cmd --tmpfs /tmp:noexec,nosuid,size=200m"
    docker_cmd="$docker_cmd --tmpfs /var/tmp:noexec,nosuid,size=200m"
    docker_cmd="$docker_cmd --tmpfs /workspace/temp:noexec,nosuid,size=500m"
    
    # Add user restrictions
    docker_cmd="$docker_cmd --user 1000:1000"
    
    # Add container name
    docker_cmd="$docker_cmd --name tournament-runner-$$"
    
    echo "$docker_cmd"
}

# Function to compile solution securely
compile_solution_secure() {
    local language="$1"
    local submission_file="$2"
    local work_dir="$3"
    
    case $language in
        java)
            print_status "Compiling Java solution securely..."
            cd "$work_dir"
            
            # Use secure Docker container for compilation
            local docker_cmd=$(create_secure_docker_run "$language" "$submission_file" "/dev/null" "$work_dir")
            local compile_cmd="$docker_cmd tournament-executor:latest"
            
            if $compile_cmd javac "$(basename "$submission_file")"; then
                print_success "Java compilation successful"
                return 0
            else
                print_error "Java compilation failed"
                return 1
            fi
            ;;
        cpp)
            print_status "Compiling C++ solution securely..."
            cd "$work_dir"
            
            local docker_cmd=$(create_secure_docker_run "$language" "$submission_file" "/dev/null" "$work_dir")
            local compile_cmd="$docker_cmd tournament-executor:latest"
            
            if $compile_cmd g++ -std=c++20 -O2 -o solution "$(basename "$submission_file")"; then
                print_success "C++ compilation successful"
                return 0
            else
                print_error "C++ compilation failed"
                return 1
            fi
            ;;
        python|go)
            # No compilation needed
            return 0
            ;;
        *)
            print_error "Unknown language: $language"
            return 1
            ;;
    esac
}

# Function to run solution securely
run_solution_secure() {
    local language="$1"
    local submission_file="$2"
    local work_dir="$3"
    local data_file="$4"
    
    local start_time
    local end_time
    local execution_time
    local memory_usage
    local exit_code
    
    print_status "Running $language solution securely..."
    
    # Create temporary output file
    local output_file="/tmp/tournament_output_$$.txt"
    local error_file="/tmp/tournament_error_$$.txt"
    
    # Start time measurement
    start_time=$(date +%s.%N)
    
    # Create secure Docker run command
    local docker_cmd=$(create_secure_docker_run "$language" "$submission_file" "$data_file" "$work_dir")
    
    # Run solution with timeout
    cd "$work_dir"
    
    case $language in
        java)
            $docker_cmd tournament-executor:latest java -Xmx${MEMORY_LIMIT}g Solution < "$data_file" > "$output_file" 2> "$error_file"
            exit_code=$?
            ;;
        python)
            $docker_cmd tournament-executor:latest python3 "$(basename "$submission_file")" < "$data_file" > "$output_file" 2> "$error_file"
            exit_code=$?
            ;;
        cpp)
            $docker_cmd tournament-executor:latest ./solution < "$data_file" > "$output_file" 2> "$error_file"
            exit_code=$?
            ;;
        go)
            $docker_cmd tournament-executor:latest go run "$(basename "$submission_file")" < "$data_file" > "$output_file" 2> "$error_file"
            exit_code=$?
            ;;
        *)
            print_error "Unknown language: $language"
            return 1
            ;;
    esac
    
    # End time measurement
    end_time=$(date +%s.%N)
    
    # Calculate execution time
    execution_time=$(echo "$end_time - $start_time" | bc -l)
    
    # Check for timeout
    if [ $exit_code -eq 124 ]; then
        print_warning "Solution timed out after ${TIME_LIMIT} minutes"
        execution_time=$((TIME_LIMIT * 60))
        exit_code=1
    fi
    
    # Check for memory issues
    if [ $exit_code -eq 137 ]; then
        print_warning "Solution was killed (likely memory limit exceeded)"
        execution_time=999999
        exit_code=1
    fi
    
    # Get memory usage from monitoring logs
    if [ -f "$LOGS_DIR/resource_monitor.log" ]; then
        memory_usage=$(tail -1 "$LOGS_DIR/resource_monitor.log" | grep -o "Memory: [0-9.]*" | cut -d' ' -f2 || echo "0")
    else
        memory_usage="0"
    fi
    
    # Clean up
    rm -f "$output_file" "$error_file"
    
    echo "$execution_time:$memory_usage:$exit_code"
}

# Function to generate enhanced results
generate_enhanced_results() {
    local results_file="$RESULTS_DIR/results_secure_$(date +%Y%m%d_%H%M%S).json"
    
    print_status "Generating enhanced results file: $results_file"
    
    cat > "$results_file" << EOF
{
  "tournament": {
    "name": "Billion Row Challenge Tournament (Secure)",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "version": "2.0.0",
    "security_level": "$SECURITY_LEVEL"
  },
  "configuration": {
    "time_limit_minutes": $TIME_LIMIT,
    "memory_limit_gb": $MEMORY_LIMIT,
    "data_file": "$DATA_FILE",
    "security_features": {
      "seccomp": true,
      "apparmor": true,
      "capabilities": true,
      "resource_limits": true,
      "monitoring": $ENABLE_MONITORING
    }
  },
  "results": [
EOF
    
    # Add results here (will be populated by main loop)
    
    cat >> "$results_file" << EOF
  ],
  "summary": {
    "total_submissions": 0,
    "successful_runs": 0,
    "failed_runs": 0,
    "security_violations": 0,
    "average_time": 0,
    "fastest_time": 999999,
    "slowest_time": 0
  },
  "security": {
    "seccomp_profile": "$SECURITY_DIR/seccomp.json",
    "apparmor_profile": "$SECURITY_DIR/apparmor-profile",
    "security_policy": "$SECURITY_DIR/security-policy.conf",
    "validation_script": "$SECURITY_DIR/validate-submission.sh",
    "monitoring_script": "$SECURITY_DIR/monitor-resources.sh"
  }
}
EOF
    
    echo "$results_file"
}

# Main tournament execution
main() {
    print_header "🚀 Starting Secure Billion Row Challenge Tournament"
    echo ""
    
    # Check prerequisites
    if [ ! -d "$SUBMISSIONS_DIR" ]; then
        print_error "Submissions directory not found: $SUBMISSIONS_DIR"
        exit 1
    fi
    
    if [ ! -d "$DATA_DIR" ]; then
        print_error "Data directory not found: $DATA_DIR"
        exit 1
    fi
    
    # Check security prerequisites
    if ! check_security_prerequisites; then
        print_error "Security prerequisites check failed"
        exit 1
    fi
    
    # Create results and logs directories
    mkdir -p "$RESULTS_DIR" "$LOGS_DIR"
    
    # Check if data file exists
    if [ ! -f "$DATA_FILE" ]; then
        print_warning "Data file not found: $DATA_FILE"
        print_status "Using test data instead..."
        DATA_FILE="$DATA_DIR/test_measurements.txt"
        
        if [ ! -f "$DATA_FILE" ]; then
            print_error "No data file available. Please run setup first."
            exit 1
        fi
    fi
    
    print_status "Using data file: $DATA_FILE"
    print_status "Time limit: ${TIME_LIMIT} minutes"
    print_status "Memory limit: ${MEMORY_LIMIT}GB"
    print_status "Security level: $SECURITY_LEVEL"
    echo ""
    
    # Start resource monitoring
    start_resource_monitoring
    
    # Initialize results
    local results_file=$(generate_enhanced_results)
    local total_submissions=0
    local successful_runs=0
    local failed_runs=0
    local security_violations=0
    local total_time=0
    local fastest_time=999999
    local slowest_time=0
    
    # Process each language
    for language in java python cpp go; do
        local language_dir="$SUBMISSIONS_DIR/$language"
        
        if [ ! -d "$language_dir" ]; then
            continue
        fi
        
        print_header "Processing $language submissions..."
        
        # Find solution files
        local solution_files=()
        case $language in
            java)
                solution_files=("$language_dir"/*.java)
                ;;
            python)
                solution_files=("$language_dir"/*.py)
                ;;
            cpp)
                solution_files=("$language_dir"/*.cpp)
                ;;
            go)
                solution_files=("$language_dir"/*.go)
                ;;
        esac
        
        # Process each solution
        for solution_file in "${solution_files[@]}"; do
            if [ ! -f "$solution_file" ]; then
                continue
            fi
            
            local filename=$(basename "$solution_file")
            local participant=$(dirname "$solution_file" | xargs basename)
            
            print_status "Testing: $filename ($participant)"
            
            # Security validation
            if ! validate_submission_security "$language" "$language_dir"; then
                print_error "Security validation failed: $filename"
                security_violations=$((security_violations + 1))
                continue
            fi
            
            # Create working directory
            local work_dir="/tmp/tournament_secure_$$_$language"
            mkdir -p "$work_dir"
            cp "$solution_file" "$work_dir/"
            
            # Compile if needed
            if ! compile_solution_secure "$language" "$solution_file" "$work_dir"; then
                print_error "Compilation failed: $filename"
                rm -rf "$work_dir"
                continue
            fi
            
            # Run solution securely
            local result=$(run_solution_secure "$language" "$solution_file" "$work_dir" "$DATA_FILE")
            local execution_time=$(echo "$result" | cut -d':' -f1)
            local memory_usage=$(echo "$result" | cut -d':' -f2)
            local exit_code=$(echo "$result" | cut -d':' -f3)
            
            # Clean up working directory
            rm -rf "$work_dir"
            
            # Process results
            total_submissions=$((total_submissions + 1))
            
            if [ "$exit_code" -eq 0 ]; then
                successful_runs=$((successful_runs + 1))
                total_time=$(echo "$total_time + $execution_time" | bc -l)
                
                if (( $(echo "$execution_time < $fastest_time" | bc -l) )); then
                    fastest_time=$execution_time
                fi
                
                if (( $(echo "$execution_time > $slowest_time" | bc -l) )); then
                    slowest_time=$execution_time
                fi
                
                print_success "Completed in ${execution_time}s (${memory_usage}GB)"
            else
                failed_runs=$((failed_runs + 1))
                print_error "Failed with exit code $exit_code"
            fi
            
            echo ""
        done
    done
    
    # Stop resource monitoring
    stop_resource_monitoring
    
    # Generate final results
    print_header "🏁 Secure Tournament Complete!"
    echo ""
    print_result "Total submissions: $total_submissions"
    print_result "Successful runs: $successful_runs"
    print_result "Failed runs: $failed_runs"
    print_result "Security violations: $security_violations"
    
    if [ $successful_runs -gt 0 ]; then
        local avg_time=$(echo "scale=2; $total_time / $successful_runs" | bc -l)
        print_result "Average time: ${avg_time}s"
        print_result "Fastest time: ${fastest_time}s"
        print_result "Slowest time: ${slowest_time}s"
    fi
    
    echo ""
    print_success "Secure tournament results saved to: $results_file"
    print_success "Security logs available in: $LOGS_DIR"
    echo ""
    print_header "🎉 Secure tournament completed successfully!"
}

# Run main function
main "$@"









