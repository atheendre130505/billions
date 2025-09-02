# 🎮 Billion Row Challenge - Complete Setup Guide

## 🎯 **For Game Master - Complete Setup Instructions**

This guide will help you set up and run the Billion Row Challenge on any device from scratch.

## 📋 **Prerequisites**

### **System Requirements**
- **OS**: Linux, macOS, or Windows with WSL
- **RAM**: Minimum 16GB (32GB recommended for billion-row dataset)
- **Storage**: 20GB free space
- **Internet**: For downloading dependencies and Firebase access

### **Required Software**
- **Python 3.8+** (for validation scripts)
- **Git** (for repository management)
- **Java 11+** (for Java submissions)
- **GCC/G++** (for C++ submissions)
- **Go 1.19+** (for Go submissions)

## 🚀 **Quick Setup (5 minutes)**

### **1. Clone Repository**
```bash
git clone https://github.com/atheendre130505/billions.git
cd billions
```

### **2. Install Dependencies**
```bash
# Python dependencies
pip3 install -r requirements.txt

# Or install individually:
pip3 install jsonschema pyyaml

# System dependencies (Ubuntu/Debian)
sudo apt update
sudo apt install python3 python3-pip git openjdk-11-jdk gcc g++ golang-go

# System dependencies (macOS)
brew install python3 git openjdk gcc go

# System dependencies (Windows - use WSL)
# Install WSL2 and Ubuntu, then follow Ubuntu instructions
```

### **3. Generate Test Dataset**
```bash
# Generate 1M row test dataset (fast - 30 seconds)
python3 scripts/generate-dataset.py --rows 1000000 --output data/measurements_1m.txt

# Generate billion-row dataset (slow - 30 minutes, 13GB)
python3 scripts/generate-dataset.py --rows 1000000000 --output data/measurements.txt
```

### **4. Test the System**
```bash
# Test Python solution
python3 scripts/validate-submission.py submissions/python/solution.py --language python --input data/measurements_1m.txt

# Test C++ solution
python3 scripts/validate-submission.py submissions/cpp/solution.cpp --language cpp --input data/measurements_1m.txt

# Test with billion-row dataset (when ready)
./test-submission-billion.sh python submissions/python/solution.py
```

### **5. Run Website Locally**
```bash
cd website
python3 -m http.server 8082
# Visit: http://localhost:8082
```

## 🔧 **Detailed Setup Instructions**

### **Python Environment**
```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### **Java Setup**
```bash
# Ubuntu/Debian
sudo apt install openjdk-11-jdk

# macOS
brew install openjdk@11

# Windows
# Download from: https://adoptium.net/

# Verify installation
javac -version
java -version
```

### **C++ Setup**
```bash
# Ubuntu/Debian
sudo apt install build-essential

# macOS
xcode-select --install

# Windows (WSL)
sudo apt install build-essential

# Verify installation
gcc --version
g++ --version
```

### **Go Setup**
```bash
# Ubuntu/Debian
sudo apt install golang-go

# macOS
brew install go

# Windows
# Download from: https://golang.org/dl/

# Verify installation
go version
```

## 📊 **Dataset Management**

### **Test Dataset (1M rows)**
- **Size**: 13MB
- **Generation time**: 30 seconds
- **Purpose**: Local development and testing
- **File**: `data/measurements_1m.txt`

### **Billion-Row Dataset**
- **Size**: 13GB
- **Generation time**: 30 minutes
- **Purpose**: Final validation
- **File**: `data/measurements.txt`

### **Generate Datasets**
```bash
# Quick test dataset
python3 scripts/generate-dataset.py --rows 1000000 --output data/measurements_1m.txt

# Full billion-row dataset
python3 scripts/generate-dataset.py --rows 1000000000 --output data/measurements.txt

# Check progress
ls -lh data/
```

## 🧪 **Testing User Submissions**

### **When Users Submit Pull Requests:**

1. **Review the PR** for code quality and security
2. **Test with 1M rows** (fast validation):
   ```bash
   python3 scripts/validate-submission.py submissions/python/solution.py --language python --input data/measurements_1m.txt
   ```
3. **Test with billion rows** (final validation):
   ```bash
   ./test-submission-billion.sh python submissions/python/solution.py
   ```
4. **Check validation results**:
   - ✅ Format: `station=min/mean/max`
   - ✅ Alphabetical order
   - ✅ All stations included
   - ✅ Temperature relationships correct
5. **Update leaderboard** if validation passes
6. **Comment on PR** with results

### **Validation Commands by Language**
```bash
# Python
./test-submission-billion.sh python submissions/python/solution.py

