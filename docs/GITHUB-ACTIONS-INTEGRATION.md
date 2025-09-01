# 🚀 GitHub Actions Integration Guide

## Overview

This guide covers the complete integration of GitHub Actions with your Billion Row Challenge Tournament system. The integration provides:

- **🔒 Automated Security Validation**: Every submission is automatically scanned for security violations
- **🏆 Automated Tournament Execution**: Submissions are automatically tested and timed
- **📊 Real-time Results**: Immediate feedback on PRs with performance metrics
- **🏅 Leaderboard Updates**: Automatic leaderboard updates after successful submissions
- **🛡️ Secure Execution**: All code runs in isolated, secure Docker containers

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                        │
├─────────────────────────────────────────────────────────────┤
│  📝 Pull Request Created                                   │
│  ├── Code changes in submissions/                          │
│  └── Triggers GitHub Actions workflow                      │
├─────────────────────────────────────────────────────────────┤
│  🔒 Security Validation (Ubuntu Runner)                    │
│  ├── Pattern detection                                      │
│  ├── File analysis                                          │
│  ├── Structure validation                                   │
│  └── Security policy compliance                            │
├─────────────────────────────────────────────────────────────┤
│  🐳 Secure Environment Build (Ubuntu Runner)               │
│  ├── Docker image building                                  │
│  ├── Security profile application                          │
│  └── Container testing                                      │
├─────────────────────────────────────────────────────────────┤
│  🏆 Tournament Execution (Self-Hosted Runner)              │
│  ├── Secure code execution                                  │
│  ├── Performance measurement                                │
│  ├── Resource monitoring                                    │
│  └── Result generation                                      │
├─────────────────────────────────────────────────────────────┤
│  💬 Results & Feedback (Ubuntu Runner)                     │
│  ├── PR comments with results                               │
│  ├── Leaderboard updates                                    │
│  └── Security reporting                                     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Setup

### 1. Enable GitHub Actions

1. Go to your repository on GitHub
2. Click **Settings** → **Actions** → **General**
3. Under "Actions permissions", select **Allow all actions and reusable workflows**
4. Click **Save**

### 2. Set Up Self-Hosted Runner

The tournament execution requires a self-hosted runner for security and performance reasons.

```bash
# Make the setup script executable
chmod +x scripts/setup-github-runner.sh

# Run the setup script
./scripts/setup-github-runner.sh
```

**What the setup script does:**
- Downloads GitHub Actions runner
- Configures it for your repository
- Sets up Docker permissions
- Installs as a system service
- Enables health monitoring

### 3. Verify Runner Status

```bash
# Check runner service status
sudo systemctl status github-actions-runner

# View runner logs
sudo journalctl -u github-actions-runner -f

# Test runner health
~/actions-runner/health_check.sh
```

## 🔒 Security Features

### Automated Security Scanning

Every submission is automatically scanned for:

- **🚫 Blocked Patterns**: Dangerous system calls, file operations, network access
- **⚠️ Suspicious Code**: OS imports, subprocess usage, socket operations
- **📏 File Limits**: Size restrictions, permission validation
- **🏗️ Structure Validation**: Language-specific requirements

### Security Levels

The system supports configurable security levels:

- **Low**: Basic validation, minimal restrictions
- **Medium**: Standard security, moderate restrictions
- **High**: Enhanced security, strict restrictions
- **Maximum**: Enterprise-grade security (default)

### Security Policies

Security policies are defined in `docker/security/security-policy.conf`:

```ini
[GENERAL]
security_level = maximum
enable_seccomp = true
enable_apparmor = true
enable_capabilities = true

[NETWORK]
allow_network_access = false
allow_localhost = false

[FILESYSTEM]
allow_file_write = false
allow_file_create = false
```

## 📋 Workflow Details

### Trigger Conditions

The workflow triggers on:

- **Pull Request**: Any PR with changes in `submissions/`
- **Workflow Dispatch**: Manual trigger with language and security level options
- **Security Updates**: Changes to security configuration files

### Job Pipeline

#### 1. Security Validation
- **Runner**: Ubuntu Latest
- **Duration**: 10 minutes max
- **Tasks**:
  - Detect changed submission files
  - Run security pattern scanning
  - Validate submission structure
  - Check security policy compliance

#### 2. Build Secure Environment
- **Runner**: Ubuntu Latest
- **Duration**: 15 minutes max
- **Tasks**:
  - Build secure tournament executor
  - Build language-specific images
  - Test Docker images
  - Apply security profiles

#### 3. Tournament Execution
- **Runner**: Self-hosted (your machine)
- **Duration**: 35 minutes max
- **Tasks**:
  - Execute submissions securely
  - Measure performance
  - Monitor resources
  - Generate results

#### 4. Results & Feedback
- **Runner**: Ubuntu Latest
- **Duration**: 5 minutes max
- **Tasks**:
  - Comment results on PR
  - Update leaderboard
  - Generate security reports
  - Update dashboards

## 🐳 Docker Integration

### Secure Container Execution

All submissions run in secure Docker containers with:

```bash
# Security options applied automatically
docker run \
  --security-opt seccomp=/workspace/security/seccomp.json \
  --security-opt apparmor=docker-default \
  --cap-drop=ALL \
  --cap-add=CHOWN \
  --cap-add=SETGID \
  --cap-add=SETUID \
  --memory=8g \
  --cpus=4 \
  --network=none \
  --read-only \
  --user 1000:1000
```

### Resource Limits

