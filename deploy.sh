#!/bin/bash

# One-command deployment script

echo "🚀 Starting deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️ .env file not found! Please create it before running this script."
    exit 1
fi

# Build and start services
echo "📦 Building and starting containers..."
docker compose up -d --build

# Wait for app container to be ready
echo "⏳ Waiting for app container to start..."
sleep 5

# Run migrations
echo "⚙️ Running database migrations..."
docker compose exec app npx sequelize-cli db:migrate

# Run seeders (Optional, uncomment if needed)
# echo "🌱 Running database seeders..."
# docker compose exec app npx sequelize-cli db:seed:all

echo "✅ Deployment complete! App is running on port 3000."
echo "🔗 Check logs with: docker compose logs -f"