# Java
./test-submission-billion.sh java submissions/java/Solution.java

# C++
./test-submission-billion.sh cpp submissions/cpp/solution.cpp

# Go
./test-submission-billion.sh go submissions/go/solution.go
```

## 🏆 **Leaderboard Management**

### **Firebase Configuration**
- **Project ID**: `billion-row-challenge-7c027`
- **Database**: Firestore
- **Collection**: `leaderboard`

### **Leaderboard Structure**
```json
{
  "user": "username",
  "language": "python",
  "executionTime": 1.726,
  "submissionDate": "2025-01-02T23:45:00Z",
  "rank": 1,
  "prNumber": 123
}
```

### **Update Leaderboard**
1. **Test submission** with billion-row dataset
2. **Record execution time** from validation output
3. **Add to Firebase** leaderboard collection
4. **Website updates** automatically

## 🌐 **Website Deployment**

### **GitHub Pages (Automatic)**
- **URL**: https://atheendre130505.github.io/billions/
- **Deployment**: Automatic on push to master
- **Status**: Check Actions tab in GitHub repository

### **Local Development**
```bash
cd website
python3 -m http.server 8082
# Visit: http://localhost:8082
```

### **Custom Deployment**
```bash
# Build for production
cp -r website/* ./build/
touch build/.nojekyll

# Deploy to any static hosting service
```

## 🔐 **Security & Validation**

### **Security Checks**
- ✅ No system calls (`system()`, `exec()`, etc.)
- ✅ No network access
- ✅ File size limits (10MB max)
- ✅ Resource limits (8GB RAM, 30min timeout)

### **Validation Rules**
- ✅ **Exact format**: `station=min/mean/max`
- ✅ **Alphabetical order**: Stations sorted A-Z
- ✅ **Temperature relationships**: `min <= mean <= max`
- ✅ **All stations**: Every station from input included
- ✅ **No duplicates**: Each station appears exactly once

## 🚨 **Troubleshooting**

### **Common Issues**

#### **"Command not found" errors**
```bash
# Check if tools are installed
python3 --version
javac -version
gcc --version
go version

# Install missing tools
sudo apt install python3 openjdk-11-jdk build-essential golang-go
```

#### **"Permission denied" errors**
```bash
# Make scripts executable
chmod +x test-submission-billion.sh
chmod +x scripts/*.py
```

#### **"Out of memory" errors**
```bash
# Check available memory
free -h

# Use smaller test dataset
python3 scripts/validate-submission.py submissions/python/solution.py --language python --input data/measurements_1m.txt
```

#### **"Dataset not found" errors**
```bash
# Generate missing datasets
python3 scripts/generate-dataset.py --rows 1000000 --output data/measurements_1m.txt
python3 scripts/generate-dataset.py --rows 1000000000 --output data/measurements.txt
```

### **Performance Issues**
- **Slow validation**: Use 1M row dataset for development
- **High memory usage**: Ensure 16GB+ RAM available
- **Long generation time**: Billion-row dataset takes 30 minutes

## 📞 **Support & Resources**

### **For Users**
- **Website**: https://atheendre130505.github.io/billions/
- **Repository**: https://github.com/atheendre130505/billions
- **Issues**: GitHub Issues for bug reports

### **For Game Master**
- **Validation script**: `python3 scripts/validate-submission.py --help`
- **Test script**: `./test-submission-billion.sh --help`
- **Firebase console**: Manage leaderboard data

## 🎯 **Success Checklist**

- [ ] All dependencies installed
- [ ] Test dataset generated (1M rows)
- [ ] Billion-row dataset generated (when needed)
- [ ] Validation system tested
- [ ] Website accessible locally
- [ ] Firebase leaderboard configured
- [ ] Complete workflow tested with sample submission

## 🚀 **Ready to Run!**

Once you complete this setup, you'll be able to:
- ✅ Test user submissions with billion-row dataset
- ✅ Validate results and update leaderboard
- ✅ Manage the competition smoothly
- ✅ Provide feedback to participants

**The Billion Row Challenge is ready to run!** 🎯

---

*Last updated: January 2, 2025*
*Repository: https://github.com/atheendre130505/billions*