- **Memory**: 8GB maximum
- **CPU**: 4 cores maximum
- **Processes**: 50 maximum
- **File Descriptors**: 1024 maximum
- **Execution Time**: 30 minutes maximum

### Security Profiles

- **Seccomp**: System call filtering
- **AppArmor**: File system access control
- **Capabilities**: Minimal Linux capabilities
- **Namespaces**: Process isolation

## 📊 Results & Feedback

### PR Comments

Every PR receives a comprehensive comment with:

```
## 🏆 Tournament Results

**🔒 Security Status:** ✅ PASSED
**💻 Languages:** python
**🚫 Violations:** 0
**⚠️  Warnings:** 0

---

## 📊 Performance Results

**PYTHON**
- Performance: 🥇 ADVANCED!
- Execution Time: 8.45s

---

## 🛡️ Security Features Applied

- ✅ **Seccomp Profiles**: System call filtering
- ✅ **AppArmor Rules**: File system access control
- ✅ **Capability Restrictions**: Minimal Linux capabilities
- ✅ **Resource Limits**: CPU, memory, and process limits
- ✅ **Network Isolation**: No network access
- ✅ **Read-Only Filesystem**: Prevents file modifications
```

### Leaderboard Updates

Results are automatically added to `data/results.json`:

```json
{
  "user": "username",
  "repository": "owner/repo",
  "pr_number": 42,
  "languages": ["python"],
  "execution_time": 8.45,
  "performance_level": "advanced",
  "security_status": "success",
  "violations": 0,
  "warnings": 0,
  "timestamp": "2025-08-31T22:30:00Z"
}
```

## 🔧 Configuration

### Environment Variables

```yaml
env:
  SECURITY_LEVEL: maximum
  ENABLE_MONITORING: true
  ENABLE_SECURITY_SCAN: true
  MAX_EXECUTION_TIME: 1800
  MAX_MEMORY_GB: 8
```

### Runner Labels

The self-hosted runner is labeled with:

- `billion-rows`: Tournament-specific identifier
- `linux`: Operating system
- `amd64`: Architecture
- `secure`: Security level indicator

### Workflow Inputs

Manual workflow dispatch supports:

- **Language**: Specific language to test (all, java, python, cpp, go)
- **Security Level**: Security validation level (low, medium, high, maximum)

## 🚨 Troubleshooting

### Common Issues

#### 1. Runner Not Available

```bash
# Check runner status
sudo systemctl status github-actions-runner

# Restart runner
sudo systemctl restart github-actions-runner

# Check logs
sudo journalctl -u github-actions-runner -f
```

#### 2. Docker Permission Issues

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker
```

#### 3. Security Validation Failures

Check the security validation logs in the workflow:

```bash
# View security validation output
# Check for blocked patterns in your code
# Ensure proper submission structure
```

#### 4. Tournament Execution Failures

```bash
# Check resource limits
ulimit -a

# Verify Docker containers
docker ps -a

# Check system resources
htop
df -h
```

### Debug Mode

Enable debug logging by setting:

```bash
# In your repository secrets
ACTIONS_RUNNER_DEBUG=true
ACTIONS_STEP_DEBUG=true
```

## 📚 Advanced Features

### Custom Security Policies

Modify `docker/security/security-policy.conf` to customize:

- Security levels
- Allowed/blocked patterns
- Resource limits
- Monitoring settings

### Performance Profiling

The system automatically profiles:

- Execution time (nanosecond precision)
- Memory usage
- CPU utilization
- I/O operations

### Health Monitoring

Continuous monitoring includes:

- Runner health checks
- Resource usage alerts
- Automatic service recovery
- Log rotation and cleanup

## 🔄 Workflow Lifecycle

### 1. Submission
- Participant creates PR with code in `submissions/`
- Workflow automatically triggers

### 2. Security Check
- Code scanned for security violations
- Structure validated per language
- Security policy compliance checked

### 3. Environment Build
- Secure Docker images built
- Security profiles applied
- Containers tested

### 4. Execution
- Code runs in secure container
- Performance measured
- Resources monitored

### 5. Results
- Results posted to PR
- Leaderboard updated
- Security report generated

## 🎯 Best Practices

### For Participants

1. **Follow Submission Guidelines**: Use correct file names and structure
2. **Avoid Blocked Patterns**: Don't use system(), exec(), etc.
3. **Test Locally**: Use `./scripts/test-local.sh` before submitting
4. **Check Security**: Review security warnings in PR comments

### For Administrators

1. **Monitor Runner Health**: Regular health checks and monitoring
2. **Review Security Reports**: Monitor for security violations
3. **Resource Management**: Monitor system resources and limits
4. **Update Security Policies**: Keep security rules current

### For Development

1. **Test Workflows**: Use workflow dispatch for testing
2. **Debug Issues**: Enable debug logging when needed
3. **Customize Security**: Modify security policies as needed
4. **Scale Runners**: Add multiple runners for high load

## 🌟 What's Next

With GitHub Actions integration complete, your tournament system now has:

- ✅ **Complete Automation**: From PR to results automatically
- ✅ **Enterprise Security**: Multi-layer security protection
- ✅ **Real-time Feedback**: Immediate results and feedback
- ✅ **Scalable Infrastructure**: Ready for high-volume tournaments
- ✅ **Professional Monitoring**: Health checks and alerting

**Ready to proceed with Prompt 4: Data Generation & Validation?** 🚀

The automated CI/CD pipeline will now handle all tournament submissions securely and efficiently!






