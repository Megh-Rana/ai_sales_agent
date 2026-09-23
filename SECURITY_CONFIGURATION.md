# Security Configuration & Encryption Documentation

**AI Sales Agent Platform — Vidur**  
**Last Updated:** September 23, 2026  
**For Technical Day Review:** September 25, 2026

---

## Overview

This document details the security architecture, encryption mechanisms, and security best practices implemented in the AI Sales Agent Platform to satisfy TC-50 (Data encryption & security requirements).

---

## 1. Authentication & Authorization

### Password Security
- **Hashing Algorithm:** bcrypt with automatic salt generation
- **Implementation:** `backend/app/services/auth_service.py`
- **Functions:**
  - `hash_password()`: Uses bcrypt with default work factor (12 rounds)
  - `verify_password()`: Constant-time comparison to prevent timing attacks
- **Storage:** Passwords are NEVER stored in plaintext; only bcrypt hashes are persisted in the `profiles.hashed_password` column

### JWT Token Security
- **Implementation:** `backend/app/core/security.py`
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Secret Key:** Loaded from environment variable `JWT_SECRET_KEY`
- **Token Expiration:** Configurable via `JWT_EXPIRATION_MINUTES` (default: 1440 minutes / 24 hours)
- **Token Payload:**
  - `user_id`: UUID
  - `email`: User email
  - `role`: User role (sales_rep, admin)
  - `exp`: Expiration timestamp

**Security Best Practices:**
- JWT secret MUST be at least 32 characters
- Tokens are validated on every protected endpoint via `Depends(get_current_user)`
- Expired tokens are automatically rejected with 401 Unauthorized

### Login Lockout Protection
- **Implementation:** `backend/app/services/auth_service.py`
- **Mechanism:** In-memory tracking with exponential backoff
- **Configuration:**
  - Max failed attempts: 5
  - Lockout duration: Starts at 60s, doubles per failed attempt (60s → 120s → 240s → 480s → 960s)
- **Reset:** Successful login clears all failed attempts

### Role-Based Access Control (RBAC)
- **Roles:** `sales_rep`, `admin`
- **Implementation:** `backend/app/core/security.py` (`require_role` dependency)
- **Enforcement:**
  - All admin endpoints in `backend/app/api/routes/admin.py` require `role="admin"`
  - Non-admin users receive HTTP 403 Forbidden
  - User management, billing, audit logs, fraud detection restricted to admins only

---

## 2. Data Encryption

### Encryption at Rest

#### Database Encryption
- **PostgreSQL Configuration:**
  - Enable Transparent Data Encryption (TDE) at the database level
  - For managed PostgreSQL (AWS RDS, Render, Supabase), enable encryption at rest in provider console
  - All data files, WAL logs, and backups are encrypted
  
**AWS RDS Configuration Example:**
```sql
-- Encryption is enabled at instance creation time
-- Cannot be modified after creation
CREATE DATABASE vidur_production
  WITH ENCRYPTION = 'AES256'
  OWNER = vidur_app_user;
```

**Render/Supabase:**
- Encryption at rest is enabled by default on all managed PostgreSQL instances
- No additional configuration required

#### Application-Level Sensitive Field Encryption
**Current Status:** Passwords are bcrypt-hashed; JWT tokens are signed but not encrypted.

**Recommendation for Production:**
For highly sensitive fields (contact phone, email in `leads` table), consider field-level encryption:

```python
# Example using cryptography library (Fernet symmetric encryption)
from cryptography.fernet import Fernet
import os

ENCRYPTION_KEY = os.getenv("FIELD_ENCRYPTION_KEY").encode()
cipher = Fernet(ENCRYPTION_KEY)

def encrypt_field(plaintext: str) -> str:
    return cipher.encrypt(plaintext.encode()).decode()

def decrypt_field(ciphertext: str) -> str:
    return cipher.decrypt(ciphertext.encode()).decode()
```

**Fields to Consider:**
- `leads.contact_phone`
- `leads.contact_email`
- `businesses.contact_phone`
- `businesses.contact_email`

**Note:** This is optional for MVP; database-level encryption provides baseline protection.

### Encryption in Transit

#### HTTPS/TLS Configuration
- **Production Deployment:** All traffic MUST use HTTPS (TLS 1.2 or higher)
- **Certificate Management:**
  - Use Let's Encrypt for free SSL/TLS certificates
  - Automated renewal via Certbot or cloud provider integration
  
