# 🎮 Billion Row Challenge - Game Master Guide

## 🎯 **Your Role**
You are the game master responsible for running the Billion Row Challenge. This guide contains everything you need to manage the competition.

## 📊 **Current Status**
- **Billion-row dataset**: Generating (5.4GB/13GB, 41% complete) - `data/measurements.txt`
- **1M test dataset**: Ready (13MB) - `data/measurements_1m.txt`
- **Validation system**: Working for all languages (Python, Java, C++, Go)
- **Website**: Live at `https://atheendre130505.github.io/billions/`

## 🚀 **How to Run the Challenge**

### **1. Wait for Dataset Generation**
```bash
# Check if billion-row dataset is complete
ls -lh data/measurements.txt

# Check generation progress
ps aux | grep "generate-dataset" | grep -v grep
```

**Expected final size**: ~13GB (1 billion rows)

### **2. Test User Submissions**
When users submit Pull Requests:

```bash
# Test Python solution
./test-submission-billion.sh python submissions/python/solution.py

# Test Java solution
./test-submission-billion.sh java submissions/java/Solution.java

# Test C++ solution
./test-submission-billion.sh cpp submissions/cpp/solution.cpp

# Test Go solution
./test-submission-billion.sh go submissions/go/solution.go
```

### **3. Validation Rules**
Submissions must pass ALL validation checks:
- ✅ **Exact format**: `station=min/mean/max`
- ✅ **Alphabetical order**: Stations must be sorted A-Z
- ✅ **Temperature relationships**: `min <= mean <= max`
- ✅ **All stations**: Must include every station from input
- ✅ **No duplicates**: Each station appears exactly once

### **4. Update Leaderboard**
If validation passes:
1. **Record execution time** from validation output
2. **Update Firebase** with user info and results
3. **Comment on PR** with results
4. **Update website leaderboard** automatically

## 🛠️ **Essential Files**

### **Core Scripts**
- `scripts/generate-dataset.py` - Generate datasets
- `scripts/validate-submission.py` - Validate submissions
- `test-submission-billion.sh` - Test with billion-row dataset

### **Datasets**
- `data/measurements.txt` - Billion-row dataset (13GB) - for final testing
- `data/measurements_1m.txt` - 1M row dataset (13MB) - for user testing

### **Website**
- `website/index.html` - Main website
- `website/css/styles.css` - Styling
- `website/js/app.js` - Functionality

### **Example Solutions**
- `submissions/python/solution.py` - Python example
- `submissions/java/Solution.java` - Java example
- `submissions/cpp/solution.cpp` - C++ example
- `submissions/go/solution.go` - Go example

## 📋 **User Workflow**

### **For Users:**
1. **Visit website**: `https://atheendre130505.github.io/billions/`
2. **Download test dataset**: Click "Download Dataset" button (13MB)
3. **Develop solution**: Test with 1M rows locally
4. **Submit PR**: Create Pull Request with solution
5. **Get results**: You test with billion-row dataset

### **For You (Game Master):**
1. **Review PR**: Check solution code
2. **Test locally**: Run `./test-submission-billion.sh`
3. **Validate results**: Check all validation rules pass
4. **Update leaderboard**: Add successful submissions
5. **Comment on PR**: Provide feedback and results

## 🎯 **Testing Commands**

### **Generate Datasets**
```bash
# Generate 1M row test dataset
python3 scripts/generate-dataset.py --rows 1000000 --output data/measurements_1m.txt

# Generate billion-row dataset (takes ~30 minutes)
python3 scripts/generate-dataset.py --rows 1000000000 --output data/measurements.txt
```

### **Validate Submissions**
```bash
# Test with 1M rows (fast)
python3 scripts/validate-submission.py submissions/python/solution.py --language python --input data/measurements_1m.txt

# Test with billion rows (slow)
python3 scripts/validate-submission.py submissions/python/solution.py --language python --input data/measurements.txt
```

### **Run Website Locally**
```bash
cd website && python3 -m http.server 8082
# Visit: http://localhost:8082
```

## 🏆 **Leaderboard Management**

### **Firebase Setup**
- **Project**: `billion-row-challenge-7c027`
- **Database**: Firestore
- **Collection**: `leaderboard`

### **Leaderboard Structure**
```json
{
  "user": "username",
  "language": "python",
  "executionTime": 1.726,
  "submissionDate": "2025-09-02T23:45:00Z",
  "rank": 1
}
```

### **Update Process**
1. **Test submission** with billion-row dataset
2. **Record execution time** from validation output
3. **Add to Firebase** leaderboard collection
4. **Website updates** automatically

## 🚨 **Common Issues**

### **Validation Errors**
- **"Stations not in alphabetical order"**: User needs to sort output
- **"Missing station"**: User needs to include all stations
- **"Invalid format"**: User needs exact `station=min/mean/max` format
- **"Temperature relationship error"**: User needs `min <= mean <= max`

### **Performance Issues**
- **Too slow**: User needs to optimize algorithm
- **Out of memory**: User needs streaming processing
- **Timeout**: User needs to reduce complexity

## 📞 **Support**

### **For Users**
- **Website**: `https://atheendre130505.github.io/billions/`
- **Repository**: `https://github.com/atheendre130505/billions`
- **Issues**: GitHub Issues for bug reports

### **For You**
- **Validation script**: `python3 scripts/validate-submission.py --help`
- **Test script**: `./test-submission-billion.sh --help`
- **Firebase console**: Manage leaderboard data

## 🎉 **Success Metrics**

### **Challenge Goals**
- **Performance**: Fastest execution time wins
- **Correctness**: Must pass all validation rules
- **Participation**: Encourage global developer participation
- **Learning**: Help developers optimize their code

### **Your Success**
- **Fair testing**: All submissions tested with same billion-row dataset
- **Clear feedback**: Detailed validation results for users
- **Updated leaderboard**: Real-time ranking system
- **Smooth experience**: Easy submission and testing process

## 🚀 **Quick Start Checklist**

- [ ] Wait for billion-row dataset generation to complete
- [ ] Test the validation system with example solutions
- [ ] Verify website is working and accessible
- [ ] Set up Firebase leaderboard (if not already done)
- [ ] Test complete workflow with a sample submission
- [ ] Announce challenge is ready for submissions

**You're ready to run the Billion Row Challenge!** 🎯

---

*Last updated: September 2, 2025*
*Dataset generation: 5.4GB/13GB (41% complete)*