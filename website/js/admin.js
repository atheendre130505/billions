/**
 * Tournament Admin Management System
 * Handles administrative functions, user management, and system configuration
 */

class TournamentAdmin {
    constructor() {
        this.currentUser = null;
        this.permissions = new Set();
        this.adminFeatures = new Map();
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadAdminFeatures();
        this.setupEventListeners();
        this.initializeAdminInterface();
    }

    /**
     * Check user authentication and permissions
     */
    async checkAuthentication() {
        try {
            // In a real implementation, check with backend
            const user = await this.getCurrentUser();
            if (user && user.role === 'admin') {
                this.currentUser = user;
                this.permissions = new Set(user.permissions || []);
                this.showAdminInterface();
            } else {
                this.hideAdminInterface();
                this.showAccessDenied();
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            this.showAccessDenied();
        }
    }

    /**
     * Get current user information
     */
    async getCurrentUser() {
        // Mock user for demo purposes
        return {
            id: 'admin_001',
            username: 'admin',
            email: 'admin@tournament.com',
            role: 'admin',
            permissions: [
                'manage_participants',
                'manage_tournaments',
                'view_analytics',
                'manage_security',
                'system_config',
                'generate_reports'
            ],
            lastLogin: new Date().toISOString()
        };
    }

    /**
     * Load available admin features
     */
    loadAdminFeatures() {
        this.adminFeatures.set('participant-management', {
            name: 'Participant Management',
            description: 'Manage tournament participants, view profiles, and handle submissions',
            icon: 'fas fa-users',
            permissions: ['manage_participants'],
            component: 'participantManager'
        });

        this.adminFeatures.set('tournament-control', {
            name: 'Tournament Control',
            description: 'Control tournament execution, settings, and rules',
            icon: 'fas fa-trophy',
            permissions: ['manage_tournaments'],
            component: 'tournamentController'
        });

        this.adminFeatures.set('security-monitoring', {
            name: 'Security Monitoring',
            description: 'Monitor security events, configure policies, and handle incidents',
            icon: 'fas fa-shield-alt',
            permissions: ['manage_security'],
            component: 'securityMonitor'
        });

        this.adminFeatures.set('system-configuration', {
            name: 'System Configuration',
            description: 'Configure system settings, integrations, and maintenance',
            icon: 'fas fa-cog',
            permissions: ['system_config'],
            component: 'systemConfig'
        });

        this.adminFeatures.set('analytics-dashboard', {
            name: 'Analytics Dashboard',
            description: 'Advanced analytics, reporting, and data insights',
            icon: 'fas fa-chart-line',
            permissions: ['view_analytics'],
            component: 'analyticsDashboard'
        });

        this.adminFeatures.set('report-generation', {
            name: 'Report Generation',
            description: 'Generate and export comprehensive tournament reports',
            icon: 'fas fa-file-alt',
            permissions: ['generate_reports'],
            component: 'reportGenerator'
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Admin feature navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.admin-feature-btn')) {
                const featureId = e.target.dataset.feature;
                this.activateFeature(featureId);
            }
        });

        // Participant management
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-participant-btn')) {
                this.showAddParticipantModal();
            }
            if (e.target.matches('.edit-participant-btn')) {
                const participantId = e.target.dataset.participantId;
                this.showEditParticipantModal(participantId);
            }
            if (e.target.matches('.remove-participant-btn')) {
                const participantId = e.target.dataset.participantId;
                this.showRemoveParticipantModal(participantId);
            }
        });

        // Tournament control
        document.addEventListener('click', (e) => {
            if (e.target.matches('.start-tournament-btn')) {
                this.startTournament();
            }
            if (e.target.matches('.stop-tournament-btn')) {
                this.stopTournament();
            }
            if (e.target.matches('.configure-tournament-btn')) {
                this.showTournamentConfigModal();
            }
        });

        // Security monitoring
        document.addEventListener('click', (e) => {
            if (e.target.matches('.security-policy-btn')) {
                this.showSecurityPolicyModal();
            }
            if (e.target.matches('.incident-response-btn')) {
                this.showIncidentResponseModal();
            }
        });

        // System configuration
        document.addEventListener('click', (e) => {
            if (e.target.matches('.system-settings-btn')) {
                this.showSystemSettingsModal();
            }
            if (e.target.matches('.maintenance-btn')) {
                this.showMaintenanceModal();
            }
        });
    }

    /**
     * Initialize admin interface
     */
    initializeAdminInterface() {
        const adminContainer = document.getElementById('admin-container');
        if (!adminContainer) return;

        // Create admin navigation
        const adminNav = this.createAdminNavigation();
        adminContainer.appendChild(adminNav);

        // Create admin content area
        const adminContent = this.createAdminContent();
        adminContainer.appendChild(adminContent);

        // Show default feature
        this.activateFeature('participant-management');
    }

    /**
     * Create admin navigation
     */
    createAdminNavigation() {
        const nav = document.createElement('div');
        nav.className = 'admin-navigation';
        
        let navHtml = '<h3>Admin Panel</h3><div class="admin-features">';
        
        for (const [featureId, feature] of this.adminFeatures) {
            if (this.hasPermission(feature.permissions)) {
                navHtml += `
                    <button class="admin-feature-btn" data-feature="${featureId}">
                        <i class="${feature.icon}"></i>
                        <span>${feature.name}</span>
                    </button>
                `;
            }
        }
        
        navHtml += '</div>';
        nav.innerHTML = navHtml;
        
        return nav;
    }

    /**
     * Create admin content area
     */
    createAdminContent() {
        const content = document.createElement('div');
        content.className = 'admin-content';
        content.id = 'admin-content';
        return content;
    }

    /**
     * Check if user has required permissions
     */
    hasPermission(requiredPermissions) {
        if (!Array.isArray(requiredPermissions)) {
            requiredPermissions = [requiredPermissions];
        }
        
        return requiredPermissions.every(permission => 
            this.permissions.has(permission)
        );
    }

    /**
     * Activate admin feature
     */
    activateFeature(featureId) {
        const feature = this.adminFeatures.get(featureId);
        if (!feature || !this.hasPermission(feature.permissions)) {
            this.showAccessDenied();
            return;
        }

        // Update active state
        document.querySelectorAll('.admin-feature-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-feature="${featureId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Load feature component
        this.loadFeatureComponent(feature.component, featureId);
    }

    /**
     * Load feature component
     */
    loadFeatureComponent(componentName, featureId) {
        const contentArea = document.getElementById('admin-content');
        if (!contentArea) return;

        switch (componentName) {
            case 'participantManager':
                contentArea.innerHTML = this.renderParticipantManager();
                break;
            case 'tournamentController':
                contentArea.innerHTML = this.renderTournamentController();
                break;
            case 'securityMonitor':
                contentArea.innerHTML = this.renderSecurityMonitor();
                break;
            case 'systemConfig':
                contentArea.innerHTML = this.renderSystemConfig();
                break;
            case 'analyticsDashboard':
                contentArea.innerHTML = this.renderAnalyticsDashboard();
                break;
            case 'reportGenerator':
                contentArea.innerHTML = this.renderReportGenerator();
                break;
            default:
                contentArea.innerHTML = '<p>Feature not implemented yet.</p>';
        }
    }

    /**
     * Render participant manager
     */
    renderParticipantManager() {
        return `
            <div class="admin-feature-content">
                <h2>Participant Management</h2>
                <p>Manage tournament participants, view profiles, and handle submissions.</p>
                
                <div class="management-controls">
                    <button class="btn btn-primary add-participant-btn">
                        <i class="fas fa-user-plus"></i>
                        Add Participant
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-download"></i>
                        Export Participants
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-upload"></i>
                        Import Participants
                    </button>
                </div>
                
                <div class="participants-table">
                    <div class="table-controls">
                        <input type="text" placeholder="Search participants..." class="participant-search">
                        <select class="participant-filter">
                            <option value="all">All Participants</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th><input type="checkbox" class="select-all"></th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Submissions</th>
                                <th>Best Rank</th>
                                <th>Last Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="checkbox" class="participant-select"></td>
                                <td>@alice_dev</td>
                                <td>alice@example.com</td>
                                <td><span class="status-badge active">Active</span></td>
                                <td>8</td>
                                <td>1st</td>
                                <td>2 hours ago</td>
                                <td>
                                    <button class="btn-icon edit-participant-btn" data-participant-id="alice_001" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon remove-participant-btn" data-participant-id="alice_001" title="Remove">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td><input type="checkbox" class="participant-select"></td>
                                <td>@bob_coder</td>
                                <td>bob@example.com</td>
                                <td><span class="status-badge active">Active</span></td>
                                <td>6</td>
                                <td>3rd</td>
                                <td>1 day ago</td>
                                <td>
                                    <button class="btn-icon edit-participant-btn" data-participant-id="bob_002" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon remove-participant-btn" data-participant-id="bob_002" title="Remove">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Render tournament controller
     */
    renderTournamentController() {
        return `
            <div class="admin-feature-content">
                <h2>Tournament Control</h2>
                <p>Control tournament execution, settings, and rules.</p>
                
                <div class="tournament-status">
                    <h3>Current Status</h3>
                    <div class="status-indicator">
                        <span class="status-dot running"></span>
                        <span class="status-text">Tournament is running</span>
                    </div>
                    <div class="status-details">
                        <p><strong>Started:</strong> 2024-01-15 10:00:00</p>
                        <p><strong>Duration:</strong> 5 days, 3 hours</p>
                        <p><strong>Participants:</strong> 42 active</p>
                        <p><strong>Submissions:</strong> 156 total</p>
                    </div>
                </div>
                
                <div class="tournament-controls">
                    <button class="btn btn-success start-tournament-btn">
                        <i class="fas fa-play"></i>
                        Start Tournament
                    </button>
                    <button class="btn btn-danger stop-tournament-btn">
                        <i class="fas fa-stop"></i>
                        Stop Tournament
                    </button>
                    <button class="btn btn-secondary configure-tournament-btn">
                        <i class="fas fa-cog"></i>
                        Configure Tournament
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-pause"></i>
                        Pause Tournament
                    </button>
                </div>
                
                <div class="tournament-settings">
                    <h3>Current Settings</h3>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label>Max Execution Time:</label>
                            <span>30 seconds</span>
                        </div>
                        <div class="setting-item">
                            <label>Max Memory Usage:</label>
                            <span>4 GB</span>
                        </div>
                        <div class="setting-item">
                            <label>Allowed Languages:</label>
                            <span>Java, Python, C++, Go</span>
                        </div>
                        <div class="setting-item">
                            <label>Scoring Method:</label>
                            <span>Time + Memory weighted</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render security monitor
     */
    renderSecurityMonitor() {
        return `
            <div class="admin-feature-content">
                <h2>Security Monitoring</h2>
                <p>Monitor security events, configure policies, and handle incidents.</p>
                
                <div class="security-overview">
                    <div class="security-stats">
                        <div class="security-stat">
                            <div class="stat-number">156</div>
                            <div class="stat-label">Total Scans</div>
                        </div>
                        <div class="security-stat">
                            <div class="stat-number success">142</div>
                            <div class="stat-label">Passed</div>
                        </div>
                        <div class="security-stat">
                            <div class="stat-number error">14</div>
                            <div class="stat-label">Failed</div>
                        </div>
                        <div class="security-stat">
                            <div class="stat-number">91%</div>
                            <div class="stat-label">Security Score</div>
                        </div>
                    </div>
                </div>
                
                <div class="security-controls">
                    <button class="btn btn-primary security-policy-btn">
                        <i class="fas fa-shield-alt"></i>
                        Security Policy
                    </button>
                    <button class="btn btn-secondary incident-response-btn">
                        <i class="fas fa-exclamation-triangle"></i>
                        Incident Response
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-eye"></i>
                        View Logs
                    </button>
                </div>
                
                <div class="recent-incidents">
                    <h3>Recent Security Incidents</h3>
                    <div class="incidents-list">
                        <div class="incident-item warning">
                            <div class="incident-header">
                                <span class="incident-level">Warning</span>
                                <span class="incident-time">2 hours ago</span>
                            </div>
                            <div class="incident-description">
                                Suspicious import detected in submission from @bob_coder
                            </div>
                            <div class="incident-actions">
                                <button class="btn btn-sm btn-secondary">Review</button>
                                <button class="btn btn-sm btn-danger">Block</button>
                            </div>
                        </div>
                        <div class="incident-item error">
                            <div class="incident-header">
                                <span class="incident-level">Error</span>
                                <span class="incident-time">4 hours ago</span>
                            </div>
                            <div class="incident-description">
                                File size limit exceeded by @carol_optimizer
                            </div>
                            <div class="incident-actions">
                                <button class="btn btn-sm btn-secondary">Review</button>
                                <button class="btn btn-sm btn-danger">Block</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render system configuration
     */
    renderSystemConfig() {
        return `
            <div class="admin-feature-content">
                <h2>System Configuration</h2>
                <p>Configure system settings, integrations, and maintenance.</p>
                
                <div class="config-sections">
                    <div class="config-section">
                        <h3>General Settings</h3>
                        <div class="config-form">
                            <div class="form-group">
                                <label>Tournament Name:</label>
                                <input type="text" value="Billion Row Challenge" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Admin Email:</label>
                                <input type="email" value="admin@tournament.com" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Max Participants:</label>
                                <input type="number" value="1000" class="form-control">
                            </div>
                        </div>
                    </div>
                    
                    <div class="config-section">
                        <h3>Integration Settings</h3>
                        <div class="config-form">
                            <div class="form-group">
                                <label>GitHub Integration:</label>
                                <select class="form-control">
                                    <option>Enabled</option>
                                    <option>Disabled</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Discord Webhook:</label>
                                <input type="url" placeholder="https://discord.com/api/webhooks/..." class="form-control">
                            </div>
                        </div>
                    </div>
                    
                    <div class="config-section">
                        <h3>Maintenance</h3>
                        <div class="maintenance-controls">
                            <button class="btn btn-warning maintenance-btn">
                                <i class="fas fa-tools"></i>
                                Maintenance Mode
                            </button>
                            <button class="btn btn-secondary">
                                <i class="fas fa-database"></i>
                                Backup Database
                            </button>
                            <button class="btn btn-secondary">
                                <i class="fas fa-trash"></i>
                                Clear Cache
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="config-actions">
                    <button class="btn btn-primary">Save Configuration</button>
                    <button class="btn btn-secondary">Reset to Defaults</button>
                </div>
            </div>
        `;
    }

    /**
     * Render analytics dashboard
     */
    renderAnalyticsDashboard() {
        return `
            <div class="admin-feature-content">
                <h2>Analytics Dashboard</h2>
                <p>Advanced analytics, reporting, and data insights.</p>
                
                <div class="analytics-overview">
                    <div class="analytics-stats">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number">42</div>
                                <div class="stat-label">Total Participants</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-code"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number">156</div>
                                <div class="stat-label">Total Submissions</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number">432ms</div>
                                <div class="stat-label">Avg Execution Time</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-controls">
                    <button class="btn btn-primary" onclick="window.tournamentDashboard.switchView('overview')">
                        <i class="fas fa-chart-pie"></i>
                        Overview
                    </button>
                    <button class="btn btn-secondary" onclick="window.tournamentDashboard.switchView('performance')">
                        <i class="fas fa-tachometer-alt"></i>
                        Performance
                    </button>
                    <button class="btn btn-secondary" onclick="window.tournamentDashboard.switchView('security')">
                        <i class="fas fa-shield-alt"></i>
                        Security
                    </button>
                    <button class="btn btn-secondary" onclick="window.tournamentDashboard.switchView('trends')">
                        <i class="fas fa-chart-line"></i>
                        Trends
                    </button>
                </div>
                
                <div class="analytics-content">
                    <p>Use the buttons above to navigate to different analytics views, or go to the main <a href="dashboard.html">Dashboard</a> for full analytics.</p>
                </div>
            </div>
        `;
    }

    /**
     * Render report generator
     */
    renderReportGenerator() {
        return `
            <div class="admin-feature-content">
                <h2>Report Generation</h2>
                <p>Generate and export comprehensive tournament reports.</p>
                
                <div class="report-templates">
                    <h3>Available Report Templates</h3>
                    <div class="template-grid">
                        <div class="template-card">
                            <h4>Tournament Summary</h4>
                            <p>Comprehensive overview of tournament performance and statistics</p>
                            <button class="btn btn-primary generate-report-btn" data-report-type="tournament-summary">
                                Generate Report
                            </button>
                        </div>
                        <div class="template-card">
                            <h4>Performance Analysis</h4>
                            <p>Detailed analysis of solution performance across languages</p>
                            <button class="btn btn-primary generate-report-btn" data-report-type="performance-analysis">
                                Generate Report
                            </button>
                        </div>
                        <div class="template-card">
                            <h4>Security Audit</h4>
                            <p>Security analysis and compliance report</p>
                            <button class="btn btn-primary generate-report-btn" data-report-type="security-audit">
                                Generate Report
                            </button>
                        </div>
                        <div class="template-card">
                            <h4>Participant Report</h4>
                            <p>Individual participant performance and statistics</p>
                            <button class="btn btn-primary generate-report-btn" data-report-type="participant-report">
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="report-history">
                    <h3>Recent Reports</h3>
                    <div class="reports-list">
                        <div class="report-item">
                            <div class="report-info">
                                <span class="report-name">Tournament Summary</span>
                                <span class="report-date">2024-01-15 14:30</span>
                            </div>
                            <div class="report-actions">
                                <button class="btn btn-sm btn-secondary">View</button>
                                <button class="btn btn-sm btn-secondary">Download</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Show admin interface
     */
    showAdminInterface() {
        const adminContainer = document.getElementById('admin-container');
        if (adminContainer) {
            adminContainer.style.display = 'block';
        }
    }

    /**
     * Hide admin interface
     */
    hideAdminInterface() {
        const adminContainer = document.getElementById('admin-container');
        if (adminContainer) {
            adminContainer.style.display = 'none';
        }
    }

    /**
     * Show access denied message
     */
    showAccessDenied() {
        const adminContainer = document.getElementById('admin-container');
        if (adminContainer) {
            adminContainer.innerHTML = `
                <div class="access-denied">
                    <h2>Access Denied</h2>
                    <p>You don't have permission to access the admin panel.</p>
                    <p>Please contact a system administrator if you believe this is an error.</p>
                </div>
            `;
        }
    }

    /**
     * Modal management methods
     */
    showAddParticipantModal() {
        // Implementation for add participant modal
        this.showModal('Add Participant', this.getAddParticipantForm());
    }

    showEditParticipantModal(participantId) {
        // Implementation for edit participant modal
        this.showModal('Edit Participant', this.getEditParticipantForm(participantId));
    }

    showRemoveParticipantModal(participantId) {
        // Implementation for remove participant modal
        this.showModal('Remove Participant', this.getRemoveParticipantForm(participantId));
    }

    showTournamentConfigModal() {
        // Implementation for tournament config modal
        this.showModal('Tournament Configuration', this.getTournamentConfigForm());
    }

    showSecurityPolicyModal() {
        // Implementation for security policy modal
        this.showModal('Security Policy', this.getSecurityPolicyForm());
    }

    showIncidentResponseModal() {
        // Implementation for incident response modal
        this.showModal('Incident Response', this.getIncidentResponseForm());
    }

    showSystemSettingsModal() {
        // Implementation for system settings modal
        this.showModal('System Settings', this.getSystemSettingsForm());
    }

    showMaintenanceModal() {
        // Implementation for maintenance modal
        this.showModal('Maintenance Mode', this.getMaintenanceForm());
    }

    /**
     * Generic modal display
     */
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal functionality
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Form generation methods (placeholders)
     */
    getAddParticipantForm() {
        return `
            <form class="admin-form">
                <div class="form-group">
                    <label>Username:</label>
                    <input type="text" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Role:</label>
                    <select class="form-control">
                        <option value="participant">Participant</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Add Participant</button>
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                </div>
            </form>
        `;
    }

    getEditParticipantForm(participantId) {
        return `<p>Edit form for participant ${participantId}</p>`;
    }

    getRemoveParticipantForm(participantId) {
        return `<p>Remove confirmation for participant ${participantId}</p>`;
    }

    getTournamentConfigForm() {
        return `<p>Tournament configuration form</p>`;
    }

    getSecurityPolicyForm() {
        return `<p>Security policy configuration form</p>`;
    }

    getIncidentResponseForm() {
        return `<p>Incident response form</p>`;
    }

    getSystemSettingsForm() {
        return `<p>System settings form</p>`;
    }

    getMaintenanceForm() {
        return `<p>Maintenance mode configuration form</p>`;
    }

    /**
     * Action methods
     */
    async startTournament() {
        try {
            // Implementation for starting tournament
            this.showSuccessMessage('Tournament started successfully!');
        } catch (error) {
            this.showErrorMessage('Failed to start tournament: ' + error.message);
        }
    }

    async stopTournament() {
        try {
            // Implementation for stopping tournament
            this.showSuccessMessage('Tournament stopped successfully!');
        } catch (error) {
            this.showErrorMessage('Failed to stop tournament: ' + error.message);
        }
    }

    /**
     * Utility methods
     */
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

// Initialize admin system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tournamentAdmin = new TournamentAdmin();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TournamentAdmin;
}
