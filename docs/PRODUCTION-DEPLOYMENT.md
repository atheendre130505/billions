# 🚀 Tournament System Production Deployment Guide

## 📋 Overview

This guide provides comprehensive instructions for deploying the Tournament System to production, including configuration, monitoring, scaling, and maintenance procedures.

## 🏗️ System Architecture

### Production Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │  Web Servers    │    │  Application   │
│   (Nginx/HAProxy)│   │  (Multiple)     │    │  Servers       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (PostgreSQL)  │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Cache Layer   │
                    │   (Redis)       │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   File Storage  │
                    │   (S3/Block)    │
                    └─────────────────┘
```

### Infrastructure Requirements

#### Minimum Requirements
- **CPU**: 8 cores (16 vCPUs recommended)
- **RAM**: 32GB (64GB recommended)
- **Storage**: 500GB SSD (1TB recommended)
- **Network**: 1Gbps (10Gbps recommended)

#### Recommended Production Setup
- **Load Balancer**: 2 instances for high availability
- **Web Servers**: 3+ instances behind load balancer
- **Application Servers**: 3+ instances for redundancy
- **Database**: Primary + 2 read replicas
- **Cache**: Redis cluster with 3+ nodes
- **Storage**: Distributed file system with redundancy

## 🔧 Pre-Deployment Checklist

### System Requirements
- [ ] Operating System: Ubuntu 22.04 LTS or CentOS 8+
- [ ] Docker Engine: 20.10+ with Docker Compose
- [ ] Node.js: 18+ LTS (for build tools)
- [ ] Python: 3.9+ (for data processing)
- [ ] Java: 17+ (for tournament execution)
- [ ] Go: 1.19+ (for Go submissions)

### Security Prerequisites
- [ ] Firewall configuration (UFW/iptables)
- [ ] SSL certificates (Let's Encrypt or commercial)
- [ ] SSH key-based authentication
- [ ] Security groups/network ACLs configured
- [ ] Database encryption at rest
- [ ] Secrets management system

### Network Configuration
- [ ] Domain name configured with DNS
- [ ] SSL/TLS certificates obtained
- [ ] Load balancer health checks configured
- [ ] CDN setup for static assets
- [ ] Backup network connectivity

## 🚀 Deployment Steps

### Step 1: Environment Setup

#### 1.1 Server Provisioning
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 1.2 Security Hardening
```bash
# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Secure SSH
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no
# Set: Port 2222 (optional)

# Restart SSH
sudo systemctl restart ssh
```

### Step 2: Application Deployment

#### 2.1 Clone and Configure
```bash
# Clone repository
git clone https://github.com/your-org/tournament-system.git
cd tournament-system

# Create production environment file
cp .env.example .env.production
nano .env.production
```

#### 2.2 Production Environment Configuration
```bash
# .env.production
NODE_ENV=production
TOURNAMENT_ENV=production

# Database
POSTGRES_DB=tournament_prod
POSTGRES_USER=tournament_user
POSTGRES_PASSWORD=<strong_password>
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<strong_password>

# Security
JWT_SECRET=<very_long_random_secret>
ENCRYPTION_KEY=<32_byte_encryption_key>
SECURITY_SALT=<random_salt>

# GitHub Integration
GITHUB_TOKEN=<personal_access_token>
GITHUB_WEBHOOK_SECRET=<webhook_secret>

# Monitoring
GRAFANA_ADMIN_PASSWORD=<strong_password>
PROMETHEUS_ENABLED=true

# Performance
CACHE_TTL=300
MAX_CONCURRENT_SUBMISSIONS=50
SUBMISSION_TIMEOUT=300000
```

#### 2.3 Docker Compose Production
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  # Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - web
    restart: unless-stopped

  # Web Application
  web:
    build: .
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs/app:/app/logs
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    deploy:
      replicas: 3

  # Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G

  # Cache Layer
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  # Tournament Executor
  tournament-executor:
    build: ./docker/executor
    environment:
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./submissions:/submissions
      - ./data:/data
      - ./results:/results
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 2G
          cpus: '2.0'

  # Monitoring
  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  grafana_data:
  prometheus_data:
```

### Step 3: Nginx Configuration

