# Ramalinga Enterprises — Frontend

Static frontend (no build step) for the Ramalinga Enterprises home appliances site:
home page with a Three.js ambient 3D appliance background, nav bar with live auth
state, login/register pages, and a product catalog page wired to the backend API.

## Run it

Any static file server works. From this `frontend/` folder:

```bash
npx serve .
# or
python3 -m http.server 5500
```

Then open `http://localhost:5500` (or whatever port your server prints).

Make sure the **backend** is running too (see `../backend/README.md`) — the
catalog and login/register pages call it at `http://localhost:5000/api` by
default.

## Pointing at a different backend
Set this before the other scripts load, e.g. add to each HTML `<head>`:
```html
<script>window.RAMALINGA_API_BASE_URL = "https://your-api.example.com/api";</script>
```

## Structure
```
frontend/
├── index.html       # Home — hero, 3D background, categories, about
├── login.html
├── register.html
├── products.html     # Live catalog from GET /api/products
├── css/style.css      # Design tokens + layout
└── js/
    ├── three-bg.js     # Ambient 3D appliance scene (Three.js r128, CDN)
    ├── auth.js          # Register/login/logout + nav auth state
    └── main.js          # Nav toggle + product catalog rendering
```

## Notes
- Three.js is loaded from a CDN (`cdnjs`) — no `npm install` needed for the frontend.
- Session token is stored in `localStorage` (`re_token`, `re_user`).
- The 3D background respects `prefers-reduced-motion`.
