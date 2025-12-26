# CI/CD Quick Start Guide

## What Was Created

1. **`.github/workflows/ci.yml`** - Continuous Integration workflow
   - Runs on every push and pull request
   - Tests frontend (lint + build)
   - Tests all backend services (authentication, assets, contexts)
   - Builds all Docker images

2. **`.github/workflows/cd.yml`** - Continuous Deployment workflow
   - Runs on version tags (v*.*.*) and manual triggers
   - Builds and pushes Docker images to GitHub Container Registry

3. **`.github/workflows/example-deploy.yml`** - Example deployment templates
   - Railway deployment example
   - SSH deployment example
   - Kubernetes deployment example

4. **`CI_CD_README.md`** - Full documentation

## Next Steps

### 1. Push to GitHub
```bash
git add .github/
git add CI_CD_README.md
git commit -m "Add CI/CD pipeline"
git push
```

### 2. Verify CI Runs
- Go to your GitHub repository
- Click on the **Actions** tab
- You should see the CI workflow running

### 3. Test CD (Optional)
```bash
# Create a version tag
git tag v1.0.0
git push origin v1.0.0
```

This will trigger the CD workflow to build and push Docker images.

### 4. Access Your Images
After CD runs, your images will be available at:
- `ghcr.io/YOUR_USERNAME/frontend`
- `ghcr.io/YOUR_USERNAME/authentication`
- `ghcr.io/YOUR_USERNAME/assets`
- `ghcr.io/YOUR_USERNAME/contexts`

## Customization

### If Tests Fail
1. Check the Actions tab for error details
2. Ensure all environment variables are set correctly
3. Verify database connections work

### To Add Deployment
1. Copy relevant sections from `example-deploy.yml`
2. Add them to `cd.yml` as a new job
3. Configure required secrets in GitHub Settings

### To Use Different Registry
Edit `.github/workflows/cd.yml` and change:
```yaml
env:
  REGISTRY: docker.io  # or your registry
  IMAGE_PREFIX: your-username
```

## Need Help?

See `CI_CD_README.md` for detailed documentation.

