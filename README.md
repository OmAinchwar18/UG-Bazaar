# 🛒 UG Bazaar — Multi-Department Hyperlocal E-Commerce Platform

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-blue.svg)](https://nodejs.org/)
[![NPM Version](https://img.shields.io/badge/npm-%3E%3D%209.0.0-red.svg)](https://www.npmjs.com/)
[![React Version](https://img.shields.io/badge/react-19.x-61dafb.svg)](https://react.dev/)
[![Database](https://img.shields.io/badge/database-MongoDB-green.svg)](https://www.mongodb.com/)
[![Caching & Queue](https://img.shields.io/badge/cache-Redis-darkred.svg)](https://redis.io/)
[![Google Gemini API](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-violet.svg)](https://deepmind.google/technologies/gemini/)

UG Bazaar is a comprehensive, production-ready multi-department hyperlocal storefront and e-commerce dashboard. It is designed to cater to modern retail shops offering products across multiple departments—such as Groceries, Kirana, Agriculture, Building Materials, Electricals, Electronics, and Home Appliances. 

The application is structured as a **Workspace Monorepo** containing a customer web app, an admin dashboard, a shared utility package, and a fast Node.js backend.

---

## 🌟 Key Features

### 🛍️ Customer Web App
- **Multi-Department Catalog Browsing**: Structured departments with fast, paginated navigation.
- **Dynamic Search & Recommendations**: Search products instantly and get recommendation cards.
- **Real-Time Interactive AI Chatbot**: Built-in shopping assistant powered by **Google Gemini 2.5 Flash** that answers questions, checks live stock/prices, recommends active coupons, and redirects users to pages.
- **Unified Cart & Checkout**: Easily manage product quantities, apply coupons, and checkout.
- **Razorpay Secure Payment Gateway**: Fully integrated online checkout supporting Cards, UPI, Netbanking, or Cash on Delivery.
- **Live Order Tracking**: Dynamic step-by-step progress tracking for placed orders.
- **Google Sign-In**: Clean authentication via Google OAuth.

### 💼 Admin Dashboard Frontend
- **Product Management**: Create, read, update, and delete products, manage stocks, upload product images to Cloudinary, and toggle active status.
- **Live Orders Monitor**: View pending customer orders, update delivery states, and track fulfillment status.
- **Automated Invoices**: View, download, and email PDF invoices generated dynamically on the backend using `pdfkit`.
- **Store Settings Control**: Configure store contact, operating name, location, and owner WhatsApp mapping.
- **Analytics & Exports**: Export CSV reports of sales, orders, and products with real-time analytics.

### ⚙️ Backend Core Features
- **Job Queues (BullMQ & Redis)**: Efficient background processing for processing order invoices, sending notifications, and running checks.
- **Notification Routing**: Customer SMS and WhatsApp alerts dispatched via Twilio.
- **Sanitization & Security**: Built with `helmet`, `express-rate-limit`, and `express-mongo-sanitize` for protection against attacks.

---

## 💻 Tech Stack

### Frontend Applications (Customer & Admin)
- **Vite & React 19** — Fast Next-gen frontend tooling.
- **Redux Toolkit** — Reliable client-side state management.
- **React Query (TanStack Query)** — Efficient server cache and API state sync.
- **Framer Motion** — Premium fluid layout transitions.
- **Tailwind CSS** — Sleek responsive utility styles.
- **Lucide React** — Premium UI icons.

### Backend Infrastructure
- **Node.js & Express** — High performance REST API server.
- **Mongoose & MongoDB** — Schema validation and database modeling.
- **BullMQ & ioredis** — Advanced background task management.
- **Cloudinary SDK** — External image asset hosting.
- **PDFKit** — Server-side dynamic PDF generation.
- **Twilio SDK** — High-speed SMS and WhatsApp integration.

---

## 📁 Workspace Monorepo Structure

```text
ugbazzar_project/
├── packages/
│   └── shared/                  # Common TypeScript client, constants, and types
├── ug-bazaar-customer-frontend/ # Customer React application (Vite-powered)
├── ug-bazaar-admin-frontend/    # Admin Dashboard React application (Vite-powered)
├── ug-bazaar-backend-main/
│   └── ug-bazaar-backend-main/  # Node.js Express Backend Service
├── docker-compose.yml           # Database (Mongo) and Cache (Redis) orchestration
├── SETUP.md                     # Comprehensive setup, run, and troubleshooting guide
└── README.md                    # Project documentation
```

---

## ⚡ Quick Start

For full configuration guidelines, database seeding, and environment setups, refer directly to the **[SETUP.md](file:///c:/D%20data/ugbazzar_project/SETUP.md)** file.

### 1. Installation
Install root dependencies and backend dependencies:

```bash
npm install
npm run install:backend
```

### 2. Configure Environment Variables
Copy `.env.example` in the root workspace to `.env` in customer-frontend and backend folders, filling out the required API keys (Gemini, Google OAuth, Razorpay, Cloudinary).

### 3. Generate & Seed Data
Generate and seed the initial product catalog into MongoDB:

```bash
cd ug-bazaar-backend-main/ug-bazaar-backend-main
node generate_products.js
node seed.js
```

### 4. Running the Development Servers
Start all applications from the root workspace folder:

```bash
# Start backend API (port 5000)
npm run dev:backend

# Start customer frontend app (port 5173)
npm run dev:customer

# Start admin dashboard app (port 5174)
npm run dev:admin
```

---

## 🤖 AI chatbot (Gemini 2.5 Flash)

The chatbot is integrated at the REST endpoint `/api/other/chatbot` and utilizes `generativelanguage.googleapis.com` via a secure HTTPS request:

- **System Context Injection**: Before every prompt, the backend queries MongoDB for the list of **active products** and **coupons** and structures them as live context.
- **Customer Navigation Assistance**: Instructs users to navigate to specific pages (`product.html?id=...`, `search.html?q=...`) to finalize checkouts, search for departments, or checkout.
- **No Private Key Exposure**: The backend manages prompt injection and makes requests using the server-side environment variable `GEMINI_API_KEY`.

---

## 💳 Payment Gateway (Razorpay)

UG Bazaar implements standard Razorpay integration to securely process payments:

1. **Order Initiation**: Frontend sends total amount to `/api/payment/create-order` backend endpoint, which initializes the transaction on Razorpay's API and returns the transaction details (including `key`, `amount`, and `orderId`).
2. **Checkout Invocation**: The customer app uses the Razorpay standard script (`https://checkout.razorpay.com/v1/checkout.js`) to open a checkout overlay with user details.
3. **Verification**: Upon completion, the payment signature is transmitted back to `/api/payment/verify` for validation via cryptographic hashing using HMAC SHA256 before marking the order as paid.

---

## 🚀 Production Deployment

### Database: MongoDB Atlas
- Provision a cluster. Keep firewall access open (`0.0.0.0/0`) or map server IPs.
- Use the connection string provided in your dashboard.

### Caching: Redis
- Host on a provider such as Railway Redis, Redis Labs, or Upstash.
- Provide the URL schema in the environment variables: `REDIS_URL=redis://default:password@host:port`.

### Backend: Railway / Heroku
- Connect your GitHub repository.
- Bind the backend build process to `ug-bazaar-backend-main/ug-bazaar-backend-main`.
- Add all variables listed in the backend `.env.example` file to your server environment.

### Frontends: Vercel / Netlify
- Map Vite build outputs (`dist`) of `ug-bazaar-customer-frontend` and `ug-bazaar-admin-frontend`.
- Specify the server configuration. The frontends resolve the API backend base path automatically using the window origin details.

---

## 🛠️ Troubleshooting & Common Errors

| Issue / Error | Cause | Resolution |
| :--- | :--- | :--- |
| **`MongooseServerSelectionError`** | Windows fails to resolve the SRV record of Atlas URLs | Replace `mongodb+srv://` with the legacy shard URL (`mongodb://`) in `.env`. See [SETUP.md](file:///c:/D%20data/ugbazzar_project/SETUP.md) for examples. |
| **`Redis connection to 127.0.0.1:6379 failed`** | Redis server is not running | Start local Redis (WSL `sudo service redis-server start`) or run `docker compose up -d redis`. |
| **`401 Unauthorized` / Invalid Tokens** | Missing or outdated user token in local storage | Log out from the client application interface, clear your browser local storage (`ug_token`), and sign in again. |
| **`Cloudinary API Key not configured`** | Product image upload failed in admin dashboard | Check backend `.env` variables `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. |

---

## 🔮 Future Improvements
1. **Dynamic Real-Time Messaging**: Add Live WebSockets mapping via `socket.io` for two-way Customer-to-Admin messaging support.
2. **Offline Mode**: Cache user store catalog in IndexedDB via Service Workers for offline shopping capability.
3. **Admin Dashboard Mobile Companion App**: Construct native administrative views using React Native.

---

## 📄 License
This project is private and proprietary. All rights reserved. Distributed under standard commercial terms.
