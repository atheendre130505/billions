#!/bin/bash
# Test script for BillionRowSolver.java

echo "🚀 Testing Billion Row Challenge - Java Solution"
echo "================================================"

# Compile the Java solution
echo "📦 Compiling Java solution..."
javac BillionRowSolver.java

if [ $? -eq 0 ]; then
    echo "✅ Compilation successful!"
else
    echo "❌ Compilation failed!"
    exit 1
fi

# Test with sample data
echo ""
echo "🧪 Testing with sample data..."
echo "Creating test data..."

# Create test data
cat > test_data.txt << 'EOF'
StationA=10.0
StationA=20.0
StationA=30.0
StationB=5.0
StationB=15.0
StationC=0.0
StationC=25.0
StationC=50.0
EOF

echo "Test data created:"
cat test_data.txt
echo ""

# Test 1: With file input
echo "📊 Test 1: File input"
echo "Command: java BillionRowSolver test_data.txt"
java BillionRowSolver test_data.txt

echo ""

# Test 2: With stdin input
echo "📊 Test 2: Stdin input"
echo "Command: java BillionRowSolver < test_data.txt"
java BillionRowSolver < test_data.txt

echo ""

# Test 3: With 1M dataset (if available)
if [ -f "data/measurements_1m.txt" ]; then
    echo "📊 Test 3: 1M row dataset"
    echo "Command: java BillionRowSolver data/measurements_1m.txt"
    echo "Processing 1M rows... (this may take a moment)"
    
    start_time=$(date +%s.%N)
    java BillionRowSolver data/measurements_1m.txt > output.txt
    end_time=$(date +%s.%N)
    
    execution_time=$(echo "$end_time - $start_time" | bc -l)
    echo "✅ Processing complete!"
    echo "⏱️  Execution time: ${execution_time}s"
    echo "📈 Output lines: $(wc -l < output.txt)"
    echo "🔍 Sample output:"
    head -5 output.txt
    echo "..."
    tail -5 output.txt
else
    echo "⚠️  1M dataset not found, skipping large dataset test"
fi

# Cleanup
echo ""
echo "🧹 Cleaning up..."
rm -f test_data.txt output.txt

echo ""
echo "🎉 Java solution testing complete!"
echo ""
echo "📋 Usage Instructions:"
echo "  1. Compile: javac BillionRowSolver.java"
echo "  2. Run with file: java BillionRowSolver input.txt"
echo "  3. Run with stdin: java BillionRowSolver < input.txt"
echo ""
echo "🚀 Ready for submission to GitHub!"
