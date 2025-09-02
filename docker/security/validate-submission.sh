#!/bin/bash

# Security Validation Script for Tournament Submissions
# Checks for malicious patterns, security vulnerabilities, and policy violations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${BLUE}[SECURITY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[BLOCKED]${NC} $1"
}

# Configuration
SUBMISSION_DIR="/workspace/submissions"
LOG_DIR="/workspace/logs"
SECURITY_LEVEL="maximum"
MAX_FILE_SIZE_MB=10
BLOCKED_PATTERNS=(
    "system("
    "exec("
    "eval("
    "Runtime.getRuntime().exec"
    "ProcessBuilder"
    "subprocess.Popen"
    "os.system"
    "os.popen"
    "exec.Command"
    "syscall"
    "fork"
    "clone"
    "kill"
    "signal"
    "ptrace"
    "chmod"
    "chown"
    "setuid"
    "setgid"
    "suid"
    "sgid"
    "sticky"
    "umask"
    "mount"
    "umount"
    "reboot"
    "halt"
    "shutdown"
    "init"
    "telinit"
    "wall"
    "write"
    "mesg"
    "talk"
    "finger"
    "rsh"
    "rlogin"
    "rexec"
    "rsh"
    "rcp"
    "ftp"
    "tftp"
    "wget"
    "curl"
    "lynx"
    "nc"
    "netcat"
    "socat"
    "nmap"
    "ping"
    "traceroute"
    "dig"
    "nslookup"
    "host"
    "whois"
    "ssh"
    "scp"
    "sftp"
    "rsync"
    "tar"
    "gzip"
    "bzip2"
    "xz"
    "zip"
    "unzip"
    "rar"
    "7z"
    "dd"
    "fdisk"
    "mkfs"
    "fsck"
    "badblocks"
    "smartctl"
    "hdparm"
    "hdparm"
    "smartctl"
    "badblocks"
    "fsck"
    "mkfs"
    "fdisk"
    "dd"
    "7z"
    "rar"
    "unzip"
    "zip"
    "xz"
    "bzip2"
    "gzip"
    "tar"
    "rsync"
    "sftp"
    "scp"
    "ssh"
    "whois"
    "host"
    "nslookup"
    "dig"
    "traceroute"
    "ping"
    "nmap"
    "socat"
    "netcat"
    "nc"
    "lynx"
    "curl"
    "wget"
    "tftp"
    "ftp"
    "rcp"
    "rsh"
    "rexec"
    "rlogin"
    "rsh"
    "finger"
    "talk"
    "mesg"
    "write"
    "wall"
    "init"
    "telinit"
    "shutdown"
    "halt"
    "reboot"
    "umount"
    "mount"
    "umask"
    "sticky"
    "sgid"
    "suid"
    "setgid"
    "setuid"
    "chown"
    "chmod"
    "signal"
    "kill"
    "clone"
    "fork"
    "syscall"
    "exec.Command"
    "os.popen"
    "os.system"
    "subprocess.Popen"
    "ProcessBuilder"
    "Runtime.getRuntime().exec"
    "eval("
    "exec("
    "system("
)

SUSPICIOUS_PATTERNS=(
    "import os"
    "import sys"
    "import subprocess"
    "import multiprocessing"
    "import threading"
    "import socket"
    "import urllib"
    "import requests"
    "import ftplib"
    "import telnetlib"
    "import smtplib"
    "import poplib"
    "import imaplib"
    "import nntplib"
    "import http.client"
    "import urllib.request"
    "import urllib.parse"
    "import urllib.error"
    "import urllib.robotparser"
    "import urllib.response"
    "import urllib.robotparser"
    "import urllib.error"
    "import urllib.parse"
    "import urllib.request"
    "import http.client"
    "import imaplib."
    "import poplib."
    "import smtplib."
    "import telnetlib."
    "import ftplib."
    "import requests."
    "import urllib."
    "import socket."
    "import threading."
    "import multiprocessing."
    "import subprocess."
    "import sys."
    "import os."
    "java.lang.Runtime"
    "java.lang.ProcessBuilder"
    "java.lang.Process"
    "java.lang.ProcessBuilder"
    "java.lang.Runtime"
    "os."
    "sys."
    "subprocess."
    "multiprocessing."
    "threading."
    "socket."
    "urllib."
    "requests."
    "ftplib."
    "telnetlib."
    "smtplib."
    "poplib."
    "imaplib."
    "nntplib."
    "http.client"
    "urllib.request"
    "urllib.parse"
    "urllib.error"
    "urllib.robotparser"
    "urllib.response"
    "urllib.robotparser"
    "urllib.error"
    "urllib.parse"
    "urllib.request"
    "http.client"
    "imaplib."
    "poplib."
    "smtplib."
    "telnetlib."
    "ftplib."
    "requests."
    "urllib."
    "socket."
    "threading."
    "multiprocessing."
    "subprocess."
    "sys."
    "os."
    "Runtime."
    "ProcessBuilder."
    "Process."
    "ProcessBuilder."
    "Runtime."
)

