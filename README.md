# 🍕 Snackify 2.0

Snackify is an app for devs to request snacks, drinks, and more for the office. Built with Angular + Express.
<img width="1460" height="1122" alt="image" src="https://github.com/user-attachments/assets/35012fdd-f0f1-4f44-a79a-c4737656776d" />
<img width="1470" height="828" alt="image" src="https://github.com/user-attachments/assets/84de1bf1-6bd9-4897-9390-8956107c2315" />


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
- Netlify deploys frontend from GitHub, Heroku deploys backend

---
Made with ❤️ and 🍕 by Brandon Ashby
