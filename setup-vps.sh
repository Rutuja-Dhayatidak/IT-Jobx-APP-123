#!/bin/bash
# ==============================================================================
# VPS Initial Bootstrap Script for app.itjobx.com (IP: 187.127.132.81)
# ==============================================================================

set -e

echo "=== 1. Updating System Packages ==="
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw ca-certificates gnupg lsb-release

echo "=== 2. Installing Docker & Docker Compose Plugin ==="
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo systemctl enable docker
    sudo systemctl start docker
    echo "Docker installed successfully."
else
    echo "Docker already installed."
fi

echo "=== 3. Configuring Firewall (UFW) ==="
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "=== 4. Setting up Project Directory ==="
DEPLOY_DIR="/var/www/itjobx"
if [ ! -d "$DEPLOY_DIR" ]; then
    mkdir -p "$DEPLOY_DIR"
    git clone https://github.com/Rutuja-Dhayatidak/IT-Jobx-APP-123.git "$DEPLOY_DIR"
fi

cd "$DEPLOY_DIR"

if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    echo "IMPORTANT: Please edit /var/www/itjobx/backend/.env with your production database, JWT secrets, and credentials!"
fi

chmod +x init-ssl.sh

echo "=== 5. VPS Bootstrap Complete! ==="
echo "Next steps on your VPS:"
echo "1. Edit /var/www/itjobx/backend/.env with your production secrets"
echo "2. Run: cd /var/www/itjobx && ./init-ssl.sh"
echo "3. Add GitHub Secrets (VPS_SSH_KEY, VPS_HOST, VPS_USERNAME) to your GitHub repository for auto-deploy on git push"
