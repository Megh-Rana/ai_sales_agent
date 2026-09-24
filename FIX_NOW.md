# 🔧 Fix PostgreSQL Authentication Error - RUN THIS NOW

## The Error You're Seeing
```
FATAL: Ident authentication failed for user "vidur_user"
```

## What It Means
PostgreSQL is trying to match your Linux username (`megh`) with the database user (`vidur_user`), but they don't match. We need to tell PostgreSQL to use password authentication instead.

---

## ✅ Solution (3 Simple Steps)

### Step 1: Run the fix script
```bash
./fix-postgres-auth.sh
```
Enter your sudo password when prompted.

### Step 2: Stop all services
```bash
./stop-all-linux.sh
```

### Step 3: Start everything again
```bash
./run-all-linux.sh
```

**Done!** Your platform should now start without database errors.

---

## 🔍 Verify It Works

Check the backend log:
```bash
tail -20 logs/backend.log
```

You should see:
- ✅ `Application startup complete` (no database warnings)
- ✅ Backend responding to health checks

---

## 📝 What the Fix Does

The script changes PostgreSQL's authentication method:
- **Before:** `ident` (matches Linux username)
- **After:** `md5` (uses password authentication)

It edits `/var/lib/pgsql/data/pg_hba.conf` and restarts PostgreSQL.

---

## ⚠️ If It Still Doesn't Work

### Manual Fix
```bash
# 1. Edit PostgreSQL config
sudo nano /var/lib/pgsql/data/pg_hba.conf

# 2. Find these lines and change 'ident' to 'md5':
#   local   all   all                   ident
#   host    all   all   127.0.0.1/32    ident
#   host    all   all   ::1/128         ident

# Change to:
#   local   all   all                   md5
#   host    all   all   127.0.0.1/32    md5
#   host    all   all   ::1/128         md5

# 3. Save and restart
sudo systemctl restart postgresql

# 4. Restart your services
./stop-all-linux.sh
./run-all-linux.sh
```

---

## 🎯 Expected Result

After the fix:
- ✅ Backend starts without database errors
- ✅ Frontend accessible at http://localhost:5173
- ✅ Backend API at http://localhost:8000
- ✅ Ollama LLM at http://localhost:11434

---

**Ready? Run the fix now:**
```bash
./fix-postgres-auth.sh
```
