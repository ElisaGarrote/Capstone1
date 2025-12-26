#!/bin/bash
# Validation script for GitHub Actions workflows

set -e

echo "🔍 Validating CI/CD Workflows..."
echo ""

# Check if yamllint is available (optional)
if command -v yamllint &> /dev/null; then
    echo "✅ yamllint found, running validation..."
    yamllint .github/workflows/*.yml || echo "⚠️  yamllint found issues (non-critical)"
else
    echo "ℹ️  yamllint not found, skipping (optional check)"
fi

# Check if Python is available for YAML parsing
if command -v python3 &> /dev/null; then
    echo "✅ Python found, validating YAML syntax..."
    python3 -c "
import yaml
import sys

files = ['.github/workflows/ci.yml', '.github/workflows/cd.yml']
for file in files:
    try:
        with open(file, 'r') as f:
            yaml.safe_load(f)
        print(f'✅ {file} - Valid YAML')
    except Exception as e:
        print(f'❌ {file} - Error: {e}')
        sys.exit(1)
"
else
    echo "⚠️  Python not found, skipping YAML validation"
fi

# Check required files exist
echo ""
echo "📁 Checking required files..."
files=(
    ".github/workflows/ci.yml"
    ".github/workflows/cd.yml"
    "frontend/Dockerfile"
    "backend/authentication/Dockerfile"
    "backend/assets/Dockerfile"
    "backend/contexts/Dockerfile"
    "frontend/package.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file MISSING"
        exit 1
    fi
done

# Check package.json has lint script
echo ""
echo "📦 Checking frontend package.json..."
if grep -q '"lint"' frontend/package.json; then
    echo "✅ lint script found in package.json"
else
    echo "❌ lint script NOT found in package.json"
    exit 1
fi

# Check Dockerfiles have production target
echo ""
echo "🐳 Checking Dockerfiles..."
for service in frontend backend/authentication backend/assets backend/contexts; do
    if grep -q "AS production" "$service/Dockerfile"; then
        echo "✅ $service/Dockerfile has production target"
    else
        echo "⚠️  $service/Dockerfile might not have production target"
    fi
done

echo ""
echo "✅ All basic validations passed!"
echo ""
echo "💡 Note: This script checks file structure and syntax."
echo "   Full testing requires running the workflows on GitHub Actions."

