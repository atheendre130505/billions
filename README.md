# 🏆 Billion Row Challenge

**The Ultimate Performance Challenge** - Optimize your code to process one billion rows in record time!

## 🎯 **Challenge Overview**

Process one billion temperature measurements from weather stations worldwide and calculate min, mean, and max temperatures for each station. The fastest solution wins!

### **Dataset**
- **Size**: 1 billion rows (13GB)
- **Format**: `StationName=Temperature`
- **Stations**: 302 weather stations worldwide
- **Output**: `StationName=min/mean/max` (alphabetically sorted)

### **Rules**
1. ✅ Process the entire dataset
2. ✅ Calculate min, mean, and max for each station
3. ✅ Output in exact format: `station=min/mean/max`
4. ✅ Stations must be in alphabetical order
5. ✅ Fastest execution time wins

## 🚀 **How to Participate**

### **1. Visit the Website**
🌐 **Live Challenge**: [https://atheendre130505.github.io/billions/](https://atheendre130505.github.io/billions/)

### **2. Download Test Dataset**
- Click "Download Dataset" button (13MB)
- Test your solution locally with 1M rows
- Optimize your algorithm

### **3. Submit Your Solution**
1. **Fork this repository**
2. **Add your solution** to:
   - `submissions/python/solution.py`
   - `submissions/java/Solution.java`
   - `submissions/cpp/solution.cpp`
   - `submissions/go/solution.go`
3. **Create a Pull Request**
4. **Game master tests** with billion-row dataset
5. **Results posted** to your PR

## 🧪 **Local Testing**

```bash
# Test with 1M rows (fast development)
python3 scripts/validate-submission.py submissions/python/solution.py --language python --input data/measurements_1m.txt

# Final testing uses billion-row dataset (automatic in CI)
```

## 🏆 **Leaderboard**

View live rankings and compete with developers worldwide!

## 💻 **Languages Supported**

- **Python** - Fast development and testing
- **Java** - Enterprise performance
- **C++** - Maximum speed optimization
- **Go** - Concurrent processing

## 🎮 **Game Master**

For game master instructions, see: [GAME_MASTER_GUIDE.md](GAME_MASTER_GUIDE.md)

## 📊 **Current Status**

- **Website**: ✅ Live and functional
- **Validation System**: ✅ Working for all languages
- **Test Dataset**: ✅ Available for download (1M rows)
- **Billion Dataset**: 🔄 Generating (5.4GB/13GB, 41% complete)

## 🚀 **Ready to Compete?**

Visit the website, download the test dataset, and start optimizing! The challenge is open and ready for submissions.

**Good luck!** 🎯