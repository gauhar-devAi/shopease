// Base URL of our backend
const API_URL = 'http://localhost:5000/api';

// Helper: get token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper: get logged in user
const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

// Helper: check if logged in
const isLoggedIn = () => !!getToken();

// Update navbar based on login status
const updateNavbar = () => {
  const authLink = document.getElementById('authLink');
  const logoutBtn = document.getElementById('logoutBtn');
  const changePasswordLink = document.getElementById('changePasswordLink');

  if (isLoggedIn() && authLink && logoutBtn) {
    authLink.style.display = 'none';
    logoutBtn.style.display = 'block';
    if (changePasswordLink) {
      changePasswordLink.style.display = 'block';
    }
  } else if (changePasswordLink) {
    changePasswordLink.style.display = 'none';
  }
  
  // Update admin link visibility
  if (typeof updateAdminLinkVisibility === 'function') {
    updateAdminLinkVisibility();
  }
};

// Show admin links only for admin users
const updateAdminLinkVisibility = () => {
  const user = getUser();
  const adminLink = document.getElementById('adminLink');

  if (!adminLink) return;

  adminLink.style.display = user && user.role === 'admin' ? 'block' : 'none';
};

const checkAndShowAdminLink = updateAdminLinkVisibility;

// Logout function
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Hide admin link after logout
  if (typeof updateAdminLinkVisibility === 'function') {
    updateAdminLinkVisibility();
  }
  
  window.location.href = 'login.html';
};

// Run on every page load
updateNavbar();

function highlightActiveNav() {
  let currentPath = window.location.pathname.split('/').pop();
  if (!currentPath) currentPath = 'index.html';
  const navLinks = document.querySelectorAll('.market-actions a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
document.addEventListener('DOMContentLoaded', highlightActiveNav);
