# API Keys & Security Guide
## Google Gemini RAG Implementation

---

## 🔐 Current Project API Key

### Google Gemini API Key
**Location**: `/backend/.env`

```env
GEMINI_API_KEY=your-key-here
```

**⚠️ SECURITY NOTICE:**
- This key is stored in `.env` file (NOT committed to git)
- Never share this key publicly
- Never commit `.env` to version control
- Rotate keys periodically

---

## 📋 How to Get Google Gemini API Key

### Step-by-Step Instructions

1. **Visit Google AI Studio**
   ```
   URL: https://aistudio.google.com/app/apikey
   ```

2. **Sign In**
   - Use your Google account
   - Accept terms of service if prompted

3. **Create API Key**
   - Click **"Get API Key"** button
   - Or click **"Create API Key"** if you have existing keys
   - Select your Google Cloud project (or create new one)

4. **Copy Your Key**
   - Format: `AIzaSy...` (starts with `AIza`)
   - Example: `AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxX`

5. **Save Securely**
   - Add to `.env` file
   - Never commit to git
   - Store backup in password manager

---

## 🛡️ Security Best Practices

### 1. Environment Variables

**✅ DO:**
```env
# .env file
GEMINI_API_KEY=AIzaSy...your-key
PORT=3000
NODE_ENV=development
```

**❌ DON'T:**
```typescript
// NEVER hardcode keys in source code
const apiKey = "AIzaSy..."; // ❌ BAD!
```

### 2. Git Ignore Configuration

**`.gitignore` file:**
```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Dependencies
node_modules/

# Build outputs
dist/
build/
```

### 3. Key Rotation

**When to rotate your API key:**
- ✅ Every 90 days (recommended)
- ✅ If key is accidentally exposed
- ✅ When team member leaves
- ✅ After security incident

**How to rotate:**
1. Create new API key in Google AI Studio
2. Update `.env` file with new key
3. Test application
4. Delete old key from Google AI Studio

### 4. Access Control

**Restrict API Key Usage:**
1. Go to Google Cloud Console
2. Navigate to API & Services → Credentials
3. Click on your API key
4. Set restrictions:
   - **Application restrictions**: HTTP referrers or IP addresses
   - **API restrictions**: Only Generative Language API
   - **Quota limits**: Set daily request limits

---

## 🔑 Multiple Environments

### Development Environment
```env
# .env.development
GEMINI_API_KEY=AIzaSy...dev-key
PORT=3000
NODE_ENV=development
```

### Production Environment
```env
# .env.production
GEMINI_API_KEY=AIzaSy...prod-key
PORT=8080
NODE_ENV=production
```

### Loading Environment-Specific Config

```typescript
import dotenv from 'dotenv';

// Load environment-specific config
const envFile = process.env.NODE_ENV === 'production' 
    ? '.env.production' 
    : '.env.development';

dotenv.config({ path: envFile });
```

---

## 📊 API Key Monitoring

### Check Usage
1. Visit: https://console.cloud.google.com/
2. Navigate to: APIs & Services → Dashboard
3. View: Quotas & System Limits

### Free Tier Limits
- **Requests per minute**: 60
- **Requests per day**: 1,500
- **Tokens per minute**: 1,000,000
- **File uploads**: 20GB total storage

### Monitoring Best Practices
- ✅ Set up billing alerts
- ✅ Monitor daily usage
- ✅ Implement rate limiting in your app
- ✅ Log API errors
- ✅ Track response times

---

## 🚨 What to Do If Key is Exposed

### Immediate Actions

1. **Delete Compromised Key**
   - Go to Google AI Studio
   - Find the exposed key
   - Click "Delete" immediately

2. **Create New Key**
   - Generate new API key
   - Update `.env` file
   - Restart your application

3. **Review Access Logs**
   - Check Google Cloud Console for unusual activity
   - Review recent API calls
   - Look for unauthorized usage

