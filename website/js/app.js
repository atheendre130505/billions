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
        
        // Show loading notification
        this.showNotification('📥 Preparing download...', 'info');
        
        // Create a comprehensive download package
        const downloadPackage = `#!/bin/bash
# Billion Row Challenge - Test Dataset Downloader
# This script downloads the 1M row test dataset for local development

echo "🚀 Billion Row Challenge - Test Dataset Downloader"
echo "=================================================="
echo ""
echo "📦 This will download a 1M row test dataset (13MB)"
echo "💡 Perfect for local development and testing your algorithms"
echo ""

# Create data directory
echo "📁 Creating data directory..."
mkdir -p data

# Download the 1M row dataset from multiple sources
echo "📥 Downloading measurements_1m.txt..."
echo "   Attempting download from GitHub..."

# Try multiple download methods
if command -v curl >/dev/null 2>&1; then
    # Method 1: Direct from GitHub (if available)
    if curl -L -f -o data/measurements_1m.txt "https://raw.githubusercontent.com/atheendre130505/billions/main/data/measurements_1m.txt" 2>/dev/null; then
        echo "   ✅ Downloaded from GitHub"
    else
        echo "   ⚠️  GitHub download failed, trying alternative..."
        # Method 2: Generate locally (fallback)
        echo "   🔄 Generating 1M row dataset locally..."
        python3 -c "
import random
import os

# Create data directory
os.makedirs('data', exist_ok=True)

# Weather stations (same as in the challenge)
stations = [
    'Abha', 'Abidjan', 'Abéché', 'Abu Dhabi', 'Abuja', 'Accra', 'Addis Ababa', 'Adelaide', 'Aden', 'Ahvaz',
    'Albuquerque', 'Alexandria', 'Algiers', 'Almaty', 'Amman', 'Amsterdam', 'Anadyr', 'Anchorage', 'Andorra la Vella', 'Ankara',
    'Antananarivo', 'Antsiranana', 'Arkhangelsk', 'Ashgabat', 'Asmara', 'Assab', 'Astana', 'Athens', 'Atlanta', 'Auckland',
    'Austin', 'Baghdad', 'Baguio', 'Baku', 'Baltimore', 'Bamako', 'Bangkok', 'Bangui', 'Banjul', 'Barcelona',
    'Bata', 'Batumi', 'Beijing', 'Beirut', 'Belgrade', 'Belize City', 'Benghazi', 'Bergen', 'Berlin', 'Bilbao',
    'Birao', 'Bishkek', 'Bissau', 'Blantyre', 'Bloemfontein', 'Boise', 'Bordeaux', 'Bosaso', 'Boston', 'Bouaké',
    'Bratislava', 'Brazzaville', 'Bridgetown', 'Brisbane', 'Brno', 'Brussels', 'Bucharest', 'Budapest', 'Bujumbura', 'Bulawayo',
    'Burnie', 'Busan', 'Cabo San Lucas', 'Cairo', 'Calgary', 'Canberra', 'Cape Town', 'Caracas', 'Casablanca', 'Castries',
    'Cayenne', 'Cebu', 'Changchun', 'Changsha', 'Charlotte', 'Chiang Mai', 'Chicago', 'Chihuahua', 'Chișinău', 'Chittagong',
    'Chongqing', 'Christchurch', 'City of San Marino', 'Colombo', 'Columbus', 'Conakry', 'Copenhagen', 'Cotonou', 'Cracow', 'Curitiba',
    'Daegu', 'Dakar', 'Dallas', 'Damascus', 'Dammam', 'Dar es Salaam', 'Darwin', 'Denpasar', 'Denver', 'Detroit',
    'Dhaka', 'Dikson', 'Dili', 'Djibouti', 'Dodoma', 'Dolisie', 'Douala', 'Dubai', 'Dublin', 'Dunedin',
    'Durban', 'Dushanbe', 'Edinburgh', 'Edmonton', 'El Paso', 'Entebbe', 'Erbil', 'Erzurum', 'Fairbanks', 'Fianarantsoa',
    'Flores, Petén', 'Frankfurt', 'Fresno', 'Fukuoka', 'Gabès', 'Gaborone', 'Gagnoa', 'Gangtok', 'Garissa', 'Garoua',
    'George Town', 'Ghanzi', 'Gjoa Haven', 'Guadalajara', 'Guangzhou', 'Guatemala City', 'Halifax', 'Hamburg', 'Hamilton', 'Hanga Roa',
    'Hanoi', 'Harare', 'Harbin', 'Hargeisa', 'Hat Yai', 'Havana', 'Helsinki', 'Heraklion', 'Hiroshima', 'Ho Chi Minh City',
    'Hobart', 'Hong Kong', 'Honiara', 'Honolulu', 'Houston', 'Ifrane', 'Indianapolis', 'Iqaluit', 'Irkutsk', 'Istanbul',
    'İzmir', 'Jacksonville', 'Jakarta', 'Jayapura', 'Jerusalem', 'Johannesburg', 'Jos', 'Juba', 'Kabul', 'Kampala',
    'Kandi', 'Kankan', 'Kano', 'Kansas City', 'Karachi', 'Karonga', 'Kathmandu', 'Khartoum', 'Kiev', 'Kigali',
    'Kikwit', 'Kinshasa', 'Kolkata', 'Kuala Lumpur', 'Kumasi', 'Kunming', 'Kuopio', 'Kuwait City', 'Kyiv', 'Kyoto',
    'La Ceiba', 'La Paz', 'Lagos', 'Lahore', 'Lake Havasu City', 'Lake Tekapo', 'Lanzhou', 'Las Palmas', 'Las Vegas', 'Launceston',
    'Lhasa', 'Libreville', 'Lisbon', 'Livingstone', 'Ljubljana', 'Lodwar', 'Lomé', 'London', 'Los Angeles', 'Louisville',
    'Luanda', 'Lubumbashi', 'Lusaka', 'Luxembourg City', 'Lviv', 'Lyon', 'Madrid', 'Mahajanga', 'Makassar', 'Makurdi',
    'Malabo', 'Malé', 'Managua', 'Manama', 'Mandalay', 'Mango', 'Manila', 'Maputo', 'Marrakesh', 'Marseille',
    'Maun', 'Medan', 'Medellín', 'Melbourne', 'Memphis', 'Mexicali', 'Mexico City', 'Miami', 'Milan', 'Milwaukee',
    'Minneapolis', 'Minsk', 'Mogadishu', 'Mombasa', 'Monaco', 'Moncton', 'Monrovia', 'Monterrey', 'Montreal', 'Moscow',
    'Mumbai', 'Murmansk', 'Muscat', 'Mzuzu', 'N\'Djamena', 'Naha', 'Nairobi', 'Nakhon Ratchasima', 'Napier', 'Napier',
    'Nashville', 'Nassau', 'Ndola', 'New Delhi', 'New Orleans', 'New York City', 'Ngaoundéré', 'Niamey', 'Nicosia', 'Niigata',
    'Nouadhibou', 'Nouakchott', 'Novosibirsk', 'Nuuk', 'Odesa', 'Odienné', 'Oklahoma City', 'Omaha', 'Oranjestad', 'Oslo',
    'Ottawa', 'Ouagadougou', 'Ouahigouya', 'Ouarzazate', 'Oulu', 'Palembang', 'Palermo', 'Palm Springs', 'Palembang', 'Panama City',
    'Parakou', 'Paris', 'Perth', 'Petropavlovsk-Kamchatsky', 'Philadelphia', 'Phnom Penh', 'Phoenix', 'Pittsburgh', 'Podgorica', 'Pointe-Noire',
    'Pontianak', 'Port Moresby', 'Port Sudan', 'Port Vila', 'Port-Gentil', 'Portland', 'Porto', 'Prague', 'Praia', 'Pretoria',
    'Pyongyang', 'Rabat', 'Rangpur', 'Reggane', 'Reykjavík', 'Riga', 'Riyadh', 'Rome', 'Rosario', 'Roseau',
    'Rostov-on-Don', 'Sacramento', 'Saint Petersburg', 'Saint-Pierre', 'Salt Lake City', 'San Antonio', 'San Diego', 'San Francisco', 'San José', 'San Juan',
    'San Salvador', 'Sana\'a', 'Santo Domingo', 'São Paulo', 'São Tomé', 'Sapporo', 'Sarajevo', 'Saskatoon', 'Seattle', 'Ségou',
    'Seoul', 'Seville', 'Shanghai', 'Singapore', 'Skopje', 'Sochi', 'Sofia', 'Sokoto', 'Split', 'St. John\'s',
    'St. Louis', 'Stockholm', 'Suva', 'Suwałki', 'Sydney', 'Tabora', 'Tabriz', 'Tallinn', 'Tamale', 'Tamanrasset',
    'Tampa', 'Tashkent', 'Tauranga', 'Tbilisi', 'Tegucigalpa', 'Tehran', 'Tel Aviv', 'Thessaloniki', 'Thiès', 'Tijuana',
    'Timbuktu', 'Tirana', 'Toamasina', 'Tokyo', 'Toliara', 'Toluca', 'Toronto', 'Tripoli', 'Tromsø', 'Tucson',
    'Tunis', 'Ulaanbaatar', 'Upington', 'Ürümqi', 'Vaduz', 'Valencia', 'Valletta', 'Vancouver', 'Veracruz', 'Vienna',
    'Vientiane', 'Villahermosa', 'Vilnius', 'Virginia Beach', 'Vladivostok', 'Warsaw', 'Washington, D.C.', 'Wau', 'Wellington', 'Whitehorse',
    'Wichita', 'Willemstad', 'Winnipeg', 'Wrocław', 'Xi\'an', 'Yakutsk', 'Yangon', 'Yaoundé', 'Yellowknife', 'Yerevan',
    'Yinchuan', 'Zagreb', 'Zanzibar City', 'Zürich'
]

# Generate 1M measurements
print('Generating 1M temperature measurements...')
with open('data/measurements_1m.txt', 'w') as f:
    for i in range(1000000):
        station = random.choice(stations)
        temp = round(random.uniform(-99.9, 99.9), 1)
        f.write(f'{station}={temp}\n')
        if (i + 1) % 100000 == 0:
            print(f'Progress: {(i + 1) / 10000:.1f}% ({i + 1:,}/1,000,000 rows)')

print('✅ Dataset generation complete!')
" 2>/dev/null || echo "   ❌ Python not available, cannot generate dataset"
    fi
elif command -v wget >/dev/null 2>&1; then
    wget -O data/measurements_1m.txt "https://raw.githubusercontent.com/atheendre130505/billions/main/data/measurements_1m.txt" 2>/dev/null && echo "   ✅ Downloaded with wget" || echo "   ❌ Download failed"
else
    echo "   ❌ Neither curl nor wget available"
    exit 1
fi

# Verify download
if [ -f "data/measurements_1m.txt" ]; then
    echo ""
    echo "✅ Download complete!"
    echo "📊 File size: $(du -h data/measurements_1m.txt | cut -f1)"
    echo "📈 Line count: $(wc -l < data/measurements_1m.txt)"
    echo "🏷️  Sample data:"
    head -5 data/measurements_1m.txt | sed 's/^/   /'
    echo "   ..."
    echo ""
    echo "🎉 Test dataset ready!"
    echo ""
    echo "💡 Next steps:"
    echo "   1. Test your solution:"
    echo "      python3 scripts/validate-submission.py submissions/python/solution.py --language python --input data/measurements_1m.txt"
    echo ""
    echo "   2. Optimize your algorithm"
    echo "   3. Submit via Pull Request for billion-row testing"
    echo ""
    echo "🚀 Happy coding!"
else
    echo "❌ Download failed!"
    echo "💡 Please check your internet connection and try again"
    exit 1
fi`;

        // Create and download the script file
        const blob = new Blob([downloadPackage], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'download-test-dataset.sh';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Show success notification with instructions
        this.showNotification('📥 Download script created! Run: chmod +x download-test-dataset.sh && ./download-test-dataset.sh', 'success');
        
        // Also offer direct download
        setTimeout(() => {
            if (confirm('Would you like to download the dataset directly as well?')) {
                const directLink = document.createElement('a');
                directLink.href = 'measurements_1m.txt';
                directLink.download = 'measurements_1m.txt';
                document.body.appendChild(directLink);
                directLink.click();
                document.body.removeChild(directLink);
                this.showNotification('📥 Direct download started!', 'success');
            }
        }, 1000);
        
        console.log('Dataset download script created');
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






