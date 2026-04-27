╔════════════════════════════════════════════════════════════════╗
║          SHOPEASE - COMPLETE DEPLOYMENT GUIDE                   ║
║      Backend (Railway) + Frontend (Netlify) + DB (Railway)      ║
╚════════════════════════════════════════════════════════════════╝

✅ DATABASE: Already deployed on Railway
✅ CODE: Pushed to GitHub

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: DEPLOY BACKEND ON RAILWAY (5 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: https://railway.app
2. Log in with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select: gauhar-devAi/shopease
5. In Settings:
   - Root Directory: backend
6. In Variables, add:
   PORT=5000
   JWT_SECRET=generate_random_string_here
   DB_HOST=shuttle.proxy.rlwy.net
   DB_USER=root
   DB_PASSWORD=LAOIvdnkVklxislnlPiznRBmQhSoWGEd
   DB_NAME=railway
   DB_PORT=22967
   DB_SSL=false
   NODE_ENV=production

7. Wait for green checkmark ✅
8. Click service → "Public URL"
9. Copy URL → This is YOUR_BACKEND_URL

Example result: https://shopease-backend.up.railway.app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: UPDATE API URL IN CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Edit: frontend/js/api.js
2. Replace:
   const API_URL = window.__API_URL__ || (
     window.location.protocol === 'file:'
       ? 'http://localhost:5000/api'
       : `${window.location.origin}/api`
   );
   
   With:
   const API_URL = 'https://YOUR_RAILWAY_BACKEND_URL/api';
   
   (Replace YOUR_RAILWAY_BACKEND_URL with actual URL from Step 1)

3. Save and run:
   git add frontend/js/api.js
   git commit -m "update api url for production"
   git push origin main

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: DEPLOY FRONTEND ON NETLIFY (3 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: https://netlify.com
2. Log in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select: shopease
5. Build settings:
   - Base directory: frontend
   - Publish directory: frontend
   - Build command: (leave empty)
6. Click "Deploy site"
7. Wait for green checkmark ✅
8. Copy the generated URL

Example result: https://shopease-abc123.netlify.app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ FINAL LIVE URLS ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BACKEND API:   https://YOUR_RAILWAY_BACKEND_URL
FRONTEND UI:   https://YOUR_NETLIFY_FRONTEND_URL

Test URLs:
- Backend health:  https://YOUR_RAILWAY_BACKEND_URL/api/health
- Frontend home:   https://YOUR_NETLIFY_FRONTEND_URL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Products don't load?
   → Check API URL in frontend/js/api.js
   → Redeploy Netlify after updating

❌ CORS errors?
   → Add to Railway backend env vars:
     CORS_ORIGIN=https://YOUR_NETLIFY_FRONTEND_URL

❌ Login fails?
   → Ensure JWT_SECRET is set on Railway backend
   → Check database connection (/test-db)

❌ 503 Tunnel error?
   → Delete the old tunnel process
   → This guide uses permanent Railway + Netlify instead

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Detailed guides:
   - RAILWAY_BACKEND_DEPLOY.md
   - NETLIFY_FRONTEND_DEPLOY.md

GitHub: https://github.com/gauhar-devAi/shopease
