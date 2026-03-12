#!/bin/sh
set -e

# ✅ Crear carpeta data con permisos correctos
echo "Creating data directory..."
mkdir -p /home/u885618655/domains/palegoldenrod-trout-192196.hostingersite.com/nodejs/data
chmod 755 /home/u885618655/domains/palegoldenrod-trout-192196.hostingersite.com/nodejs/data

echo "Initializing database..."
npx prisma db push --schema=./prisma/schema.prisma --skip-generate 2>/dev/null || \
  echo "Warning: Could not initialize database, it may already exist"

echo "Starting application on port ${PORT:-3000}..."
export PORT=${PORT:-3000}
exec node server.js
