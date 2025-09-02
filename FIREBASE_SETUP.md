# 🔥 Firebase Setup Guide

## Complete Firebase Integration for Billion Row Challenge

### **Why Firebase?**
- ✅ **No Docker needed** - Everything runs in the cloud
- ✅ **Simple authentication** - Google sign-in with one click
- ✅ **Real-time database** - Firestore for live leaderboard
- ✅ **Easy hosting** - Deploy with one command
- ✅ **Free tier** - Perfect for development and small projects

---

## 🚀 **Step 1: Create Firebase Project**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Click "Create a project"**
3. **Enter project name**: `billion-row-challenge`
4. **Enable Google Analytics** (optional)
5. **Click "Create project"**

---

## 🔐 **Step 2: Enable Authentication**

1. **In Firebase Console**, go to **"Authentication"**
2. **Click "Get started"**
3. **Go to "Sign-in method" tab**
4. **Enable "Google"** provider:
   - Click on Google
   - Toggle "Enable"
   - Add your email as project support email
   - Click "Save"

---

## 🗄️ **Step 3: Set up Firestore Database**

1. **Go to "Firestore Database"**
2. **Click "Create database"**
3. **Choose "Start in test mode"** (for development)
4. **Select a location** (choose closest to you)
5. **Click "Done"**

---

## 🌐 **Step 4: Get Firebase Configuration**

1. **Go to Project Settings** (gear icon)
2. **Scroll down to "Your apps"**
3. **Click "Web" icon** (`</>`)
4. **Register app**:
   - App nickname: `Billion Row Challenge Web`
   - Check "Also set up Firebase Hosting"
   - Click "Register app"
5. **Copy the Firebase config object**

---

## 📝 **Step 5: Update Your Website**

Replace the Firebase config in `website/index.html`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

---

## 🚀 **Step 6: Deploy to Firebase Hosting**

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Public directory: `website`
   - Single-page app: `Yes`
   - Overwrite index.html: `No`

4. **Deploy**:
   ```bash
   firebase deploy
   ```

---

## 🧪 **Step 7: Test Everything**

1. **Visit your deployed site**
2. **Test Google sign-in**
3. **Check if leaderboard loads**
4. **Verify real-time updates**

---

## 📊 **Step 8: Add Sample Data (Optional)**

To populate your leaderboard with sample data, run this in your browser console:

```javascript
// Add sample leaderboard entries
const sampleData = [
    { userName: 'speed_demon', executionTime: 2.34, language: 'C++' },
    { userName: 'python_master', executionTime: 3.12, language: 'Python' },
    { userName: 'java_ninja', executionTime: 3.45, language: 'Java' },
    { userName: 'go_guru', executionTime: 3.78, language: 'Go' }
];

sampleData.forEach(async (data) => {
    await addDoc(collection(db, 'leaderboard'), {
        ...data,
        timestamp: new Date()
    });
});
```

---

## 🔧 **Troubleshooting**

### **Authentication Issues**
- Make sure Google provider is enabled
- Check that your domain is authorized
- Verify Firebase config is correct

### **Database Issues**
- Ensure Firestore is in test mode
- Check Firestore rules allow read/write
- Verify collection names match

### **Hosting Issues**
- Check Firebase CLI is logged in
- Verify project ID is correct
- Ensure all files are in the public directory

---

## 🎯 **Benefits of This Setup**

1. **No Docker complexity** - Everything runs in Firebase
2. **Real-time updates** - Leaderboard updates instantly
3. **Scalable** - Firebase handles scaling automatically
4. **Secure** - Built-in security rules
5. **Free** - Generous free tier for development
6. **Easy deployment** - One command to deploy

---

## 📱 **Next Steps**

1. **Follow the steps above**
2. **Get your Firebase config**
3. **Update the website**
4. **Deploy to Firebase Hosting**
5. **Test the complete system**

Your Billion Row Challenge will be running on Firebase with real-time authentication and database! 🚀
