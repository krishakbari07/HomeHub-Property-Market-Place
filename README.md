# HomeHub — Enterprise Real Estate Management & Marketplace SaaS

[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**HomeHub** is a production-ready, full-stack MERN real-estate marketplace and property management SaaS platform. Designed for luxury properties, villas, high-rise apartments, and commercial estates, HomeHub pairs architectural aesthetics with enterprise features including Google Gemini 2.5 AI intelligence, tab-isolated multi-tab authentication, strict search filtering, self-service password reset, and multi-role dashboards for Admins, Sellers, Real Estate Agents, and Buyers.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    UserClient[Web Browser / Mobile Client\nReact 19 + Tailwind CSS]
    
    subgraph Frontend["Frontend Layer (Vercel)"]
        Landing[Public Pages\nHome / Buy / Rent / Sell / Agents]
        AIComponents[AI Chatbot Drawer\nSmart Search Bar\nAI Matchmaker & Valuation]
        Dashboards[Role-Based Dashboards\nAdmin | Seller | Agent | Buyer]
        AuthUI[Tab-Isolated Authentication\nRegistration & Self-Service Password Reset]
    end

    subgraph Backend["Backend API Layer (Render / Express)"]
        ExpressApp[Express 5 Server\nDynamic PORT + CORS + Rate Limiter]
        AuthRouter[Auth Controller\nJWT + Bcrypt Hashing + Multi-Factor Reset]
        PropertyRouter[Property Controller\nStrict Buy/Rent Filtering + Role Authorize]
        AIRouter[AI Controller\nGemini 2.5 Flash SDK Integration]
        AnalyticsRouter[Visitor Analytics Controller\nIP & Route Tracker]
    end

    subgraph Integrations["External Services & Storage"]
        MongoAtlas[(MongoDB Atlas Database\nhomehub.properties | users | visitors)]
        GeminiAPI[Google Gemini 2.5 Flash API\nThinking Budget 0 Optimized]
    end

    UserClient --> Frontend
    Frontend -->|HTTPS / REST API| Backend
    Backend --> MongoAtlas
    AIRouter -->|Official Google GenAI SDK| GeminiAPI
```

---

## ✨ Core Features & Technical Highlights

### 1. Google Gemini AI Property Intelligence
* **Feature 1: RAG Real Estate Chatbot** — Powered by the official `@google/genai` SDK on `gemini-2.5-flash`. Grounded exclusively on genuine active catalog listings with strict prompt constraints against hallucinations.
* **Feature 2: Natural-Language Smart Property Search** — Automatically parses freeform conversational queries (e.g. *"Show me a 4 BHK villa in Bodakdev under 3 crore"*) into structured filters (`purpose`, `location`, `type`, `bedrooms`, `minPrice`, `maxPrice`) and synchronizes live form inputs.
* **Feature 3: Personalized Residence Matchmaker** — Evaluates user spatial requirements, budget allocation, and lifestyle criteria against genuine listings, computing compatibility percentages (e.g. 96% Match) with transparent AI rationales.
* **Feature 4: AI Listing Copywriter** — Empowers authorized Sellers, Agents, and Admins to generate architectural titles, 3-paragraph marketing descriptions, and key highlights with an interactive review modal before publishing.
* **Feature 5: Fair Market Valuation Estimator** — Uses real comparable listings and regional square-footage baselines to estimate fair market value ranges, confidence scores, and identified value drivers.

### 2. Tab-Isolated Multi-Tab Authentication
* **Tab-Scoped Session Storage**: Supports concurrent sessions (e.g. Buyer logged in on Tab 1 while Agent is logged in on Tab 2) without cross-tab clobbering.
* **Independent Refresh & Direct Navigation**: Each tab retains its own intended identity after page refresh.
* **Isolated Logouts**: Logging out or receiving a 401 in one tab does not terminate or affect active sessions in another tab.
* **Self-Service Password Reset**: Secure multi-factor credential matching (registered Email + registered Phone Number + New Password) with bcrypt salt-10 hashing.

### 3. Strict Search & Category Segregation
* **Buy Catalog**: Excludes rental properties (`purpose: { $nin: ["rent", "Rental"] }`), enforcing pure acquisition listings with price range and bedroom filters.
* **Rent Catalog**: Isolates rental properties only, with furnishing status, monthly rent range, and bedroom filters.
* **Color Contrast & Responsive UI**: High-contrast typography adhering to WCAG standards with HomeHub palette (Deep Navy `#172B3A`, Forest Green `#315C4B`, Warm Ivory `#F7F5F0`, and Muted Gold `#D5AD72`).

### 4. Role-Based SaaS Dashboards
* **Admin Dashboard**: System overview, user management (CRUD, role modifications), property catalog oversight, appointment management, inquiry processing, and visitor analytics.
* **Seller Dashboard**: Add property with AI copywriter, manage active listings, track inquiries, and view offer status.
* **Agent Dashboard**: Property portfolio, client appointment schedule, client inquiries, and performance metrics.
* **Buyer Dashboard**: Saved property wishlist, scheduled property tours, submitted inquiries, and profile settings.

---

## 🔐 Environment Variables Catalog

### Backend Configuration (`backend/.env`)

| Variable | Description | Example / Default | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | HTTP server listening port | `5000` | Yes |
| `NODE_ENV` | Runtime environment mode | `development` / `production` | Yes |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/homehub` | Yes |
| `JWT_SECRET` | Secret key for signing auth tokens | `your_secure_random_jwt_secret` | Yes |
| `GEMINI_API_KEY` | Google AI Studio Gemini API Key | `AIzaSy...` | Yes (for AI) |
| `GEMINI_MODEL` | Gemini text model identifier | `gemini-2.5-flash` | Yes (for AI) |
| `FRONTEND_URL` | Allowed CORS origins (comma-separated) | `http://localhost:3000,https://homehub.vercel.app` | Yes (in prod) |

### Frontend Configuration (`frontend/.env`)

| Variable | Description | Example / Default | Required |
| :--- | :--- | :--- | :--- |
| `REACT_APP_API_URL` | Base API URL pointing to Express backend | `http://127.0.0.1:5000/api` | Yes |

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js**: v18.x, v20.x, or v24.x
* **npm**: v9.x or later
* **MongoDB**: Local instance or free MongoDB Atlas cluster

### 1. Clone & Configure Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, and GEMINI_API_KEY
npm run seed     # (Optional) Populates sample verified properties
npm run dev      # Starts Express API at http://localhost:5000
```

### 2. Configure & Launch Frontend
```bash
cd ../frontend
npm install
# Ensure .env has REACT_APP_API_URL=http://127.0.0.1:5000/api
npm start        # Launches React SPA at http://localhost:3000
```

---

## 🌐 Production Deployment Guide

### Frontend Deployment (Vercel)
1. Push repository to GitHub.
2. In the Vercel Dashboard, import the project and set **Root Directory** to `frontend`.
3. Set Environment Variable:
   * `REACT_APP_API_URL`: Your deployed backend URL (e.g. `https://homehub-backend.onrender.com/api`).
4. Vercel automatically detects [`vercel.json`](file:///d:/MERN/reactjs/frontend/vercel.json) to configure SPA client-side routing (`/* -> /index.html`).

### Backend Deployment (Render)
1. In the Render Dashboard, create a new **Web Service** connected to your repository.
2. Set **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables matching the table above (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `FRONTEND_URL`).
6. Render will automatically verify the `/health` endpoint for 0-downtime healthchecks.

---

## 🛠️ Diagnostics & Administrative Tools

* **Test Multi-Tab Session Isolation**:
  ```bash
  node backend/scripts/testMultiTabAuth.js
  ```
* **Test Gemini Connectivity**:
  ```bash
  node backend/scripts/testGeminiSdk.js
  ```
* **Admin Password Recovery**:
  To safely reset the admin password without exposing credentials in Git:
  ```powershell
  $env:NEW_ADMIN_PASSWORD="YourSecurePasswordHere123!"
  node backend/scripts/resetAdminPassword.js
  Remove-Item Env:\NEW_ADMIN_PASSWORD
  ```

---

## 📄 License
This project is proprietary and developed for HomeHub Real Estate Management.
