# 📱 Bulk SMS Panel

A professional Node.js-based API panel for managing bulk SMS operations, contact groups, and message templates. This project is built with **Express.js**, **Sequelize ORM**, and **MySQL**, and is fully containerized with **Docker** for easy deployment.

---

## 🚀 Features

- **Group Management**: Organize contacts into logical groups with descriptive titles.
- **Template System**: Create and manage reusable message templates.
- **Bulk Operations**: API endpoints designed for high-volume SMS transactions.
- **Dockerized**: One-command deployment for any cloud provider or local environment.
- **Security**: API key-based authentication for secure access.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **ORM**: Sequelize
- **Containerization**: Docker & Docker Compose

---

## 📦 Local Installation

### Prerequisites
- Node.js installed locally
- MySQL Server running

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/wmasday/panel-bulk-sms
   cd panel-bulk-sms
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory and add your credentials:
   ```env
   PORT=3000
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_NAME=bulksms_panel
   DB_HOST=127.0.0.1
   DB_DIALECT=mysql
   API_KEY=your_secret_api_key
   ```

4. **Run Migrations**:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. **Start the Server**:
   ```bash
   npm run dev
   ```

---

## 🐳 Docker Deployment (Recommended)

To deploy the project on an Ubuntu VPS or any environment with Docker installed:

1. **Install Docker** (if not already installed):
   Follow the instructions in `install.txt`.

2. **Deploy with One Command**:
   ```bash
   chmod +x deploy.sh && ./deploy.sh
   ```

This script will automatically build the images, start the containers (App + DB), and run the database migrations.

---

## 🛤 API Documentation

The API is accessible at `http://localhost:3000/api`.

### Authentication
All requests must include the `x-api-key` header:
- **Header**: `x-api-key: <your_api_key>`

### Key Endpoints
- `GET /api/groups`: List all contact groups.
- `POST /api/groups`: Create a new group.
- `GET /api/templates`: List all message templates.
- `POST /api/transactions`: Record a new SMS transaction.

A **Postman Collection** is included in the root directory (`BulkSMS_Panel.postman_collection.json`) for testing all endpoints.

---

## 📂 Project Structure

```text
├── config/             # Database configuration
├── controllers/        # Request handlers
├── migrations/         # Database schema migrations
├── models/             # Sequelize models
├── public/             # Static assets
├── routes/             # API route definitions
├── seeders/            # Initial demo data
├── Dockerfile          # App container config
├── docker-compose.yml  # Multi-container orchestration
└── deploy.sh           # Deployment automation script
```

---

## 📄 License
This project is licensed under the ISC License.
