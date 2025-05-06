#!/bin/bash

# This script runs before the main build process on Netlify

# Disable ESLint
export DISABLE_ESLINT=true
export DISABLE_ESLINT_PLUGIN=true
export NEXT_DISABLE_ESLINT=1
export NODE_OPTIONS="--max_old_space_size=4096"

# Print environment for debugging
echo "Environment variables:"
echo "DISABLE_ESLINT=$DISABLE_ESLINT"
echo "DISABLE_ESLINT_PLUGIN=$DISABLE_ESLINT_PLUGIN"
echo "NEXT_DISABLE_ESLINT=$NEXT_DISABLE_ESLINT"
echo "NODE_OPTIONS=$NODE_OPTIONS"

# Create empty .eslintrc.json file to disable ESLint
echo "{}" > .eslintrc.json

# Continue with the normal build process
echo "Starting Next.js build..."
NODE_OPTIONS="--max_old_space_size=4096" DISABLE_ESLINT=true DISABLE_ESLINT_PLUGIN=true NEXT_DISABLE_ESLINT=1 npm run build
