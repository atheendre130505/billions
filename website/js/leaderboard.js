/**
 * Leaderboard JavaScript
 * Handles real-time leaderboard updates, sorting, filtering, and data management
 */

class TournamentLeaderboard {
    constructor() {
        this.leaderboardData = [];
        this.filteredData = [];
        this.currentSort = 'execution_time';
        this.currentLanguage = 'all';
        this.autoRefreshInterval = null;
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadLeaderboardData();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-leaderboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshLeaderboard());
        }

        // Language filter
        const languageFilter = document.getElementById('language-filter');
        if (languageFilter) {
            languageFilter.addEventListener('change', (e) => {
                this.currentLanguage = e.target.value;
                this.applyFilters();
            });
        }

        // Sort dropdown
        const sortDropdown = document.getElementById('sort-by');
        if (sortDropdown) {
            sortDropdown.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.sortData();
                this.renderLeaderboard();
            });
        }

        // Auto-refresh checkbox
        const autoRefreshCheckbox = document.getElementById('auto-refresh');
        if (autoRefreshCheckbox) {
            autoRefreshCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }
    }

    async loadLeaderboardData() {
        try {
            this.setLoading(true);
            
            // Try to load from local storage first (for demo purposes)
            const cachedData = localStorage.getItem('tournament_leaderboard');
            if (cachedData) {
                this.leaderboardData = JSON.parse(cachedData);
                this.applyFilters();
                this.sortData();
                this.renderLeaderboard();
            }

            // Load fresh data from API or results file
            await this.fetchLeaderboardData();
            
        } catch (error) {
            console.error('Failed to load leaderboard data:', error);
            this.showError('Failed to load leaderboard data. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async fetchLeaderboardData() {
        try {
            // In a real implementation, this would fetch from your API
            // For now, we'll generate sample data
            const sampleData = this.generateSampleData();
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.leaderboardData = sampleData;
            this.applyFilters();
            this.sortData();
            this.renderLeaderboard();
            
            // Cache the data
            localStorage.setItem('tournament_leaderboard', JSON.stringify(sampleData));
            
        } catch (error) {
            console.error('Failed to fetch leaderboard data:', error);
            throw error;
        }
    }

    generateSampleData() {
        const participants = [
            { name: 'Alice Johnson', username: 'alice_dev', language: 'java' },
            { name: 'Bob Smith', username: 'bob_coder', language: 'python' },
            { name: 'Carol Davis', username: 'carol_optimizer', language: 'cpp' },
            { name: 'David Wilson', username: 'david_speed', language: 'go' },
            { name: 'Eva Brown', username: 'eva_fast', language: 'java' },
            { name: 'Frank Miller', username: 'frank_efficient', language: 'python' },
            { name: 'Grace Lee', username: 'grace_optimized', language: 'cpp' },
            { name: 'Henry Taylor', username: 'henry_quick', language: 'go' },
            { name: 'Ivy Chen', username: 'ivy_smart', language: 'java' },
            { name: 'Jack Anderson', username: 'jack_clever', language: 'python' }
        ];

        const languages = ['java', 'python', 'cpp', 'go'];
        const performanceLevels = ['expert', 'advanced', 'good', 'completed'];
        const statuses = ['success', 'warning', 'error', 'pending'];

        return participants.map((participant, index) => {
            const language = participant.language;
            const executionTime = Math.random() * 1800 + 100; // 100ms to 30 minutes
            const performanceLevel = performanceLevels[Math.floor(Math.random() * performanceLevels.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random time in last 30 days

            return {
                id: index + 1,
                rank: index + 1,
                participant: participant,
                language: language,
                executionTime: executionTime,
                performanceLevel: performanceLevel,
                status: status,
                timestamp: timestamp,
                memoryUsage: Math.random() * 8000 + 100, // 100MB to 8GB
                outputSize: Math.random() * 1000 + 100, // 100B to 1KB
                securityScore: Math.random() * 100 + 50 // 50-150
            };
        });
    }

    applyFilters() {
        this.filteredData = this.leaderboardData.filter(entry => {
            if (this.currentLanguage !== 'all' && entry.language !== this.currentLanguage) {
                return false;
            }
            return true;
        });
    }

    sortData() {
        this.filteredData.sort((a, b) => {
            switch (this.currentSort) {
                case 'execution_time':
                    return a.executionTime - b.executionTime;
                case 'performance_level':
                    const levelOrder = { 'expert': 4, 'advanced': 3, 'good': 2, 'completed': 1 };
                    return levelOrder[b.performanceLevel] - levelOrder[a.performanceLevel];
                case 'timestamp':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                default:
                    return a.executionTime - b.executionTime;
            }
        });

        // Update ranks after sorting
        this.filteredData.forEach((entry, index) => {
            entry.rank = index + 1;
        });
    }

    renderLeaderboard() {
        const leaderboardBody = document.getElementById('leaderboard-body');
        if (!leaderboardBody) return;

        if (this.filteredData.length === 0) {
            leaderboardBody.innerHTML = this.renderEmptyState();
            return;
        }

        leaderboardBody.innerHTML = this.filteredData.map(entry => 
            this.renderLeaderboardEntry(entry)
        ).join('');

        this.updateLeaderboardStats();
        this.updateLastUpdateTime();
    }

    renderLeaderboardEntry(entry) {
        const rankClass = this.getRankClass(entry.rank);
        const languageClass = `language-${entry.language}`;
        const performanceClass = `level-${entry.performanceLevel}`;
        const statusClass = `status-${entry.status}`;
        
        const executionTimeFormatted = this.formatExecutionTime(entry.executionTime);
        const dateFormatted = this.formatDate(entry.timestamp);

        return `
            <div class="leaderboard-entry" data-id="${entry.id}">
                <div class="rank-col">
                    <div class="rank-number ${rankClass}">${entry.rank}</div>
                </div>
                <div class="participant-col">
                    <div class="participant-avatar">
                        ${entry.participant.name.charAt(0)}
                    </div>
                    <div class="participant-info">
                        <div class="participant-name">${entry.participant.name}</div>
                        <div class="participant-username">@${entry.participant.username}</div>
                    </div>
                </div>
                <div class="language-col">
                    <span class="language-badge ${languageClass}">${entry.language}</span>
                </div>
                <div class="performance-col">
                    <span class="performance-level ${performanceClass}">${entry.performanceLevel}</span>
                </div>
                <div class="time-col">${executionTimeFormatted}</div>
                <div class="status-col">
                    <div class="status-indicator ${statusClass}"></div>
                    <span class="status-text">${entry.status}</span>
                </div>
                <div class="date-col">${dateFormatted}</div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-trophy"></i>
                <h3>No Submissions Yet</h3>
                <p>Be the first to submit a solution and claim the top spot!</p>
            </div>
        `;
    }

    renderErrorState(error) {
        return `
            <div class="leaderboard-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Leaderboard</h3>
                <p>${error}</p>
                <button class="retry-button" onclick="tournamentLeaderboard.loadLeaderboardData()">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }

    getRankClass(rank) {
        if (rank === 1) return 'rank-1';
        if (rank === 2) return 'rank-2';
        if (rank === 3) return 'rank-3';
        if (rank <= 10) return 'rank-4-10';
        return 'rank-other';
    }

    formatExecutionTime(timeMs) {
        if (timeMs < 1000) {
            return `${Math.round(timeMs)}ms`;
        } else if (timeMs < 60000) {
            return `${(timeMs / 1000).toFixed(1)}s`;
        } else {
            const minutes = Math.floor(timeMs / 60000);
            const seconds = Math.round((timeMs % 60000) / 1000);
            return `${minutes}m ${seconds}s`;
        }
    }

    formatDate(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    updateLeaderboardStats() {
        const totalParticipants = document.getElementById('total-leaderboard-participants');
        if (totalParticipants) {
            totalParticipants.textContent = this.filteredData.length;
        }

        // Update hero stats if they exist
        const totalParticipantsHero = document.getElementById('total-participants');
        if (totalParticipantsHero) {
            totalParticipantsHero.textContent = this.leaderboardData.length;
        }

        const totalSubmissions = document.getElementById('total-submissions');
        if (totalSubmissions) {
            totalSubmissions.textContent = this.leaderboardData.length;
        }
    }

    updateLastUpdateTime() {
        const lastUpdate = document.getElementById('last-update');
        if (lastUpdate) {
            lastUpdate.textContent = new Date().toLocaleTimeString();
        }

        const footerLastUpdate = document.getElementById('footer-last-update');
        if (footerLastUpdate) {
            footerLastUpdate.textContent = new Date().toLocaleString();
        }
    }

    async refreshLeaderboard() {
        try {
            this.setLoading(true);
            await this.fetchLeaderboardData();
            this.showSuccessMessage('Leaderboard refreshed successfully!');
        } catch (error) {
            console.error('Failed to refresh leaderboard:', error);
            this.showErrorMessage('Failed to refresh leaderboard. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.isLoading = loading;
        const container = document.querySelector('.leaderboard-container');
        const refreshBtn = document.getElementById('refresh-leaderboard');
        
        if (container) {
            container.classList.toggle('loading', loading);
        }
        
        if (refreshBtn) {
            refreshBtn.disabled = loading;
            refreshBtn.innerHTML = loading ? 
                '<i class="fas fa-spinner fa-spin"></i> Refreshing...' : 
                '<i class="fas fa-sync-alt"></i> Refresh';
        }
    }

    startAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        this.autoRefreshInterval = setInterval(() => {
            this.fetchLeaderboardData();
        }, 30000); // Refresh every 30 seconds
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(messageEl);

        // Show message
        setTimeout(() => messageEl.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }

    showError(error) {
        const leaderboardBody = document.getElementById('leaderboard-body');
        if (leaderboardBody) {
            leaderboardBody.innerHTML = this.renderErrorState(error);
        }
    }

    // Public methods for external use
    addSubmission(submission) {
        // Add new submission to leaderboard
        const newEntry = {
            id: Date.now(),
            rank: 1,
            participant: submission.participant,
            language: submission.language,
            executionTime: submission.executionTime,
            performanceLevel: submission.performanceLevel,
            status: submission.status,
            timestamp: new Date(),
            memoryUsage: submission.memoryUsage || 0,
            outputSize: submission.outputSize || 0,
            securityScore: submission.securityScore || 100
        };

        this.leaderboardData.unshift(newEntry);
        this.applyFilters();
        this.sortData();
        this.renderLeaderboard();

        // Highlight new entry
        const newEntryEl = document.querySelector(`[data-id="${newEntry.id}"]`);
        if (newEntryEl) {
            newEntryEl.classList.add('new');
            setTimeout(() => newEntryEl.classList.remove('new'), 2000);
        }
    }

    updateSubmission(submissionId, updates) {
        const entry = this.leaderboardData.find(e => e.id === submissionId);
        if (entry) {
            Object.assign(entry, updates);
            this.applyFilters();
            this.sortData();
            this.renderLeaderboard();
        }
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
        // Remove event listeners if needed
    }
}

// Initialize leaderboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tournamentLeaderboard = new TournamentLeaderboard();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TournamentLeaderboard;
}






