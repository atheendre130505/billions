#!/bin/bash

echo "🔥 Testing Firebase Integration"
echo "================================"

# Test if local server is running
echo "📡 Testing local server..."
if curl -s http://localhost:8081/ > /dev/null; then
    echo "✅ Local server is running on localhost:8081"
else
    echo "❌ Local server is not running"
    echo "   Starting server..."
    cd website && python3 -m http.server 8081 &
    sleep 2
    if curl -s http://localhost:8081/ > /dev/null; then
        echo "✅ Local server started successfully"
    else
        echo "❌ Failed to start local server"
        exit 1
    fi
fi

# Test if Firebase files exist
echo ""
echo "📁 Checking Firebase configuration files..."
if [ -f "firebase.json" ]; then
    echo "✅ firebase.json exists"
else
    echo "❌ firebase.json missing"
fi

if [ -f "firestore.rules" ]; then
    echo "✅ firestore.rules exists"
else
    echo "❌ firestore.rules missing"
fi

if [ -f "firestore.indexes.json" ]; then
    echo "✅ firestore.indexes.json exists"
else
    echo "❌ firestore.indexes.json missing"
fi

if [ -f "FIREBASE_SETUP.md" ]; then
    echo "✅ FIREBASE_SETUP.md exists"
else
    echo "❌ FIREBASE_SETUP.md missing"
fi

# Test website files
echo ""
echo "🌐 Checking website files..."
if [ -f "website/index.html" ]; then
    echo "✅ website/index.html exists"
    if grep -q "firebase" website/index.html; then
        echo "✅ Firebase SDK integrated in HTML"
    else
        echo "❌ Firebase SDK not found in HTML"
    fi
else
    echo "❌ website/index.html missing"
fi

if [ -f "website/js/app.js" ]; then
    echo "✅ website/js/app.js exists"
    if grep -q "firebase" website/js/app.js; then
        echo "✅ Firebase integration in JavaScript"
    else
        echo "❌ Firebase integration not found in JavaScript"
    fi
else
    echo "❌ website/js/app.js missing"
fi

# Test Docker status
echo ""
echo "🐳 Checking Docker status..."
if docker ps | grep -q "billion-rows"; then
    echo "⚠️  Docker containers still running (not needed with Firebase)"
else
    echo "✅ No Docker containers running (Firebase mode)"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Follow FIREBASE_SETUP.md to configure Firebase"
echo "2. Get your Firebase config from Firebase Console"
echo "3. Update the config in website/index.html"
echo "4. Deploy with: firebase deploy"
echo ""
echo "🌐 Your website is running at: http://localhost:8081"
echo "📖 Setup guide: FIREBASE_SETUP.md"
