#!/bin/bash
# =============================================================================
# PostgreSQL Setup Script for AI Sales Agent Platform
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}PostgreSQL Setup${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check if PostgreSQL is installed
if command -v psql &> /dev/null; then
    print_status "PostgreSQL is already installed"
else
    print_info "Installing PostgreSQL..."
    sudo dnf install -y postgresql-server postgresql-contrib
    print_status "PostgreSQL installed"
    
    # Initialize database
    print_info "Initializing PostgreSQL database..."
    sudo postgresql-setup --initdb
    print_status "PostgreSQL database initialized"
fi

# Enable and start PostgreSQL service
print_info "Enabling PostgreSQL service..."
sudo systemctl enable postgresql

print_info "Starting PostgreSQL service..."
sudo systemctl start postgresql

# Wait for service to be ready
sleep 2

if sudo systemctl is-active --quiet postgresql; then
    print_status "PostgreSQL service is running"
else
    print_error "Failed to start PostgreSQL"
    exit 1
fi

# Setup database and user
print_info "Setting up database and user..."

# Create user if not exists
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='vidur_user'" | grep -q 1 || {
    sudo -u postgres psql -c "CREATE USER vidur_user WITH PASSWORD 'vidur_password';"
    print_status "User 'vidur_user' created"
}

# Create database if not exists
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw vidur_sales || {
    sudo -u postgres psql -c "CREATE DATABASE vidur_sales OWNER vidur_user;"
    print_status "Database 'vidur_sales' created"
}

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vidur_sales TO vidur_user;" 2>/dev/null || true

print_status "Database setup complete"

# Fix PostgreSQL authentication to use md5 (password-based) instead of ident
print_info "Configuring PostgreSQL authentication..."

PG_HBA_CONF="/var/lib/pgsql/data/pg_hba.conf"

if [ -f "$PG_HBA_CONF" ]; then
    # Backup original
    sudo cp "$PG_HBA_CONF" "${PG_HBA_CONF}.backup"
    
    # Replace 'ident' with 'md5' for local connections
    sudo sed -i 's/local\s*all\s*all\s*ident/local   all             all                                     md5/g' "$PG_HBA_CONF"
    sudo sed -i 's/host\s*all\s*all\s*127.0.0.1\/32\s*ident/host    all             all             127.0.0.1\/32            md5/g' "$PG_HBA_CONF"
    sudo sed -i 's/host\s*all\s*all\s*::1\/128\s*ident/host    all             all             ::1\/128                 md5/g' "$PG_HBA_CONF"
    
    print_status "PostgreSQL authentication configured for password-based auth"
    
    # Restart PostgreSQL to apply changes
    print_info "Restarting PostgreSQL..."
    sudo systemctl restart postgresql
    sleep 2
    
    print_status "PostgreSQL restarted successfully"
else
    print_error "Could not find pg_hba.conf at $PG_HBA_CONF"
fi

# Create or update .env file
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "$PROJECT_ROOT/.env" ]; then
    print_info "Creating .env file..."
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
fi

# Update DATABASE_URL
print_info "Updating DATABASE_URL in .env..."
sed -i 's|DATABASE_URL=.*|DATABASE_URL=postgresql://vidur_user:vidur_password@localhost:5432/vidur_sales|g' "$PROJECT_ROOT/.env"

print_status ".env file configured"

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✓ PostgreSQL setup complete!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${BLUE}Database Connection:${NC}"
echo -e "  Host:     localhost"
echo -e "  Port:     5432"
echo -e "  Database: vidur_sales"
echo -e "  User:     vidur_user"
echo -e "  Password: vidur_password"
echo ""
echo -e "${YELLOW}You can now run ./run-all-linux.sh${NC}"
echo ""
