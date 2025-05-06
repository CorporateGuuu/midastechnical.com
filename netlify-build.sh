#!/bin/bash

# This script runs before the main build process on Netlify

# Disable Python in Netlify
export NETLIFY_USE_PYTHON=false
export PYTHON_VERSION=3.9

# Remove any Python-related files to prevent Netlify from trying to install Python dependencies
echo "Removing Python-related files..."
rm -f requirements.txt
rm -f Scripts/requirements.txt
rm -f runtime.txt

# Create empty requirements files
echo "# Intentionally empty" > requirements.txt
echo "# Intentionally empty" > Scripts/requirements.txt

# Print environment for debugging
echo "Environment variables:"
echo "NETLIFY_USE_PYTHON=$NETLIFY_USE_PYTHON"
echo "PYTHON_VERSION=$PYTHON_VERSION"

# Continue with the normal build process
echo "Starting Next.js build..."
npm run build
