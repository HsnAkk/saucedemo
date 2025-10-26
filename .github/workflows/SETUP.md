# GitHub Secrets Setup Guide

## How to Add Secrets for Better Security

### Step 1: Access Repository Settings

1. Go to your GitHub repository
2. Click **Settings** (top navigation bar)
3. Click **Secrets and variables** → **Actions** (left sidebar)

### Step 2: Add Secrets

Click **"New repository secret"** and add:

#### For SauceDemo (Optional - already has fallback):
```
Name: STANDARD_USERNAME
Value: standard_user

Name: STANDARD_PASSWORD  
Value: secret_sauce
```

#### For Real Projects:
```
Name: PROD_DB_PASSWORD
Value: your-actual-password

Name: API_KEY
Value: your-api-key-here
```

### Step 3: Secrets in CI/CD

Secrets are automatically available in CI workflows:

```yaml
env:
  CI: true
  # Secrets are automatically available via process.env
  STANDARD_USERNAME: ${{ secrets.STANDARD_USERNAME }}
  STANDARD_PASSWORD: ${{ secrets.STANDARD_PASSWORD }}
```

### Step 4: Update TestDataLoader (if needed)

The current implementation will automatically use secrets when available:

```javascript
// Automatically uses secrets if set, otherwise falls back to defaults
const username = process.env[user.username] || this.getDefaultUsername(userType);
```

## Security Best Practices

### ✅ DO:
- Use secrets for **production credentials**
- Use secrets for **private/sensitive data**
- Rotate secrets regularly
- Use different secrets for different environments

### ❌ DON'T:
- Commit secrets to repository
- Hardcode production credentials
- Share secrets publicly
- Use same secrets across environments

## For This Project

**Current Setup:** ✅ Uses fallback credentials (perfect for SauceDemo)

**When to Add Secrets:**
- You're testing against a **real app** (not SauceDemo)
- You have **private credentials**
- You need **multiple environments** (dev/staging/prod)
- You're deploying to **production**

## Comparison

| Approach | Setup | Security | Flexibility | Use Case |
|----------|-------|----------|-------------|----------|
| **Fallback (Current)** | ✅ None | ⚠️ Public creds | ⚠️ One set | Demo apps |
| **GitHub Secrets** | ⚙️ 5 min | ✅ Secure | ✅ Multiple | Real apps |

## When to Use Each

### Use Fallback Credentials When:
- ✅ Testing public demo apps (SauceDemo)
- ✅ Learning/portfolio projects
- ✅ Quick prototyping
- ✅ Credentials are public knowledge

### Use GitHub Secrets When:
- ✅ Testing production apps
- ✅ Credentials are sensitive
- ✅ Multiple environments (dev/staging/prod)
- ✅ Real customer data
- ✅ Enterprise/professional projects

## Quick Decision Tree

```
Is this a public demo app?
├─ YES → Use fallback credentials ✅ (Current setup)
└─ NO → Are credentials sensitive?
    ├─ YES → Use GitHub Secrets 🔐
    └─ NO → Use fallback is okay ✅
```

## Adding Secrets for This Project (Optional)

If you want to use GitHub Secrets for SauceDemo:

1. Go to: `Settings` → `Secrets and variables` → `Actions`
2. Add these secrets:
   ```
   STANDARD_USERNAME = standard_user
   STANDARD_PASSWORD = secret_sauce
   ```
3. That's it! The code already supports this.

## Note

The current implementation is **flexible** - it will use:
1. **GitHub Secrets** if available (most secure)
2. **Environment variables** if set locally
3. **Fallback credentials** as last resort (convenient for demos)

So you get **best of both worlds**!

