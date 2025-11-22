# 🚀 Quick Start Guide - Snackify 2.0

## For First-Time Setup

### Option 1: Docker (Easiest) 🐳

**Prerequisites:** Docker Desktop installed

```bash
# Clone the repo
git clone https://github.com/bash7325/Snackify2.0.git
cd Snackify2.0

# Start everything with one command
docker-compose -f docker-compose.dev.yml up
```

✅ **That's it!** Open `http://localhost:4200` in your browser.

### Option 2: Traditional Setup

**Prerequisites:** Node.js 18+ installed

```bash
# Clone the repo
git clone https://github.com/bash7325/Snackify2.0.git
cd Snackify2.0

# Install dependencies
npm install

# Terminal 1 - Start backend
cd snack-request-backend
node server.js

# Terminal 2 - Start frontend (new terminal)
npm start
```

✅ Open `http://localhost:4200` in your browser.

## First Login

The app starts with an empty database. You'll need to:

1. Click "Create Account" on the home page
2. Fill in your details:
   - Username: `admin`
   - Password: (your choice)
   - Name: `Admin User`
   - Role: Select **Admin** (important!)
3. Login with your new credentials
4. As an admin, you can access the Admin Dashboard

## Making Your First Request

1. Login as any user
2. Click "Request" in the navigation
3. Select item type (Snack/Drink/Misc)
4. Enter the item name
5. Optionally add a product link
6. Click "Submit Request"

## Using the Admin Dashboard

**Only accessible by users with "Admin" role**

1. Login as an admin user
2. Navigate to the Admin Dashboard
3. View three sections:
   - **Pending Requests**: New requests waiting to be fulfilled
   - **Ordered Requests**: Items that have been ordered
   - **Keep on Hand**: Recurring items to always stock

4. Actions you can take:
   - Mark items as ordered
   - Flag items to keep on hand
   - Delete requests

## Environment Switching

### Development (Local Backend)
Uses `src/environments/environment.ts`:
```typescript
apiUrl: 'http://localhost:3000/api'
```

### Production (Heroku Backend)
Uses `src/environments/environment.prod.ts`:
```typescript
apiUrl: 'https://snackify-backend-c8a799790919.herokuapp.com/api'
```

Angular automatically uses the correct file based on build configuration.

## Common Issues & Solutions

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### Frontend can't connect to backend
1. Verify backend is running on port 3000
2. Check browser console for CORS errors
3. Ensure `environment.ts` has correct URL

### Database issues
```bash
# Reset database (deletes all data!)
rm snack_requests.db

# Restart backend - it will recreate the database
cd snack-request-backend
node server.js
```

### Docker not working
```bash
# Clean up everything
docker-compose down -v

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml up --build
```

## Development Tips

### Hot Reload
- **Frontend**: Changes auto-reload (save any file)
- **Backend**: Restart `node server.js` after changes
- **Docker Dev Mode**: Both frontend and backend support hot reload

### Testing
```bash
npm test  # Run Karma/Jasmine tests
```

### Building for Production
```bash
npm run build  # Creates dist/snack-request-app/
```

## Project Structure at a Glance

```
📁 src/app/
  ├── 🏠 home/              - Landing page
  ├── 🔐 login/             - User login
  ├── ✍️  register/          - User registration  
  ├── 📝 request-form/      - Submit snack requests
  ├── 📊 admin-dashboard/   - Manage all requests (Admin only)
  └── 📜 snack-list/        - View your request history

📁 snack-request-backend/
  └── server.js            - Express API (all routes here)

📁 src/environments/
  ├── environment.ts       - Dev config (localhost)
  └── environment.prod.ts  - Production config (Heroku)
```

## Next Steps

- ⚙️ Customize the theme in `src/styles.css`
- 🔐 Add route guards for better security
- 📱 Test responsive design on mobile
- 🚀 Deploy to Netlify (frontend) and Heroku (backend)
- 📊 Add analytics or reporting features

## Need Help?

- 📖 Check the full [README.md](./README.md)
- 🤖 Review [.github/copilot-instructions.md](./.github/copilot-instructions.md)
- 🐛 [Open an issue](https://github.com/bash7325/Snackify2.0/issues)

Happy snacking! 🍕🥤✨
