# Backend Deployment on Railway (Free)

## Prerequisites
- GitHub repo: https://github.com/gauhar-devAi/shopease (already pushed ✅)
- Railway account (free tier): https://railway.app
- Database already deployed on Railway ✅

## Step 1: Connect GitHub to Railway
1. Go to https://railway.app
2. Sign up / Log in
3. Click **New Project** → **Deploy from GitHub**
4. Select repo: `gauhar-devAi/shopease`
5. Click **Deploy**

## Step 2: Configure Backend Service
1. After deploy, click on the project
2. In **Services**, click **shopease** repo
3. Click **Settings** → **Root Directory**
   - Set to: `backend`
4. Click **Deployment** → Edit Start Command:
   - Change to: `node server.js`
5. Build Command should auto-detect: `npm install`

## Step 3: Add Environment Variables
Click **Variables** tab, paste these:

```
PORT=5000
JWT_SECRET=your_super_secret_key_here_change_it
CORS_ORIGIN=https://shopease-frontend.netlify.app
DB_HOST=shuttle.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=LAOIvdnkVklxislnlPiznRBmQhSoWGEd
DB_NAME=railway
DB_PORT=22967
DB_SSL=false
NODE_ENV=production
```

**Note:** Replace `JWT_SECRET` with a random strong string (e.g., use https://uuidgenerator.net)

## Step 4: Deploy
1. After adding variables, Railway auto-deploys
2. Wait for green checkmark (2-3 minutes)
3. Click on your service → **Public URL**
4. Copy that URL — this is your backend live link!

Example: `https://shopease-backend.up.railway.app`

## Step 5: Test Backend
Test these in browser:
- `YOUR_BACKEND_URL/` → Should show ShopEase UI
- `YOUR_BACKEND_URL/api/health` → Should return `{"status":"ok"}`
- `YOUR_BACKEND_URL/test-db` → Should show DB connection status

---

**Your Backend Live URL will be displayed in Railway dashboard after deployment.**
