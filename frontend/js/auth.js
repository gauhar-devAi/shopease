// Show alert messages to user
const showAlert = (type, message) => {
  const el = document.getElementById(type + 'Alert');
  el.textContent = message;
  el.style.display = 'block';
  // Hide after 4 seconds
  setTimeout(() => { el.style.display = 'none'; }, 4000);
};

// REGISTER function
const registerUser = async () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Frontend validation
  if (!name || !email || !password) {
    return showAlert('error', 'Please fill in all fields');
  }
  if (password.length < 6) {
    return showAlert('error', 'Password must be at least 6 characters');
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return showAlert('error', data.message);
    }

    showAlert('success', 'Account created! Redirecting to login...');
    setTimeout(() => { window.location.href = 'login.html'; }, 2000);

  } catch (error) {
    showAlert('error', 'Something went wrong. Try again.');
  }
};

// LOGIN function
const loginUser = async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    return showAlert('error', 'Please fill in all fields');
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return showAlert('error', data.message);
    }

    // Save token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Update admin link visibility if function exists
    if (typeof checkAndShowAdminLink === 'function') {
      checkAndShowAdminLink();
    }

    showAlert('success', 'Login successful! Redirecting...');
    setTimeout(() => {
      window.location.href = data.user && data.user.role === 'admin'
        ? 'admin/dashboard.html'
        : 'index.html';
    }, 1500);

  } catch (error) {
    showAlert('error', 'Something went wrong. Try again.');
  }
};

// CHANGE PASSWORD function
const changePassword = async () => {
  const currentPassword = document.getElementById('currentPassword').value.trim();
  const newPassword = document.getElementById('newPassword').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return showAlert('error', 'Please fill in all fields');
  }

  if (newPassword.length < 6) {
    return showAlert('error', 'New password must be at least 6 characters');
  }

  if (newPassword !== confirmPassword) {
    return showAlert('error', 'New passwords do not match');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return showAlert('error', 'Please login first');
  }

  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      return showAlert('error', data.message || 'Could not change password');
    }

    showAlert('success', 'Password changed successfully!');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  } catch (error) {
    showAlert('error', 'Something went wrong. Try again.');
  }
};