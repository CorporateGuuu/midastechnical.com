#!/bin/bash

# This script runs before the main build process on Netlify

# Disable ESLint
export DISABLE_ESLINT_PLUGIN=true
export NEXT_DISABLE_ESLINT=1

# Print environment for debugging
echo "Environment variables:"
echo "DISABLE_ESLINT_PLUGIN=$DISABLE_ESLINT_PLUGIN"
echo "NEXT_DISABLE_ESLINT=$NEXT_DISABLE_ESLINT"

# Continue with the normal build process
echo "Starting Next.js build..."
npm run build
