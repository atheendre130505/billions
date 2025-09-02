# 🚀 Billion Row Challenge - User Guide

## 🎯 **How to Participate:**

### **1. Fork the Repository**
```bash
git clone https://github.com/atheendre130505/billions.git
cd billions
```

### **2. Download Test Dataset (Local Development)**
```bash
# Download 1M row dataset for local testing (13MB)
./download-test-dataset.sh
```

### **3. For Final Submission**
The billion-row dataset (13GB) will be automatically downloaded during GitHub Actions testing when you submit a Pull Request.

### **4. Choose Your Language**
Add your solution to the appropriate directory:
- **Python**: `submissions/python/solution.py`
- **Java**: `submissions/java/Solution.java`
- **C++**: `submissions/cpp/solution.cpp`
- **Go**: `submissions/go/solution.go`

### **5. Test Your Solution Locally**
```bash
# Test with 1M row dataset (fast development)
python3 scripts/validate-submission.py submissions/python/solution.py --language python --input data/measurements_1m.txt
```

### **6. Submit Your Solution**
1. **Create a Pull Request** to the main repository
2. **GitHub Actions** will automatically test your solution
3. **Results** will be posted to your PR
4. **Leaderboard** will be updated automatically

## 📋 **Solution Requirements:**

### **Input Format:**
```
StationName=Temperature
Chengdu=9.1
Berlin=-9.3
Krakow=15.9
...
```

### **Output Format:**
```
StationName=min/mean/max
Chengdu=9.1/9.1/9.1
Berlin=-9.3/-9.3/-9.3
Krakow=15.9/15.9/15.9
...
```

### **Validation Rules:**
- ✅ **Exact format**: `station=min/mean/max`
- ✅ **Alphabetical order**: Stations must be sorted A-Z
- ✅ **Temperature relationships**: `min <= mean <= max`
- ✅ **All stations**: Must include every station from input
- ✅ **No duplicates**: Each station appears exactly once

## 🧪 **Testing Your Solution:**

### **Local Testing:**
```bash
# Test with 1M rows (fast development)
python3 scripts/validate-submission.py submissions/python/solution.py --language python --input data/measurements_1m.txt
```

### **Final Testing:**
The billion-row dataset will be automatically tested when you submit a Pull Request via GitHub Actions.

### **Validation Output:**
```
🔍 Validating python submission: submissions/python/solution.py
✅ Validation passed! Execution time: 1.726s
🎉 Submission validation PASSED!
```

## 🏆 **Scoring:**

### **Performance Metrics:**
- **Execution time**: How fast your solution runs
- **Memory usage**: How much RAM your solution uses
- **Correctness**: Must pass all validation tests

### **Leaderboard:**
- **Ranked by**: Execution time (fastest wins)
- **Updated**: Automatically after each PR
- **Public**: Viewable on the website

## 🛠️ **Development Tips:**

### **Development Workflow:**
1. **Download test dataset**: `./download-test-dataset.sh`
2. **Develop your solution** with 1M rows
3. **Optimize your algorithm**
4. **Submit Pull Request** for final testing with billion rows

### **Language-Specific Tips:**

#### **Python:**
```python
# Use efficient data structures
from collections import defaultdict
import sys

# Read input efficiently
for line in sys.stdin:
    station, temp = line.strip().split('=')
    # Process...
```

#### **Java:**
```java
// Use BufferedReader for fast I/O
BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
String line;
while ((line = reader.readLine()) != null) {
    // Process...
}
```

#### **C++:**
```cpp
// Use fast I/O
ios_base::sync_with_stdio(false);
cin.tie(nullptr);

// Use efficient containers
unordered_map<string, vector<double>> stations;
```

#### **Go:**
```go
// Use bufio for fast I/O
scanner := bufio.NewScanner(os.Stdin)
for scanner.Scan() {
    line := scanner.Text()
    // Process...
}
```

## 🚨 **Common Issues:**

### **Validation Errors:**
- **"Stations not in alphabetical order"**: Sort your output
- **"Missing station"**: Include all stations from input
- **"Invalid format"**: Use exact `station=min/mean/max` format
- **"Temperature relationship error"**: Ensure `min <= mean <= max`

### **Performance Issues:**
- **Too slow**: Optimize your algorithm
- **Out of memory**: Use streaming processing
- **Timeout**: Reduce complexity

## 🎉 **Success!**

Once your solution passes validation and appears on the leaderboard, you've successfully completed the Billion Row Challenge! 🏆

## 📞 **Need Help?**

- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Website**: Visit the live leaderboard
- **Documentation**: Check the docs/ folder

Good luck! 🚀
