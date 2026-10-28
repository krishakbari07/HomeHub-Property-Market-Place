# HomeHub — Modern Real Estate Marketplace Client

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React%20Router-v7-CA4245?logo=reactrouter)](https://reactrouter.com/)
[![Lucide](https://img.shields.io/badge/Lucide%20Icons-0.454.0-F97316)](https://lucide.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com/)

An architectural, responsive frontend client for the **HomeHub** real-estate marketplace SaaS platform. Built with React 19, Tailwind CSS, and React Router v7, engineered for luxury properties, commercial portfolios, and multi-role operations.

---

## 🏛️ Key Highlights & Features

- **Public Landing Experience & Smart Routing**:
  - Root route `/` always opens the public HomeHub landing page for all visitors.
  - Authenticated sessions remain active without disruptive automatic redirections.
  - Dynamic navigation bar: shows Login and Sign Up when logged out; displays direct Dashboard link and User Profile dropdown when logged in.
- **Genuine RERA Real Estate Advisors Directory**:
  - Fully integrated with MongoDB Atlas agent endpoints (`/api/users/agents`).
  - Dynamic computation of managed property portfolios.
  - Stable MongoDB ID identification and Map-based deduplication preventing duplicate cards.
  - Graceful loading skeletons and region-based empty states.
- **Tab-Isolated Multi-Tab Authentication**:
  - Independent `sessionStorage` management allowing concurrent logins (e.g., Buyer on Tab 1, Agent on Tab 2).
  - Safe tab-scoped logout: terminating a session in one tab does not disturb sessions in other browser tabs.
- **Smooth, Accessible CSS Animations**:
  - High-performance micro-interactions: card elevation (`.card-hover-effect`), tactile button presses (`active:scale-[0.98]`), and modal entrances (`@keyframes scaleIn`, `@keyframes fadeIn`).
  - **Zero motion sickness**: Strict adherence to `@media (prefers-reduced-motion: reduce)` across all animated elements.
- **Google Gemini AI Assistant Integration**:
  - AI Real-Estate Chatbot Drawer grounded exclusively in live catalog listings.
  - Natural Language Search converting conversational queries into structured filters.
  - Automated listing copywriter and valuation estimator for sellers and agents.
- **Production Performance Optimizations**:
  - Route-based code splitting using `React.lazy` and `Suspense` for sub-second initial loads.
  - Throttled background synchronization: eliminates aggressive 5-second polling in favor of window focus sync and a gentle 60-second fallback.
  - Safe fallback for API endpoints ensuring remote clients never query `localhost` in production.

---

## 🛠️ Technology Stack

- **Framework**: React 19 (SPA)
- **Styling**: Tailwind CSS v3 (Custom HomeHub luxury palette)
- **Routing**: React Router v7
- **HTTP Client**: Axios with automatic JWT bearer interceptors
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library, User Event

---

## 📁 Repository Structure

```
frontend/
├── public/
│   ├── index.html            # HTML template with mobile viewport optimizations
│   └── manifest.json         # PWA metadata
├── src/
│   ├── api/
│   │   └── api.js            # Axios client, baseURL fallback, and 401 interceptors
│   ├── components/
│   │   ├── admin/            # Admin management modals and data tables
│   │   ├── common/           # PropertyCard, ImageWithFallback, Modal, Button
│   │   ├── dashboard/        # DashboardCard, Sidebar, DashboardNavbar
│   │   └── landing/          # HeroSection, MainNavbar, SearchBar, FeaturedProperties
│   ├── context/
│   │   ├── AuthContext.jsx   # Multi-tab auth provider and session persistence
│   │   └── PropertyContext.jsx # Catalog state, wishlist, and throttled background sync
│   ├── pages/
│   │   ├── auth/             # Login, Register, ForgotPassword, ResetPassword
│   │   ├── dashboard/        # Role-based dashboards (Buyer, Seller, Agent, Admin)
│   │   ├── landing/          # Home, Buy, Rent, Sell, About, Contact, Agents
│   │   └── property/         # PropertyDetails, AIRecommendations
│   ├── routes/
│   │   ├── AppRoutes.jsx     # Route definitions with lazy-loaded chunks
│   │   └── RoleRoute.jsx     # Strict role-based route guard
│   ├── services/
│   │   └── api.js            # Centralized API service functions
│   ├── utils/
│   │   └── session.js        # Tab-scoped sessionStorage engine
│   ├── index.css             # Tailwind base & smooth animation keyframes
│   ├── index.js              # Application root entry
│   └── setupTests.js         # Jest test environment and TextEncoder polyfills
├── package.json              # Dependencies and build scripts
├── tailwind.config.js        # HomeHub architectural theme & color tokens
└── vercel.json               # SPA client-side rewrite rules for Vercel
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- HomeHub Backend running locally on port `5000` (or deployed remote backend)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/krishakbari07/homehub-frontend.git
cd homehub-frontend

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Populate `.env` with your backend URL:
```ini
# Backend API Base URL
REACT_APP_API_URL=http://127.0.0.1:5000/api
```

### 4. Running the Development Server
```bash
npm start
```
The application will launch automatically at `http://localhost:3000`.

---

## 🧪 Automated Testing

Run the test suite using React Scripts:
```bash
# Run all tests once
npm test -- --watchAll=false
```
Verifies landing page routing, multi-role navigation, unauthenticated route guards, and genuine agent deduplication.

---

## 🏗️ Production Build

Create an optimized, minified production build:
```bash
npm run build
```
Output files are packaged into the `build/` directory with cache-busting content hashes.

---

## 🚀 Deployment to Vercel

HomeHub Frontend is optimized for one-click deployment on [Vercel](https://vercel.com):

1. Import the repository into your Vercel Dashboard.
2. Select **Create React App** preset.
3. Configure the **Environment Variable**:
   - `REACT_APP_API_URL`: Your deployed backend API URL (e.g., `https://your-backend.onrender.com/api`).
4. The included `vercel.json` automatically configures SPA route rewrites to `index.html`, ensuring direct navigation to `/buy`, `/rent`, `/agents`, and `/property/:id` functions seamlessly without 404s.

---

## 📄 License
ISC License. Built by [Krish Akbari](https://github.com/krishakbari07).
