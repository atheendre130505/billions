#!/bin/bash

# Billion Row Challenge Tournament Setup Script
# This script sets up the complete tournament environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker
check_docker() {
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is available and running"
}

# Function to check Git
check_git() {
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_success "Git is available"
}

# Function to create environment file
create_env_file() {
    if [ ! -f .env ]; then
        print_status "Creating .env file with default values..."
        cat > .env << EOF
# Tournament System Environment Variables
GITHUB_TOKEN=your_github_token_here
GITHUB_REPOSITORY=your_username/billion-rows
DB_PASSWORD=tournament123
GRAFANA_PASSWORD=admin123

# Runner Configuration
RUNNER_LABELS=billion-rows,linux,amd64
RUNNER_NAME=billion-rows-runner

# Tournament Configuration
TOURNAMENT_STATUS=active
MAX_EXECUTION_TIME=30
MEMORY_LIMIT_GB=8
EOF
        print_warning "Please update .env file with your actual GitHub token and repository"
    else
        print_status ".env file already exists"
    fi
}

# Function to create sample data
create_sample_data() {
    print_status "Creating sample data directory structure..."
    
    # Create a small test file for development
    if [ ! -f data/test_measurements.txt ]; then
        print_status "Creating sample test data..."
        cat > data/test_measurements.txt << EOF
Abha=-23.0/18.0/59.2
Bangkok=20.7/26.3/30.4
Cairo=7.2/20.7/33.9
Denver=-31.1/8.9/36.4
Edmonton=-49.1/4.1/23.1
Fresno=9.9/18.4/42.8
Geneva=1.2/10.8/24.3
Hamburg=-9.4/9.4/23.0
Istanbul=6.2/13.9/27.8
Jakarta=23.1/26.7/31.2
EOF
        print_success "Sample test data created"
    fi
    
    # Create data directory structure
    mkdir -p data/{raw,processed,results}
    print_success "Data directory structure created"
}

# Function to create example submissions
create_example_submissions() {
    print_status "Creating example submissions..."
    
    # Java example
    cat > submissions/java/Solution.java << 'EOF'
import java.io.*;
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        try (BufferedReader reader = new BufferedReader(new FileReader("data/test_measurements.txt"))) {
            Map<String, List<Double>> stations = new TreeMap<>();
            String line;
            
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("=");
                String station = parts[0];
                double temp = Double.parseDouble(parts[1]);
                
                stations.computeIfAbsent(station, k -> new ArrayList<>()).add(temp);
            }
            
            for (Map.Entry<String, List<Double>> entry : stations.entrySet()) {
                List<Double> temps = entry.getValue();
                double min = temps.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
                double max = temps.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
                double mean = temps.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                
                System.out.printf("%s=%.1f/%.1f/%.1f%n", entry.getKey(), min, mean, max);
            }
        } catch (IOException e) {
            System.err.println("Error reading file: " + e.getMessage());
            System.exit(1);
        }
    }
}
EOF

    # Python example
    cat > submissions/python/solution.py << 'EOF'
#!/usr/bin/env python3

def main():
    stations = {}
    
    try:
        with open('data/test_measurements.txt', 'r') as f:
            for line in f:
                station, temp_str = line.strip().split('=')
                temp = float(temp_str)
                
                if station not in stations:
                    stations[station] = []
                stations[station].append(temp)
        
        # Sort stations alphabetically
        for station in sorted(stations.keys()):
            temps = stations[station]
            min_temp = min(temps)
            max_temp = max(temps)
            mean_temp = sum(temps) / len(temps)
            
            print(f"{station}={min_temp:.1f}/{mean_temp:.1f}/{max_temp:.1f}")
            
    except FileNotFoundError:
        print("Error: data file not found", file=sys.stderr)
        exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        exit(1)

if __name__ == "__main__":
    main()
EOF

    # C++ example
    cat > submissions/cpp/solution.cpp << 'EOF'
#include <iostream>
#include <fstream>
#include <string>
#include <map>
#include <vector>
#include <algorithm>
#include <numeric>
#include <iomanip>

int main() {
    std::map<std::string, std::vector<double>> stations;
    std::ifstream file("data/test_measurements.txt");
    std::string line;
    
    if (!file.is_open()) {
        std::cerr << "Error: Could not open file" << std::endl;
        return 1;
    }
    
    while (std::getline(file, line)) {
        size_t pos = line.find('=');
        if (pos != std::string::npos) {
            std::string station = line.substr(0, pos);
            double temp = std::stod(line.substr(pos + 1));
            stations[station].push_back(temp);
        }
    }
    
    for (const auto& [station, temps] : stations) {
        auto [min_it, max_it] = std::minmax_element(temps.begin(), temps.end());
        double mean = std::accumulate(temps.begin(), temps.end(), 0.0) / temps.size();
        
        std::cout << station << "=" << std::fixed << std::setprecision(1)
                  << *min_it << "/" << mean << "/" << *max_it << std::endl;
    }
    
    return 0;
}
EOF

    # Go example
    cat > submissions/go/solution.go << 'EOF'
