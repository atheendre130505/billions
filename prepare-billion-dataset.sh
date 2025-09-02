#!/bin/bash
# Prepare billion-row dataset for GitHub Releases
# This script will be run after the dataset generation is complete

set -e

echo "🚀 Preparing Billion Row Dataset for GitHub Releases..."

# Check if dataset exists
if [ ! -f "data/measurements.txt" ]; then
    echo "❌ Dataset not found: data/measurements.txt"
    echo "💡 Generate it first with: python3 scripts/generate-dataset.py --rows 1000000000"
    exit 1
fi

# Get file size
FILE_SIZE=$(du -h data/measurements.txt | cut -f1)
echo "📊 Dataset size: $FILE_SIZE"

# Check if file is large enough (should be ~13GB)
FILE_SIZE_BYTES=$(stat -c%s data/measurements.txt)
FILE_SIZE_GB=$((FILE_SIZE_BYTES / 1024 / 1024 / 1024))

if [ $FILE_SIZE_GB -lt 10 ]; then
    echo "⚠️  Dataset seems too small ($FILE_SIZE_GB GB). Expected ~13GB."
    echo "💡 Make sure generation is complete."
    exit 1
fi

echo "✅ Dataset size looks good: ${FILE_SIZE_GB}GB"

# Create compressed version for GitHub Releases
echo "🗜️  Creating compressed version..."
gzip -c data/measurements.txt > data/measurements.txt.gz

COMPRESSED_SIZE=$(du -h data/measurements.txt.gz | cut -f1)
echo "📦 Compressed size: $COMPRESSED_SIZE"

# Create download script for users
cat > download-billion-dataset.sh << 'EOF'
#!/bin/bash
# Download billion-row dataset for final testing
# This is used by GitHub Actions for PR testing

set -e

echo "🚀 Downloading Billion Row Dataset for Final Testing..."
echo "📦 This is the full 13GB dataset used for final validation"
echo ""

# Create data directory
mkdir -p data

# Download the compressed dataset
echo "📥 Downloading measurements.txt.gz..."
curl -L -o data/measurements.txt.gz "https://github.com/atheendre130505/billions/releases/download/dataset/measurements.txt.gz"

# Decompress
echo "🔧 Decompressing dataset..."
gunzip data/measurements.txt.gz

# Verify download
if [ -f "data/measurements.txt" ]; then
    echo "✅ Download complete!"
    echo "📊 File size: $(du -h data/measurements.txt | cut -f1)"
    echo "📈 Line count: $(wc -l < data/measurements.txt)"
    echo ""
    echo "🎉 Billion row dataset ready for final testing!"
else
    echo "❌ Download failed!"
    exit 1
fi
EOF

chmod +x download-billion-dataset.sh

echo "📜 Created download-billion-dataset.sh"

# Create GitHub Release instructions
cat > GITHUB_RELEASE_INSTRUCTIONS.md << EOF
# GitHub Release Instructions for Billion Row Dataset

## Upload Dataset to GitHub Releases

1. **Create a new release:**
   - Go to: https://github.com/atheendre130505/billions/releases/new
   - Tag: \`dataset\`
   - Title: \`Billion Row Challenge Dataset\`
   - Description: \`Compressed billion-row dataset for final testing\`

2. **Upload the compressed file:**
   - File: \`data/measurements.txt.gz\` ($COMPRESSED_SIZE)
   - This will be available at: https://github.com/atheendre130505/billions/releases/download/dataset/measurements.txt.gz

3. **Publish the release**

## Usage
- **Local development**: Use \`./download-test-dataset.sh\` (1M rows)
- **Final testing**: Use \`./download-billion-dataset.sh\` (1B rows)
- **GitHub Actions**: Will automatically download for PR testing

## File Sizes
- **Original**: $FILE_SIZE (uncompressed)
- **Compressed**: $COMPRESSED_SIZE (for GitHub Release)
- **Test dataset**: 13MB (1M rows, for local development)
EOF

echo "📋 Created GITHUB_RELEASE_INSTRUCTIONS.md"
echo ""
echo "🎯 Next steps:"
echo "1. Wait for dataset generation to complete"
echo "2. Run this script again to prepare for upload"
echo "3. Upload measurements.txt.gz to GitHub Release"
echo "4. Test the complete workflow"
