/**
 * Tournament Analytics API Service
 * Handles data fetching, processing, and management for tournament analytics
 */

class TournamentAnalyticsAPI {
    constructor() {
        this.baseURL = '/api/analytics';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    /**
     * Fetch analytics data with caching and retry logic
     */
    async fetchAnalytics(endpoint, options = {}) {
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        const cached = this.getCached(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const data = await this.makeRequest(endpoint, options);
            this.setCached(cacheKey, data);
            return data;
        } catch (error) {
            console.error(`Failed to fetch analytics from ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Make HTTP request with retry logic
     */
    async makeRequest(endpoint, options = {}) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const url = `${this.baseURL}${endpoint}`;
                const response = await fetch(url, {
                    method: options.method || 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    body: options.body ? JSON.stringify(options.body) : undefined,
                    ...options
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return data;
                
            } catch (error) {
                lastError = error;
                
                if (attempt < this.retryAttempts) {
                    console.warn(`Request attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`);
                    await this.delay(this.retryDelay * attempt); // Exponential backoff
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Get overview statistics
     */
    async getOverview(dateRange = '30d') {
        return this.fetchAnalytics('/overview', { dateRange });
    }

    /**
     * Get language performance data
     */
    async getLanguagePerformance(dateRange = '30d') {
        return this.fetchAnalytics('/languages', { dateRange });
    }

    /**
     * Get performance distribution
     */
    async getPerformanceDistribution(dateRange = '30d') {
        return this.fetchAnalytics('/performance-distribution', { dateRange });
    }

    /**
     * Get security analysis
     */
    async getSecurityAnalysis(dateRange = '30d') {
        return this.fetchAnalytics('/security', { dateRange });
    }

    /**
     * Get participant demographics
     */
    async getParticipantDemographics(dateRange = '30d') {
        return this.fetchAnalytics('/participants', { dateRange });
    }

    /**
     * Get time series data
     */
    async getTimeSeriesData(dateRange = '30d', metric = 'submissions') {
        return this.fetchAnalytics('/time-series', { dateRange, metric });
    }

    /**
     * Get submission trends
     */
    async getSubmissionTrends(dateRange = '30d') {
        return this.fetchAnalytics('/submission-trends', { dateRange });
    }

    /**
     * Get performance metrics over time
     */
    async getPerformanceMetrics(dateRange = '30d') {
        return this.fetchAnalytics('/performance-metrics', { dateRange });
    }

    /**
     * Get security logs
     */
    async getSecurityLogs(filters = {}) {
        return this.fetchAnalytics('/security-logs', filters);
    }

    /**
     * Get participant list
     */
    async getParticipants(filters = {}) {
        return this.fetchAnalytics('/participants/list', filters);
    }

    /**
     * Export analytics data
     */
    async exportData(format, filters = {}) {
        try {
            const response = await this.makeRequest('/export', {
                method: 'POST',
                body: { format, filters }
            });
            
            if (response.downloadUrl) {
                // Trigger download
                const link = document.createElement('a');
                link.href = response.downloadUrl;
                link.download = response.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            return response;
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    }

    /**
     * Run tournament execution
     */
    async runTournament(options = {}) {
        return this.makeRequest('/run-tournament', {
            method: 'POST',
            body: options
        });
    }

    /**
     * Generate dataset
     */
    async generateDataset(options = {}) {
        return this.makeRequest('/generate-dataset', {
            method: 'POST',
            body: options
        });
    }

    /**
     * Update tournament settings
     */
    async updateSettings(settings) {
        return this.makeRequest('/settings', {
            method: 'PUT',
            body: settings
        });
    }

    /**
     * Get tournament settings
     */
    async getSettings() {
        return this.fetchAnalytics('/settings');
    }

    /**
     * Add participant
     */
    async addParticipant(participantData) {
        return this.makeRequest('/participants', {
            method: 'POST',
            body: participantData
        });
    }

    /**
     * Update participant
     */
    async updateParticipant(participantId, participantData) {
        return this.makeRequest(`/participants/${participantId}`, {
            method: 'PUT',
            body: participantData
        });
    }

    /**
     * Remove participant
     */
    async removeParticipant(participantId) {
        return this.makeRequest(`/participants/${participantId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get real-time updates
     */
    async getRealTimeUpdates() {
        return this.fetchAnalytics('/real-time');
    }

    /**
     * Subscribe to real-time updates
     */
    subscribeToUpdates(callback) {
        // In a real implementation, this would use WebSockets or Server-Sent Events
        const eventSource = new EventSource(`${this.baseURL}/stream`);
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                callback(data);
            } catch (error) {
                console.error('Failed to parse real-time update:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('Real-time update connection failed:', error);
            eventSource.close();
        };

        return eventSource;
    }

    /**
     * Cache management
     */
    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCached(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    /**
     * Utility methods
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Mock data generation for development/demo purposes
     */
    generateMockData(type, options = {}) {
        switch (type) {
            case 'overview':
                return this.generateMockOverview(options);
            case 'language-performance':
                return this.generateMockLanguagePerformance(options);
            case 'performance-distribution':
                return this.generateMockPerformanceDistribution(options);
            case 'security-analysis':
                return this.generateMockSecurityAnalysis(options);
            case 'participant-demographics':
                return this.generateMockParticipantDemographics(options);
            case 'time-series':
                return this.generateMockTimeSeries(options);
            default:
                throw new Error(`Unknown mock data type: ${type}`);
        }
    }

    generateMockOverview(options = {}) {
        const now = new Date();
        const participants = 42 + Math.floor(Math.random() * 10);
        const submissions = 156 + Math.floor(Math.random() * 20);
        
        return {
            totalParticipants: participants,
            totalSubmissions: submissions,
            avgExecutionTime: 400 + Math.floor(Math.random() * 100),
            avgMemoryUsage: 2000 + Math.floor(Math.random() * 1000),
            successRate: 0.85 + Math.random() * 0.1,
            activeLanguages: 4,
            lastUpdated: now.toISOString()
        };
    }

    generateMockLanguagePerformance(options = {}) {
        return {
            java: {
                submissions: 40 + Math.floor(Math.random() * 10),
                avgExecutionTime: 400 + Math.floor(Math.random() * 100),
                avgMemoryUsage: 3000 + Math.floor(Math.random() * 500),
                successRate: 0.85 + Math.random() * 0.1,
                participants: 15 + Math.floor(Math.random() * 5)
            },
            python: {
                submissions: 45 + Math.floor(Math.random() * 10),
                avgExecutionTime: 600 + Math.floor(Math.random() * 150),
                avgMemoryUsage: 2500 + Math.floor(Math.random() * 500),
                successRate: 0.90 + Math.random() * 0.08,
                participants: 18 + Math.floor(Math.random() * 5)
            },
            cpp: {
                submissions: 35 + Math.floor(Math.random() * 10),
                avgExecutionTime: 300 + Math.floor(Math.random() * 80),
                avgMemoryUsage: 1500 + Math.floor(Math.random() * 500),
                successRate: 0.92 + Math.random() * 0.06,
                participants: 12 + Math.floor(Math.random() * 5)
            },
            go: {
                submissions: 20 + Math.floor(Math.random() * 8),
                avgExecutionTime: 250 + Math.floor(Math.random() * 60),
                avgMemoryUsage: 1000 + Math.floor(Math.random() * 300),
                successRate: 0.88 + Math.random() * 0.08,
                participants: 10 + Math.floor(Math.random() * 4)
            }
        };
    }

    generateMockPerformanceDistribution(options = {}) {
        return {
            expert: { count: 12 + Math.floor(Math.random() * 5), percentage: 30 + Math.random() * 10 },
            advanced: { count: 15 + Math.floor(Math.random() * 5), percentage: 35 + Math.random() * 10 },
            good: { count: 8 + Math.floor(Math.random() * 3), percentage: 20 + Math.random() * 8 },
            completed: { count: 3 + Math.floor(Math.random() * 2), percentage: 8 + Math.random() * 4 }
        };
    }

    generateMockSecurityAnalysis(options = {}) {
        return {
            totalScans: 150 + Math.floor(Math.random() * 20),
            passedScans: 135 + Math.floor(Math.random() * 15),
            failedScans: 15 + Math.floor(Math.random() * 10),
            securityScore: 85 + Math.random() * 10,
            commonIssues: [
                { issue: 'File size limit exceeded', count: 8 + Math.floor(Math.random() * 5) },
                { issue: 'Suspicious import detected', count: 4 + Math.floor(Math.random() * 3) },
                { issue: 'Network access attempt', count: 2 + Math.floor(Math.random() * 2) },
                { issue: 'System command execution', count: 1 + Math.floor(Math.random() * 2) }
            ]
        };
    }

    generateMockParticipantDemographics(options = {}) {
        const totalParticipants = 40 + Math.floor(Math.random() * 10);
        const activeParticipants = Math.floor(totalParticipants * 0.8);
        const newParticipants = Math.floor(totalParticipants * 0.3);
        const returningParticipants = totalParticipants - newParticipants;
        
        return {
            totalParticipants,
            activeParticipants,
            newParticipants,
            returningParticipants,
            topContributors: [
                { username: 'alice_dev', submissions: 6 + Math.floor(Math.random() * 4), avgRank: 2.0 + Math.random() * 1.5 },
                { username: 'bob_coder', submissions: 5 + Math.floor(Math.random() * 3), avgRank: 2.5 + Math.random() * 2.0 },
                { username: 'carol_optimizer', submissions: 4 + Math.floor(Math.random() * 3), avgRank: 1.8 + Math.random() * 1.2 },
                { username: 'david_speed', submissions: 4 + Math.floor(Math.random() * 2), avgRank: 3.0 + Math.random() * 2.0 },
                { username: 'eva_fast', submissions: 3 + Math.floor(Math.random() * 2), avgRank: 2.8 + Math.random() * 1.8 }
            ]
        };
    }

    generateMockTimeSeries(options = {}) {
        const days = options.days || 30;
        const data = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            data.push({
                date: date.toISOString().split('T')[0],
                submissions: Math.floor(Math.random() * 8) + 1,
                participants: Math.floor(Math.random() * 4) + 1,
                avgExecutionTime: Math.random() * 800 + 200,
                avgMemoryUsage: Math.random() * 3000 + 1000
            });
        }
        
        return data;
    }

    /**
     * Error handling utilities
     */
    handleError(error, context = '') {
        const errorInfo = {
            message: error.message || 'An unknown error occurred',
            context,
            timestamp: new Date().toISOString(),
            stack: error.stack
        };

        console.error('Analytics API Error:', errorInfo);
        
        // In production, you might want to send this to an error tracking service
        // this.reportError(errorInfo);
        
        return errorInfo;
    }

    /**
     * Report errors to monitoring service
     */
    async reportError(errorInfo) {
        try {
            await this.makeRequest('/errors', {
                method: 'POST',
                body: errorInfo
            });
        } catch (error) {
            console.error('Failed to report error:', error);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TournamentAnalyticsAPI;
}

// Global instance for easy access
window.TournamentAnalyticsAPI = TournamentAnalyticsAPI;
