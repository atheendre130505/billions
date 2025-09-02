# 🎮 Game Master Guide

## 🎯 **Your Role:**
Test user submissions with the billion-row dataset and update the leaderboard.

## 📊 **Current Status:**
- **Billion-row dataset**: Generating (3.2GB/13GB) - `data/measurements.txt`
- **1M test dataset**: Ready - `data/measurements_1m.txt`
- **Validation system**: Working for all languages

## 🚀 **Testing Submissions:**

### **When a user submits a Pull Request:**

1. **Check the submission:**
   ```bash
   # Review the code in the PR
   # Make sure it's in the correct directory: submissions/{language}/
   ```

2. **Test with billion-row dataset:**
   ```bash
   # Test the submission
   ./test-submission-billion.sh python submissions/python/solution.py
   ./test-submission-billion.sh java submissions/java/Solution.java
   ./test-submission-billion.sh cpp submissions/cpp/solution.cpp
   ./test-submission-billion.sh go submissions/go/solution.go
   ```

3. **Check results:**
   - ✅ **Validation passed**: Add to leaderboard
   - ❌ **Validation failed**: Comment on PR with error details

4. **Update leaderboard:**
   - Add successful submissions to Firebase
   - Include execution time and language
   - Update the website leaderboard

## 📋 **Validation Rules:**
- ✅ **Exact format**: `station=min/mean/max`
- ✅ **Alphabetical order**: Stations must be sorted A-Z
- ✅ **Temperature relationships**: `min <= mean <= max`
- ✅ **All stations**: Must include every station from input
- ✅ **No duplicates**: Each station appears exactly once

## 🏆 **Leaderboard Updates:**
- **Rank by**: Execution time (fastest wins)
- **Include**: Language, execution time, submission date
- **Update**: Firebase Firestore database

## 🛠️ **Tools Available:**

### **Test Scripts:**
- `./test-submission-billion.sh` - Test with billion-row dataset
- `python3 scripts/validate-submission.py` - Validation system
- `./download-test-dataset.sh` - Download 1M test dataset

### **Dataset Files:**
- `data/measurements.txt` - Billion-row dataset (13GB) - for final testing
- `data/measurements_1m.txt` - 1M row dataset (13MB) - for user testing

## 🎯 **Workflow:**
1. **User submits PR** with solution
2. **You test locally** with billion-row dataset
3. **You update leaderboard** if successful
4. **You comment on PR** with results

## 📞 **Need Help?**
- Check `USER_GUIDE.md` for user instructions
- Check `scripts/validate-submission.py --help` for validation options
- Test with 1M dataset first if billion-row is still generating

Good luck managing the challenge! 🚀
