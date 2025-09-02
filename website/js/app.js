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
        document.getElementById('downloadDatasetBtn')?.addEventListener('click', () => this.handleDownloadDataset());

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

    handleDownloadDataset() {
        console.log('Download dataset button clicked!');
        
        // Create download link for the 1M row dataset
        const downloadUrl = 'https://raw.githubusercontent.com/atheendre130505/billions/main/data/measurements_1m.txt';
        
        // Create temporary link element
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'measurements_1m.txt';
        link.target = '_blank';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success notification
        this.showNotification('📥 Download started! Check your downloads folder.', 'success');
        
        // Optional: Track download event
        console.log('Dataset download initiated');
    }

    handleSubmitSolution() {
        console.log('Submit button clicked!');
        console.log('Current user:', this.currentUser);
        
        if (!this.currentUser) {
            this.showNotification('Please sign in to submit a solution', 'warning');
            this.showAuthModal();
            return;
        }

        // Show submission modal with instructions
        console.log('Showing submission modal...');
        this.showSubmissionModal();
    }

    showSubmissionModal() {
        console.log('Creating submission modal...');
        const modal = document.createElement('div');
        modal.id = 'submissionModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🚀 Submit Your Solution</h2>
                    <button class="close-modal" id="closeSubmissionModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="submission-instructions">
                        <div class="welcome-section">
                            <h3>🎯 Ready to Compete?</h3>
                            <p>Join the Billion Row Challenge and optimize your way to the top of the leaderboard!</p>
                        </div>
                        
                        <div class="steps-container">
                            <h4>📋 Submission Steps:</h4>
                            <div class="step-cards">
                                <div class="step-card">
                                    <div class="step-number">1</div>
                                    <div class="step-content">
                                        <h5>🍴 Fork Repository</h5>
                                        <p>Click the button below to fork our repository</p>
                                    </div>
                                </div>
                                <div class="step-card">
                                    <div class="step-number">2</div>
                                    <div class="step-content">
                                        <h5>💻 Add Your Solution</h5>
                                        <p>Create your optimized solution in the <code>submissions/</code> folder</p>
                                    </div>
                                </div>
                                <div class="step-card">
                                    <div class="step-number">3</div>
                                    <div class="step-content">
                                        <h5>📤 Create Pull Request</h5>
                                        <p>Submit your solution via a pull request</p>
                                    </div>
                                </div>
                                <div class="step-card">
                                    <div class="step-number">4</div>
                                    <div class="step-content">
                                        <h5>🏆 Get Ranked</h5>
                                        <p>We'll test your solution and add you to the leaderboard!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="language-tabs">
                            <h4>🚀 Choose Your Language:</h4>
                            <div class="tab-buttons">
                                <button class="tab-btn active" data-lang="python">🐍 Python</button>
                                <button class="tab-btn" data-lang="java">☕ Java</button>
                                <button class="tab-btn" data-lang="cpp">⚡ C++</button>
                                <button class="tab-btn" data-lang="go">🐹 Go</button>
                            </div>
                            
                            <div class="code-example" id="codeExample">
                                <h5>🐍 Python Example:</h5>
                                <pre><code># submissions/python/solution.py
def process_billion_rows():
    # Your optimized solution here
    # Goal: Process 1 billion rows as fast as possible
    pass

if __name__ == "__main__":
    process_billion_rows()</code></pre>
                            </div>
                        </div>
                        
                        <div class="submission-actions">
                            <button class="btn-primary" onclick="window.open('https://github.com/atheendre130505/billions', '_blank')">
                                🍴 Fork Repository & Start Coding
                            </button>
                            <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                                Maybe Later
                            </button>
                        </div>
                        
                        <div class="motivation-text">
                            <p>💡 <strong>Pro Tip:</strong> The fastest solutions often use memory mapping, parallel processing, and optimized data structures!</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('Modal added to DOM');
        
        // Show the modal
        setTimeout(() => {
            modal.classList.add('show');
            console.log('Modal shown');
        }, 10);
        
        // Add event listeners
        document.getElementById('closeSubmissionModal').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
        
        // Language tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateCodeExample(e.target.dataset.lang);
            });
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        });
    }

    updateCodeExample(language) {
        const codeExample = document.getElementById('codeExample');
        const examples = {
            python: {
                title: '🐍 Python Example:',
                code: `# submissions/python/solution.py
def process_billion_rows():
    # Your optimized solution here
    # Goal: Process 1 billion rows as fast as possible
    # Tips: Use pandas, numpy, or multiprocessing
    pass

if __name__ == "__main__":
    process_billion_rows()`
            },
            java: {
                title: '☕ Java Example:',
                code: `// submissions/java/Solution.java
public class Solution {
    public static void main(String[] args) {
        // Your optimized solution here
        // Goal: Process 1 billion rows as fast as possible
        // Tips: Use NIO, parallel streams, or memory mapping
    }
}`
            },
            cpp: {
                title: '⚡ C++ Example:',
                code: `// submissions/cpp/solution.cpp
#include <iostream>
#include <fstream>

int main() {
    // Your optimized solution here
    // Goal: Process 1 billion rows as fast as possible
    // Tips: Use memory mapping, SIMD, or parallel processing
    return 0;
}`
            },
            go: {
                title: '🐹 Go Example:',
                code: `// submissions/go/solution.go
package main

import "fmt"

func main() {
    // Your optimized solution here
    // Goal: Process 1 billion rows as fast as possible
    // Tips: Use goroutines, channels, or memory mapping
}`
            }
        };
        
        const example = examples[language];
        codeExample.innerHTML = `
            <h5>${example.title}</h5>
            <pre><code>${example.code}</code></pre>
        `;
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






