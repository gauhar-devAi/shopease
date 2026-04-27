# Backend Deployment (Free) - Render + Free MySQL Host

This project can be deployed on Render's free web service tier.

## 1) Push code to GitHub
- Make sure your repo is on GitHub.
- Keep `backend/.env` out of git (already ignored).

## 2) Create a free MySQL database
Choose any free MySQL provider you prefer. After creating DB, collect:
- host
- port
- database name
- username
- password

You can either set `DATABASE_URL` or use `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`.

## 3) Deploy backend on Render
- Go to Render dashboard
- New -> Web Service
- Connect your GitHub repo
- Root Directory: `backend`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

## 4) Add environment variables in Render
Minimum required:
- `JWT_SECRET` = strong random string
- `CORS_ORIGIN` = frontend URL (example: `https://your-frontend.onrender.com`)

Database (choose one style):
- `DATABASE_URL` = `mysql://user:pass@host:port/db_name`
- OR separate vars: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`

Optional:
- `DB_SSL=true` if your DB host requires TLS

## 5) Verify deployment
- Open backend URL: `/`
- Check DB route: `/test-db`

If `/test-db` fails:
- recheck DB credentials
- if cloud DB requires SSL, set `DB_SSL=true`
- ensure IP/network access is allowed by your DB host

## 6) Connect frontend
Update frontend API base URL to your deployed backend URL.
Then redeploy frontend if needed.

## Notes
- Free tiers may sleep after inactivity.
- First request after sleep can be slow.
