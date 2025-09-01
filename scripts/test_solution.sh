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
