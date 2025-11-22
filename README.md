# 🍕 Snackify 2.0

Snackify is a fun app for devs to request snacks, drinks, and more for the office. Built with Angular + Express.

## 🚀 Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/bash7325/Snackify2.0.git
   cd Snackify2.0
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the backend**
   ```bash
   cd snack-request-backend
   node server.js
   ```
   (Backend runs on http://localhost:3000)
4. **Start the frontend** (in a new terminal)
   ```bash
   npm start
   ```
   (Frontend runs on http://localhost:4200)

## 🐳 Docker (optional)
- For dev: `docker-compose -f docker-compose.dev.yml up`
- For prod-like: `docker-compose up --build`

## ✨ Features
- User login & registration
- Submit snack, drink, misc requests
- Admin dashboard: manage, order, stats, top requests
- Keep-on-hand list for recurring items
- Search, filter, sort, bulk actions, undo, export
- Modern dark theme, responsive UI

## 🛠️ Dev Tips
- If you get DB errors, delete `snack_requests.db` and restart backend
- Update `src/environments/environment.prod.ts` for your backend URL if deploying
- Netlify deploys frontend from GitHub, Heroku deploys backend

---
Made with ❤️ and 🍕 by Brandon & friends
