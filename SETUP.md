# UG Bazaar — System Setup & Installation Guide

This document outlines the requirements and step-by-step procedures to set up the **UG Bazaar** workspace for local development on your machine.

---

## Prerequisites

Before setting up the project, make sure you have the following installed on your system:

| Prerequisite | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v18.x` or `v20.x` (LTS) | JavaScript runtime env |
| **NPM** | `v9.x` or `v10.x` | Package manager |
| **MongoDB** | `v6.0+` (Local / Atlas) | Core Document database |
| **Redis** | `v7.0+` (WSL / Docker) | Cache & Queue backing for BullMQ |
| **Docker Desktop** *(Optional)* | Latest | Easiest way to spin up Redis & MongoDB |

---

## 🛠️ Step-by-Step Installation

Follow these steps to download dependencies, configure environment files, and seed data.

### 1. Clone & Root Workspace Setup
Open your terminal in the workspace root:

```bash
# Install core workspace, customer frontend, and admin frontend dependencies
npm install
```

### 2. Backend Dependencies Setup
Now, install dependencies for the backend services:

```bash
# Using the workspace root helper script
npm run install:backend

# Or manually navigate and install:
# cd ug-bazaar-backend-main/ug-bazaar-backend-main && npm install
```

### 3. Setup Configuration (.env files)

You need to set up environment variable files for both the backend and frontend components.

#### A. Backend Config:
Navigate to the backend directory: `ug-bazaar-backend-main/ug-bazaar-backend-main/`
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill out your specific credentials:
   - `MONGO_URI` (See **Database Setup** below for Atlas DNS instructions)
   - `JWT_SECRET` (Use a strong unique string)
   - `GEMINI_API_KEY` (Get from Google AI Studio)
   - `GOOGLE_CLIENT_ID` (Get from Google Cloud Console Credentials)
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` (Get from Razorpay Dashboard)
   - `TWILIO_` variables (For SMS and WhatsApp notifications)
   - `CLOUDINARY_` variables (For product image uploads)

#### B. Customer Frontend Config:
Navigate to the customer frontend directory: `ug-bazaar-customer-frontend/`
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure the Google client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
   ```

---

## 🗄️ Database & Redis Setup

### 1. Spin up Services via Docker (Recommended)
You can run MongoDB and Redis in isolated containers using the provided Docker Compose setup:

```bash
# Spin up Redis and MongoDB in detached mode
docker compose up -d mongodb redis
```

### 2. Generating & Seeding Store Products
Before running the app, populate the database with a catalog of products (Grocery, Electronics, Kirana, etc.):

```bash
# Go to the backend folder
cd ug-bazaar-backend-main/ug-bazaar-backend-main

# Step 1: Generate product catalog catalog JSON file
node generate_products.js

# Step 2: Seed the catalog JSON data directly into your MongoDB database
node seed.js
```

---

## 🚀 Running the Project Locally

You can launch all services independently from the workspace root folder:

### Start the Backend Server:
```bash
npm run dev:backend
```
*Starts Node.js API server on port `5000` with hot-reloading (nodemon).*

### Start the Customer Frontend:
```bash
npm run dev:customer
```
*Launches Vite customer application on port `5173` (http://localhost:5173).*

### Start the Admin Dashboard Frontend:
```bash
npm run dev:admin
```
*Launches Vite admin dashboard application on port `5174` (http://localhost:5174).*

---

## 💻 Windows Troubleshooting

Windows developers may encounter specific configuration issues. Below are common errors and their solutions.

### 1. MongoDB SRV DNS Lookup Issue (Atlas connection fails)
On Windows, Node.js frequently fails to resolve the SRV record of Atlas URLs starting with `mongodb+srv://`, resulting in a `MongooseServerSelectionError` or DNS resolution timeouts.

**Symptoms:**
```text
MongooseServerSelectionError: connection <monitor> to xxx-shard-00.mongodb.net:27017 closed
OR
Error: querySrv ENODATA _mongodb._tcp.cluster0.xxxx.mongodb.net
```

**Solution:**
Use the legacy standard connection format (`mongodb://`) specifying the direct shard nodes, ports, and replica set name instead of `mongodb+srv://`:
```env
# Replace this (SRV):
# MONGO_URI=mongodb+srv://db_user:password@cluster0.xxxx.mongodb.net/ugbazaar

# With this (Legacy standard format):
MONGO_URI=mongodb://db_user:password@ac-xxxx-shard-00-00.mongodb.net:27017,ac-xxxx-shard-00-01.mongodb.net:27017,ac-xxxx-shard-00-02.mongodb.net:27017/ugbazaar?ssl=true&replicaSet=atlas-xxxx-shard-0&authSource=admin
```

### 2. Redis on Windows
Redis is not natively supported on Windows. Use one of these methods to run it:
- **Docker Desktop (Recommended):** Use `docker compose up -d redis`.
- **WSL2 (Windows Subsystem for Linux):** Install Ubuntu in WSL2, run `sudo apt install redis-server`, and start it using `sudo service redis-server start`.
- **Memurai:** Install Memurai, which is a native Windows port of Redis.

### 3. Execution Policy Restrictions (PowerShell)
If you get security blocks running node packages (e.g. `nodemon` or `tsc` blocks):
```text
File C:\Users\...\nodemon.ps1 cannot be loaded because running scripts is disabled on this system.
```

**Solution:**
Enable local script execution for your active session:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
