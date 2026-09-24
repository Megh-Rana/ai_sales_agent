#!/bin/bash
# Quick fix for PostgreSQL authentication error

echo "Fixing PostgreSQL authentication..."

# Backup pg_hba.conf
sudo cp /var/lib/pgsql/data/pg_hba.conf /var/lib/pgsql/data/pg_hba.conf.backup

# Replace ident with md5 for password authentication
sudo sed -i 's/\(local\s*all\s*all\s*\)ident/\1md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/\(host\s*all\s*all\s*127\.0\.0\.1\/32\s*\)ident/\1md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/\(host\s*all\s*all\s*::1\/128\s*\)ident/\1md5/g' /var/lib/pgsql/data/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql

echo "✓ PostgreSQL authentication fixed!"
echo ""
echo "Now restart your services:"
echo "  ./stop-all-linux.sh"
echo "  ./run-all-linux.sh"