package main

import (
	"bufio"
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"
)

func main() {
	stations := make(map[string][]float64)
	
	file, err := os.Open("data/test_measurements.txt")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error opening file: %v\n", err)
		os.Exit(1)
	}
	defer file.Close()
	
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		parts := strings.Split(scanner.Text(), "=")
		if len(parts) == 2 {
			station := parts[0]
			temp, err := strconv.ParseFloat(parts[1], 64)
			if err == nil {
				stations[station] = append(stations[station], temp)
			}
		}
	}
	
	// Sort station names
	var stationNames []string
	for station := range stations {
		stationNames = append(stationNames, station)
	}
	sort.Strings(stationNames)
	
	for _, station := range stationNames {
		temps := stations[station]
		min := temps[0]
		max := temps[0]
		sum := temps[0]
		
		for _, temp := range temps[1:] {
			if temp < min {
				min = temp
			}
			if temp > max {
				max = temp
			}
			sum += temp
		}
		
		mean := sum / float64(len(temps))
		fmt.Printf("%s=%.1f/%.1f/%.1f\n", station, min, mean, max)
	}
}
EOF

    print_success "Example submissions created for all supported languages"
}

# Function to create utility scripts
create_utility_scripts() {
    print_status "Creating utility scripts..."
    
    # Test solution script
    cat > scripts/test_solution.sh << 'EOF'
#!/bin/bash

# Test Solution Script
# Usage: ./scripts/test_solution.sh <language> <solution_file>

set -e

if [ $# -ne 2 ]; then
    echo "Usage: $0 <language> <solution_file>"
    echo "Example: $0 java submissions/java/Solution.java"
    exit 1
fi

LANGUAGE=$1
SOLUTION_FILE=$2

if [ ! -f "$SOLUTION_FILE" ]; then
    echo "Error: Solution file not found: $SOLUTION_FILE"
    exit 1
fi

echo "Testing $LANGUAGE solution: $SOLUTION_FILE"
echo "=========================================="

case $LANGUAGE in
    java)
        echo "Compiling Java solution..."
        javac "$SOLUTION_FILE"
        echo "Running Java solution..."
        time java -cp "$(dirname "$SOLUTION_FILE")" Solution
        ;;
    python)
        echo "Running Python solution..."
        time python3 "$SOLUTION_FILE"
        ;;
    cpp)
        echo "Compiling C++ solution..."
        g++ -std=c++20 -O2 -o "${SOLUTION_FILE%.cpp}" "$SOLUTION_FILE"
        echo "Running C++ solution..."
        time "./${SOLUTION_FILE%.cpp}"
        ;;
    go)
        echo "Running Go solution..."
        time go run "$SOLUTION_FILE"
        ;;
    *)
        echo "Error: Unsupported language: $LANGUAGE"
        echo "Supported languages: java, python, cpp, go"
        exit 1
        ;;
esac

echo "=========================================="
echo "Test completed!"
EOF

    # Generate data script
    cat > scripts/generate_data.sh << 'EOF'
#!/bin/bash

# Generate Test Data Script
# Creates sample data files of various sizes for testing

set -e

echo "Generating test data..."

# Small test file (10 entries)
cat > data/test_10.txt << 'END'
Abha=-23.0/18.0/59.2
Bangkok=20.7/26.3/30.4
Cairo=7.2/20.7/33.9
Denver=-31.1/8.9/36.4
Edmonton=-49.1/4.1/23.1
Fresno=9.9/18.4/42.8
Geneva=1.2/10.8/24.3
Hamburg=-9.4/9.4/23.0
Istanbul=6.2/13.9/27.8
Jakarta=23.1/26.7/31.2
END

# Medium test file (1000 entries)
echo "Generating medium test file (1000 entries)..."
python3 -c "
import random
import string

stations = []
for i in range(1000):
    name = ''.join(random.choices(string.ascii_uppercase, k=6))
    temp = random.uniform(-50, 50)
    stations.append(f'{name}={temp:.1f}')

with open('data/test_1000.txt', 'w') as f:
    for station in sorted(stations):
        f.write(station + '\n')
"

# Large test file (100,000 entries)
echo "Generating large test file (100,000 entries)..."
python3 -c "
import random
import string

stations = []
for i in range(100000):
    name = ''.join(random.choices(string.ascii_uppercase, k=6))
    temp = random.uniform(-50, 50)
    stations.append(f'{name}={temp:.1f}')

with open('data/test_100k.txt', 'w') as f:
    for station in sorted(stations):
        f.write(station + '\n')
