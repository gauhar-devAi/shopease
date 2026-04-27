# Frontend Deployment on Netlify (Free)

## Prerequisites
- Backend deployed on Railway (with live URL)
- GitHub repo: https://github.com/gauhar-devAi/shopease ✅

## Step 1: Update Frontend API URL (BEFORE deploying)
Before deploying to Netlify, update the API base URL:

Edit `frontend/js/api.js`:
```javascript
// Change this:
const API_URL = window.__API_URL__ || (
  window.location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : `${window.location.origin}/api`
);

// To this (replace with your Railway backend URL):
const API_URL = 'https://YOUR_RAILWAY_BACKEND_URL/api';
```

**Example:** 
```javascript
const API_URL = 'https://shopease-backend.up.railway.app/api';
```

Then commit and push:
```bash
git add frontend/js/api.js
git commit -m "update api url for netlify deployment"
git push origin main
```

## Step 2: Connect GitHub to Netlify
1. Go to https://netlify.com
2. Sign up / Log in (use GitHub)
3. Click **Add new site** → **Import an existing project**
4. Select **GitHub**
5. Authorize & select repo: `shopease`
6. Click **Connect**

## Step 3: Configure Build Settings
1. **Base directory:** `frontend`
2. **Build command:** Leave empty (static site)
3. **Publish directory:** `frontend`
4. Click **Deploy site**

## Step 4: Wait for Deployment
- Netlify will show a live URL (e.g., `https://shopease-xyz123.netlify.app`)
- Wait for green checkmark (1-2 minutes)

## Step 5: Test Frontend
Open the Netlify URL in browser:
- Homepage should load
- Click "Home" → Products should load from Railway backend
- Try Login/Register
- Test Cart, Orders, Admin panel

---

**Your Frontend Live URL will be generated automatically by Netlify.**

## Troubleshooting
- **Products don't load:** Check API URL in `frontend/js/api.js`
- **CORS errors:** Ensure Railway backend has correct `CORS_ORIGIN` env var
- **Login fails:** Check JWT_SECRET matches on backend

---

## Quick Links
- Frontend Repo: https://github.com/gauhar-devAi/shopease
- Netlify Dashboard: https://app.netlify.com
- Railway Dashboard: https://railway.app
