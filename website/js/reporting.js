/**
 * Tournament Reporting System
 * Handles report generation, formatting, and export functionality
 */

class TournamentReporting {
    constructor() {
        this.reportTemplates = new Map();
        this.exportFormats = ['html', 'pdf', 'csv', 'json', 'markdown'];
        this.init();
    }

    init() {
        this.loadReportTemplates();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Report generation buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.generate-report-btn')) {
                const reportType = e.target.dataset.reportType;
                this.generateReport(reportType);
            }
        });

        // Export buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.export-report-btn')) {
                const format = e.target.dataset.format;
                const reportId = e.target.dataset.reportId;
                this.exportReport(reportId, format);
            }
        });
    }

    loadReportTemplates() {
        // Load predefined report templates
        this.reportTemplates.set('tournament-summary', {
            name: 'Tournament Summary Report',
            description: 'Comprehensive overview of tournament performance and statistics',
            sections: ['overview', 'performance', 'security', 'participants', 'trends'],
            template: this.getSummaryTemplate()
        });

        this.reportTemplates.set('performance-analysis', {
            name: 'Performance Analysis Report',
            description: 'Detailed analysis of solution performance across languages',
            sections: ['performance', 'languages', 'benchmarks', 'comparisons'],
            template: this.getPerformanceTemplate()
        });

        this.reportTemplates.set('security-audit', {
            name: 'Security Audit Report',
            description: 'Security analysis and compliance report',
            sections: ['security', 'compliance', 'incidents', 'recommendations'],
            template: this.getSecurityTemplate()
        });

        this.reportTemplates.set('participant-report', {
            name: 'Participant Report',
            description: 'Individual participant performance and statistics',
            sections: ['participant', 'submissions', 'performance', 'history'],
            template: this.getParticipantTemplate()
        });
    }

    /**
     * Generate a comprehensive report
     */
    async generateReport(reportType, options = {}) {
        try {
            this.showLoadingState(true);
            
            const template = this.reportTemplates.get(reportType);
            if (!template) {
                throw new Error(`Unknown report type: ${reportType}`);
            }

            // Fetch required data
            const data = await this.fetchReportData(template.sections, options);
            
            // Generate report content
            const report = await this.buildReport(template, data, options);
            
            // Store report for later export
            const reportId = this.storeReport(report);
            
            // Display report
            this.displayReport(report, reportId);
            
            this.showLoadingState(false);
            this.showSuccessMessage(`Report generated successfully!`);
            
            return report;
            
        } catch (error) {
            console.error('Failed to generate report:', error);
            this.showLoadingState(false);
            this.showErrorMessage(`Failed to generate report: ${error.message}`);
            throw error;
        }
    }

    /**
     * Fetch data required for report sections
     */
    async fetchReportData(sections, options = {}) {
        const data = {};
        const api = window.TournamentAnalyticsAPI || new TournamentAnalyticsAPI();
        
        for (const section of sections) {
            try {
                switch (section) {
                    case 'overview':
                        data.overview = await api.getOverview(options.dateRange);
                        break;
                    case 'performance':
                        data.performance = await api.getLanguagePerformance(options.dateRange);
                        break;
                    case 'security':
                        data.security = await api.getSecurityAnalysis(options.dateRange);
                        break;
                    case 'participants':
                        data.participants = await api.getParticipantDemographics(options.dateRange);
                        break;
                    case 'trends':
                        data.trends = await api.getTimeSeriesData(options.dateRange);
                        break;
                    case 'languages':
                        data.languages = await api.getLanguagePerformance(options.dateRange);
                        break;
                    case 'benchmarks':
                        data.benchmarks = await this.generateBenchmarkData();
                        break;
                    case 'comparisons':
                        data.comparisons = await this.generateComparisonData();
                        break;
                    case 'compliance':
                        data.compliance = await this.generateComplianceData();
                        break;
                    case 'incidents':
                        data.incidents = await this.generateIncidentData();
                        break;
                    case 'recommendations':
                        data.recommendations = await this.generateRecommendations();
                        break;
                    case 'participant':
                        if (options.participantId) {
                            data.participant = await this.getParticipantData(options.participantId);
                        }
                        break;
                    case 'submissions':
                        if (options.participantId) {
                            data.submissions = await this.getParticipantSubmissions(options.participantId);
                        }
                        break;
                    case 'history':
                        if (options.participantId) {
                            data.history = await this.getParticipantHistory(options.participantId);
                        }
                        break;
                }
            } catch (error) {
                console.warn(`Failed to fetch data for section ${section}:`, error);
                // Use mock data as fallback
                data[section] = this.getMockDataForSection(section);
            }
        }
        
        return data;
    }

    /**
     * Build report using template and data
     */
    async buildReport(template, data, options = {}) {
        const report = {
            id: this.generateReportId(),
            type: template.name,
            description: template.description,
            generatedAt: new Date().toISOString(),
            generatedBy: options.user || 'System',
            data: data,
            content: {},
            metadata: {
                version: '1.0',
                template: template.name,
                sections: template.sections
            }
        };

        // Generate content for each section
        for (const section of template.sections) {
            report.content[section] = await this.generateSectionContent(section, data[section], options);
        }

        return report;
    }

    /**
     * Generate content for a specific section
     */
    async generateSectionContent(section, data, options = {}) {
        switch (section) {
            case 'overview':
                return this.generateOverviewContent(data);
            case 'performance':
                return this.generatePerformanceContent(data);
            case 'security':
                return this.generateSecurityContent(data);
            case 'participants':
                return this.generateParticipantsContent(data);
            case 'trends':
                return this.generateTrendsContent(data);
            case 'languages':
                return this.generateLanguagesContent(data);
            case 'benchmarks':
                return this.generateBenchmarksContent(data);
            case 'comparisons':
                return this.generateComparisonsContent(data);
            case 'compliance':
                return this.generateComplianceContent(data);
            case 'incidents':
                return this.generateIncidentsContent(data);
            case 'recommendations':
                return this.generateRecommendationsContent(data);
            case 'participant':
                return this.generateParticipantContent(data);
            case 'submissions':
                return this.generateSubmissionsContent(data);
            case 'history':
                return this.generateHistoryContent(data);
            default:
                return this.generateGenericContent(section, data);
        }
    }

    /**
     * Generate overview section content
     */
    generateOverviewContent(data) {
        const { overview } = data;
        
        return {
            title: 'Tournament Overview',
            summary: `Tournament running with ${overview.totalParticipants} participants and ${overview.totalSubmissions} submissions.`,
            statistics: [
                { label: 'Total Participants', value: overview.totalParticipants, icon: 'users' },
                { label: 'Total Submissions', value: overview.totalSubmissions, icon: 'code' },
                { label: 'Average Execution Time', value: `${overview.avgExecutionTime}ms`, icon: 'clock' },
                { label: 'Average Memory Usage', value: `${(overview.avgMemoryUsage / 1024).toFixed(1)}GB`, icon: 'memory' },
                { label: 'Success Rate', value: `${(overview.successRate * 100).toFixed(1)}%`, icon: 'chart-line' },
                { label: 'Active Languages', value: overview.activeLanguages, icon: 'language' }
            ],
            highlights: [
                `Tournament has been running for ${this.calculateTournamentDuration()} days`,
                `Current success rate is ${(overview.successRate * 100).toFixed(1)}%`,
                `${overview.totalParticipants} participants actively competing`
            ]
        };
    }

    /**
     * Generate performance section content
     */
    generatePerformanceContent(data) {
        const { performance } = data;
        
        const languageStats = Object.entries(performance).map(([lang, stats]) => ({
            language: lang.toUpperCase(),
            submissions: stats.submissions,
            avgExecutionTime: stats.avgExecutionTime,
            avgMemoryUsage: stats.avgMemoryUsage,
            successRate: stats.successRate,
            participants: stats.participants
        }));

        // Sort by execution time (best performance first)
        languageStats.sort((a, b) => a.avgExecutionTime - b.avgExecutionTime);

        return {
            title: 'Performance Analysis',
            summary: `Performance analysis across ${languageStats.length} programming languages.`,
            topPerformers: languageStats.slice(0, 3),
            allLanguages: languageStats,
            performanceMetrics: {
                fastestLanguage: languageStats[0],
                mostEfficient: languageStats.reduce((min, curr) => 
                    curr.avgMemoryUsage < min.avgMemoryUsage ? curr : min
                ),
                highestSuccessRate: languageStats.reduce((max, curr) => 
                    curr.successRate > max.successRate ? curr : max
                )
            }
        };
    }

    /**
     * Generate security section content
     */
    generateSecurityContent(data) {
        const { security } = data;
        
        return {
            title: 'Security Analysis',
            summary: `Security scan results: ${security.passedScans} passed, ${security.failedScans} failed.`,
            securityScore: security.securityScore,
            scanResults: {
                total: security.totalScans,
                passed: security.passedScans,
                failed: security.failedScans,
                passRate: ((security.passedScans / security.totalScans) * 100).toFixed(1)
            },
            commonIssues: security.commonIssues,
            recommendations: [
                'Implement stricter file size limits',
                'Add more comprehensive import scanning',
                'Enhance network access detection',
                'Improve system command blocking'
            ]
        };
    }

    /**
     * Generate participants section content
     */
    generateParticipantsContent(data) {
        const { participants } = data;
        
        return {
            title: 'Participant Demographics',
            summary: `Tournament has ${participants.totalParticipants} participants with ${participants.activeParticipants} active.`,
            demographics: {
                total: participants.totalParticipants,
                active: participants.activeParticipants,
                new: participants.newParticipants,
                returning: participants.returningParticipants
            },
            topContributors: participants.topContributors,
            participationTrends: {
                newParticipantsRate: ((participants.newParticipants / participants.totalParticipants) * 100).toFixed(1),
                activeRate: ((participants.activeParticipants / participants.totalParticipants) * 100).toFixed(1)
            }
        };
    }

    /**
     * Generate trends section content
     */
    generateTrendsContent(data) {
        const { trends } = data;
        
        const submissionTrends = this.analyzeTrends(trends.map(d => d.submissions));
        const participantTrends = this.analyzeTrends(trends.map(d => d.participants));
        
        return {
            title: 'Trends Analysis',
            summary: 'Analysis of submission and participation trends over time.',
            submissionTrends: {
                data: trends.map(d => ({ date: d.date, value: d.submissions })),
                analysis: submissionTrends,
                trend: submissionTrends.direction
            },
            participantTrends: {
                data: trends.map(d => ({ date: d.date, value: d.participants })),
                analysis: participantTrends,
                trend: participantTrends.direction
            },
            insights: [
                `Submission trend is ${submissionTrends.direction}`,
                `Participation trend is ${participantTrends.direction}`,
                `Average daily submissions: ${submissionTrends.average.toFixed(1)}`,
                `Peak submission day: ${this.findPeakDay(trends, 'submissions')}`
            ]
        };
    }

    /**
     * Display generated report
     */
    displayReport(report, reportId) {
        const reportContainer = document.getElementById('report-container') || this.createReportContainer();
        
        const reportHtml = this.renderReportHTML(report, reportId);
        reportContainer.innerHTML = reportHtml;
        
        // Add export controls
        this.addExportControls(reportId);
        
        // Scroll to report
        reportContainer.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Create report container if it doesn't exist
     */
    createReportContainer() {
        const container = document.createElement('div');
        container.id = 'report-container';
        container.className = 'report-container';
        
        // Insert after dashboard container
        const dashboardContainer = document.querySelector('.dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.parentNode.insertBefore(container, dashboardContainer.nextSibling);
        }
        
        return container;
    }

    /**
     * Render report as HTML
     */
    renderReportHTML(report, reportId) {
        let html = `
            <div class="report-header">
                <h2>${report.type}</h2>
                <p>${report.description}</p>
                <div class="report-meta">
                    <span>Generated: ${new Date(report.generatedAt).toLocaleString()}</span>
                    <span>By: ${report.generatedBy}</span>
                    <span>Report ID: ${reportId}</span>
                </div>
            </div>
        `;

        // Render each section
        for (const [sectionName, sectionData] of Object.entries(report.content)) {
            html += this.renderSectionHTML(sectionName, sectionData);
        }

        return html;
    }

    /**
     * Render a section as HTML
     */
    renderSectionHTML(sectionName, sectionData) {
        let html = `
            <div class="report-section">
                <h3>${sectionData.title}</h3>
                <p class="section-summary">${sectionData.summary}</p>
        `;

        // Render statistics if available
        if (sectionData.statistics) {
            html += '<div class="section-statistics">';
            sectionData.statistics.forEach(stat => {
                html += `
                    <div class="stat-item">
                        <i class="fas fa-${stat.icon}"></i>
                        <div class="stat-content">
                            <div class="stat-value">${stat.value}</div>
                            <div class="stat-label">${stat.label}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Render highlights if available
        if (sectionData.highlights) {
            html += '<div class="section-highlights"><ul>';
            sectionData.highlights.forEach(highlight => {
                html += `<li>${highlight}</li>`;
            });
            html += '</ul></div>';
        }

        // Render tables if available
        if (sectionData.allLanguages) {
            html += this.renderTableHTML(sectionData.allLanguages, ['Language', 'Submissions', 'Avg Time (ms)', 'Avg Memory (MB)', 'Success Rate', 'Participants']);
        }

        html += '</div>';
        return html;
    }

    /**
     * Render table HTML
     */
    renderTableHTML(data, headers) {
        let html = '<div class="section-table"><table><thead><tr>';
        
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        data.forEach(row => {
            html += '<tr>';
            Object.values(row).forEach(value => {
                html += `<td>${value}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        return html;
    }

    /**
     * Add export controls to report
     */
    addExportControls(reportId) {
        const exportContainer = document.createElement('div');
        exportContainer.className = 'report-export-controls';
        exportContainer.innerHTML = `
            <h4>Export Report</h4>
            <div class="export-buttons">
                <button class="export-report-btn btn btn-secondary" data-format="html" data-report-id="${reportId}">
                    <i class="fas fa-file-code"></i> HTML
                </button>
                <button class="export-report-btn btn btn-secondary" data-format="pdf" data-report-id="${reportId}">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
                <button class="export-report-btn btn btn-secondary" data-format="csv" data-report-id="${reportId}">
                    <i class="fas fa-file-csv"></i> CSV
                </button>
                <button class="export-report-btn btn btn-secondary" data-format="json" data-report-id="${reportId}">
                    <i class="fas fa-file-code"></i> JSON
                </button>
                <button class="export-report-btn btn btn-secondary" data-format="markdown" data-report-id="${reportId}">
                    <i class="fas fa-file-alt"></i> Markdown
                </button>
            </div>
        `;
        
        const reportContainer = document.getElementById('report-container');
        if (reportContainer) {
            reportContainer.appendChild(exportContainer);
        }
    }

    /**
     * Export report in specified format
     */
    async exportReport(reportId, format) {
        try {
            const report = this.getStoredReport(reportId);
            if (!report) {
                throw new Error('Report not found');
            }

            let content, filename, mimeType;
            
            switch (format) {
                case 'html':
                    content = this.exportToHTML(report);
                    filename = `report-${reportId}.html`;
                    mimeType = 'text/html';
                    break;
                case 'pdf':
                    await this.exportToPDF(report);
                    return;
                case 'csv':
                    content = this.exportToCSV(report);
                    filename = `report-${reportId}.csv`;
                    mimeType = 'text/csv';
                    break;
                case 'json':
                    content = JSON.stringify(report, null, 2);
                    filename = `report-${reportId}.json`;
                    mimeType = 'application/json';
                    break;
                case 'markdown':
                    content = this.exportToMarkdown(report);
                    filename = `report-${reportId}.md`;
                    mimeType = 'text/markdown';
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            // Download file
            this.downloadFile(content, filename, mimeType);
            this.showSuccessMessage(`${format.toUpperCase()} export completed!`);
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showErrorMessage(`Failed to export ${format.toUpperCase()}: ${error.message}`);
        }
    }

    /**
     * Export to HTML
     */
    exportToHTML(report) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${report.type}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .report-header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .report-section { margin-bottom: 30px; }
                    .section-statistics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
                    .stat-item { display: flex; align-items: center; gap: 10px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f5f5f5; font-weight: bold; }
                </style>
            </head>
            <body>
                ${this.renderReportHTML(report, report.id)}
            </body>
            </html>
        `;
    }

    /**
     * Export to CSV
     */
    exportToCSV(report) {
        let csv = 'Section,Field,Value\n';
        
        for (const [sectionName, sectionData] of Object.entries(report.content)) {
            if (sectionData.statistics) {
                sectionData.statistics.forEach(stat => {
                    csv += `${sectionName},${stat.label},${stat.value}\n`;
                });
            }
        }
        
        return csv;
    }

    /**
     * Export to Markdown
     */
    exportToMarkdown(report) {
        let md = `# ${report.type}\n\n`;
        md += `${report.description}\n\n`;
        md += `**Generated:** ${new Date(report.generatedAt).toLocaleString()}\n`;
        md += `**By:** ${report.generatedBy}\n\n`;
        
        for (const [sectionName, sectionData] of Object.entries(report.content)) {
            md += `## ${sectionData.title}\n\n`;
            md += `${sectionData.summary}\n\n`;
            
            if (sectionData.statistics) {
                md += '### Statistics\n\n';
                sectionData.statistics.forEach(stat => {
                    md += `- **${stat.label}:** ${stat.value}\n`;
                });
                md += '\n';
            }
            
            if (sectionData.highlights) {
                md += '### Highlights\n\n';
                sectionData.highlights.forEach(highlight => {
                    md += `- ${highlight}\n`;
                });
                md += '\n';
            }
        }
        
        return md;
    }

    /**
     * Export to PDF (placeholder)
     */
    async exportToPDF(report) {
        // In a real implementation, use a library like jsPDF or html2pdf
        this.showInfoMessage('PDF export feature coming soon!');
    }

    /**
     * Download file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Store report for later access
     */
    storeReport(report) {
        const reportId = report.id;
        const reports = JSON.parse(localStorage.getItem('tournament_reports') || '{}');
        reports[reportId] = {
            ...report,
            storedAt: new Date().toISOString()
        };
        localStorage.setItem('tournament_reports', JSON.stringify(reports));
        return reportId;
    }

    /**
     * Get stored report
     */
    getStoredReport(reportId) {
        const reports = JSON.parse(localStorage.getItem('tournament_reports') || '{}');
        return reports[reportId];
    }

    /**
     * Generate unique report ID
     */
    generateReportId() {
        return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Utility methods
     */
    calculateTournamentDuration() {
        // Placeholder - in real implementation, get from tournament start date
        return Math.floor(Math.random() * 30) + 15;
    }

    analyzeTrends(data) {
        if (data.length < 2) return { direction: 'stable', average: data[0] || 0 };
        
        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));
        
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        const change = ((secondAvg - firstAvg) / firstAvg) * 100;
        
        return {
            direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
            change: change.toFixed(1),
            average: data.reduce((a, b) => a + b, 0) / data.length
        };
    }

    findPeakDay(data, metric) {
        const peak = data.reduce((max, curr) => curr[metric] > max[metric] ? curr : max);
        return peak.date;
    }

    getMockDataForSection(section) {
        const api = window.TournamentAnalyticsAPI || new TournamentAnalyticsAPI();
        return api.generateMockData(section);
    }

    showLoadingState(loading) {
        // Implementation depends on UI structure
        const loadingEl = document.querySelector('.loading-indicator');
        if (loadingEl) {
            loadingEl.style.display = loading ? 'block' : 'none';
        }
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
        // Implementation depends on UI structure
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Initialize reporting system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tournamentReporting = new TournamentReporting();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TournamentReporting;
}
