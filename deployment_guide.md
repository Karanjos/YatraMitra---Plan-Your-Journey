# YatraMitra - Production Deployment Guide

This document outlines the systematic process for deploying the YatraMitra (MERN + Next.js) application to a production AWS server. It incorporates containerization using Docker, proxying with Nginx, and automation using Jenkins.

## 1. Prerequisites
- **AWS EC2 Instance**: Linux-based (Ubuntu 22.04 recommended), minimum `t3.medium`.
- **Domain Name**: Pointed to the EC2 Elastic IP address.
- **MongoDB Atlas** or a managed database instance (recommended over self-hosting databases).
- **Installed on Server**:
  - Docker & Docker Compose
  - Nginx (for Reverse Proxy)
  - Certbot (for SSL)

## 2. Containerization (Dockerfile & docker-compose)

We utilize Docker to ensure the environment is consistent across development and production.

### Backend (`/backend/Dockerfile`)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Generate Prisma Client
RUN npx prisma generate
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Frontend (`/frontend/Dockerfile`)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### `docker-compose.yml` (Root Directory)
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
    restart: always
```

## 3. Reverse Proxy & Domain Configuration (Nginx)

On your EC2 instance, configure Nginx to route traffic to the appropriate Docker containers.

```nginx
# /etc/nginx/sites-available/yatramitra
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and run Certbot to secure with HTTPS:
```bash
sudo ln -s /etc/nginx/sites-available/yatramitra /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## 4. CI/CD Pipeline Automation (Jenkins)

To automate deployments, set up a Jenkins pipeline that triggers on code pushes to the `main` branch.

**Jenkinsfile Example:**
```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-creds')
        SERVER_CREDS = credentials('ec2-ssh-key')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-repo/YatraMitra.git'
            }
        }
        
        stage('Build & Push Images') {
            steps {
                script {
                    docker.build("yourdockerhub/yatramitra-backend", "./backend").push('latest')
                    docker.build("yourdockerhub/yatramitra-frontend", "./frontend").push('latest')
                }
            }
        }
        
        stage('Deploy to Production') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@your-ec2-ip << EOF
                        cd /app/YatraMitra
                        git pull origin main
                        docker-compose pull
                        docker-compose up -d --build
                    EOF
                    '''
                }
            }
        }
    }
}
```

## 5. Deployment Steps (Manual fallback)
If you prefer to deploy manually without Jenkins:
1. SSH into the server: `ssh -i key.pem ubuntu@server-ip`
2. Clone repository: `git clone <repo-url>`
3. CD into directory: `cd YatraMitra`
4. Create `.env` file with secrets.
5. Run: `docker-compose up -d --build`
