# The Ultimate Beginner's Guide to Deploying YatraMitra

Welcome! This guide is written specifically for beginners. It assumes you have your code working locally and now want to put it on the internet securely, using industry best practices.

We will deploy a full-stack application (Next.js Frontend, Node.js Backend, PostgreSQL Database) to an AWS EC2 Server, secured with HTTPS, and automated using Jenkins.

**Industry Standard CI/CD Architecture:**
In a professional environment, your production server *does not* hold your source code. You will *never* run `git clone` or `npm install` on your production server. Instead:
1. You push code to GitHub.
2. Jenkins downloads the code and builds "Docker Images".
3. Jenkins pushes those images to Docker Hub.
4. Jenkins tells your Production Server to download ONLY the compiled images and run them.

---

## Step 1: Purchasing Your Server (AWS EC2)

First, we need a computer that is always on and connected to the internet.

1. Create an account at [AWS](https://aws.amazon.com/).
2. Search for **EC2** in the search bar and click it.
3. Click the orange **Launch instance** button.
4. **Name**: `YatraMitra-Production`
5. **Application and OS Images (AMI)**: Select **Ubuntu** -> **Ubuntu Server 22.04 LTS (HVM)**.
6. **Instance type**: Select **t3.medium** (Docker, Next.js, and Postgres require at least 4GB of RAM to run smoothly).
7. **Key pair (login)**: 
   - Click **Create new key pair**.
   - Name it `yatramitra-prod-key`.
   - Key pair type: **RSA**.
   - Private key file format: **.pem**.
   - Click **Create key pair**. A `.pem` file will download to your computer. **DO NOT LOSE THIS FILE.** 
8. **Network settings**:
   - Check **Allow SSH traffic from Anywhere**.
   - Check **Allow HTTPS traffic from the internet**.
   - Check **Allow HTTP traffic from the internet**.
9. **Configure storage**: 20 GiB gp3 is sufficient.
10. Click **Launch instance**.

Once launched, click the **Instance ID**. Copy the **Public IPv4 address**. 

*(Optional but highly recommended: Go to your domain registrar like Namecheap or GoDaddy, and create two 'A Records' pointing to this Public IP: one for `@` (yourdomain.com) and one for `api` (api.yourdomain.com).)*

---

## Step 2: Connecting to Your Server

Open the Terminal on your computer.

1. Navigate to where you saved your `.pem` key. For example:
   ```bash
   cd ~/.ssh
   ```
2. **Mac/Linux Only**: You must restrict permissions on the key file or AWS will reject it:
   ```bash
   chmod 400 yatramitra-prod-key.pem
   ```
3. Connect to the server:
   ```bash
   ssh -i yatramitra-prod-key.pem ubuntu@YOUR_PUBLIC_IP_ADDRESS
   ```
   *Type `yes` if it asks if you want to continue connecting.*

You are now controlling your AWS server!

---

## Step 3: Best Practice - Server Security (Firewall)

It is dangerous to leave all ports open on a server. We will configure **UFW (Uncomplicated Firewall)** to only allow web traffic (Ports 80 & 443) and SSH login (Port 22).

Run these commands one by one in your server terminal:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable
sudo ufw status
```
*You should see Status: active, and rules for 22, 80, and 443.*

---

## Step 4: Installing Required Software

The production server ONLY needs Docker (to run the images) and Nginx (to route internet traffic).

Run these commands to update the server and install the software:

```bash
# 1. Update the server
sudo apt update && sudo apt upgrade -y

# 2. Install Curl, Nginx, and Certbot
sudo apt install -y curl nginx certbot python3-certbot-nginx

# 3. Install Docker & Docker Compose
sudo apt install -y docker.io docker-compose

# 4. Start Docker and ensure it runs when the server restarts
sudo systemctl enable --now docker

# 5. VERY IMPORTANT: Give your 'ubuntu' user permission to use Docker
sudo usermod -aG docker ubuntu
```

**CRITICAL:** You must log out of the server and log back in for the Docker permissions to apply.
Type `exit` and hit Enter. Then run your SSH connect command from Step 2 again.

---

## Step 5: Preparing the Server Environment

Because we are NOT running `git clone` on the server, we just need to create a folder to hold our secret environment variables.

1. Create a project folder on the server:
   ```bash
   mkdir -p /home/ubuntu/YatraMitra
   cd /home/ubuntu/YatraMitra
   ```
2. Create the environment variables file (`.env`):
   ```bash
   nano .env
   ```
3. Paste the following configuration. Modify the passwords to be secure!
   ```env
   # Database connection string.
   DATABASE_URL="postgresql://yatramitra_admin:SuperSecret123!@db:5432/yatramitra_prod"
   
   # JWT Secret for encrypting user logins.
   JWT_SECRET="ab84b2u3n42in42893nd238nd2id32hd283h"
   ```
4. Save the file: Press `Ctrl+X`, then type `Y`, then hit `Enter`.

*That's it for the server setup! Jenkins will handle transferring the `docker-compose.yml` file and pulling the images later.*

---

## Step 6: Configuring Nginx Reverse Proxy (The Traffic Director)

Currently, your Docker containers run on ports 3000 (front) and 5000 (back). We will use Nginx on Port `80` to act as the traffic director.

1. Create a new Nginx configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/yatramitra
   ```

2. **Choose the correct configuration below based on if you have a Domain Name.**

   **► OPTION A: If you HAVE a Domain Name**
   Paste this (replace `yourdomain.com`):
   ```nginx
   # Frontend Configuration
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # Backend API Configuration
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

   **► OPTION B: If you ONLY have an IP Address (No Domain)**
   Paste this (replace `YOUR_PUBLIC_IP`):
   ```nginx
   server {
       listen 80;
       server_name YOUR_PUBLIC_IP;

       # Send all /api/ traffic to the Node.js backend
       location /api/ {
           proxy_pass http://localhost:5000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Send everything else to the Next.js frontend
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

3. Save the file (`Ctrl+X`, `Y`, `Enter`).
   # Frontend Configuration
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000; # Forward to Next.js
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # Backend API Configuration
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000; # Forward to Node.js
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Save the file (`Ctrl+X`, `Y`, `Enter`).

3. Enable this configuration and restart Nginx:
   ```bash
   sudo rm /etc/nginx/sites-enabled/default
   sudo ln -s /etc/nginx/sites-available/yatramitra /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## Step 7: Securing the Site with HTTPS (Certbot)

**⚠️ IMPORTANT: If you do NOT have a domain name, you MUST SKIP THIS STEP. Certbot only issues SSL certificates for registered domains, not bare IP addresses. Your site will run perfectly fine on standard `http://YOUR_PUBLIC_IP`.**

If you *do* have a domain name, run this simple command to secure your site with a free SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```
* Follow the email/TOS prompts.
* If asked to "Redirect" all HTTP traffic to HTTPS, choose option `2` (Redirect) - this is a best practice!

---

## Step 8: Preparing Your Code Repository for Jenkins

We need to add two files to your Github repository (on your local computer) to tell Jenkins what to do.

### 1. Create `docker-compose.prod.yml`
In the root of your project, create `docker-compose.prod.yml`. Notice how this file uses `image:` instead of `build:` because the production server will pull pre-compiled images from Docker Hub!

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: yatramitra_admin
      POSTGRES_PASSWORD: SuperSecret123!
      POSTGRES_DB: yatramitra_prod
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    image: yourdockerhub/yatramitra-backend:latest
    restart: always
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db

  frontend:
    image: yourdockerhub/yatramitra-frontend:latest
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  pgdata:
```

### 2. Create `Jenkinsfile`
In the root of your project, create the `b` exactly as shown. 

**⚠️ CRITICAL API CONFIGURATION:**
Look at the `NEXT_PUBLIC_API_URL` build argument in the script below:
* **If using Domain (Option A):** Use `https://api.yourdomain.com/api`
* **If using IP Only (Option B):** Use `http://YOUR_PRODUCTION_IP/api`

Update `yourdockerhub`, `YOUR_PRODUCTION_IP`, and the API URL before saving.

```groovy
pipeline {
    agent any
    
    // Connect the credentials we will create in Jenkins
    environment {
        DOCKER_CREDS = credentials('docker-hub-creds')
        EC2_KEY = credentials('ec2-ssh-key')
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Jenkins pulls the latest code to the BUILD SERVER (never to production)
                checkout scm
            }
        }
        
        stage('Build & Push Docker Images') {
            steps {
                script {
                    // Login to Docker Hub
                    sh 'echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin'
                    
                    // Build and tag the Backend image
                    def backendImage = docker.build("yourdockerhub/yatramitra-backend:${IMAGE_TAG}", "./backend")
                    backendImage.push()
                    backendImage.push('latest')
                    
                    // Build and tag the Frontend image 
                    // ---> CHANGE THE URL HERE DEPENDING ON IF YOU ARE USING A DOMAIN OR JUST AN IP <---
                    def frontendImage = docker.build("yourdockerhub/yatramitra-frontend:${IMAGE_TAG}", "--build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api ./frontend")
                    frontendImage.push()
                    frontendImage.push('latest')
                }
            }
        }
        
        stage('Deploy to Production Server') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh '''
                    # 1. Securely Copy the production docker-compose file to the EC2 server
                    scp -o StrictHostKeyChecking=no docker-compose.prod.yml ubuntu@YOUR_PRODUCTION_IP:/home/ubuntu/YatraMitra/docker-compose.yml
                    
                    # 2. Log into the production server and run the containers
                    ssh -o StrictHostKeyChecking=no ubuntu@YOUR_PRODUCTION_IP << EOF
                        cd /home/ubuntu/YatraMitra
                        
                        # Stop existing containers
                        docker-compose down
                        
                        # Pull the freshly built images we just pushed to Docker Hub
                        docker-compose pull
                        
                        # Start everything back up
                        docker-compose up -d
                    EOF
                    '''
                }
            }
        }
    }
}
```
*Commit both of these new files to GitHub!*

---

## Step 9: Configuring Jenkins

1. Log into your **Jenkins Dashboard** (which should be running on a completely separate server from your Production app).
2. Install plugins: **Manage Jenkins** -> **Plugins** -> **Available**. Install `Docker Pipeline` and `SSH Agent`.
3. Go to **Manage Jenkins** -> **Credentials** -> **System** -> **Global credentials** -> **Add Credentials**.
   - **Docker Hub**: Kind: `Username with password`. ID: `docker-hub-creds`. Enter your Docker Hub info.
   - **EC2 SSH**: Kind: `SSH Username with private key`. ID: `ec2-ssh-key`. Username: `ubuntu`. Paste the *entire* contents of your `yatramitra-prod-key.pem` file.

4. Create the Pipeline Job:
   - Click **New Item** -> Name it `YatraMitra-Production-Deployment` -> Select **Pipeline**.
   - Under **Build Triggers**, check **GitHub hook trigger for GITScm polling**.
   - Under **Pipeline**, set Definition to `Pipeline script from SCM`.
   - Set SCM to `Git`, paste your Repository URL, set Branch to `*/main`, and Script Path to `Jenkinsfile`.
   - Click **Save**.

## Step 10: Link GitHub to Jenkins

1. Go to your GitHub repository in your web browser.
2. Go to **Settings** -> **Webhooks** -> **Add webhook**.
3. **Payload URL**: `http://YOUR_JENKINS_IP:8080/github-webhook/`
4. **Content type**: `application/json`
5. Click **Add webhook**.

**You are completely finished!**
Every time you `git push` from your laptop, Jenkins will detect the change, build the Docker images in isolation, push them to Docker Hub securely, transfer your compose file to the EC2 server over SSH, and command the EC2 server to pull and run the newly compiled application. **This is true modern CI/CD!**
