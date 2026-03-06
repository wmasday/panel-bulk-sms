FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wait-for-it \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Ensure the public folder exists (though it is copied)
RUN mkdir -p public

EXPOSE 3000

# We use a CMD that waits for the DB, but this can also be handled in docker-compose
CMD ["node", "index.js"]
