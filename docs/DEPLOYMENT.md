# FlowState AI Supreme - Deployment Guide

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (optional)
- Git

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd flowstate-ai-supreme
npm install
```

### 2. Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development
COGNITIVE_ENHANCEMENT_LEVEL=supreme
P2P_PORT=9000
```

### 3. Start the Platform

```bash
# Start backend
npm run dev

# In another terminal, start frontend
cd frontend
npm install
npm run dev
```

Access the application:
- Backend API: http://localhost:3000
- Frontend: http://localhost:8080

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build backend
docker build -t flowstate-ai-supreme .

# Run backend
docker run -p 3000:3000 -p 9000:9000 \
  -e NODE_ENV=production \
  flowstate-ai-supreme

# Build frontend
cd frontend
docker build -t flowstate-frontend .

# Run frontend
docker run -p 8080:8080 \
  -e API_URL=http://localhost:3000 \
  flowstate-frontend
```

## Production Deployment

### Option 1: VPS/Cloud Server

1. **Setup Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd flowstate-ai-supreme
   
   # Install dependencies
   npm install --production
   
   # Setup environment
   cp .env.example .env
   nano .env  # Edit configuration
   
   # Start with PM2
   pm2 start src/index.js --name flowstate-ai
   pm2 save
   pm2 startup
   ```

3. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Kubernetes

1. **Create Deployment**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: flowstate-ai-supreme
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: flowstate-ai
     template:
       metadata:
         labels:
           app: flowstate-ai
       spec:
         containers:
         - name: flowstate-ai
           image: flowstate-ai-supreme:latest
           ports:
           - containerPort: 3000
           - containerPort: 9000
           env:
           - name: NODE_ENV
             value: "production"
           - name: COGNITIVE_ENHANCEMENT_LEVEL
             value: "supreme"
   ```

2. **Create Service**
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: flowstate-ai-service
   spec:
     selector:
       app: flowstate-ai
     ports:
     - name: api
       port: 3000
       targetPort: 3000
     - name: p2p
       port: 9000
       targetPort: 9000
     type: LoadBalancer
   ```

### Option 3: Cloud Platforms

#### AWS

```bash
# Install AWS CLI and configure
aws configure

# Create ECS cluster
aws ecs create-cluster --cluster-name flowstate-cluster

# Deploy using ECS
# (Use AWS Console or CloudFormation)
```

#### Google Cloud

```bash
# Install gcloud CLI
gcloud init

# Deploy to Cloud Run
gcloud run deploy flowstate-ai \
  --image gcr.io/YOUR_PROJECT/flowstate-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure

```bash
# Install Azure CLI
az login

# Create container instance
az container create \
  --resource-group flowstate-rg \
  --name flowstate-ai \
  --image flowstate-ai-supreme:latest \
  --dns-name-label flowstate-ai \
  --ports 3000 9000
```

## Distributed Network Setup

### Multi-Node Deployment

1. **Setup Node 1 (Bootstrap Node)**
   ```bash
   # .env configuration
   PORT=3000
   P2P_PORT=9000
   NODE_TYPE=bootstrap
   ```

2. **Setup Node 2 (Worker Node)**
   ```bash
   # .env configuration
   PORT=3001
   P2P_PORT=9001
   NODE_TYPE=worker
   BOOTSTRAP_PEERS=/ip4/NODE1_IP/tcp/9000/p2p/NODE1_ID
   ```

3. **Setup Node 3 (Worker Node)**
   ```bash
   # .env configuration
   PORT=3002
   P2P_PORT=9002
   NODE_TYPE=worker
   BOOTSTRAP_PEERS=/ip4/NODE1_IP/tcp/9000/p2p/NODE1_ID
   ```

## Monitoring

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs flowstate-ai

# Monitor resources
pm2 monit
```

### Docker Monitoring

```bash
# View container stats
docker stats

# View logs
docker logs -f flowstate-ai-supreme
```

### Health Checks

```bash
# Check API health
curl http://localhost:3000/health

# Check system status
curl http://localhost:3000/api/status
```

## Backup and Recovery

### Database Backup

```bash
# Backup state database
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Restore from backup
tar -xzf backup-20240101.tar.gz
```

### Configuration Backup

```bash
# Backup configuration
cp .env .env.backup-$(date +%Y%m%d)
```

## Security Considerations

1. **Firewall Configuration**
   ```bash
   # Allow API port
   sudo ufw allow 3000/tcp
   
   # Allow P2P port
   sudo ufw allow 9000/tcp
   
   # Enable firewall
   sudo ufw enable
   ```

2. **SSL/TLS Setup**
   ```bash
   # Install certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Obtain certificate
   sudo certbot --nginx -d your-domain.com
   ```

3. **Environment Security**
   - Never commit `.env` files
   - Use secrets management (AWS Secrets Manager, HashiCorp Vault)
   - Rotate credentials regularly

## Scaling

### Horizontal Scaling

Add more nodes to the P2P network:

```bash
# Deploy additional nodes with different ports
PORT=3003 P2P_PORT=9003 npm start
PORT=3004 P2P_PORT=9004 npm start
```

### Vertical Scaling

Increase node resources:

```env
MAX_CONCURRENT_MODELS=20
MAX_MEMORY_MB=8192
WORKER_THREADS=8
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

2. **Module Not Found**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **P2P Connection Issues**
   - Check firewall rules
   - Verify bootstrap peer addresses
   - Check network connectivity

## Performance Tuning

```env
# Increase cache size
MODEL_CACHE_SIZE=2000

# Adjust sync interval
STATE_SYNC_INTERVAL=3000

# Enable workers
WORKER_THREADS=4
```

## Maintenance

### Regular Updates

```bash
# Pull latest code
git pull origin main

# Update dependencies
npm update

# Restart services
pm2 restart flowstate-ai
```

### Log Rotation

```bash
# Setup logrotate
sudo nano /etc/logrotate.d/flowstate

# Add configuration
/var/log/flowstate/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```
