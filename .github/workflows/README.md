# CI/CD Pipeline Documentation

This repository uses GitHub Actions for continuous integration and deployment.

## Workflows

### 1. Main CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

1. **Lint** - Code quality checks
2. **Smoke Tests** - Fast feedback with 2 parallel shards
3. **Regression Tests** - Full test suite with 4 parallel shards
4. **All Tests** - Complete test run on main branch
5. **Test Summary** - Combined test results report

**Duration:** ~15-20 minutes (parallel execution)

### 2. Release Pipeline (`.github/workflows/release.yml`)

**Triggers:**

- Tag push (`v*`)
- Manual dispatch

**Purpose:** Create GitHub releases with test reports

### 3. Scheduled Tests (`.github/workflows/scheduled.yml`)

**Triggers:**

- Daily at 2 AM UTC
- Manual dispatch

**Purpose:** Nightly regression tests for monitoring stability

### 4. Deployment Pipeline (`.github/workflows/deployment.yml`)

**Triggers:**

- Manual dispatch with environment selection

**Purpose:** Deploy to staging/production with pre-deployment tests

## Setup Instructions

### 1. Repository Setup

Ensure your repository has:

```bash
✅ package.json (with test scripts)
✅ playwright.config.js
✅ tests/ directory
✅ .github/workflows/ (this directory)
```

### 2. GitHub Secrets (Optional)

For advanced features, add secrets in GitHub:

- Settings → Secrets → Actions

#### Required for Slack Notifications:

```
SLACK_WEBHOOK_URL - Webhook URL for test failure notifications
```

#### Required for Deployment:

```
STAGING_URL - Staging environment URL
PROD_URL - Production environment URL
```

### 3. Branch Protection

Recommended branch protection rules:

**Main Branch:**

```yaml
Required checks:
  - Lint
  - Smoke Tests
  - Regression Tests

Require up-to-date: true
Require approvals: 1
```

## Usage

### Run Locally Before Pushing

```bash
# Lint check
npm run lint

# Run smoke tests
npm run test:smoke

# Run all tests
npm test
```

### View CI Results

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Select the workflow run
4. View individual job results and artifacts

### Download Test Reports

CI artifacts include:

- Test results (JSON/XML)
- HTML reports
- Screenshots/videos on failures

Click on the workflow run → Download artifacts

## Parallel Execution

Tests are split across multiple jobs for speed:

- **Smoke Tests:** 2 shards (2 parallel jobs)
- **Regression Tests:** 4 shards (4 parallel jobs)
- **Total Duration:** ~15-20 minutes

## Customization

### Change Parallel Shards

Edit `.github/workflows/ci.yml`:

```yaml
matrix:
  shard: [1, 2, 3, 4, 5, 6] # Increase for more parallelism
```

### Change Browser

Edit `.github/workflows/ci.yml`:

```yaml
run: npx playwright install --with-deps chromium firefox webkit
```

### Add Matrix Testing

Edit to test across browsers:

```yaml
matrix:
  browser: [chromium, firefox, webkit]
```

## Troubleshooting

### Tests Failing Locally but Pass in CI

- Check Node.js version (CI uses v20)
- Ensure all dependencies are in `package.json`
- Clear cache: `npm ci` and re-run

### CI Timeout

Increase timeout in `playwright.config.js`:

```javascript
timeout: 60000, // 60 seconds
```

### Missing Artifacts

Artifacts are retained for 7 days. For longer retention, download locally.

## Performance

**Current Setup:**

- Smoke tests: ~2 minutes
- Regression tests: ~10 minutes (parallel)
- Total: ~15-20 minutes

**Optimization Tips:**

1. Use test sharding (already configured)
2. Run only affected tests in PRs
3. Cache dependencies (GitHub Actions handles this)
4. Parallel execution (already configured)

## Next Steps

1. ✅ Push to GitHub to trigger CI
2. ✅ Check Actions tab for results
3. ✅ Set up branch protection rules
4. ✅ Configure notifications (optional)
5. ✅ Add deployment steps (if applicable)