# Function to check file size
check_file_size() {
    local file="$1"
    local size_mb=$(du -m "$file" | cut -f1)
    
    if [ "$size_mb" -gt "$MAX_FILE_SIZE_MB" ]; then
        print_error "File too large: ${size_mb}MB (max: ${MAX_FILE_SIZE_MB}MB)"
        return 1
    fi
    
    print_success "File size OK: ${size_mb}MB"
    return 0
}

# Function to check for blocked patterns
check_blocked_patterns() {
    local file="$1"
    local violations=0
    
    print_status "Checking for blocked patterns..."
    
    for pattern in "${BLOCKED_PATTERNS[@]}"; do
        if grep -q "$pattern" "$file" 2>/dev/null; then
            print_error "Blocked pattern found: $pattern"
            violations=$((violations + 1))
        fi
    done
    
    if [ $violations -eq 0 ]; then
        print_success "No blocked patterns found"
        return 0
    else
        print_error "Found $violations blocked pattern(s)"
        return 1
    fi
}

# Function to check for suspicious patterns
check_suspicious_patterns() {
    local file="$1"
    local warnings=0
    
    print_status "Checking for suspicious patterns..."
    
    for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
        if grep -q "$pattern" "$file" 2>/dev/null; then
            print_warning "Suspicious pattern found: $pattern"
            warnings=$((warnings + 1))
        fi
    done
    
    if [ $warnings -eq 0 ]; then
        print_success "No suspicious patterns found"
    else
        print_warning "Found $warnings suspicious pattern(s) - manual review recommended"
    fi
    
    return 0
}

# Function to check file permissions
check_file_permissions() {
    local file="$1"
    local permissions=$(stat -c "%a" "$file")
    
    if [ "$permissions" != "644" ] && [ "$permissions" != "664" ]; then
        print_warning "Unusual file permissions: $permissions"
    else
        print_success "File permissions OK: $permissions"
    fi
    
    return 0
}

# Function to check for hidden files
check_hidden_files() {
    local submission_dir="$1"
    local hidden_files=$(find "$submission_dir" -name ".*" -type f 2>/dev/null | wc -l)
    
    if [ "$hidden_files" -gt 0 ]; then
        print_warning "Hidden files found: $hidden_files"
        find "$submission_dir" -name ".*" -type f 2>/dev/null | while read -r file; do
            print_warning "  Hidden file: $file"
        done
    else
        print_success "No hidden files found"
    fi
    
    return 0
}

# Function to check for executable files
check_executable_files() {
    local submission_dir="$1"
    local exec_files=$(find "$submission_dir" -type f -executable 2>/dev/null | wc -l)
    
    if [ "$exec_files" -gt 0 ]; then
        print_warning "Executable files found: $exec_files"
        find "$submission_dir" -type f -executable 2>/dev/null | while read -r file; do
            print_warning "  Executable: $file"
        done
    else
        print_success "No executable files found"
    fi
    
    return 0
}

# Function to check for network-related code
check_network_code() {
    local file="$1"
    local network_patterns=(
        "socket"
        "http"
        "https"
        "ftp"
        "tcp"
        "udp"
        "ip"
        "dns"
        "url"
        "port"
        "bind"
        "listen"
        "accept"
        "connect"
        "send"
        "recv"
        "read"
        "write"
    )
    
    local found=0
    for pattern in "${network_patterns[@]}"; do
        if grep -qi "$pattern" "$file" 2>/dev/null; then
            if [ $found -eq 0 ]; then
                print_warning "Network-related code detected:"
                found=1
            fi
            print_warning "  Pattern: $pattern"
        fi
    done
    
    if [ $found -eq 0 ]; then
        print_success "No network-related code detected"
    fi
    
    return 0
}

# Function to check for file system access
check_filesystem_access() {
    local file="$1"
    local fs_patterns=(
        "File"
        "file"
        "Path"
        "path"
        "Directory"
        "directory"
        "Folder"
        "folder"
        "read"
        "write"
        "delete"
        "remove"
        "create"
        "mkdir"
        "rmdir"
        "rename"
        "move"
        "copy"
        "link"
        "symlink"
    )
    
    local found=0
    for pattern in "${fs_patterns[@]}"; do
        if grep -qi "$pattern" "$file" 2>/dev/null; then
            if [ $found -eq 0 ]; then
                print_warning "File system access detected:"
                found=1
            fi
            print_warning "  Pattern: $pattern"
        fi
    done
    
    if [ $found -eq 0 ]; then
        print_success "No file system access detected"
    fi
    
    return 0
}

