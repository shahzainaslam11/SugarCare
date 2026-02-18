#!/bin/bash
# Script to remove console.log statements from production code
# This script removes console.log, console.debug, console.info but keeps console.error

# find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | while read file; do
#   # Remove console.log statements (but keep console.error)
#   sed -i '' '/console\.log/d' "$file" 2>/dev/null
#   sed -i '' '/console\.debug/d' "$file" 2>/dev/null
#   sed -i '' '/console\.info/d' "$file" 2>/dev/null
# done

# echo "Console logs removed from production code"

