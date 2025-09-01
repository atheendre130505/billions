#!/bin/bash

# GitHub Actions Self-Hosted Runner Setup Script
# Sets up a secure runner for tournament execution

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1
}

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

# Configuration
RUNNER_VERSION="2.311.0"
RUNNER_DIR="$HOME/actions-runner"
SERVICE_NAME="github-actions-runner"
REPO_URL=""
TOKEN=""
RUNNER_LABELS="billion-rows,linux,amd64,secure"

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "This script should not be run as root"
        exit 1
    fi
    
    # Check if required commands exist
    local required_commands=("curl" "wget" "tar" "systemctl" "docker")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            print_error "Required command not found: $cmd"
            exit 1
        fi
    done
    
    # Check Docker
    if ! docker info &> /dev/null; then
        print_error "Docker is not running or not accessible"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to get user input
get_user_input() {
    print_header "GitHub Actions Runner Setup"
    echo ""
    echo "This script will set up a self-hosted GitHub Actions runner for the tournament system."
    echo "You'll need your GitHub repository URL and a personal access token."
    echo ""
    
    # Get repository URL
    while [ -z "$REPO_URL" ]; do
        read -p "Enter your GitHub repository URL (e.g., https://github.com/username/billion-rows): " REPO_URL
        if [[ ! "$REPO_URL" =~ ^https://github\.com/[^/]+/[^/]+$ ]]; then
            print_error "Invalid repository URL format"
            REPO_URL=""
        fi
    done
    
    # Get personal access token
    while [ -z "$TOKEN" ]; do
        echo ""
        echo "You need a Personal Access Token with 'repo' and 'workflow' permissions."
        echo "Create one at: https://github.com/settings/tokens"
        echo ""
        read -s -p "Enter your Personal Access Token: " TOKEN
        echo ""
        
        if [ -z "$TOKEN" ]; then
            print_error "Token cannot be empty"
        fi
    done
    
    # Confirm setup
    echo ""
    print_status "Setup Configuration:"
    echo "  Repository: $REPO_URL"
    echo "  Runner Directory: $RUNNER_DIR"
    echo "  Service Name: $SERVICE_NAME"
    echo "  Labels: $RUNNER_LABELS"
    echo ""
    
    read -p "Proceed with setup? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        print_status "Setup cancelled"
        exit 0
    fi
}

# Function to download and extract runner
download_runner() {
    print_status "Downloading GitHub Actions runner..."
    
    # Create runner directory
    mkdir -p "$RUNNER_DIR"
    cd "$RUNNER_DIR"
    
    # Download runner
    local runner_url="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
    print_status "Downloading from: $runner_url"
    
    if curl -L -o "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" "$runner_url"; then
        print_success "Download completed"
    else
        print_error "Download failed"
        exit 1
    fi
    
    # Extract runner
    print_status "Extracting runner..."
    if tar xzf "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"; then
        print_success "Extraction completed"
    else
        print_error "Extraction failed"
        exit 1
    fi
    
    # Clean up download
    rm "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
}

# Function to configure runner
configure_runner() {
    print_status "Configuring GitHub Actions runner..."
    
    cd "$RUNNER_DIR"
    
    # Extract repository owner and name
    local repo_path=$(echo "$REPO_URL" | sed 's|https://github.com/||')
    local owner=$(echo "$repo_path" | cut -d'/' -f1)
    local repo=$(echo "$repo_path" | cut -d'/' -f2)
    
    # Configure runner
    print_status "Running runner configuration..."
    
    if ./config.sh --url "https://github.com/$owner/$repo" --token "$TOKEN" --labels "$RUNNER_LABELS" --name "$(hostname)-tournament-runner" --unattended; then
        print_success "Runner configuration completed"
    else
        print_error "Runner configuration failed"
        exit 1
    fi
}

# Function to install runner as service
install_service() {
    print_status "Installing runner as systemd service..."
    
    cd "$RUNNER_DIR"
    
    # Install service
    if sudo ./svc.sh install "$USER"; then
        print_success "Service installation completed"
    else
        print_error "Service installation failed"
        exit 1
    fi
    
    # Start service
    print_status "Starting runner service..."
    if sudo ./svc.sh start; then
        print_success "Runner service started"
    else
        print_error "Failed to start runner service"
        exit 1
    fi
    
    # Enable service to start on boot
    print_status "Enabling service to start on boot..."
    if sudo systemctl enable "$SERVICE_NAME"; then
        print_success "Service enabled for boot"
    else
        print_warning "Failed to enable service for boot"
    fi
}

# Function to verify runner status
verify_runner() {
    print_status "Verifying runner status..."
    
    # Wait a moment for service to start
    sleep 5
    
    # Check service status
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_success "Runner service is running"
    else
        print_error "Runner service is not running"
        print_status "Checking service logs..."
        sudo journalctl -u "$SERVICE_NAME" --no-pager -n 20
        exit 1
    fi
    
    # Check if runner is connected
    print_status "Checking runner connection..."
    if [ -f "$RUNNER_DIR/.runner" ]; then
        print_success "Runner configuration file found"
    else
        print_error "Runner configuration file not found"
        exit 1
    fi
}

# Function to setup Docker permissions
setup_docker_permissions() {
    print_status "Setting up Docker permissions for runner..."
    
    # Add user to docker group if not already added
    if ! groups "$USER" | grep -q docker; then
        print_status "Adding user to docker group..."
        sudo usermod -aG docker "$USER"
        print_warning "You may need to log out and back in for Docker permissions to take effect"
    else
        print_success "User already in docker group"
    fi
    
    # Verify Docker access
    if docker info &> /dev/null; then
        print_success "Docker access verified"
    else
        print_warning "Docker access not available - you may need to log out and back in"
    fi
}

# Function to create runner health check
create_health_check() {
    print_status "Creating runner health check script..."
    
    cat > "$RUNNER_DIR/health_check.sh" << 'EOF'
#!/bin/bash

# Runner health check script
RUNNER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME="github-actions-runner"

# Check if service is running
if ! systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "❌ Runner service is not running"
    exit 1
fi

# Check if runner is responsive
if [ -f "$RUNNER_DIR/.runner" ]; then
    echo "✅ Runner is configured and running"
    exit 0
else
    echo "❌ Runner configuration not found"
    exit 1
fi
EOF
    
    chmod +x "$RUNNER_DIR/health_check.sh"
    print_success "Health check script created"
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up runner monitoring..."
    
    # Create monitoring script
    cat > "$RUNNER_DIR/monitor_runner.sh" << 'EOF'
#!/bin/bash

# Runner monitoring script
RUNNER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME="github-actions-runner"
LOG_FILE="$RUNNER_DIR/runner_monitor.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check runner status
if ! systemctl is-active --quiet "$SERVICE_NAME"; then
    log_message "ERROR: Runner service is not running"
    echo "❌ Runner service is not running"
    
    # Try to restart service
    log_message "Attempting to restart runner service"
    sudo systemctl restart "$SERVICE_NAME"
    
    # Wait and check again
    sleep 10
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_message "SUCCESS: Runner service restarted successfully"
        echo "✅ Runner service restarted successfully"
    else
        log_message "ERROR: Failed to restart runner service"
        echo "❌ Failed to restart runner service"
    fi
else
    log_message "INFO: Runner service is running normally"
    echo "✅ Runner service is running normally"
fi

# Check disk space
DISK_USAGE=$(df "$RUNNER_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    log_message "WARNING: Disk usage is high: ${DISK_USAGE}%"
    echo "⚠️  Disk usage is high: ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    log_message "WARNING: Memory usage is high: ${MEMORY_USAGE}%"
    echo "⚠️  Memory usage is high: ${MEMORY_USAGE}%"
fi

# Clean up old logs
find "$RUNNER_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
EOF
    
    chmod +x "$RUNNER_DIR/monitor_runner.sh"
    
    # Create systemd timer for monitoring
    cat > "/tmp/runner-monitor.timer" << EOF
[Unit]
Description=GitHub Actions Runner Monitor Timer
After=network.target

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
Persistent=true

[Install]
WantedBy=timers.target
EOF
    
    cat > "/tmp/runner-monitor.service" << EOF
[Unit]
Description=GitHub Actions Runner Monitor
After=network.target

[Service]
Type=oneshot
User=$USER
WorkingDirectory=$RUNNER_DIR
ExecStart=$RUNNER_DIR/monitor_runner.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    # Install monitoring service
    sudo cp "/tmp/runner-monitor.timer" "/etc/systemd/system/"
    sudo cp "/tmp/runner-monitor.service" "/etc/systemd/system/"
    sudo systemctl daemon-reload
    sudo systemctl enable runner-monitor.timer
    sudo systemctl start runner-monitor.timer
    
    print_success "Monitoring setup completed"
}

# Function to display setup summary
display_summary() {
    print_header "Setup Complete!"
    echo ""
    echo "🎉 GitHub Actions runner has been successfully set up!"
    echo ""
    echo "📋 Setup Summary:"
    echo "  ✅ Runner downloaded and configured"
    echo "  ✅ Service installed and started"
    echo "  ✅ Docker permissions configured"
    echo "  ✅ Health monitoring enabled"
    echo ""
    echo "🔧 Service Information:"
    echo "  Service Name: $SERVICE_NAME"
    echo "  Runner Directory: $RUNNER_DIR"
    echo "  Status: $(systemctl is-active $SERVICE_NAME)"
    echo "  Enabled: $(systemctl is-enabled $SERVICE_NAME)"
    echo ""
    echo "📊 Useful Commands:"
    echo "  Check status: sudo systemctl status $SERVICE_NAME"
    echo "  View logs: sudo journalctl -u $SERVICE_NAME -f"
    echo "  Restart: sudo systemctl restart $SERVICE_NAME"
    echo "  Stop: sudo systemctl stop $SERVICE_NAME"
    echo ""
    echo "🔍 Health Check:"
    echo "  Manual check: $RUNNER_DIR/health_check.sh"
    echo "  Monitoring: $RUNNER_DIR/monitor_runner.sh"
    echo ""
    echo "🌐 Next Steps:"
    echo "  1. Go to your GitHub repository"
    echo "  2. Navigate to Settings → Actions → Runners"
    echo "  3. Verify your runner appears in the list"
    echo "  4. Create a test workflow to verify functionality"
    echo ""
    echo "📚 Documentation:"
    echo "  Runner docs: https://docs.github.com/en/actions/hosting-your-own-runners"
    echo "  Troubleshooting: https://docs.github.com/en/actions/hosting-your-own-runners/troubleshooting"
    echo ""
    print_success "Your tournament system is now ready for secure GitHub Actions execution!"
}

# Function to cleanup on error
cleanup() {
    print_error "Setup failed. Cleaning up..."
    
    if [ -d "$RUNNER_DIR" ]; then
        print_status "Removing runner directory..."
        rm -rf "$RUNNER_DIR"
    fi
    
    if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
        print_status "Stopping runner service..."
        sudo systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    fi
    
    if systemctl is-enabled --quiet "$SERVICE_NAME" 2>/dev/null; then
        print_status "Disabling runner service..."
        sudo systemctl disable "$SERVICE_NAME" 2>/dev/null || true
    fi
    
    print_status "Cleanup completed"
}

# Main setup function
main() {
    # Set up error handling
    trap cleanup ERR
    
    print_header "GitHub Actions Runner Setup for Tournament System"
    echo ""
    
    # Run setup steps
    check_prerequisites
    get_user_input
    download_runner
    configure_runner
    install_service
    verify_runner
    setup_docker_permissions
    create_health_check
    setup_monitoring
    display_summary
    
    # Remove error trap
    trap - ERR
    
    print_success "Setup completed successfully!"
}

# Check if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi




