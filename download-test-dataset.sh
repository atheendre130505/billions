#!/bin/bash
# Download 1M row test dataset for local development
# Usage: ./download-test-dataset.sh

set -e

echo "🚀 Downloading 1M Row Test Dataset..."
echo "📦 This dataset is for local development and testing"
echo ""

# Create data directory
mkdir -p data

# Download the 1M row dataset
echo "📥 Downloading measurements_1m.txt..."
curl -L -o data/measurements_1m.txt "https://raw.githubusercontent.com/atheendre130505/billions/main/data/measurements_1m.txt"

# Verify download
if [ -f "data/measurements_1m.txt" ]; then
    echo "✅ Download complete!"
    echo "📊 File size: $(du -h data/measurements_1m.txt | cut -f1)"
    echo "📈 Line count: $(wc -l < data/measurements_1m.txt)"
    echo ""
    echo "🎉 Test dataset ready!"
    echo "💡 You can now test your solution with:"
    echo "   python3 scripts/validate-submission.py submissions/python/solution.py --language python --input data/measurements_1m.txt"
else
    echo "❌ Download failed!"
    exit 1
fi