**Nginx Configuration Example:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.vidur.ai;

    ssl_certificate /etc/letsencrypt/live/api.vidur.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.vidur.ai/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.vidur.ai;
    return 301 https://$server_name$request_uri;
}
```

**Docker/Cloud Provider:**
- Render: HTTPS enabled automatically with free SSL certificates
- AWS: Use Application Load Balancer with ACM (AWS Certificate Manager)
- Vercel (frontend): HTTPS automatic on all deployments

#### API Security Headers
**Implementation:** FastAPI middleware for security headers

```python
# backend/api_server.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.vidur.ai"],  # Production frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers (add via middleware)
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

---

## 3. Database Security

### Connection Security
- **Connection String:** Stored in environment variable `DATABASE_URL`
- **Format:** `postgresql://user:password@host:port/database?sslmode=require`
- **SSL Mode:** Always use `sslmode=require` or `sslmode=verify-full` in production

**Example `.env` Configuration:**
```env
DATABASE_URL=postgresql://vidur_user:STRONG_PASSWORD_HERE@db.example.com:5432/vidur_production?sslmode=require
JWT_SECRET_KEY=GENERATE_WITH_openssl_rand_hex_32_MINIMUM_32_CHARS
```

### SQL Injection Prevention
- **ORM:** SQLAlchemy with parameterized queries (prevents SQL injection by default)
- **No raw SQL:** All queries use ORM methods or parameterized text() constructs
- **Input Validation:** Pydantic schemas validate all API inputs before database operations

**Example Safe Query:**
```python
# SAFE: SQLAlchemy parameterized query
lead = db.query(Lead).filter(Lead.id == lead_id).first()

# UNSAFE: Never do this
# result = db.execute(f"SELECT * FROM leads WHERE id = '{lead_id}'")
```

### Database Access Control
- **Principle of Least Privilege:**
  - Application database user has only necessary permissions (SELECT, INSERT, UPDATE, DELETE)
  - No DROP, TRUNCATE, or ALTER permissions
- **Separate Admin User:** Database migrations and schema changes use separate privileged account

---

## 4. Audit Logging

### Implementation
- **Model:** `backend/app/db/models/activity_log.py` (ActivityLog)
- **Service:** `backend/app/services/activity_log_service.py`
- **Immutability:** Activity logs have no UPDATE or DELETE operations (write-once, read-many)
- **Logged Events:**
  - User registration
  - Login/logout
  - Password changes
  - Lead creation/updates
  - Campaign creation
  - Call initiation
  - Admin actions

### Admin Audit Dashboard
- **Endpoint:** `GET /api/admin/audit-logs`
- **Access:** Admin-only (HTTP 403 for non-admins)
- **Pagination:** 50 records per page (max 200)
- **Fields Tracked:**
  - `user_id`: Who performed the action
  - `action_type`: What action was performed
  - `resource`: Which resource was affected
  - `timestamp`: When (UTC timezone)
  - `extra_metadata`: Additional context (JSON)

**Security Note:** Audit logs are never modified or deleted, providing forensic evidence for compliance and incident response.

---

## 5. API Security

### Authentication Enforcement
- **All protected endpoints** require JWT token via `Authorization: Bearer <token>` header
- **Dependency Injection:** `Depends(get_current_user)` on every protected route
- **Automatic Rejection:** Missing, expired, or invalid tokens return HTTP 401 Unauthorized

### Rate Limiting
**Recommendation for Production:**
```python
# Add rate limiting middleware (e.g., slowapi)
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Apply to sensitive endpoints
@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(...):
    ...
```

### CORS Configuration
- **Production:** Whitelist only the production frontend domain
- **Development:** Allow localhost origins for testing
- **Credentials:** `allow_credentials=True` to support cookies/auth headers

---

## 6. Environment Variable Security

### Required Secrets
```env
# JWT Authentication
JWT_SECRET_KEY=<minimum 32 characters, generated with: openssl rand -hex 32>
JWT_EXPIRATION_MINUTES=1440

# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Telephony (Optional)
TWILIO_ACCOUNT_SID=<your_twilio_sid>
TWILIO_AUTH_TOKEN=<your_twilio_token>
TWILIO_PHONE_NUMBER=<your_twilio_number>

# Field Encryption (Optional, for sensitive data)
FIELD_ENCRYPTION_KEY=<generated with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())">
```

