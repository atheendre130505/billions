/**
 * Tournament Dashboard JavaScript
 * Handles advanced analytics, data visualization, and reporting systems
 */

class TournamentDashboard {
    constructor() {
        this.analyticsData = {};
        this.charts = {};
        this.currentView = 'overview';
        this.dateRange = '7d';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAnalyticsData();
        this.initializeCharts();
        this.setupRealTimeUpdates();
    }

    setupEventListeners() {
        // Dashboard view switcher
        const viewSwitchers = document.querySelectorAll('.dashboard-view-switcher');
        viewSwitchers.forEach(switcher => {
            switcher.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Date range selector
        const dateRangeSelector = document.getElementById('date-range-selector');
        if (dateRangeSelector) {
            dateRangeSelector.addEventListener('change', (e) => {
                this.dateRange = e.target.value;
                this.updateAnalytics();
            });
        }

        // Export buttons
        const exportButtons = document.querySelectorAll('.export-btn');
        exportButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                this.exportData(format);
            });
        });

        // Refresh analytics
        const refreshBtn = document.getElementById('refresh-analytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAnalytics());
        }
    }

    async loadAnalyticsData() {
        try {
            this.setLoading(true);
            
            // Load from local storage first (for demo)
            const cachedData = localStorage.getItem('tournament_analytics');
            if (cachedData) {
                this.analyticsData = JSON.parse(cachedData);
                this.renderDashboard();
            }

            // Fetch fresh analytics data
            await this.fetchAnalyticsData();
            
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            this.showError('Failed to load analytics data. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async fetchAnalyticsData() {
        try {
            // Generate comprehensive analytics data
            const analyticsData = this.generateAnalyticsData();
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.analyticsData = analyticsData;
            this.renderDashboard();
            
            // Cache the data
            localStorage.setItem('tournament_analytics', JSON.stringify(analyticsData));
            
        } catch (error) {
            console.error('Failed to fetch analytics data:', error);
            throw error;
        }
    }

    generateAnalyticsData() {
        const now = new Date();
        const participants = 42;
        const submissions = 156;
        
        // Generate time series data for the last 30 days
        const timeSeriesData = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            timeSeriesData.push({
                date: date.toISOString().split('T')[0],
                submissions: Math.floor(Math.random() * 10) + 1,
                participants: Math.floor(Math.random() * 5) + 1,
                avgExecutionTime: Math.random() * 1000 + 100,
                avgMemoryUsage: Math.random() * 4000 + 500
            });
        }

        // Generate language performance data
        const languagePerformance = {
            java: {
                submissions: 45,
                avgExecutionTime: 450,
                avgMemoryUsage: 3200,
                successRate: 0.89,
                participants: 18
            },
            python: {
                submissions: 52,
                avgExecutionTime: 680,
                avgMemoryUsage: 2800,
                successRate: 0.92,
                participants: 22
            },
            cpp: {
                submissions: 38,
                avgExecutionTime: 320,
                avgMemoryUsage: 1800,
                successRate: 0.95,
                participants: 15
            },
            go: {
                submissions: 21,
                avgExecutionTime: 280,
                avgMemoryUsage: 1200,
                successRate: 0.88,
                participants: 12
            }
        };

        // Generate performance distribution
        const performanceDistribution = {
            expert: { count: 15, percentage: 35.7 },
            advanced: { count: 18, percentage: 42.9 },
            good: { count: 7, percentage: 16.7 },
            completed: { count: 2, percentage: 4.8 }
        };

        // Generate security analysis
        const securityAnalysis = {
            totalScans: 156,
            passedScans: 142,
            failedScans: 14,
            securityScore: 91.0,
            commonIssues: [
                { issue: 'File size limit exceeded', count: 8 },
                { issue: 'Suspicious import detected', count: 4 },
                { issue: 'Network access attempt', count: 2 }
            ]
        };

        // Generate participant demographics
        const participantDemographics = {
            totalParticipants: participants,
            activeParticipants: 38,
            newParticipants: 12,
            returningParticipants: 26,
            topContributors: [
                { username: 'alice_dev', submissions: 8, avgRank: 2.1 },
                { username: 'bob_coder', submissions: 6, avgRank: 3.2 },
                { username: 'carol_optimizer', submissions: 5, avgRank: 1.8 },
                { username: 'david_speed', submissions: 4, avgRank: 4.5 },
                { username: 'eva_fast', submissions: 4, avgRank: 2.9 }
            ]
        };

        return {
            overview: {
                totalParticipants,
                totalSubmissions: submissions,
                avgExecutionTime: 432,
                avgMemoryUsage: 2250,
                successRate: 0.91,
                activeLanguages: 4
            },
            timeSeries: timeSeriesData,
            languagePerformance,
            performanceDistribution,
            securityAnalysis,
            participantDemographics,
            lastUpdated: now.toISOString()
        };
    }

    renderDashboard() {
        this.renderOverview();
        this.renderTimeSeriesChart();
        this.renderLanguagePerformance();
        this.renderPerformanceDistribution();
        this.renderSecurityAnalysis();
        this.renderParticipantDemographics();
        this.updateLastUpdated();
    }

    renderOverview() {
        const overviewContainer = document.getElementById('overview-stats');
        if (!overviewContainer) return;

        const { overview } = this.analyticsData;
        
        overviewContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${overview.totalParticipants}</div>
                    <div class="stat-label">Total Participants</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-code"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${overview.totalSubmissions}</div>
                    <div class="stat-label">Total Submissions</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${overview.avgExecutionTime}ms</div>
                    <div class="stat-label">Avg Execution Time</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-memory"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${(overview.avgMemoryUsage / 1024).toFixed(1)}GB</div>
                    <div class="stat-label">Avg Memory Usage</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${(overview.successRate * 100).toFixed(1)}%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-language"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${overview.activeLanguages}</div>
                    <div class="stat-label">Active Languages</div>
                </div>
            </div>
        `;
    }

    renderTimeSeriesChart() {
        const chartContainer = document.getElementById('time-series-chart');
        if (!chartContainer) return;

        const { timeSeries } = this.analyticsData;
        
        // Create chart using Chart.js or similar
        this.createTimeSeriesChart(chartContainer, timeSeries);
    }

    createTimeSeriesChart(container, data) {
        // Simple chart implementation (in production, use Chart.js or D3.js)
        const chartHtml = `
            <div class="chart-container">
                <h3>Submission Activity (Last 30 Days)</h3>
                <div class="chart-legend">
                    <span class="legend-item"><span class="legend-color submissions"></span> Submissions</span>
                    <span class="legend-item"><span class="legend-color participants"></span> New Participants</span>
                </div>
                <div class="chart-bars">
                    ${data.map(day => `
                        <div class="chart-bar-group">
                            <div class="chart-bar submissions" style="height: ${day.submissions * 8}px" title="${day.date}: ${day.submissions} submissions"></div>
                            <div class="chart-bar participants" style="height: ${day.participants * 8}px" title="${day.date}: ${day.participants} participants"></div>
                            <div class="chart-date">${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = chartHtml;
    }

    renderLanguagePerformance() {
        const container = document.getElementById('language-performance');
        if (!container) return;

        const { languagePerformance } = this.analyticsData;
        
        container.innerHTML = `
            <div class="language-performance-grid">
                ${Object.entries(languagePerformance).map(([lang, data]) => `
                    <div class="language-performance-card">
                        <div class="language-header">
                            <span class="language-badge language-${lang}">${lang.toUpperCase()}</span>
                            <span class="submission-count">${data.submissions} submissions</span>
                        </div>
                        <div class="performance-metrics">
                            <div class="metric">
                                <span class="metric-label">Avg Time:</span>
                                <span class="metric-value">${data.avgExecutionTime}ms</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Avg Memory:</span>
                                <span class="metric-value">${(data.avgMemoryUsage / 1024).toFixed(1)}GB</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Success Rate:</span>
                                <span class="metric-value">${(data.successRate * 100).toFixed(1)}%</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Participants:</span>
                                <span class="metric-value">${data.participants}</span>
                            </div>
                        </div>
                        <div class="performance-chart">
                            <div class="chart-bar" style="width: ${(data.avgExecutionTime / 1000) * 100}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPerformanceDistribution() {
        const container = document.getElementById('performance-distribution');
        if (!container) return;

        const { performanceDistribution } = this.analyticsData;
        
        container.innerHTML = `
            <div class="performance-distribution-chart">
                <h3>Performance Level Distribution</h3>
                <div class="distribution-bars">
                    ${Object.entries(performanceDistribution).map(([level, data]) => `
                        <div class="distribution-bar-group">
                            <div class="distribution-bar level-${level}" style="height: ${data.percentage * 3}px"></div>
                            <div class="distribution-label">
                                <span class="level-name">${level.charAt(0).toUpperCase() + level.slice(1)}</span>
                                <span class="level-count">${data.count}</span>
                                <span class="level-percentage">${data.percentage}%</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderSecurityAnalysis() {
        const container = document.getElementById('security-analysis');
        if (!container) return;

        const { securityAnalysis } = this.analyticsData;
        
        container.innerHTML = `
            <div class="security-overview">
                <div class="security-stats">
                    <div class="security-stat">
                        <div class="stat-number">${securityAnalysis.totalScans}</div>
                        <div class="stat-label">Total Scans</div>
                    </div>
                    <div class="security-stat">
                        <div class="stat-number success">${securityAnalysis.passedScans}</div>
                        <div class="stat-label">Passed</div>
                    </div>
                    <div class="security-stat">
                        <div class="stat-number error">${securityAnalysis.failedScans}</div>
                        <div class="stat-label">Failed</div>
                    </div>
                    <div class="security-stat">
                        <div class="stat-number">${securityAnalysis.securityScore}%</div>
                        <div class="stat-label">Security Score</div>
                    </div>
                </div>
                <div class="security-issues">
                    <h4>Common Security Issues</h4>
                    <div class="issues-list">
                        ${securityAnalysis.commonIssues.map(issue => `
                            <div class="issue-item">
                                <span class="issue-name">${issue.issue}</span>
                                <span class="issue-count">${issue.count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderParticipantDemographics() {
        const container = document.getElementById('participant-demographics');
        if (!container) return;

        const { participantDemographics } = this.analyticsData;
        
        container.innerHTML = `
            <div class="demographics-overview">
                <div class="demographics-stats">
                    <div class="demographic-stat">
                        <div class="stat-number">${participantDemographics.totalParticipants}</div>
                        <div class="stat-label">Total Participants</div>
                    </div>
                    <div class="demographic-stat">
                        <div class="stat-number">${participantDemographics.activeParticipants}</div>
                        <div class="stat-label">Active Participants</div>
                    </div>
                    <div class="demographic-stat">
                        <div class="stat-number">${participantDemographics.newParticipants}</div>
                        <div class="stat-label">New This Month</div>
                    </div>
                    <div class="demographic-stat">
                        <div class="stat-number">${participantDemographics.returningParticipants}</div>
                        <div class="stat-label">Returning</div>
                    </div>
                </div>
                <div class="top-contributors">
                    <h4>Top Contributors</h4>
                    <div class="contributors-list">
                        ${participantDemographics.topContributors.map((contributor, index) => `
                            <div class="contributor-item">
                                <div class="contributor-rank">${index + 1}</div>
                                <div class="contributor-info">
                                    <div class="contributor-username">@${contributor.username}</div>
                                    <div class="contributor-stats">
                                        ${contributor.submissions} submissions • Avg Rank: ${contributor.avgRank}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('last-updated');
        if (lastUpdatedElement && this.analyticsData.lastUpdated) {
            const date = new Date(this.analyticsData.lastUpdated);
            lastUpdatedElement.textContent = date.toLocaleString();
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active view switcher
        document.querySelectorAll('.dashboard-view-switcher').forEach(switcher => {
            switcher.classList.remove('active');
            if (switcher.dataset.view === view) {
                switcher.classList.add('active');
            }
        });

        // Show/hide view sections
        document.querySelectorAll('.dashboard-view').forEach(section => {
            section.classList.remove('active');
            if (section.dataset.view === view) {
                section.classList.add('active');
            }
        });

        // Update view-specific content
        this.updateViewContent(view);
    }

    updateViewContent(view) {
        switch (view) {
            case 'overview':
                this.renderOverview();
                break;
            case 'performance':
                this.renderLanguagePerformance();
                this.renderPerformanceDistribution();
                break;
            case 'security':
                this.renderSecurityAnalysis();
                break;
            case 'participants':
                this.renderParticipantDemographics();
                break;
            case 'trends':
                this.renderTimeSeriesChart();
                break;
        }
    }

    async refreshAnalytics() {
        try {
            this.setLoading(true);
            await this.fetchAnalyticsData();
            this.showSuccessMessage('Analytics refreshed successfully!');
        } catch (error) {
            console.error('Failed to refresh analytics:', error);
            this.showErrorMessage('Failed to refresh analytics. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        const refreshBtn = document.getElementById('refresh-analytics');
        if (refreshBtn) {
            refreshBtn.disabled = loading;
            refreshBtn.innerHTML = loading ? 
                '<i class="fas fa-spinner fa-spin"></i> Refreshing...' : 
                '<i class="fas fa-sync-alt"></i> Refresh Analytics';
        }
    }

    exportData(format) {
        try {
            let data, filename, mimeType;
            
            switch (format) {
                case 'json':
                    data = JSON.stringify(this.analyticsData, null, 2);
                    filename = `tournament-analytics-${new Date().toISOString().split('T')[0]}.json`;
                    mimeType = 'application/json';
                    break;
                case 'csv':
                    data = this.convertToCSV();
                    filename = `tournament-analytics-${new Date().toISOString().split('T')[0]}.csv`;
                    mimeType = 'text/csv';
                    break;
                case 'pdf':
                    this.exportToPDF();
                    return;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            // Create download link
            const blob = new Blob([data], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showSuccessMessage(`${format.toUpperCase()} export completed successfully!`);
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showErrorMessage(`Failed to export ${format.toUpperCase()}. Please try again.`);
        }
    }

    convertToCSV() {
        const { overview, languagePerformance, performanceDistribution } = this.analyticsData;
        
        let csv = 'Metric,Value\n';
        csv += `Total Participants,${overview.totalParticipants}\n`;
        csv += `Total Submissions,${overview.totalSubmissions}\n`;
        csv += `Average Execution Time (ms),${overview.avgExecutionTime}\n`;
        csv += `Average Memory Usage (MB),${overview.avgMemoryUsage}\n`;
        csv += `Success Rate,${(overview.successRate * 100).toFixed(1)}%\n`;
        csv += `Active Languages,${overview.activeLanguages}\n\n`;
        
        csv += 'Language,Submissions,Avg Execution Time (ms),Avg Memory Usage (MB),Success Rate (%)\n';
        Object.entries(languagePerformance).forEach(([lang, data]) => {
            csv += `${lang},${data.submissions},${data.avgExecutionTime},${data.avgMemoryUsage},${(data.successRate * 100).toFixed(1)}\n`;
        });
        
        csv += '\nPerformance Level,Count,Percentage\n';
        Object.entries(performanceDistribution).forEach(([level, data]) => {
            csv += `${level},${data.count},${data.percentage}%\n`;
        });
        
        return csv;
    }

    exportToPDF() {
        // In a real implementation, use a library like jsPDF
        this.showInfoMessage('PDF export feature coming soon!');
    }

    setupRealTimeUpdates() {
        // Update analytics every 5 minutes
        setInterval(() => {
            this.fetchAnalyticsData();
        }, 5 * 60 * 1000);
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showInfoMessage(message) {
        this.showMessage(message, 'info');
    }

    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(messageEl);
        setTimeout(() => messageEl.classList.add('show'), 100);
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }

    showError(error) {
        console.error('Dashboard error:', error);
        this.showErrorMessage('An error occurred while loading the dashboard. Please try again.');
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

    // Cleanup
    destroy() {
        // Clear intervals and event listeners
        clearInterval(this.realTimeInterval);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tournamentDashboard = new TournamentDashboard();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TournamentDashboard;
}






