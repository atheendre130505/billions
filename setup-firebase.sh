#!/bin/bash

echo "🔥 Firebase Setup for Billion Row Challenge"
echo "============================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
echo "📦 Node.js version: $(node --version)"

if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Node.js version is too old for latest Firebase CLI"
    echo "   Current: $(node --version)"
    echo "   Required: >= 20.0.0"
    echo ""
    echo "🔧 Solutions:"
    echo "1. Update Node.js to version 20 or higher"
    echo "2. Use the manual setup guide (FIREBASE_SETUP.md)"
    echo "3. Use the web-based Firebase Console"
    echo ""
    echo "📖 Manual setup guide: FIREBASE_SETUP.md"
    exit 1
fi

# Install Firebase CLI
echo "📥 Installing Firebase CLI..."
npm install -g firebase-tools

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Failed to install Firebase CLI"
    exit 1
fi

echo "✅ Firebase CLI installed successfully"

# Login to Firebase
echo "🔐 Logging into Firebase..."
firebase login

# Initialize Firebase project
echo "🚀 Initializing Firebase project..."
firebase init

echo ""
echo "🎉 Firebase setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your Firebase config in website/index.html"
echo "2. Deploy with: firebase deploy"
echo "3. Test your website at the Firebase hosting URL"
echo ""
echo "🌐 Your website is running locally at: http://localhost:8082"
