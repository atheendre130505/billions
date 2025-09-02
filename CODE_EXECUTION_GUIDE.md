# 🚀 Code Execution System Guide

## 🎯 **How Code Execution Works**

### **Current Architecture:**
- **Frontend**: GitHub Pages (static website)
- **Backend**: Firebase (authentication + database)
- **Code Execution**: **LOCAL** (your computer)

---

## 🔧 **How to Run Java, Python, C++ Code**

### **Option 1: Local Execution (Current Setup)**

#### **For Testing/Development:**
```bash
# Navigate to submissions directory
cd submissions/

# Run Python solution
python3 python/solution.py

# Run Java solution
cd java/
javac Solution.java
java Solution

# Run C++ solution
cd cpp/
g++ -o solution solution.cpp
./solution

# Run Go solution
cd go/
go run solution.go
```

#### **For Tournament Execution:**
```bash
# Run secure tournament (Docker-based)
./scripts/run_tournament_secure.sh

# Run regular tournament
./scripts/run_tournament.sh
```

---

## 🌐 **How Leaderboard Updates**

### **Current Flow:**
1. **User submits code** → Frontend (GitHub Pages)
2. **Code stored** → Firebase Firestore
3. **Manual execution** → Your local machine
4. **Results uploaded** → Firebase Firestore
5. **Leaderboard updates** → Real-time via Firebase

### **To Update Leaderboard:**
```bash
# 1. Run the code locally
cd submissions/python/
python3 solution.py

# 2. Note the execution time
# 3. Manually add to Firebase (or use script)
```

---

## 🚀 **Production Code Execution Options**

### **Option A: Server-Side Execution (Recommended)**

#### **Setup Backend Server:**
```bash
# Create Node.js backend
mkdir backend
cd backend
npm init -y
npm install express multer child_process

# Create execution service
touch server.js
```

#### **Backend Server (server.js):**
```javascript
const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/execute', upload.single('code'), (req, res) => {
    const { language } = req.body;
    const codeFile = req.file.path;
    
    let command;
    switch(language) {
        case 'python':
            command = `python3 ${codeFile}`;
            break;
        case 'java':
            command = `cd ${path.dirname(codeFile)} && javac ${codeFile} && java ${path.basename(codeFile, '.java')}`;
            break;
        case 'cpp':
            command = `g++ -o ${codeFile}.out ${codeFile} && ${codeFile}.out`;
            break;
    }
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            res.json({ success: false, error: error.message });
        } else {
            res.json({ success: true, output: stdout, time: Date.now() });
        }
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### **Option B: Third-Party APIs**

#### **Using JDoodle API:**
```javascript
// In your frontend
async function executeCode(code, language) {
    const response = await fetch('https://api.jdoodle.com/v1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            script: code,
            language: language,
            versionIndex: '0',
            clientId: 'YOUR_CLIENT_ID',
            clientSecret: 'YOUR_CLIENT_SECRET'
        })
    });
    
    return await response.json();
}
```

### **Option C: GitHub Actions (Automated)**

#### **Create GitHub Action:**
```yaml
# .github/workflows/execute-code.yml
name: Execute Code Submission

on:
  pull_request:
    paths: ['submissions/**']

jobs:
  execute:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '11'
      - name: Execute Code
        run: |
          # Run your execution logic here
          ./scripts/execute-submission.sh
      - name: Update Leaderboard
        run: |
          # Update Firebase with results
          node scripts/update-leaderboard.js
```

---

## 🔄 **Automated Update System**

### **Real-Time Updates:**
```javascript
// In your frontend (app.js)
async function submitSolution(code, language) {
    // 1. Submit to execution service
    const result = await executeCode(code, language);
    
    // 2. Save to Firebase
    await addDoc(collection(db, 'leaderboard'), {
        userName: currentUser.name,
        executionTime: result.time,
        language: language,
        timestamp: new Date()
    });
    
    // 3. Refresh leaderboard
    await loadLeaderboard();
}
```

### **Scheduled Updates:**
```javascript
// Update leaderboard every 30 seconds
setInterval(async () => {
    await loadLeaderboard();
}, 30000);
```

---

## 🛡️ **Security Considerations**

### **Sandboxing:**
```bash
# Use Docker for secure execution
docker run --rm -v $(pwd):/code python:3.9 python /code/solution.py

# Or use chroot/jail
chroot /secure-env python3 solution.py
```

### **Resource Limits:**
```javascript
// Set execution timeouts
const timeout = 5000; // 5 seconds
const child = exec(command, { timeout }, callback);
```

---

## 📊 **Current Status & Next Steps**

### **✅ What's Working:**
- Frontend (GitHub Pages)
- Firebase Authentication
- Firebase Database
- Local code execution
- Manual leaderboard updates

### **⏳ What Needs Setup:**
1. **Firebase Domain Authorization** (fix the auth error)
2. **Code Execution Backend** (choose option A, B, or C)
3. **Automated Testing** (GitHub Actions)
4. **Real-time Updates** (WebSocket or polling)

### **🎯 Recommended Next Steps:**
1. **Fix Firebase domain** (add `atheendre130505.github.io`)
2. **Set up backend server** (Option A - most control)
3. **Implement automated execution**
4. **Add real-time leaderboard updates**

---

## 🚀 **Quick Start Commands**

```bash
# Test current setup
./test-complete-system.sh

# Run local tournament
./scripts/run_tournament.sh

# Check Firebase connection
firebase projects:list

# Deploy updates
git add . && git commit -m "Update" && git push
```

**Your system is ready for local testing and development!** 🎉