4. **Update Git History** (if committed)
   ```bash
   # Remove sensitive file from git history
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch .env" \
   --prune-empty --tag-name-filter cat -- --all
   
   # Force push (⚠️ coordinate with team)
   git push origin --force --all
   ```

5. **Notify Team**
   - Inform all team members
   - Update documentation
   - Review security practices

---

## 🔒 Additional Security Measures

### 1. Use Secret Management Services

**For Production:**
- Google Secret Manager
- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault

**Example with Google Secret Manager:**
```typescript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

async function getApiKey() {
    const [version] = await client.accessSecretVersion({
        name: 'projects/PROJECT_ID/secrets/GEMINI_API_KEY/versions/latest',
    });
    return version.payload?.data?.toString();
}
```

### 2. Implement Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
```

### 3. Add Request Validation

```typescript
app.post('/api/generate-insights', async (req, res) => {
    // Validate request
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid request' });
    }
    
    // Sanitize input
    const sanitizedQuery = sanitizeInput(req.body);
    
    // Generate insights
    const insights = await generateInsights(sanitizedQuery);
    res.json(insights);
});
```

### 4. Enable HTTPS in Production

```typescript
import https from 'https';
import fs from 'fs';

const options = {
    key: fs.readFileSync('path/to/private-key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443);
```

---

## 📝 Environment Variables Checklist

### Required Variables
- [ ] `GEMINI_API_KEY` - Google Gemini API key
- [ ] `PORT` - Server port (default: 3000)
- [ ] `NODE_ENV` - Environment (development/production)

### Optional Variables
- [ ] `CORS_ORIGIN` - Allowed CORS origins
- [ ] `LOG_LEVEL` - Logging level (debug/info/error)
- [ ] `MAX_FILE_SIZE` - Maximum upload file size
- [ ] `RATE_LIMIT_WINDOW` - Rate limit time window
- [ ] `RATE_LIMIT_MAX` - Max requests per window

### Example Complete `.env`

```env
# Google Gemini API
GEMINI_API_KEY=AIzaSy...your-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:8080

# Logging
LOG_LEVEL=debug

# File Upload Limits
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=10
```

---

## 🔍 Troubleshooting API Key Issues

### Issue: "API key not valid"
**Solutions:**
- ✅ Check key format (should start with `AIza`)
- ✅ Verify key is enabled in Google Cloud Console
- ✅ Check API restrictions aren't blocking requests
- ✅ Ensure Generative Language API is enabled

### Issue: "Quota exceeded"
**Solutions:**
- ✅ Check daily/minute limits in console
- ✅ Implement caching to reduce requests
- ✅ Add rate limiting to your app
- ✅ Consider upgrading to paid tier

### Issue: "Permission denied"
**Solutions:**
- ✅ Verify API key has correct permissions
- ✅ Check Google Cloud project settings
- ✅ Ensure billing is enabled (if required)
- ✅ Review IAM permissions

---

## 📚 Additional Resources

- **Google AI Studio**: https://aistudio.google.com/
- **API Key Management**: https://console.cloud.google.com/apis/credentials
- **Pricing**: https://ai.google.dev/pricing
- **Security Best Practices**: https://cloud.google.com/docs/security/best-practices
- **Secret Manager**: https://cloud.google.com/secret-manager

---

## ⚠️ IMPORTANT REMINDERS

1. **NEVER** commit `.env` files to git
2. **ALWAYS** add `.env` to `.gitignore`
3. **ROTATE** keys every 90 days
4. **MONITOR** usage regularly
5. **RESTRICT** API key access
6. **USE** environment variables, not hardcoded keys
7. **ENABLE** HTTPS in production
8. **IMPLEMENT** rate limiting
9. **VALIDATE** all inputs
10. **BACKUP** keys securely

---

**Created:** 2025-11-20  
**Last Updated:** 2025-11-20  
**Version:** 1.0.0  
**Security Level:** Confidential
