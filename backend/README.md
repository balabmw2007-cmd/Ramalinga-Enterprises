# Ramalinga Enterprises — Backend API

Node.js/Express API powering the Ramalinga Enterprises home appliances website: user
accounts (register/login with JWT) and a product catalog endpoint the frontend calls.

## Stack
- Node.js + Express
- MongoDB via Mongoose (`config/db.js`, `models/User.js`, `models/Product.js`)
- JWT auth (`jsonwebtoken`) with hashed passwords (`bcryptjs`)

## Getting started

### 1. Get a MongoDB database
Pick one:
- **Local:** install MongoDB Community Server, then it runs at `mongodb://127.0.0.1:27017`.
- **Atlas (free, no local install):** create a cluster at mongodb.com/cloud/atlas,
  add a database user, allow your IP, and copy the connection string it gives you.

### 2. Configure and run
```bash
cd backend
npm install
cp .env.example .env       # set MONGODB_URI and a real JWT_SECRET
npm run seed                 # inserts sample appliances into the products collection
npm run dev                  # starts on http://localhost:5000 with auto-reload
```

Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Check the connection any time:
```bash
curl http://localhost:5000/api/health
# { "status": "ok", "db": "connected", ... }
```

## API reference

| Method | Route              | Auth | Description                        |
|--------|---------------------|------|-------------------------------------|
| GET    | `/api/health`        | No   | Health check                        |
| POST   | `/api/auth/register`| No   | Create account → `{ token, user }`  |
| POST   | `/api/auth/login`   | No   | Log in → `{ token, user }`          |
| GET    | `/api/auth/me`       | Yes  | Current user profile                |
| GET    | `/api/products`      | No   | List products (`?category=`, `?search=`) |
| GET    | `/api/products/:id`  | No   | Single product                      |

Send the token from register/login as a header on protected routes:
```
Authorization: Bearer <token>
```

### Example: register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Asha Rao","email":"asha@example.com","password":"secretpass123"}'
```

### Example: login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"asha@example.com","password":"secretpass123"}'
```

## Connecting to GitHub

From the **project root** (one level up, containing both `backend/` and `frontend/`):

```bash
git init
git add .
git commit -m "Initial commit: Ramalinga Enterprises full-stack site"
git branch -M main
git remote add origin https://github.com/<your-username>/ramalinga-enterprises.git
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `.env`, and generated `data/users.json`
so secrets and local data never get committed.

## Deploying
Any Node host works (Render, Railway, Fly.io, an EC2/VM, etc.):
1. Set environment variables from `.env.example` in the host's dashboard (never commit `.env`).
2. Build command: `npm install`
3. Start command: `npm start`
4. Point the frontend's `API_BASE_URL` (in `frontend/js/main.js` and `js/auth.js`) at the deployed URL.

## Project structure
```
backend/
├── server.js            # Express app entry point — connects to MongoDB, then listens
├── config/db.js          # Mongoose connection helper
├── routes/                # auth.js, products.js
├── middleware/auth.js     # JWT verification
├── models/
│   ├── User.js             # Mongoose schema + password hashing
│   └── Product.js           # Mongoose schema for the catalog
├── data/seed.js            # Upserts sample appliances into MongoDB
├── .env.example
└── package.json
```

## Troubleshooting
- **"MONGODB_URI is not set"** — copy `.env.example` to `.env` and fill it in.
- **Connection refused (local Mongo)** — make sure `mongod` is running (`brew services start mongodb-community` on macOS, or `sudo systemctl start mongod` on Linux).
- **Atlas auth/timeout errors** — double-check the database user's password (URL-encode special characters) and that your current IP is on the cluster's access list.