# Function to validate submission structure
validate_submission_structure() {
    local submission_dir="$1"
    local language="$2"
    
    print_status "Validating submission structure for $language..."
    
    case $language in
        java)
            if [ ! -f "$submission_dir/Solution.java" ]; then
                print_error "Missing Solution.java file"
                return 1
            fi
            if ! grep -q "class Solution" "$submission_dir/Solution.java"; then
                print_error "Solution.java must contain 'Solution' class"
                return 1
            fi
            if ! grep -q "public static void main" "$submission_dir/Solution.java"; then
                print_error "Solution.java must contain 'main' method"
                return 1
            fi
            ;;
        python)
            if [ ! -f "$submission_dir/solution.py" ]; then
                print_error "Missing solution.py file"
                return 1
            fi
            if ! grep -q "def main" "$submission_dir/solution.py"; then
                print_error "solution.py must contain 'main' function"
                return 1
            fi
            ;;
        cpp)
            if [ ! -f "$submission_dir/solution.cpp" ]; then
                print_error "Missing solution.cpp file"
                return 1
            fi
            if ! grep -q "int main" "$submission_dir/solution.cpp"; then
                print_error "solution.cpp must contain 'main' function"
                return 1
            fi
            ;;
        go)
            if [ ! -f "$submission_dir/solution.go" ]; then
                print_error "Missing solution.go file"
                return 1
            fi
            if ! grep -q "func main" "$submission_dir/solution.go"; then
                print_error "solution.go must contain 'main' function"
                return 1
            fi
            ;;
        *)
            print_error "Unknown language: $language"
            return 1
            ;;
    esac
    
    print_success "Submission structure valid"
    return 0
}

# Function to generate security report
generate_security_report() {
    local submission_dir="$1"
    local language="$2"
    local report_file="$LOG_DIR/security_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Security Validation Report"
        echo "========================="
        echo "Timestamp: $(date)"
        echo "Submission: $submission_dir"
        echo "Language: $language"
        echo "Security Level: $SECURITY_LEVEL"
        echo ""
        echo "Validation Results:"
        echo "==================="
        
        # Run all checks and capture output
        check_file_size "$submission_dir"/* 2>&1 || true
        check_blocked_patterns "$submission_dir"/* 2>&1 || true
        check_suspicious_patterns "$submission_dir"/* 2>&1 || true
        check_file_permissions "$submission_dir"/* 2>&1 || true
        check_hidden_files "$submission_dir" 2>&1 || true
        check_executable_files "$submission_dir" 2>&1 || true
        check_network_code "$submission_dir"/* 2>&1 || true
        check_filesystem_access "$submission_dir"/* 2>&1 || true
        validate_submission_structure "$submission_dir" "$language" 2>&1 || true
        
    } > "$report_file"
    
    print_success "Security report generated: $report_file"
    echo "$report_file"
}

# Main validation function
validate_submission() {
    local submission_dir="$1"
    local language="$2"
    
    if [ -z "$submission_dir" ] || [ -z "$language" ]; then
        echo "Usage: $0 <submission_dir> <language>"
        exit 1
    fi
    
    if [ ! -d "$submission_dir" ]; then
        print_error "Submission directory not found: $submission_dir"
        exit 1
    fi
    
    print_status "Starting security validation for $language submission..."
    echo "Submission directory: $submission_dir"
    echo "Security level: $SECURITY_LEVEL"
    echo ""
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    
    # Run all security checks
    local all_passed=true
    
    # Check file size
    for file in "$submission_dir"/*; do
        if [ -f "$file" ]; then
            if ! check_file_size "$file"; then
                all_passed=false
            fi
        fi
    done
    
    # Check blocked patterns
    for file in "$submission_dir"/*; do
        if [ -f "$file" ]; then
            if ! check_blocked_patterns "$file"; then
                all_passed=false
            fi
        fi
    done
    
    # Check suspicious patterns
    for file in "$submission_dir"/*; do
        if [ -f "$file" ]; then
            check_suspicious_patterns "$file"
        fi
    done
    
    # Check file permissions
    for file in "$submission_dir"/*; do
        if [ -f "$file" ]; then
            check_file_permissions "$file"
        fi
    done
    
    # Check for hidden and executable files
    check_hidden_files "$submission_dir"
    check_executable_files "$submission_dir"
    
    # Check for network and filesystem access
    for file in "$submission_dir"/*; do
        if [ -f "$file" ]; then
            check_network_code "$file"
            check_filesystem_access "$file"
        fi
    done
    
    # Validate submission structure
    if ! validate_submission_structure "$submission_dir" "$language"; then
        all_passed=false
    fi
    
    # Generate security report
    local report_file=$(generate_security_report "$submission_dir" "$language")
    
    echo ""
    if [ "$all_passed" = true ]; then
        print_success "Security validation PASSED"
        echo "✅ Submission is safe to execute"
        exit 0
    else
        print_error "Security validation FAILED"
        echo "❌ Submission contains security violations"
        echo "📋 See detailed report: $report_file"
        exit 1
    fi
}

# Check if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    validate_submission "$@"
fi









