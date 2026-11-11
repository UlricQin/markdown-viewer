#!/bin/sh
set -e
cd "$(dirname "$0")"
npm ci 2>/dev/null || npm install --no-audit --no-fund
npx esbuild entry.js --bundle --minify --format=iife --global-name=wechatHighlight --outfile=../../vendor/wechat-highlight.min.js
rm -rf node_modules
