#!/bin/bash
# Test submission with billion-row dataset (for game master)
# Usage: ./test-submission-billion.sh <language> <solution_file>

set -e

if [ $# -ne 2 ]; then
    echo "Usage: $0 <language> <solution_file>"
    echo "Example: $0 python submissions/python/solution.py"
    echo "Languages: python, java, cpp, go"
    exit 1
fi

LANGUAGE=$1
SOLUTION_FILE=$2

echo "🎯 Testing submission with billion-row dataset..."
echo "📁 Solution: $SOLUTION_FILE"
echo "🔤 Language: $LANGUAGE"
echo ""

# Check if billion-row dataset exists
if [ ! -f "data/measurements.txt" ]; then
    echo "❌ Billion-row dataset not found: data/measurements.txt"
    echo "💡 Generate it first with: python3 scripts/generate-dataset.py --rows 1000000000"
    exit 1
fi

# Check if solution file exists
if [ ! -f "$SOLUTION_FILE" ]; then
    echo "❌ Solution file not found: $SOLUTION_FILE"
    exit 1
fi

# Get dataset size
DATASET_SIZE=$(du -h data/measurements.txt | cut -f1)
echo "📊 Dataset size: $DATASET_SIZE"
echo ""

# Run validation
echo "🚀 Running validation with billion-row dataset..."
python3 scripts/validate-submission.py "$SOLUTION_FILE" --language "$LANGUAGE" --input data/measurements.txt

echo ""
echo "🎉 Testing complete!"
