#!/bin/sh
set -e

echo "Initializing database..."
npx prisma db push --schema=./prisma/schema.prisma --skip-generate 2>/dev/null || \
  echo "Warning: Could not initialize database, it may already exist"

echo "Resetting admin password..."
node scripts/reset-password.mjs

echo "Starting application on port ${PORT:-3000}..."
export PORT=${PORT:-3000}
exec node server.js