"

echo "Test data generated:"
echo "  - data/test_10.txt (10 entries)"
echo "  - data/test_1000.txt (1000 entries)"
echo "  - data/test_100k.txt (100,000 entries)"
EOF

    # Make scripts executable
    chmod +x scripts/*.sh
    
    print_success "Utility scripts created and made executable"
}

# Function to create documentation
create_documentation() {
    print_status "Creating documentation..."
    
    # Performance optimization guide
    cat > docs/optimization-guide.md << 'EOF'
# Performance Optimization Guide

## General Principles

1. **Measure First**: Always benchmark before and after optimizations
2. **Profile**: Use profiling tools to identify bottlenecks
3. **Optimize Hot Paths**: Focus on code that runs most frequently
4. **Memory Matters**: Efficient memory usage often beats CPU optimization

## Language-Specific Tips

### Java
- Use `BufferedReader` for file I/O
- Consider `ByteBuffer` for very large files
- Use `Stream.parallel()` for parallel processing
- Profile with JProfiler or VisualVM

### Python
- Use `pandas` for data manipulation
- Consider `numba` for numerical computations
- Use `multiprocessing` for CPU-bound tasks
- Profile with `cProfile` and `line_profiler`

### C++
- Use `std::ifstream` with large buffer
- Enable compiler optimizations (`-O2`, `-O3`)
- Use `std::unordered_map` for hash tables
- Profile with `perf` or `gprof`

### Go
- Use `bufio.Scanner` for efficient file reading
- Leverage goroutines for parallel processing
- Use `sync.Map` for concurrent access
- Profile with `go tool pprof`

## Common Optimizations

1. **I/O Optimization**
   - Use buffered I/O
   - Read in chunks
   - Memory-mapped files for very large datasets

2. **Data Structures**
   - Choose appropriate containers
   - Minimize object creation
   - Use value types when possible

3. **Algorithm Optimization**
   - Reduce time complexity
   - Use efficient sorting algorithms
   - Leverage data locality

4. **Parallel Processing**
   - Divide work into chunks
   - Use thread pools
   - Minimize synchronization overhead
EOF

    # GitHub workflows tutorial
    cat > docs/github-workflows.md << 'EOF'
# GitHub Workflows Tutorial

## Understanding the Tournament System

This tournament uses GitHub's powerful workflow system to automatically test and evaluate your submissions.

## How It Works

1. **Fork the Repository**: Create your own copy
2. **Clone Locally**: Download to your machine
3. **Create a Branch**: Work on your solution
4. **Submit via PR**: Create a Pull Request
5. **Automatic Testing**: GitHub Actions runs your code
6. **Results**: Get feedback and see your ranking

## Step-by-Step Guide

### 1. Fork the Repository
- Click the "Fork" button on GitHub
- Choose your account as the destination

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/billion-rows.git
cd billion-rows
```

### 3. Create a Feature Branch
```bash
git checkout -b my-solution
```

### 4. Add Your Solution
- Place your code in the appropriate language folder
- Follow the naming conventions
- Ensure it meets the requirements

### 5. Commit and Push
```bash
git add .
git commit -m "Add my optimized solution"
git push origin my-solution
```

### 6. Create a Pull Request
- Go to your fork on GitHub
- Click "Compare & pull request"
- Add description of your approach
- Submit the PR

## Understanding GitHub Actions

The tournament system automatically:
- Compiles your code
- Runs it against test data
- Measures performance
- Validates output format
- Updates the leaderboard

## Best Practices

1. **Clear Commit Messages**: Describe what you changed
2. **Small, Focused Changes**: One optimization per commit
3. **Test Locally**: Verify your code works before submitting
4. **Documentation**: Explain your optimization approach
5. **Iterative Improvement**: Submit multiple versions

## Troubleshooting

- **Build Failures**: Check the Actions tab for error details
- **Test Failures**: Verify your output format matches requirements
- **Performance Issues**: Check if you're within time/memory limits
EOF

    print_success "Documentation created"
}

# Main setup function
main() {
    echo "🚀 Billion Row Challenge Tournament Setup"
    echo "=========================================="
    echo ""
    
    print_status "Checking prerequisites..."
    check_docker
    check_git
    
    print_status "Creating environment configuration..."
    create_env_file
    
    print_status "Setting up data structure..."
    create_sample_data
    
    print_status "Creating example submissions..."
    create_example_submissions
    
    print_status "Setting up utility scripts..."
    create_utility_scripts
    
    print_status "Creating documentation..."
    create_documentation
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env file with your GitHub token and repository"
    echo "2. Run 'docker-compose up -d' to start services"
    echo "3. Test your setup with './scripts/test_solution.sh java submissions/java/Solution.java'"
    echo "4. Generate test data with './scripts/generate_data.sh'"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"


