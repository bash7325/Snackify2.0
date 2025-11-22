# Snackify 2.0 - AI Coding Agent Instructions

## Architecture Overview

Snackify is a full-stack snack request management app with:
- **Frontend**: Angular 15 SPA (`src/`) serving from root
- **Backend**: Express.js REST API (`snack-request-backend/server.js`) running on port 3000
- **Database**: SQLite (`snack_requests.db`) with two tables: `users` and `snack_requests`
- **Deployment**: Frontend on Netlify (with SPA redirects), backend on Heroku
- **Containerization**: Docker support with production and development compose files

### Environment Configuration System (NEW)
Services now use Angular environment files instead of hardcoded URLs:
```typescript
// src/environments/environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// src/environments/environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://snackify-backend-c8a799790919.herokuapp.com/api'
};

// Usage in services
import { environment } from '../environments/environment';
private apiUrl = environment.apiUrl;
```

## Database Schema

**users table:**
- `id` (PK), `username` (UNIQUE), `password` (bcrypt hashed), `role` ('user'|'Admin'), `name`

**snack_requests table:**
- `id` (PK), `user_id` (FK to users), `snack`, `drink`, `misc`, `link`
- `ordered_flag` (0|1), `keep_on_hand` (0|1)
- `created_at`, `ordered_at` (SQLite datetime strings in localtime)

## Critical Patterns

### 1. Boolean-to-Integer Mapping
SQLite stores booleans as integers. Backend expects/returns 0/1:
```typescript
// Frontend service layer converts
updateKeepOnHandStatus(requestId: number, keepOnHand: boolean) {
  return this.http.put(`${this.apiUrl}/${requestId}/keep`, 
    { keep_on_hand: keepOnHand ? 1 : 0 }
  );
}
```

### 2. Authentication Flow
- Login/register store user object (including `id`, `role`, `name`) in `localStorage` as JSON
- `AuthService.getUser()` returns Observable from localStorage (not a live API call)
- Role check: `user.role === 'Admin'` (exact string match, case-sensitive)
- No JWT tokens - relies on client-side localStorage persistence

### 3. Backend Database Operations
Mix of callback-based and promisified sqlite3 queries:
```javascript
// Promisified for async/await
const row = await new Promise((resolve, reject) => {
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

// Callback style for simple operations
db.run('UPDATE snack_requests SET ordered_flag = ? WHERE id = ?', 
  [newOrderedStatus, requestId], 
  function(err) { /* handle error */ }
);
```

### 4. Request Categorization
Admin dashboard filters requests into three lists:
- `snackRequests`: `ordered_flag === 0` (pending)
- `orderedRequests`: `ordered_flag === 1` (fulfilled)
- `keepOnHand`: `keep_on_hand === 1` (recurring items)

### 5. Routing & SPA Deployment
- `src/_redirects` enables client-side routing on Netlify: `/* /index.html 200`
- Duplicate route definitions in `app-routing.module.ts` (line 14 and 18-24 both define `/request`)
- Default route (`''`) goes to `HomeComponent`

## Development Workflow

**Traditional Development:**
```bash
# Terminal 1 - Backend
cd snack-request-backend
node server.js  # port 3000

# Terminal 2 - Frontend
npm start  # ng serve, port 4200
```

**Docker Development (NEW - Recommended):**
```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Production-like build
docker-compose up --build

# View logs
docker-compose logs -f

# Cleanup
docker-compose down -v
```

**Build & Test:**
```bash
npm test  # Karma + Jasmine
npm run build  # outputs to dist/snack-request-app/
```

## Common Tasks

### Adding a New API Endpoint
1. Add route in `snack-request-backend/server.js` using Express patterns
2. Add corresponding method in `auth.service.ts` or `snack-request.service.ts`
3. Use `HttpClient` with typed responses: `http.post<User>(...)`

### Adding a New Component
```bash
ng generate component component-name
```
Register in `app.module.ts` declarations and add route in `app-routing.module.ts`.

### Modifying Database Schema
Update `db.run()` CREATE TABLE statements in `server.js` (lines 21-44). SQLite doesn't auto-migrate; delete `snack_requests.db` to recreate or write manual ALTER statements.

## Deployment Configuration

**Docker Files:**
- `Dockerfile.backend` - Node.js backend container
- `Dockerfile.frontend` - Multi-stage build with nginx
- `docker-compose.yml` - Production deployment
- `docker-compose.dev.yml` - Development with hot reload
- `nginx.conf` - SPA routing configuration

**Netlify Configuration (`netlify.toml`):**
- Build command: `npm run build`
- Publish directory: `dist/snack-request-app`
- SPA redirects configured
- Security headers and cache control

**Heroku Configuration (`Procfile`):**
- Web process: `node snack-request-backend/server.js`

## Known Issues & Quirks

- **Password security**: Bcrypt salt rounds set to 10 (reasonable, but hardcoded)
- **Error handling**: Backend logs to console; frontend shows generic error messages
- **No authentication guards**: Routes like `/admin` accessible to any role; rely on component-level checks
- **Duplicate route definition**: `/request` route defined twice in routing module (functional but redundant)

## Testing Considerations

- All components have `.spec.ts` files generated but may not have comprehensive tests
- Services are injectable with `providedIn: 'root'`
- Mock `HttpClient` and `localStorage` when testing services
- UserResolver (in routing) fetches user from localStorage on navigation