#### 3.1 Load Balancer Configuration
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream web_backend {
        least_conn;
        server web:3000 max_fails=3 fail_timeout=30s;
        server web:3001 max_fails=3 fail_timeout=30s;
        server web:3002 max_fails=3 fail_timeout=30s;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    server {
        listen 80;
        server_name tournament.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name tournament.yourdomain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security
        limit_req zone=api burst=20 nodelay;
        limit_req zone=login burst=5 nodelay;

        # Static files
        location /static/ {
            alias /app/public/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API endpoints
        location /api/ {
            proxy_pass http://web_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # WebSocket support
        location /ws/ {
            proxy_pass http://web_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Main application
        location / {
            proxy_pass http://web_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Step 4: Database Setup

#### 4.1 PostgreSQL Configuration
```bash
# Create production database
sudo -u postgres psql
CREATE DATABASE tournament_prod;
CREATE USER tournament_user WITH PASSWORD '<strong_password>';
GRANT ALL PRIVILEGES ON DATABASE tournament_prod TO tournament_user;
\q

# Run migrations
npm run migrate:prod

# Seed initial data
npm run seed:prod
```

#### 4.2 Database Optimization
```sql
-- Create indexes for performance
CREATE INDEX idx_submissions_participant_id ON submissions(participant_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);
CREATE INDEX idx_results_submission_id ON results(submission_id);
CREATE INDEX idx_results_score ON results(score);

-- Partition large tables
CREATE TABLE submissions_2024 PARTITION OF submissions
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Configure connection pooling
-- In postgresql.conf
max_connections = 200
shared_buffers = 1GB
effective_cache_size = 3GB
work_mem = 4MB
maintenance_work_mem = 256MB
```

### Step 5: Monitoring Setup

#### 5.1 Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'tournament-system'
    static_configs:
      - targets: ['web:3000', 'tournament-executor:8080']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    metrics_path: '/metrics'

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    metrics_path: '/metrics'

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
```

#### 5.2 Grafana Dashboards
```json
{
  "dashboard": {
    "title": "Tournament System Overview",
    "panels": [
      {
        "title": "System Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Database Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_xact_commit",
            "legendFormat": "{{datname}}"
          }
        ]
      },
      {
        "title": "Tournament Submissions",
        "type": "stat",
        "targets": [
          {
            "expr": "tournament_submissions_total",
            "legendFormat": "Total Submissions"
          }
        ]
      }
    ]
  }
}
```

### Step 6: Security Configuration

#### 6.1 SSL Certificate Setup
```bash
# Let's Encrypt setup
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d tournament.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 6.2 Security Headers
```nginx
# Additional security headers
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";
```

### Step 7: Backup and Recovery

#### 7.1 Database Backup
```bash
#!/bin/bash
# backup-database.sh
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="tournament_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U tournament_user $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://your-backup-bucket/
```

#### 7.2 File Backup
```bash
#!/bin/bash
# backup-files.sh
BACKUP_DIR="/backups/files"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup important directories
tar -czf $BACKUP_DIR/submissions_$DATE.tar.gz /submissions
tar -czf $BACKUP_DIR/results_$DATE.tar.gz /results
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /config

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### Step 8: Deployment Scripts

#### 8.1 Production Deployment
```bash
#!/bin/bash
# deploy-production.sh
set -e

echo "🚀 Starting production deployment..."

# Pull latest changes
git pull origin main

# Build production images
docker-compose -f docker-compose.production.yml build

# Run database migrations
docker-compose -f docker-compose.production.yml run --rm web npm run migrate:prod

# Deploy services
docker-compose -f docker-compose.production.yml up -d

# Health check
echo "⏳ Waiting for services to be ready..."
sleep 30

# Verify deployment
if curl -f http://localhost/health; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed!"
    exit 1
fi
```

#### 8.2 Rollback Script
```bash
#!/bin/bash
# rollback.sh
set -e

echo "🔄 Starting rollback..."

# Get previous version
PREVIOUS_VERSION=$(git log --oneline -n 2 | tail -n 1 | awk '{print $1}')

# Checkout previous version
git checkout $PREVIOUS_VERSION

# Rebuild and redeploy
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

echo "✅ Rollback completed!"
```

## 📊 Monitoring and Alerting

### Key Metrics to Monitor
- **System Performance**: CPU, memory, disk usage
- **Application Metrics**: Response time, error rate, throughput
- **Database Performance**: Query time, connection count, cache hit rate
- **Security**: Failed login attempts, suspicious activities
- **Business Metrics**: Tournament participation, submission success rate

### Alerting Rules
```yaml
# monitoring/rules/alerts.yml
groups:
  - name: tournament-system
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: DatabaseSlowQueries
        expr: histogram_quantile(0.95, pg_stat_activity_duration_seconds_bucket) > 5
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Slow database queries detected"
          description: "95th percentile query time is {{ $value }} seconds"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"
```

## 🔄 Maintenance Procedures

### Daily Tasks
- [ ] Check system health and performance
- [ ] Review error logs and alerts
- [ ] Monitor backup completion
- [ ] Check disk space usage

### Weekly Tasks
- [ ] Review security logs and incidents
- [ ] Analyze performance trends
- [ ] Update system packages
- [ ] Review and rotate logs

### Monthly Tasks
- [ ] Performance optimization review
- [ ] Security audit and updates
- [ ] Capacity planning
- [ ] Disaster recovery testing

## 🚨 Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Check memory usage
free -h
docker stats

# Identify memory-hogging containers
docker ps --format "table {{.Names}}\t{{.MemUsage}}"

# Restart problematic services
docker-compose restart web
```

#### Database Performance Issues
```bash
# Check slow queries
sudo -u postgres psql -d tournament_prod -c "
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
"

# Check connection count
sudo -u postgres psql -d tournament_prod -c "
SELECT count(*) FROM pg_stat_activity;
"
```

#### Network Issues
```bash
# Check network connectivity
ping -c 4 google.com
traceroute google.com

# Check port availability
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Test load balancer health
curl -I http://localhost/health
```

## 📈 Scaling Strategies

### Horizontal Scaling
- Add more application server instances
- Implement database read replicas
- Use Redis cluster for distributed caching
- Implement CDN for static assets

### Vertical Scaling
- Increase server resources (CPU, RAM, storage)
- Optimize database configuration
- Implement connection pooling
- Use SSD storage for better I/O performance

### Auto-scaling
```yaml
# docker-compose.scale.yml
services:
  web:
    deploy:
      replicas: 5
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
```

## 🎯 Performance Optimization

### Frontend Optimization
- Implement lazy loading for components
- Use service workers for caching
- Optimize bundle size with tree shaking
- Implement virtual scrolling for large lists

### Backend Optimization
- Implement database query optimization
- Use Redis for session storage
- Implement connection pooling
- Use async/await for I/O operations

### Infrastructure Optimization
- Use CDN for global content delivery
- Implement load balancing strategies
- Use SSD storage for better performance
- Optimize network configuration

## 🔒 Security Best Practices

### Access Control
- Implement role-based access control (RBAC)
- Use multi-factor authentication (MFA)
- Implement session management
- Regular access review and cleanup

### Data Protection
- Encrypt data at rest and in transit
- Implement data backup and recovery
- Use secure communication protocols
- Regular security audits and penetration testing

### Network Security
- Use firewalls and network segmentation
- Implement intrusion detection systems
- Regular security updates and patches
- Monitor and log all network activities

## 📚 Additional Resources

### Documentation
- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/runtime-config-query.html)
- [Redis Production Deployment](https://redis.io/topics/admin)

### Tools
- **Monitoring**: Prometheus, Grafana, ELK Stack
- **Logging**: Fluentd, Logstash, Graylog
- **Security**: OWASP ZAP, Nmap, Wireshark
- **Performance**: Apache Bench, JMeter, Artillery

### Support
- **Community**: GitHub Issues, Stack Overflow
- **Professional**: Docker Support, AWS Support
- **Security**: Security advisories, CVE database

---

## 🎉 Deployment Complete!

Your Tournament System is now deployed to production with:
- ✅ High availability load balancing
- ✅ Secure SSL/TLS configuration
- ✅ Comprehensive monitoring and alerting
- ✅ Automated backup and recovery
- ✅ Performance optimization
- ✅ Security hardening

**Next Steps:**
1. Monitor system performance and health
2. Set up automated alerts and notifications
3. Implement regular maintenance procedures
4. Plan for future scaling and optimization

**Remember:** Production deployment is just the beginning. Continuous monitoring, optimization, and security updates are essential for maintaining a robust and secure system.





