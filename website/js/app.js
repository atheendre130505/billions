/**
 * Billion Row Challenge - Firebase-Powered Application
 * Modern UI with Firebase Authentication and Firestore database
 */

class BillionRowApp {
    constructor() {
        this.currentUser = null;
        this.leaderboardData = [];
        this.init();
    }

    async init() {
        // Wait for Firebase to load
        await this.waitForFirebase();
        this.bindEvents();
        this.setupFirebaseAuth();
        await this.loadLeaderboard();
    }

    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebase) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    bindEvents() {
        // Navigation and button events
        document.getElementById('signInBtn')?.addEventListener('click', () => this.showAuthModal());
        document.getElementById('closeModal')?.addEventListener('click', () => this.hideAuthModal());
        document.getElementById('googleSignInBtn')?.addEventListener('click', () => this.handleGoogleSignIn());
        document.getElementById('getStartedBtn')?.addEventListener('click', () => this.scrollToSection('submitSection'));
        document.getElementById('viewLeaderboardBtn')?.addEventListener('click', () => this.scrollToSection('leaderboardSection'));
        document.getElementById('submitSolutionBtn')?.addEventListener('click', () => this.handleSubmitSolution());

        // Modal backdrop click to close
        document.getElementById('authModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'authModal') {
                this.hideAuthModal();
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });
    }

    setupFirebaseAuth() {
        const { auth, onAuthStateChanged } = window.firebase;
        
        // Listen for authentication state changes
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.currentUser = {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    picture: user.photoURL
                };
                this.updateUIAfterSignIn();
            } else {
                this.currentUser = null;
                this.updateUIAfterSignOut();
            }
        });
    }

    async handleGoogleSignIn() {
        try {
            const { auth, signInWithPopup, provider } = window.firebase;
            const result = await signInWithPopup(auth, provider);
            
            this.currentUser = {
                uid: result.user.uid,
                name: result.user.displayName,
                email: result.user.email,
                picture: result.user.photoURL
            };

            this.updateUIAfterSignIn();
            this.hideAuthModal();
            this.showNotification('Successfully signed in!', 'success');
            
            console.log('User signed in:', this.currentUser);
        } catch (error) {
            console.error('Error signing in:', error);
            this.showNotification('Sign-in failed. Please try again.', 'error');
        }
    }

    updateUIAfterSignIn() {
        const navAuth = document.getElementById('navAuth');
        if (navAuth && this.currentUser) {
            navAuth.innerHTML = `
                <div class="user-profile">
                    <img src="${this.currentUser.picture}" alt="${this.currentUser.name}" class="user-avatar">
                    <span class="user-name">${this.currentUser.name}</span>
                    <button class="btn-signout" onclick="app.signOut()">Sign Out</button>
                </div>
            `;
        }
    }

    updateUIAfterSignOut() {
        const navAuth = document.getElementById('navAuth');
        if (navAuth) {
            navAuth.innerHTML = `
                <button class="btn-signin" id="signInBtn">Sign In</button>
            `;
            // Re-bind the sign-in button event
            document.getElementById('signInBtn')?.addEventListener('click', () => this.showAuthModal());
        }
    }

    async signOut() {
        try {
            const { auth, signOut } = window.firebase;
            await signOut(auth);
            this.showNotification('Signed out successfully', 'success');
        } catch (error) {
            console.error('Error signing out:', error);
            this.showNotification('Error signing out', 'error');
        }
    }

    showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    async loadLeaderboard() {
        try {
            const { db, collection, getDocs, query, orderBy, limit } = window.firebase;
            
            // Try to load from Firestore first
            const leaderboardRef = collection(db, 'leaderboard');
            const q = query(leaderboardRef, orderBy('executionTime', 'asc'), limit(10));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
                this.leaderboardData = [];
                let rank = 1;
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    this.leaderboardData.push({
                        rank: rank++,
                        user: data.userName || 'Anonymous',
                        time: `${data.executionTime}s`,
                        language: data.language || 'Unknown'
                    });
                });
            } else {
                // No data in Firestore yet - show empty leaderboard
                this.leaderboardData = [];
            }

            this.renderLeaderboard();
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            // Show empty leaderboard on error
            this.leaderboardData = [];
            this.renderLeaderboard();
            this.showNotification('Unable to load leaderboard - check Firebase connection', 'error');
        }
    }

    renderLeaderboard() {
        const container = document.getElementById('leaderboardEntries');
        if (!container) return;

        if (this.leaderboardData.length === 0) {
            container.innerHTML = `
                <div class="empty-leaderboard">
                    <p>🏆 No submissions yet!</p>
                    <p>Be the first to submit a solution and claim the top spot!</p>
                </div>
            `;
        } else {
            container.innerHTML = this.leaderboardData.map(entry => `
                <div class="leaderboard-entry">
                    <span class="rank">#${entry.rank}</span>
                    <span class="user">${entry.user}</span>
                    <span class="time">${entry.time}</span>
                    <span class="language">${entry.language}</span>
                </div>
            `).join('');
        }
    }

    handleSubmitSolution() {
        if (!this.currentUser) {
            this.showNotification('Please sign in to submit a solution', 'warning');
            this.showAuthModal();
            return;
        }

        // Redirect to GitHub or show submission instructions
        this.showNotification('Redirecting to GitHub...', 'info');
        
        // In a real app, you might redirect to your GitHub repo
        setTimeout(() => {
            window.open('https://github.com/your-username/billion-rows-challenge', '_blank');
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;

        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;
        
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
            setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Check if user is already signed in
    checkExistingSignIn() {
        const savedUser = localStorage.getItem('billionRowUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateUIAfterSignIn();
            } catch (error) {
                localStorage.removeItem('billionRowUser');
            }
        }
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid var(--primary-color);
    }
    
    .user-name {
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .btn-signout {
        background: var(--text-light);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .btn-signout:hover {
        background: var(--text-secondary);
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BillionRowApp();
    
    // Check for existing sign-in
    setTimeout(() => {
        app.checkExistingSignIn();
    }, 100);
});

// Export for global access
window.BillionRowApp = BillionRowApp;






