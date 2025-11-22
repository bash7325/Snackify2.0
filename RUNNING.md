# 🚀 Snackify 2.0 - Running Locally

## ✅ Currently Running

Your application is now running at:

- **Frontend (Angular)**: http://localhost:4200
- **Backend (Express API)**: http://localhost:3000

## 🎯 Quick Start

Both servers are already started. Open your browser to:
```
http://localhost:4200
```

## 🔄 Restarting Servers

If you need to restart the servers:

### Backend
```bash
cd snack-request-backend
node server.js
```

### Frontend
```bash
npm start
```

## 🐛 SSL Certificate Issue - Fixed

The SSL certificate issue was resolved by:
```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
npm config set strict-ssl false
npm install --legacy-peer-deps
```

**Note**: This is a temporary workaround for local development. For production, you should fix the certificate issue properly.

## 📦 Project Structure

```
Frontend:  http://localhost:4200  → Angular SPA
Backend:   http://localhost:3000  → Express REST API
Database:  ./snack-request-backend/snack_requests.db → SQLite
```

## 🌐 Environment Configuration

### Development (Current)
- Uses `src/environments/environment.ts`
- API URL: `http://localhost:3000/api`

### Production
- Uses `src/environments/environment.prod.ts`  
- API URL: `https://snackify-backend-c8a799790919.herokuapp.com/api`

## 🚀 Deployment

### Frontend (Netlify)
```bash
npm run build
# Deploy dist/snack-request-app/ to Netlify
```

Configuration in `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist/snack-request-app`
- SPA redirects enabled

### Backend (Heroku)
```bash
git push heroku main
```

Configuration in `Procfile`:
- Web process: `node snack-request-backend/server.js`

## 📝 First Steps

1. **Create an Admin Account**
   - Go to http://localhost:4200
   - Click "Create Account"
   - Fill in details and select "Admin" role
   - Login with your credentials

2. **Submit a Request**
   - Click "Request" in navigation
   - Fill out the form
   - Submit your first snack request

3. **Access Admin Dashboard**
   - Login as an admin user
   - Navigate to "Admin Dashboard"
   - Manage all requests

## 🔧 Common Commands

```bash
# Install dependencies (already done)
npm install --legacy-peer-deps

# Start development servers
npm start                          # Frontend
cd snack-request-backend && node server.js  # Backend

# Build for production
npm run build

# Run tests
npm test

# Check for errors
npm audit
```

## 🛑 Stopping Servers

Press `Ctrl+C` in each terminal where the servers are running.

## 📚 Additional Resources

- [README.md](./README.md) - Full project documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Architecture details

## 💡 Tips

- Hot reload is enabled on the frontend - changes to `.ts`, `.html`, or `.css` files will automatically refresh
- Backend changes require manual restart
- Database is created automatically on first backend startup
- Check browser console for any frontend errors
- Check terminal output for backend errors

Happy coding! 🎉
