# Ramalinga Enterprises — Home Appliances Website

Full-stack starter for a home appliances storefront: static frontend (3D ambient
background, nav bar, login/register, product catalog) + a Node.js/Express backend
(JWT auth, product API).

```
ramalinga-enterprises/
├── frontend/     # HTML/CSS/JS site — see frontend/README.md
├── backend/      # Express API — see backend/README.md
└── .gitignore
```

## Quick start

**Backend** (terminal 1) — needs a MongoDB database, local or Atlas (see `backend/README.md`):
```bash
cd backend
npm install
cp .env.example .env      # set MONGODB_URI and a real JWT_SECRET
npm run seed
npm run dev                 # http://localhost:5000
```

**Frontend** (terminal 2):
```bash
cd frontend
npx serve .                  # http://localhost:3000 (or the port it prints)
```

Open the frontend URL, click **Sign up**, create an account, then visit
**Products** to see the catalog served by the backend.

## Push to GitHub

```bash
cd ramalinga-enterprises
git init
git add .
git commit -m "Initial commit: Ramalinga Enterprises full-stack site"
git branch -M main
git remote add origin https://github.com/<your-username>/ramalinga-enterprises.git
git push -u origin main
```

Create the empty repo on GitHub first (github.com → New repository), then run
the commands above with your actual repo URL. `.gitignore` already keeps
`node_modules/`, `.env`, and generated data files out of version control.

## What's included
- **Frontend:** responsive nav bar with live login state, Three.js ambient 3D
  background built from stylized appliance shapes (fridge, washer, fan, AC unit),
  login/register forms, and a product catalog page that calls the backend.
- **Backend:** Express API backed by MongoDB (Mongoose) with `/api/auth/register`,
  `/api/auth/login`, `/api/auth/me` (JWT-protected), and `/api/products`;
  password hashing with bcrypt; rate limiting on auth routes.

See `frontend/README.md` and `backend/README.md` for details on each half.
