#!/bin/bash

# Tournament Runner Script
# Executes all submissions and generates leaderboard

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

# Function to check if solution file exists and is valid
validate_solution() {
    local language="$1"
    local solution_file="$2"
    
    if [ ! -f "$solution_file" ]; then
        return 1
    fi
    
    case $language in
        java)
            # Check if file contains Solution class with main method
            grep -q "class Solution" "$solution_file" && grep -q "public static void main" "$solution_file"
            ;;
        python)
            # Check if file contains main function
            grep -q "def main" "$solution_file"
            ;;
        cpp)
            # Check if file contains main function
            grep -q "int main" "$solution_file"
            ;;
        go)
            # Check if file contains main function
            grep -q "func main" "$solution_file"
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to compile solution
compile_solution() {
    local language="$1"
    local solution_file="$2"
    local work_dir="$3"
    
    case $language in
        java)
            print_status "Compiling Java solution..."
            cd "$work_dir"
            javac "$(basename "$solution_file")"
            if [ $? -eq 0 ]; then
                print_success "Java compilation successful"
                return 0
            else
                print_error "Java compilation failed"
                return 1
            fi
            ;;
        cpp)
            print_status "Compiling C++ solution..."
            cd "$work_dir"
            g++ -std=c++20 -O2 -o solution "$(basename "$solution_file")"
            if [ $? -eq 0 ]; then
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

# Function to run solution and measure performance
run_solution() {
    local language="$1"
    local solution_file="$2"
    local work_dir="$3"
    local data_file="$4"
    
    local start_time
    local end_time
    local execution_time
    local memory_usage
    local exit_code
    
    print_status "Running $language solution..."
    
    # Create temporary output file
    local output_file="/tmp/tournament_output_$$.txt"
    local error_file="/tmp/tournament_error_$$.txt"
    
    # Start time measurement
    start_time=$(date +%s.%N)
    
    # Run solution with timeout and memory limits
    cd "$work_dir"
    
    case $language in
        java)
            timeout ${TIME_LIMIT}m java -Xmx${MEMORY_LIMIT}g Solution < "$data_file" > "$output_file" 2> "$error_file"
            exit_code=$?
            ;;
        python)
            timeout ${TIME_LIMIT}m python3 "$(basename "$solution_file")" < "$data_file" > "$output_file" 2> "$error_file"
            exit_code=$?
            ;;
        cpp)
            timeout ${TIME_LIMIT}m ./solution < "$data_file" > "$output_file" 2> "$error_file"
            exit_code=$?
            ;;
        go)
            timeout ${TIME_LIMIT}m go run "$(basename "$solution_file")" < "$data_file" > "$output_file" 2> "$error_file"
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
    
    # Get memory usage (approximate)
    memory_usage=$(ps -o rss= -p $$ 2>/dev/null | awk '{print $1/1024/1024}' || echo "0")
    
    # Clean up
    rm -f "$output_file" "$error_file"
    
    echo "$execution_time:$memory_usage:$exit_code"
}

# Function to validate output format
validate_output() {
    local output_file="$1"
    local expected_format="$2"
    
    if [ ! -f "$output_file" ]; then
        return 1
    fi
    
    # Check if output matches expected format: station=min/mean/max
    local valid_lines=0
    local total_lines=0
    
    while IFS= read -r line; do
        total_lines=$((total_lines + 1))
        if [[ $line =~ ^[A-Za-z]+=-?[0-9]+\.[0-9]+/-?[0-9]+\.[0-9]+/-?[0-9]+\.[0-9]+$ ]]; then
            valid_lines=$((valid_lines + 1))
        fi
    done < "$output_file"
    
    # At least 80% of lines should be valid
    local valid_percentage=$(echo "scale=2; $valid_lines * 100 / $total_lines" | bc -l)
    local threshold=80
    
    if (( $(echo "$valid_percentage >= $threshold" | bc -l) )); then
        return 0
    else
        return 1
    fi
}

# Function to generate results JSON
generate_results() {
    local results_file="$RESULTS_DIR/results_$(date +%Y%m%d_%H%M%S).json"
    
    print_status "Generating results file: $results_file"
    
    cat > "$results_file" << EOF
{
  "tournament": {
    "name": "Billion Row Challenge Tournament",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "version": "1.0.0"
  },
  "configuration": {
    "time_limit_minutes": $TIME_LIMIT,
    "memory_limit_gb": $MEMORY_LIMIT,
    "data_file": "$DATA_FILE"
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
    "average_time": 0,
    "fastest_time": 999999,
    "slowest_time": 0
  }
}
EOF
    
    echo "$results_file"
}

