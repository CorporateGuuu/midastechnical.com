#!/bin/bash

# This script runs before the main build process on Netlify

# Remove any Python-related files to prevent Netlify from trying to install Python dependencies
echo "Removing Python-related files..."
rm -f requirements.txt
rm -f Scripts/requirements.txt
touch requirements.txt
touch Scripts/requirements.txt

# Continue with the normal build process
echo "Starting Next.js build..."
npm run build
