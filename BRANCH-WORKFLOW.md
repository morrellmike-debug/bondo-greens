# Branch Workflow

## Overview
This repository uses a two-branch workflow for managing code changes and deployments.

## Branch Structure

### `prd` - Production Branch
- **Purpose**: Stable, production-ready code
- **Usage**: This branch contains code that has been thoroughly tested and is ready for deployment to production
- **Update Process**: Only merge from `dev` after testing is complete

### `dev` - Development Branch
- **Purpose**: Testing and enhancements
- **Usage**: All new features, bug fixes, and enhancements should be developed and tested here first
- **Update Process**:
  1. Create feature branches from `dev`
  2. Develop and test changes
  3. Merge back to `dev` for integration testing
  4. Once tested and verified, merge to `prd`

## Workflow Process

### 1. Development
```bash
# Start from dev
git checkout dev
git pull origin dev

# Create feature branch (optional but recommended)
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push feature branch
git push origin feature/your-feature-name
```

### 2. Testing on Dev
```bash
# Merge to dev for testing
git checkout dev
git merge feature/your-feature-name

# Push to remote dev
git push origin dev

# Test thoroughly in dev environment
```

### 3. Production Release
```bash
# Once tested, merge to production
git checkout prd
git merge dev

# Push to production
git push origin prd

# Deploy to production environment
```

## Current Consolidation Status

### Consolidated Changes (as of 2026-02-09)
All work from the following branches has been consolidated into `claude/consolidate-branches-zPm0Y`:
- `claude/analyze-tech-stack-MbVMo` (latest features)
- Previous `dev` branch work

### Key Features Included:
- ✅ Admin Portal (unified check-in and inventory)
- ✅ Dark Mode UI (auto-detects system/browser settings)
- ✅ Guest Registration Flow
- ✅ Email confirmation system
- ✅ Supabase integration
- ✅ Registration form improvements
- ✅ Partner event selection
- ✅ Phone/email validation

## Next Steps

1. **Review and Test**: Review the consolidated changes in `claude/consolidate-branches-zPm0Y`
2. **Merge to Dev**: Once reviewed, merge this branch to `dev` for testing
3. **Test Each Feature**: Walk through each form step and feature
4. **Deploy to Production**: After successful testing, merge `dev` to `prd`

## Branch Permissions Note

Due to git configuration, automated pushes are restricted to branches with specific naming patterns. To update `dev` and `prd` branches:

1. Manually merge `claude/consolidate-branches-zPm0Y` into `dev`:
   ```bash
   git checkout dev
   git merge claude/consolidate-branches-zPm0Y
   git push origin dev
   ```

2. After testing, merge to production:
   ```bash
   git checkout prd
   git merge dev
   git push origin prd
   ```

Alternatively, you can use pull requests to merge changes between branches via GitHub's interface.
