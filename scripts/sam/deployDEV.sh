#!/bin/bash
echo "**** Clearing node_modules ****"
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' + 
echo "**** Recursively installing node_modules ****"
npm install -D
npm run install:all
echo "**** Building sam project ****"
npm run build
echo "**** Deploying SAM changes ****"
sam deploy