### Secret Management Best Practices
1. **Never commit secrets to Git** — Use `.env.example` as template
2. **Rotate secrets regularly** — Every 90 days minimum
3. **Use secret management service in production:**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Cloud provider secret stores (Render, Railway)
4. **Restrict access:** Only authorized personnel can view production secrets

---

## 7. Fraud Detection & Anomaly Monitoring

### Implemented Protections
- **Call Volume Spike Detection:** `backend/app/services/admin_service.py`
  - Flags accounts with abnormal call volume (>15 calls in 10 minutes by default)
  - Admin dashboard: `GET /api/admin/fraud/anomalies`
- **Failed Login Tracking:** Exponential backoff lockout (see Section 1)
- **Audit Trail:** All sensitive actions logged for forensic analysis

---

## 8. Security Checklist for Production Deployment

### Pre-Deployment
- [ ] Generate strong JWT secret (minimum 32 characters)
- [ ] Enable database encryption at rest
- [ ] Configure `sslmode=require` in DATABASE_URL
- [ ] Set up HTTPS/TLS with valid SSL certificate
- [ ] Configure CORS to allow only production frontend domain
- [ ] Add security headers middleware (X-Frame-Options, CSP, HSTS)
- [ ] Enable rate limiting on authentication endpoints
- [ ] Review and rotate all API keys (Twilio, etc.)
- [ ] Disable debug mode (`DEBUG=false` in production)

### Post-Deployment
- [ ] Test HTTPS enforcement (HTTP should redirect to HTTPS)
- [ ] Verify JWT token expiration and refresh
- [ ] Test login lockout mechanism (5 failed attempts)
- [ ] Review audit logs for anomalies
- [ ] Run security scan (OWASP ZAP, Burp Suite)
- [ ] Set up monitoring/alerting for failed auth attempts
- [ ] Document incident response procedure

---

## 9. Compliance & Data Protection

### GDPR/Data Privacy Considerations
- **Data Minimization:** Only collect necessary lead/business information
- **Right to Deletion:** Cascade deletes implemented (delete user → delete businesses → delete leads → delete calls)
- **Data Export:** CSV export endpoint allows users to download their data
- **Consent:** Ensure compliance with TCPA/TRAI for outbound calling

### Data Retention
- **Audit Logs:** Retain indefinitely (compliance requirement)
- **Call Recordings:** Retain per regulatory requirements (typically 90 days minimum)
- **Deleted Records:** Implement soft-delete with retention period if required by regulation

---

## 10. Security Contact & Incident Response

### Reporting Security Vulnerabilities
- **Email:** security@vidur.ai (placeholder - update with actual contact)
- **Response SLA:** 24 hours for critical vulnerabilities, 72 hours for others

### Incident Response Plan
1. **Detection:** Monitor audit logs, fraud alerts, error logs
2. **Assessment:** Determine severity and scope of breach
3. **Containment:** Revoke compromised tokens, block malicious IPs
4. **Eradication:** Patch vulnerability, rotate secrets
5. **Recovery:** Restore service, verify integrity
6. **Post-Mortem:** Document incident, update security measures

---

## Summary

**Current Security Posture:**
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication with expiration
- ✅ RBAC enforcement (admin vs. sales_rep)
- ✅ Login lockout protection
- ✅ SQL injection prevention (ORM parameterization)
- ✅ Audit logging (immutable activity log)
- ✅ Fraud detection (call spike monitoring)
- ⚠️ HTTPS/TLS (requires production configuration)
- ⚠️ Database encryption at rest (requires cloud provider configuration)
- ⚠️ Field-level encryption (optional enhancement)

**Recommended Enhancements Before Production:**
1. Enable HTTPS with valid SSL certificate
2. Enable database encryption at rest via cloud provider
3. Add rate limiting middleware
4. Add security headers middleware
5. Implement secret rotation schedule

**For Technical Day Review:**
This platform implements industry-standard security practices with bcrypt password hashing, JWT authentication, RBAC, audit logging, and fraud detection. Production deployment requires HTTPS configuration and database encryption enablement at the infrastructure level.

---

**Document Version:** 1.0  
**Maintainer:** Platform Engineering Team  
**Next Review Date:** October 25, 2026
