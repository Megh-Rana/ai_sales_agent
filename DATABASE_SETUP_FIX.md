# Database Setup Fix

## Problem
Backend was failing to start with error:
```
Database initialization warning: (psycopg2.OperationalError) connection to server at "localhost" (::1), port 5432 failed: FATAL:  Ident authentication failed for user "vidur_user"
```

**Cause:** PostgreSQL is using "ident" authentication instead of "md5" (password-based authentication). This means it's trying to match your Linux username instead of using the password.

---

## Quick Fix (Run this)

```bash
./fix-postgres-auth.sh
```

Then restart services:
```bash
./stop-all-linux.sh
./run-all-linux.sh
```

This will change PostgreSQL from ident to md5 authentication.

---

## Solution

### Quick Fix (Run this first)
```bash
./setup-postgres.sh
```

This will:
1. Install PostgreSQL on Fedora Linux
2. Initialize the database
3. Create database `vidur_sales` and user `vidur_user`
4. Update your `.env` file with correct credentials
5. Start PostgreSQL service

### Then Run
```bash
./run-all-linux.sh
```

---

## Manual Setup (If script fails)

### 1. Install PostgreSQL
```bash
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2. Create Database and User
```bash
# Login as postgres user
sudo -u postgres psql

# Run these commands in psql:
CREATE USER vidur_user WITH PASSWORD 'vidur_password';
CREATE DATABASE vidur_sales OWNER vidur_user;
GRANT ALL PRIVILEGES ON DATABASE vidur_sales TO vidur_user;
\q
```

### 3. Update .env File
Create or edit `.env` file in project root:
```bash
DATABASE_URL=postgresql://vidur_user:vidur_password@localhost:5432/vidur_sales
```

### 4. Verify PostgreSQL is Running
```bash
sudo systemctl status postgresql
```

### 5. Test Connection
```bash
psql -h localhost -U vidur_user -d vidur_sales
# Enter password: vidur_password
```

---

## Verification

After setup, check:

1. **PostgreSQL Service:**
   ```bash
   sudo systemctl status postgresql
   ```
   Should show "active (running)"

2. **Database Connection:**
   ```bash
   psql -h localhost -U vidur_user -d vidur_sales -c "SELECT version();"
   ```
   Should show PostgreSQL version

3. **Backend Health:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return `{"status":"healthy"}`

---

## Updated run-all-linux.sh

The main run script has been updated to include PostgreSQL setup automatically. Next time you run `./run-all-linux.sh`, it will:
- Check if PostgreSQL is installed
- Install it if missing
- Create database and user
- Configure .env file
- Start all services

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 5432
sudo lsof -i :5432

# Kill if needed
sudo systemctl stop postgresql
sudo systemctl start postgresql
```

### Connection Refused After Install
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql

# Check logs
sudo journalctl -u postgresql -n 50
```

### Permission Denied
```bash
# Ensure user can connect
sudo -u postgres psql -c "ALTER USER vidur_user WITH SUPERUSER;"
```

### Password Authentication Failed
```bash
# Edit pg_hba.conf to allow password auth
sudo nano /var/lib/pgsql/data/pg_hba.conf

# Change this line:
# local   all   all                   peer
# To:
# local   all   all                   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## Default Credentials

**⚠️ These are development credentials. Change in production!**

- **Database:** vidur_sales
- **User:** vidur_user
- **Password:** vidur_password
- **Host:** localhost
- **Port:** 5432

---

## Next Steps

1. Run `./setup-postgres.sh` to fix PostgreSQL
2. Run `./run-all-linux.sh` to start all services
3. Access platform at http://localhost:5173
4. Check backend logs: `tail -f logs/backend.log`

Your platform should now start without database connection errors! 🎉
