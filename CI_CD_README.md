# CI/CD Pipeline Documentation

This project uses GitHub Actions for Continuous Integration and Continuous Deployment.

## Overview

The CI/CD pipeline consists of two main workflows:

1. **CI Workflow** (`.github/workflows/ci.yml`) - Runs on every push and pull request
2. **CD Workflow** (`.github/workflows/cd.yml`) - Runs on version tags and manual triggers

## CI Workflow

The CI workflow runs the following checks:

### Frontend
- **Linting**: Runs ESLint to check code quality
- **Build**: Builds the React/Vite frontend to ensure it compiles successfully

### Backend Services
Each Django microservice is tested independently:
- **Authentication Service**: Runs Django tests with PostgreSQL
- **Assets Service**: Runs Django tests with PostgreSQL
- **Contexts Service**: Runs Django tests with PostgreSQL

### Docker Builds
- Builds all Docker images to ensure they compile correctly:
  - Frontend (production target)
  - Authentication service (production target)
  - Assets service (production target)
  - Contexts service (production target)

## CD Workflow

The CD workflow handles building and pushing Docker images to GitHub Container Registry (GHCR).

### Triggers
- **Automatic**: When a version tag is pushed (e.g., `v1.0.0`)
- **Manual**: Can be triggered from GitHub Actions UI with environment selection

### What it does
1. Builds Docker images for all services
2. Tags images with:
   - Branch name
   - PR number (for pull requests)
   - Semantic version (for tags)
   - SHA commit hash
   - `latest` (for default branch)
3. Pushes images to `ghcr.io/<your-username>/<service-name>`

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions are automatically enabled when you push the `.github/workflows/` directory to your repository.

### 2. Configure Secrets (if needed)

If you need to deploy to external services, add secrets in:
**Repository Settings → Secrets and variables → Actions**

Common secrets you might need:
- `DOCKER_USERNAME` - Docker registry username
- `DOCKER_PASSWORD` - Docker registry password
- `DEPLOY_KEY` - SSH key for deployment
- `KUBECONFIG` - Kubernetes configuration (if deploying to K8s)

### 3. Test the Pipeline

1. **Test CI**: Create a pull request or push to `main`/`develop` branch
2. **Test CD**: Create and push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

### 4. Manual Deployment

To manually trigger a deployment:
1. Go to **Actions** tab in GitHub
2. Select **CD** workflow
3. Click **Run workflow**
4. Choose environment (staging/production)
5. Click **Run workflow**

## Workflow Status Badges

Add these badges to your README.md to show workflow status:

```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg)
![CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CD/badge.svg)
```

## Environment Variables

### CI Environment Variables

The CI workflow uses these environment variables for testing:

**Authentication Service:**
- `AUTH_DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET_KEY` - Django secret key
- `AUTH_DEBUG` - Debug mode (set to "False" in CI)

**Assets Service:**
- `ASSETS_DATABASE_URL` - PostgreSQL connection string
- `ASSETS_SECRET_KEY` - Django secret key
- `ASSETS_DEBUG` - Debug mode (set to "False" in CI)

**Contexts Service:**
- `CONTEXTS_DATABASE_URL` - PostgreSQL connection string
- `CONTEXTS_SECRET_KEY` - Django secret key
- `CONTEXTS_DEBUG` - Debug mode (set to "False" in CI)

### CD Environment Variables

The CD workflow automatically uses:
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- `REGISTRY` - Set to `ghcr.io` (GitHub Container Registry)
- `IMAGE_PREFIX` - Your GitHub username/organization

## Customization

### Adding More Tests

To add more test steps, edit `.github/workflows/ci.yml`:

```yaml
- name: Run custom tests
  run: |
    # Your test commands here
```

### Changing Docker Registry

To use a different registry (e.g., Docker Hub), edit `.github/workflows/cd.yml`:

```yaml
env:
  REGISTRY: docker.io
  IMAGE_PREFIX: your-dockerhub-username
```

And update the login step:

```yaml
- name: Log in to Container Registry
  uses: docker/login-action@v3
  with:
    registry: ${{ env.REGISTRY }}
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

### Adding Deployment Steps

To add actual deployment (e.g., to Railway, AWS, etc.), uncomment and customize the `deploy` job in `.github/workflows/cd.yml`.

## Troubleshooting

### CI Tests Failing

1. **Database connection issues**: Check that PostgreSQL service is running correctly
2. **Missing dependencies**: Ensure all requirements are in `requirements.txt`
3. **Environment variables**: Verify all required env vars are set in the workflow

### Docker Build Failing

1. **Dockerfile issues**: Test Docker builds locally first
2. **Cache issues**: Clear GitHub Actions cache if builds are inconsistent
3. **Resource limits**: GitHub Actions has resource limits; optimize Dockerfiles if needed

### CD Not Triggering

1. **Tag format**: Ensure tags follow `v*.*.*` format (e.g., `v1.0.0`)
2. **Permissions**: Check that GitHub Actions has write permissions
3. **Registry access**: Verify `GITHUB_TOKEN` has package write permissions

## Best Practices

1. **Keep workflows fast**: Use caching and parallel jobs where possible
2. **Test locally first**: Run tests and builds locally before pushing
3. **Use matrix builds**: For testing multiple Python/Node versions
4. **Monitor costs**: GitHub Actions has free tier limits
5. **Security**: Never commit secrets; use GitHub Secrets
6. **Review PRs**: Always review CI results before merging

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

