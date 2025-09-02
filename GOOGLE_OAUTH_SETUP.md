# 🔐 Google OAuth Setup Guide

## Step-by-Step Instructions to Fix Google Sign-In

### 1. **Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `Billion Row Challenge`
4. Click "Create"

### 2. **Enable Google+ API**

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on it and press "Enable"

### 3. **Create OAuth 2.0 Credentials**

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in required fields:
     - App name: `Billion Row Challenge`
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (your email)

### 4. **Configure OAuth Client**

1. Application type: "Web application"
2. Name: `Billion Row Challenge Web`
3. Authorized JavaScript origins:
   - `http://localhost:8081`
   - `http://localhost:3000` (if using different port)
4. Authorized redirect URIs:
   - `http://localhost:8081`
   - `http://localhost:8081/callback` (optional)

### 5. **Get Your Client ID**

1. After creating, you'll see a popup with your Client ID
2. Copy the Client ID (looks like: `123456789-abcdefg.apps.googleusercontent.com`)

### 6. **Update Your Website**

Replace `YOUR_GOOGLE_CLIENT_ID` in `website/index.html` with your actual Client ID:

```html
<div id="g_id_onload"
     data-client_id="YOUR_ACTUAL_CLIENT_ID_HERE"
     data-callback="handleCredentialResponse"
     data-auto_prompt="false">
</div>
```

### 7. **Test the Setup**

1. Restart your Docker services: `docker-compose restart`
2. Open http://localhost:8081
3. Click "Sign In" button
4. You should see the Google sign-in popup

## 🔧 Alternative: Use Demo Mode

If you want to test without Google OAuth setup, I can create a demo mode that simulates sign-in.

## 🚨 Common Issues

### "OAuth client was not found"
- Make sure you copied the correct Client ID
- Check that the domain matches exactly (localhost:8081)
- Ensure the OAuth consent screen is configured

### "Invalid redirect URI"
- Add `http://localhost:8081` to authorized redirect URIs
- Make sure there are no trailing slashes

### "Access blocked"
- Add your email to test users in OAuth consent screen
- Or publish the app (not recommended for development)

## 📝 Quick Fix Commands

```bash
# Restart services after making changes
docker-compose restart

# Check if services are running
docker-compose ps

# View logs if there are issues
docker-compose logs nginx
```

## 🎯 Next Steps

1. Follow the steps above to get your Google Client ID
2. Update the HTML file with your Client ID
3. Test the sign-in functionality
4. Let me know if you need help with any step!
