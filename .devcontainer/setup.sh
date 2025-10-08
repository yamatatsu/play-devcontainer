#!/bin/bash
set -e

echo "🚀 Starting Dev Container setup..."


echo "👤 Current user:"
whoami


# Setup GitHub authentication
if [ -n "$GH_TOKEN" ]; then
  echo "🔐 Setting up GitHub authentication..."
  gh auth setup-git
  echo "✅ GitHub authentication configured"
else
  echo "⚠️  GH_TOKEN not set. Git push/pull may require manual authentication."
fi


echo "📦 Installing dependencies..."
npm ci


# init and execute personal setup script
if [ ! -f ".devcontainer/setup.personal.sh" ]; then
  cat << 'EOF' > .devcontainer/setup.personal.sh
#!/bin/bash
set -e

# Your personal setup steps here
EOF
  chmod +x .devcontainer/setup.personal.sh
fi
echo "🔧 Running personal setup..."
bash .devcontainer/setup.personal.sh


echo "✨ Dev Container setup completed successfully!"
