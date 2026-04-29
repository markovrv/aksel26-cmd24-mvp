#!/bin/sh
set -e

# Переходим в папку сервера
cd /app/server

# Если база данных ещё не создана — инициализируем и наполняем демоданными
if [ ! -f src/database/database.sqlite ]; then
  echo "Initializing database..."
  npm run init-db
  echo "Seeding demo data..."
  npm run seed
fi

echo "Starting server..."
exec node src/index.js