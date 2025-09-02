# 🧪 Billion Row Challenge - Test Cases

## 📋 Manual Testing Checklist

### 1. **Web Interface Tests**
- [ ] **Page Load**: Website loads at http://localhost:8081
- [ ] **Responsive Design**: Test on mobile, tablet, desktop
- [ ] **Navigation**: All sections scroll smoothly
- [ ] **Visual Elements**: All icons, colors, and animations work
- [ ] **Performance**: Page loads quickly (< 3 seconds)

### 2. **Authentication Tests**
- [ ] **Sign In Button**: Click opens modal
- [ ] **Google Sign-In**: Modal displays Google sign-in button
- [ ] **Modal Close**: X button and backdrop click close modal
- [ ] **User Profile**: After sign-in, shows user avatar and name
- [ ] **Sign Out**: Sign out button works and resets UI

### 3. **Leaderboard Tests**
- [ ] **Data Display**: Shows sample leaderboard entries
- [ ] **Responsive Table**: Table adapts to screen size
- [ ] **Hover Effects**: Rows highlight on hover
- [ ] **Data Format**: Times, ranks, and languages display correctly

### 4. **Navigation Tests**
- [ ] **Get Started Button**: Scrolls to submit section
- [ ] **View Leaderboard Button**: Scrolls to leaderboard section
- [ ] **Footer Links**: All footer links scroll to correct sections
- [ ] **Smooth Scrolling**: All scroll animations are smooth

### 5. **Submit Solution Tests**
- [ ] **Without Sign-In**: Shows warning and opens sign-in modal
- [ ] **With Sign-In**: Shows "Redirecting to GitHub" notification
- [ ] **GitHub Redirect**: Opens GitHub in new tab (if configured)

### 6. **Notification System Tests**
- [ ] **Success Notifications**: Green notifications appear and auto-dismiss
- [ ] **Error Notifications**: Red notifications appear and auto-dismiss
- [ ] **Warning Notifications**: Yellow notifications appear and auto-dismiss
- [ ] **Info Notifications**: Blue notifications appear and auto-dismiss
- [ ] **Manual Close**: X button on notifications works

### 7. **Docker Services Tests**
- [ ] **All Services Running**: Check `docker-compose ps`
- [ ] **Web Server**: Nginx serves files correctly
- [ ] **Database**: PostgreSQL accessible and has sample data
- [ ] **Redis**: Redis responds to ping
- [ ] **Grafana**: Monitoring dashboard accessible

### 8. **Performance Tests**
- [ ] **Page Load Time**: < 3 seconds
- [ ] **Resource Usage**: Check browser dev tools
- [ ] **Memory Usage**: No memory leaks
- [ ] **Network Requests**: Minimal external requests

### 9. **Cross-Browser Tests**
- [ ] **Chrome**: All features work
- [ ] **Firefox**: All features work
- [ ] **Safari**: All features work (if available)
- [ ] **Edge**: All features work (if available)

### 10. **Mobile Tests**
- [ ] **Touch Navigation**: All buttons respond to touch
- [ ] **Responsive Layout**: Layout adapts to mobile screens
- [ ] **Modal on Mobile**: Sign-in modal works on mobile
- [ ] **Scrolling**: Smooth scrolling on mobile

## 🚀 Automated Test Script

Run the automated test script:
```bash
./test-website.sh
```

## 📊 Expected Results

### ✅ Success Criteria
- All services running without errors
- Website loads and displays correctly
- All interactive elements work
- Responsive design functions properly
- No console errors in browser
- Performance metrics within acceptable ranges

### ❌ Failure Criteria
- Services fail to start
- Website doesn't load
- JavaScript errors in console
- Broken responsive design
- Authentication doesn't work
- Performance issues

## 🔧 Troubleshooting

### Common Issues
1. **Port Conflicts**: Check if ports 8081, 3000, 5433, 6379 are available
2. **Docker Issues**: Restart Docker service if needed
3. **Permission Issues**: Check file permissions
4. **Browser Cache**: Clear browser cache if issues persist

### Debug Commands
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs

# Restart services
docker-compose restart

# Check port usage
sudo lsof -i :8081
```