# Function to update leaderboard
update_leaderboard() {
    local results_file="$1"
    
    if [ ! -f "$results_file" ]; then
        print_error "Results file not found: $results_file"
        return 1
    fi
    
    print_status "Updating leaderboard..."
    
    # Create leaderboard HTML
    local leaderboard_file="$RESULTS_DIR/leaderboard.html"
    
    cat > "$leaderboard_file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Billion Row Challenge Tournament - Leaderboard</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 20px; }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #3498db; }
        .stat-label { color: #7f8c8d; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #34495e; color: white; }
        tr:nth-child(even) { background: #f9f9f9; }
        tr:hover { background: #f0f0f0; }
        .rank { font-weight: bold; color: #e74c3c; }
        .language { padding: 4px 8px; border-radius: 4px; color: white; font-size: 0.8em; }
        .java { background: #e74c3c; }
        .python { background: #3498db; }
        .cpp { background: #f39c12; }
        .go { background: #27ae60; }
        .time { font-family: monospace; }
        .memory { font-size: 0.9em; color: #7f8c8d; }
        .last-updated { text-align: center; color: #7f8c8d; margin-top: 20px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏆 Billion Row Challenge Tournament</h1>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="total-submissions">0</div>
                <div class="stat-label">Total Submissions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="successful-runs">0</div>
                <div class="stat-label">Successful Runs</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="fastest-time">-</div>
                <div class="stat-label">Fastest Time (s)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="last-updated">-</div>
                <div class="stat-label">Last Updated</div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Participant</th>
                    <th>Language</th>
                    <th>Execution Time</th>
                    <th>Memory Usage</th>
                    <th>Status</th>
                    <th>Last Run</th>
                </tr>
            </thead>
            <tbody id="leaderboard-body">
                <!-- Results will be populated here -->
            </tbody>
        </table>
        
        <div class="last-updated">
            Last updated: <span id="last-updated-time">-</span>
        </div>
    </div>
    
    <script>
        // Auto-refresh every 5 minutes
        setInterval(() => {
            location.reload();
        }, 5 * 60 * 1000);
    </script>
</body>
</html>
EOF
    
    print_success "Leaderboard updated: $leaderboard_file"
}

# Main tournament execution
main() {
    print_header "🚀 Starting Billion Row Challenge Tournament"
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
    
    # Create results directory
    mkdir -p "$RESULTS_DIR"
    
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
    echo ""
    
    # Initialize results
    local results_file=$(generate_results)
    local total_submissions=0
    local successful_runs=0
    local failed_runs=0
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
            
            # Validate solution
            if ! validate_solution "$language" "$solution_file"; then
                print_warning "Invalid solution format: $filename"
                continue
            fi
            
            # Create working directory
            local work_dir="/tmp/tournament_$$_$language"
            mkdir -p "$work_dir"
            cp "$solution_file" "$work_dir/"
            
            # Compile if needed
            if ! compile_solution "$language" "$solution_file" "$work_dir"; then
                print_error "Compilation failed: $filename"
                rm -rf "$work_dir"
                continue
            fi
            
            # Run solution
            local result=$(run_solution "$language" "$solution_file" "$work_dir" "$DATA_FILE")
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
    
    # Generate final results
    print_header "🏁 Tournament Complete!"
    echo ""
    print_result "Total submissions: $total_submissions"
    print_result "Successful runs: $successful_runs"
    print_result "Failed runs: $failed_runs"
    
    if [ $successful_runs -gt 0 ]; then
        local avg_time=$(echo "scale=2; $total_time / $successful_runs" | bc -l)
        print_result "Average time: ${avg_time}s"
        print_result "Fastest time: ${fastest_time}s"
        print_result "Slowest time: ${slowest_time}s"
    fi
    
    # Update leaderboard
    update_leaderboard "$results_file"
    
    echo ""
    print_success "Tournament results saved to: $results_file"
    print_success "Leaderboard updated: $RESULTS_DIR/leaderboard.html"
    echo ""
    print_header "🎉 Tournament completed successfully!"
}

# Run main function
main "$@"


