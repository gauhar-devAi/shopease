/**
 * PRODUCTION API CONFIG
 * Update this with your Railway backend URL after deployment
 * Replace: YOUR_RAILWAY_BACKEND_URL with actual URL from Railway dashboard
 * Example: https://shopease-backend.up.railway.app/api
 */

// ⬇️ CHANGE THIS LINE WITH YOUR RAILWAY BACKEND URL ⬇️
const BACKEND_URL = 'https://YOUR_RAILWAY_BACKEND_URL'; // Remove /api from end

// Auto-detect environment and build API_URL
const API_URL = window.__API_URL__ || (
  window.location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : BACKEND_URL 
      ? `${BACKEND_URL}/api`
      : `${window.location.origin}/api`
);

console.log('🔗 API_URL:', API_URL);
