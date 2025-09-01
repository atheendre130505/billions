/**
 * Billion Row Challenge - Main Application
 * Clean, simple UI with Google sign-in and essential functionality
 */

class BillionRowApp {
    constructor() {
        this.currentUser = null;
        this.leaderboardData = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadLeaderboard();
        this.setupGoogleSignIn();
    }

    bindEvents() {
        // Navigation and button events
        document.getElementById('signInBtn')?.addEventListener('click', () => this.showAuthModal());
        document.getElementById('closeModal')?.addEventListener('click', () => this.hideAuthModal());
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

    setupGoogleSignIn() {
        // Google Sign-In callback
        window.handleCredentialResponse = (response) => {
            this.handleGoogleSignIn(response);
        };
    }

    async handleGoogleSignIn(response) {
        try {
            // Decode the JWT token
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            
            this.currentUser = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture
            };

            this.updateUIAfterSignIn();
            this.hideAuthModal();
            
            // Store user info in localStorage
            localStorage.setItem('billionRowUser', JSON.stringify(this.currentUser));
            
            console.log('User signed in:', this.currentUser);
        } catch (error) {
            console.error('Error handling Google sign-in:', error);
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

    signOut() {
        this.currentUser = null;
        localStorage.removeItem('billionRowUser');
        
        const navAuth = document.getElementById('navAuth');
        if (navAuth) {
            navAuth.innerHTML = `
                <button class="btn-signin" id="signInBtn">Sign In</button>
            `;
            // Re-bind the sign-in button event
            document.getElementById('signInBtn')?.addEventListener('click', () => this.showAuthModal());
        }
        
        this.showNotification('Signed out successfully', 'success');
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
            // Simulate loading leaderboard data
            // In a real app, this would fetch from your API
            this.leaderboardData = [
                { rank: 1, user: 'speed_demon', time: '2.34s', language: 'C++' },
                { rank: 2, user: 'python_master', time: '3.12s', language: 'Python' },
                { rank: 3, user: 'java_ninja', time: '3.45s', language: 'Java' },
                { rank: 4, user: 'go_guru', time: '3.78s', language: 'Go' },
                { rank: 5, user: 'optimizer_pro', time: '4.23s', language: 'C++' },
                { rank: 6, user: 'data_cruncher', time: '4.67s', language: 'Python' },
                { rank: 7, user: 'performance_king', time: '5.01s', language: 'Java' },
                { rank: 8, user: 'speed_racer', time: '5.34s', language: 'Go' }
            ];

            this.renderLeaderboard();
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.showNotification('Failed to load leaderboard', 'error');
        }
    }

    renderLeaderboard() {
        const container = document.getElementById('leaderboardEntries');
        if (!container) return;

        container.innerHTML = this.leaderboardData.map(entry => `
            <div class="leaderboard-entry">
                <span class="rank">#${entry.rank}</span>
                <span class="user">${entry.user}</span>
                <span class="time">${entry.time}</span>
                <span class="language">${entry.language}</span>
            </div>
        `).join('');
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






