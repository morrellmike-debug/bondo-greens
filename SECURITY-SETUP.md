# Security Configuration - BONDO GREENS

## Deployment Security Setup

### 1. Vercel Environment Variables

You need to set these in Vercel for both dev and production:

**For `dev.bondogreens.com` (Development):**
```
VITE_ENVIRONMENT = dev
VITE_DEV_PASSWORD = [choose a strong password]
```

**For `bondogreens.com` (Production):**
```
VITE_ENVIRONMENT = production
```

**How to set in Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Select which environment(s) it applies to
4. Deploy

### 2. Environment Behavior

**Production (`bondogreens.com`):**
- Shows "Coming Soon" splash page
- Link to dev site included
- No access to registration form

**Development (`dev.bondogreens.com`):**
- Shows password login modal
- Users must enter dev password before accessing any page
- Admin/Check-In tabs hidden (not visible in UI)
- Admin Portal only accessible if authenticated as admin (future: MFA)
- Check-In only accessible if authenticated as admin (future: QR-locked)

### 3. Protected Routes

**Admin Portal** (`/admin`):
- Only visible if user is authenticated as admin
- Future: Require MFA login via Authy
- Currently: Hidden from all users until admin login is implemented

**Check-In** (`/checkin`):
- Only visible if user is authenticated as admin
- Future: QR code with secret URL
- Future: Time-locked (only works on event day)
- Currently: Hidden from all users until admin login is implemented

**Registration** (`/`):
- Public on dev site
- Hidden on production (shows Coming Soon)

### 4. How to Authenticate as Admin (Future)

Future implementation:
1. Click "Admin" link (when visible)
2. Scan QR code with Authy
3. Enter MFA code
4. Unlock Check-In and Admin Portal

For now: None (tabs hidden)

### 5. Dev Password Security

**Current password:** `bondo2026dev`

**To change:**
1. Go to Vercel Settings → Environment Variables
2. Update `VITE_DEV_PASSWORD` for dev environment
3. Redeploy
4. Share new password only with organizers via secure channel (not in code)

### 6. Check-In Security (Future)

The check-in URL will be:
```
dev.bondogreens.com/checkin?token=[secret-token]
```

**Token will:**
- Be randomly generated per event
- Change each day
- Only work during event hours
- Be short-lived (expires after event)

The QR code will encode this URL. Can't be reverse-engineered.

### 7. Session Management

- Dev password session: Stored in `sessionStorage` (lost on browser close)
- Admin login: Will use `sessionStorage` (lost on browser close)
- Prevents accidental access if admin leaves browser unattended

### 8. Vercel Deployment Notes

Both domains deploy from the same repository:
- `dev.bondogreens.com` → pulls from `main` branch
- `bondogreens.com` → pulls from `main` branch

Environment detection is based on `hostname`, not git branch.

To have separate code for dev vs production, either:
1. Create separate Vercel projects
2. Use feature flags in code
3. Deploy different branches to different projects

Currently using same codebase with environment detection.

---

**Setup Checklist:**
- [ ] Set `VITE_ENVIRONMENT` in Vercel for both domains
- [ ] Set `VITE_DEV_PASSWORD` for dev domain only
- [ ] Test dev.bondogreens.com (should show password modal)
- [ ] Test bondogreens.com (should show Coming Soon)
- [ ] Share dev password with organizers securely
