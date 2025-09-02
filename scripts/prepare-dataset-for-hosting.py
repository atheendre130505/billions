#!/usr/bin/env python3
"""
Prepare billion-row dataset for free hosting
Splits large dataset into chunks and creates download script
"""

import os
import gzip
import hashlib
from pathlib import Path

def compress_and_split_dataset(input_file, chunk_size_mb=100):
    """
    Split dataset into compressed chunks for GitHub Releases
    Each chunk will be ~100MB compressed (suitable for GitHub)
    """
    chunk_size_bytes = chunk_size_mb * 1024 * 1024
    
    print(f"🔄 Preparing dataset for hosting...")
    print(f"📁 Input: {input_file}")
    print(f"📦 Chunk size: {chunk_size_mb}MB")
    
    # Create chunks directory
    chunks_dir = Path("data/chunks")
    chunks_dir.mkdir(exist_ok=True)
    
    chunk_files = []
    current_chunk = 0
    current_size = 0
    current_file = None
    
    with open(input_file, 'r') as infile:
        for line_num, line in enumerate(infile, 1):
            # Start new chunk if needed
            if current_file is None or current_size >= chunk_size_bytes:
                if current_file:
                    current_file.close()
                
                chunk_filename = f"measurements_chunk_{current_chunk:03d}.txt.gz"
                chunk_path = chunks_dir / chunk_filename
                current_file = gzip.open(chunk_path, 'wt')
                chunk_files.append(chunk_path)
                current_size = 0
                current_chunk += 1
                
                print(f"📦 Creating chunk {current_chunk}: {chunk_filename}")
            
            current_file.write(line)
            current_size += len(line.encode('utf-8'))
            
            if line_num % 1000000 == 0:
                print(f"📊 Processed {line_num:,} lines...")
    
    if current_file:
        current_file.close()
    
    print(f"✅ Created {len(chunk_files)} chunks")
    return chunk_files

def create_download_script(chunk_files):
    """Create download script for users"""
    
    # Create download URLs (GitHub Releases format)
    base_url = "https://github.com/atheendre130505/billions/releases/download/dataset"
    
    download_script = """#!/bin/bash
# Download and reassemble billion-row dataset
# Usage: ./download-dataset.sh

set -e

echo "🚀 Downloading Billion Row Challenge Dataset..."
echo "📦 This will download ~13GB of data"
echo ""

# Create data directory
mkdir -p data
cd data

# Download all chunks
"""
    
    for i, chunk_file in enumerate(chunk_files):
        filename = chunk_file.name
        download_script += f'echo "📥 Downloading {filename}..."\n'
        download_script += f'curl -L -o "{filename}" "{base_url}/{filename}"\n'
        download_script += f'echo "✅ Downloaded {filename}"\n\n'
    
    download_script += """
# Verify downloads
echo "🔍 Verifying downloads..."
for file in measurements_chunk_*.txt.gz; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing file: $file"
        exit 1
    fi
done

# Reassemble dataset
echo "🔧 Reassembling dataset..."
cat measurements_chunk_*.txt.gz | gunzip > measurements.txt

# Clean up chunks
echo "🧹 Cleaning up chunks..."
rm measurements_chunk_*.txt.gz

# Verify final file
echo "✅ Dataset ready: measurements.txt"
echo "📊 File size: $(du -h measurements.txt | cut -f1)"
echo "📈 Line count: $(wc -l < measurements.txt)"
echo ""
echo "🎉 Dataset download complete!"
echo "💡 You can now test your solution with:"
echo "   python3 scripts/validate-submission.py submissions/python/solution.py --language python --input data/measurements.txt"
"""
    
    with open("download-dataset.sh", "w") as f:
        f.write(download_script)
    
    os.chmod("download-dataset.sh", 0o755)
    print("📜 Created download-dataset.sh")

def create_github_release_instructions(chunk_files):
    """Create instructions for GitHub Release"""
    
    instructions = """# GitHub Release Instructions

## Upload Dataset to GitHub Releases

1. **Create a new release:**
   - Go to: https://github.com/atheendre130505/billions/releases/new
   - Tag: `dataset`
   - Title: `Billion Row Challenge Dataset`
   - Description: `Compressed dataset chunks for the Billion Row Challenge`

2. **Upload chunk files:**
   - Drag and drop all files from `data/chunks/` to the release
   - Files to upload:
"""
    
    for chunk_file in chunk_files:
        size_mb = chunk_file.stat().st_size / (1024 * 1024)
        instructions += f"   - `{chunk_file.name}` ({size_mb:.1f}MB)\n"
    
    instructions += """
3. **Publish the release:**
   - Click "Publish release"
   - The files will be available at: https://github.com/atheendre130505/billions/releases/download/dataset/

## Alternative: Use Git LFS (if available)
```bash
# Enable Git LFS
git lfs install

# Track large files
git lfs track "data/chunks/*.txt.gz"

# Add and commit
git add .gitattributes data/chunks/
git commit -m "Add dataset chunks with LFS"
git push origin main
```

## User Instructions
Users can download the dataset using:
```bash
curl -L https://raw.githubusercontent.com/atheendre130505/billions/main/download-dataset.sh | bash
```
"""
    
    with open("GITHUB_RELEASE_INSTRUCTIONS.md", "w") as f:
        f.write(instructions)
    
    print("📋 Created GITHUB_RELEASE_INSTRUCTIONS.md")

def main():
    """Main function"""
    # Try different dataset files
    input_file = None
    for filename in ["data/measurements.txt", "data/measurements_1m.txt"]:
        if os.path.exists(filename):
            input_file = filename
            break
    
    if not input_file:
        print("❌ No dataset file found!")
        print("💡 Generate one with: python3 scripts/generate-dataset.py --rows 1000000 --output data/measurements_1m.txt")
        return
    
    # Get file size
    file_size_gb = os.path.getsize(input_file) / (1024**3)
    print(f"📊 Dataset size: {file_size_gb:.2f}GB")
    
    if file_size_gb > 2:
        print("⚠️  File too large for single GitHub file (2GB limit)")
        print("🔄 Splitting into chunks...")
        
        chunk_files = compress_and_split_dataset(input_file)
        create_download_script(chunk_files)
        create_github_release_instructions(chunk_files)
        
        print("\n🎯 Next steps:")
        print("1. Upload chunks to GitHub Release")
        print("2. Users run: ./download-dataset.sh")
        print("3. Test with: python3 scripts/validate-submission.py ...")
    else:
        print("✅ File size OK for GitHub Release")
        print("💡 Can upload directly to GitHub Releases")

if __name__ == "__main__":
    main()
