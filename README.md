# 🍕 Snackify 2.0

An app for devs to add things to the snack closet so we all are fat and happy.

![Snackify Banner](https://github.com/bash7325/Snackify2.0/assets/72292490/9c1add5f-81e1-4c6a-a154-d180d31cd5e1)

## 📋 Overview

Snackify is a full-stack snack request management application that allows users to submit snack requests and admins to manage inventory. Built with Angular 15 frontend and Express.js backend with SQLite database.

## ✨ Features

- 🔐 User authentication with role-based access (User/Admin)
- 📝 Submit snack, drink, and misc item requests
- 👨‍💼 Admin dashboard for managing requests
- ✅ Mark items as ordered
- 📌 Keep-on-hand list for recurring items
- 📊 Request history tracking
- 🎨 Modern dark-themed UI

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────┐
│  Angular 15 SPA │ ───► │  Express.js API │ ───► │   SQLite DB  │
│  (Port 4200)    │      │   (Port 3000)   │      │ (snack_      │
│                 │      │                 │      │  requests.db)│
└─────────────────┘      └─────────────────┘      └──────────────┘
```

- **Frontend**: Angular 15 SPA served from root
- **Backend**: Express.js REST API on port 3000
- **Database**: SQLite with `users` and `snack_requests` tables
- **Deployment**: Frontend on Netlify, Backend on Heroku

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Local Development (Traditional)

1. **Clone the repository**
   ```bash
   git clone https://github.com/bash7325/Snackify2.0.git
   cd Snackify2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   cd snack-request-backend
   node server.js
   ```
   Backend runs on `http://localhost:3000`

4. **Start the frontend (in a new terminal)**
   ```bash
   npm start
   ```
   Frontend runs on `http://localhost:4200`

5. **Open your browser**
   Navigate to `http://localhost:4200`

### Local Development (Docker) 🐳

**Option 1: Development mode with hot reload**
```bash
docker-compose -f docker-compose.dev.yml up
```

**Option 2: Production-like build**
```bash
docker-compose up --build
```

Access the app at:
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000`

## 📦 Deployment

### Frontend Deployment (Netlify)

1. **Connect your GitHub repository to Netlify**

2. **Build settings** (configured in `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist/snack-request-app`

3. **Environment variables**: None required (uses `environment.prod.ts`)

4. **Deploy**: Push to `main` branch triggers automatic deployment

### Backend Deployment (Heroku)

1. **Create a Heroku app**
   ```bash
   heroku create snackify-backend
   ```

2. **Deploy**
   ```bash
   git push heroku main
   ```

3. **The `Procfile` handles the startup**: `web: node snack-request-backend/server.js`

4. **Update frontend environment**: Update `src/environments/environment.prod.ts` with your Heroku backend URL

### Alternative: Deploy Both with Docker

```bash
# Build images
docker build -f Dockerfile.backend -t snackify-backend .
docker build -f Dockerfile.frontend -t snackify-frontend .

# Push to your container registry
docker push your-registry/snackify-backend
docker push your-registry/snackify-frontend
```

## ⚙️ Configuration

### Environment Files

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.herokuapp.com/api'
};
```

### Backend Configuration

The backend uses SQLite and runs on port 3000 by default. To change:
```javascript
// In snack-request-backend/server.js
const port = process.env.PORT || 3000;
```

## 🗄️ Database Schema

**users table:**
```sql
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- password (TEXT, bcrypt hashed)
- role (TEXT: 'user' or 'Admin')
- name (TEXT)
```

**snack_requests table:**
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER, FK to users)
- snack, drink, misc, link (TEXT)
- ordered_flag (INTEGER: 0 or 1)
- keep_on_hand (INTEGER: 0 or 1)
- created_at, ordered_at (TEXT, SQLite datetime)
```

## 🛠️ Development Commands

```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Generate new component
ng generate component component-name

# Docker commands
docker-compose up              # Start with Docker
docker-compose down            # Stop containers
docker-compose logs -f         # View logs
```

## 📁 Project Structure

```
Snackify2.0/
├── src/
│   ├── app/
│   │   ├── admin-dashboard/   # Admin management interface
│   │   ├── home/              # Landing page
│   │   ├── login/             # Login component
│   │   ├── register/          # Registration component
│   │   ├── request-form/      # Snack request form
│   │   ├── snack-list/        # User's request history
│   │   ├── auth.service.ts    # Authentication service
│   │   └── snack-request.service.ts  # API service
│   ├── environments/          # Environment configs
│   └── styles.css            # Global styles
├── snack-request-backend/
│   └── server.js             # Express API server
├── docker-compose.yml        # Docker production config
├── docker-compose.dev.yml    # Docker dev config
├── Dockerfile.backend        # Backend container
├── Dockerfile.frontend       # Frontend container
├── netlify.toml             # Netlify deployment config
└── Procfile                 # Heroku deployment config
```

## 🎨 UI Improvements (v2.0)

- ✅ Modern dark theme with gradient backgrounds
- ✅ Smooth animations and transitions
- ✅ Improved form styling with better focus states
- ✅ Enhanced table layouts with sticky headers
- ✅ Responsive design for mobile devices
- ✅ Better button hover effects and visual feedback
- ✅ Consistent color scheme with CSS variables

## 🔧 Troubleshooting

### Backend not connecting
- Ensure backend is running on port 3000
- Check `environment.ts` has correct API URL
- Verify CORS is enabled in `server.js`

### Database errors
- Delete `snack_requests.db` to recreate with fresh schema
- Check SQLite3 is installed: `npm list sqlite3`

### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Angular cache: `rm -rf .angular`

### Docker issues
- Clean up: `docker-compose down -v`
- Rebuild: `docker-compose up --build --force-recreate`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Brandon Ashby** - [bash7325](https://github.com/bash7325)

---

Made with ❤️ and 🍕
