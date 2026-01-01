#!/bin/bash
# TypeScript strict mode type checking script
# Run with: ./scripts/typecheck.sh or npm run typecheck (if configured)

echo "Running TypeScript strict mode type check..."
npx tsc -p tsconfig.strict.json --noEmit

if [ $? -eq 0 ]; then
  echo "✓ Type check passed!"
  exit 0
else
  echo "✗ Type check failed. Please fix the errors above."
  exit 1
fi
