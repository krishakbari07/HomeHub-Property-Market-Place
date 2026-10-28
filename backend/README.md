# HomeHub — Backend REST API & Intelligence Engine

[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Google GenAI SDK](https://img.shields.io/badge/Google%20GenAI-Gemini%202.5-4285F4?logo=google)](https://ai.google.dev/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-black?logo=jsonwebtokens)](https://jwt.io/)

Production-ready backend API service for the **HomeHub** real-estate marketplace and SaaS platform. Powered by Express 5, MongoDB Atlas, and the official Google GenAI SDK (`@google/genai`).

---

## 🚀 Key Features

- **JWT Authentication & Role-Based Access Control**:
  - Secure role segregation: `buyer`, `seller`, `agent`, `admin`, and `renter`.
  - Tab-scoped token authentication with standard bearer headers.
  - Multi-factor self-service password reset (Email + Phone Number + Bcrypt verification).
- **Property Catalog & Advanced Search Engine**:
  - High-performance indexing on `purpose`, `city`, `type`, and `price`.
  - Strict catalog segregation: pure acquisition listings (`buy`) and pure rentals (`rent`).
  - Agent and seller portfolio attribution with MongoDB aggregation pipelines.
- **Genuine RERA Agent Directory**:
  - Dynamic agent directory with live managed portfolio counts.
  - Compound indexing `{ role: 1, name: 1 }` for high-throughput listing.
- **Google Gemini 2.5 Flash AI Service**:
  - RAG chatbot grounded strictly in verified active MongoDB listings.
  - Conversational natural-language query parser into structured search filters.
  - Residence matchmaker, AI architectural copywriter, and property valuation estimator.
  - Resilient error handling preventing external AI outages from affecting core marketplace APIs.
- **Security & Reliability**:
  - Rate limiting on authentication endpoints to prevent brute-force attacks.
  - Granular CORS policies supporting development and production frontend domains.
  - Safe administrative controls and single designated system administrator protection.
  - Lightweight system healthcheck endpoint (`/api/health` and `/health`).

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 5.x
- **Database**: MongoDB Atlas with Mongoose ODM 8.x
- **AI SDK**: `@google/genai` (Google GenAI Official SDK)
- **Security**: `bcryptjs`, `jsonwebtoken`, `express-rate-limit`, `cors`
- **Environment**: `dotenv`

---

## 📁 Repository Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB Atlas persistent connection pool
├── controllers/
│   ├── aiController.js       # Gemini AI RAG chatbot, parser, and matchmaker
│   ├── appointmentController.js # Property visit appointments
│   ├── authController.js     # Login, registration, profile, and password reset
│   ├── inquiryController.js  # Buyer/seller inquiries
│   ├── offerController.js    # Bidding and real estate offer submissions
│   ├── propertyController.js # Property catalog, filters, and management
│   ├── userController.js     # User management & genuine verified agents
│   └── visitorController.js  # Traffic and visitor analytics
├── middleware/
│   ├── authMiddleware.js     # JWT verification & role authorization guards
│   └── errorMiddleware.js    # Centralized 404 & error handling
├── models/
│   ├── Appointment.js        # Scheduled property visit schema
│   ├── Inquiry.js            # Property inquiry schema
│   ├── Offer.js              # Real estate offer/bid schema
│   ├── Property.js           # Property listing schema with compound indexes
│   ├── User.js               # User accounts schema with bcrypt password hashing
│   ├── Visitor.js            # Analytics visitor schema
│   └── Wishlist.js           # Client saved properties schema
├── routes/                   # Express routers mapping to controllers
├── services/
│   └── geminiService.js      # Gemini 2.5 Flash implementation with prompt guards
├── utils/                    # Currency formatting and token helpers
├── app.js                    # Express app setup, middlewares, and server listener
├── render.yaml               # Infrastructure-as-code deployment configuration
├── package.json              # Backend dependencies and scripts
└── .env.example              # Sanitized environment variable template
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB)
- [Google AI Studio](https://aistudio.google.com/) API Key (optional, for Gemini AI features)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/krishakbari07/homehub-backend.git
cd homehub-backend

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the template file to `.env`:
```bash
cp .env.example .env
```
Populate `.env` with your genuine credentials:
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/homehub?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
ADMIN_EMAIL=admin@homehub.com
ADMIN_PASSWORD=your_secure_admin_password
FRONTEND_URL=http://localhost:3000,http://127.0.0.1:3000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 4. Running the Server
```bash
# Development mode with auto-reload
npm run dev

# Production startup
npm start
```
The server will bind to port `5000` (or `process.env.PORT`) on `0.0.0.0`.

---

## 🧪 Automated Testing

HomeHub includes comprehensive automated integration test suites:
```bash
# Multi-tab authentication isolation and token resilience test
node scripts/testMultiTabAuth.js

# Gemini AI and offer/bidding test suite
node scripts/verifyOfferAndAiSuite.js
```

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` / `/api/health` | Public | System status, database connection, and uptime |
| `POST` | `/api/auth/register` | Public | Register new user (buyer, seller, agent, renter) |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `POST` | `/api/auth/reset-password` | Public | Self-service multi-factor password reset |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated session profile |
| `GET` | `/api/users/agents` | Public | List genuine verified agents with portfolio counts |
| `GET` | `/api/properties` | Public | Search and filter properties (buy/rent/city/price) |
| `GET` | `/api/properties/:id` | Public | Get comprehensive details of a single property |
| `POST` | `/api/properties` | Private (Seller/Agent/Admin) | Create new property listing |
| `POST` | `/api/ai/chat` | Public | Real-estate RAG chatbot powered by Gemini 2.5 |
| `POST` | `/api/ai/smart-search` | Public | Parse natural language prompt into search filters |
| `POST` | `/api/offers` | Private (Buyer) | Submit offer / bid on property listing |
| `POST` | `/api/appointments` | Private | Book scheduled property viewing |

---

## 🚢 Deployment to Production (Render / Railway)

### Deploying to Render
1. Create a **New Web Service** connected to your GitHub repository.
2. Set **Root Directory** to `.` (or project root).
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Add Environment Variables in Render Dashboard matching `.env.example`:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `FRONTEND_URL` (your deployed Vercel domain)
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`

### Free-Tier Hosting Limitations Note
> [!NOTE]
> On free-tier cloud hosting (e.g., Render Free Instance), servers automatically spin down during periods of inactivity. The first incoming request after idle takes approximately **30 to 50 seconds** (cold-start) to wake up the service. Subsequent requests respond instantly in under 100ms. For 24/7 zero-latency response without cold-starts, consider upgrading to an inexpensive persistent instance or container tier.

---

## 📄 License
ISC License. Built by [Krish Akbari](https://github.com/krishakbari07).
