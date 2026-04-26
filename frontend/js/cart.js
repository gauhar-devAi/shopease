// Get cart from localStorage
const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');

// Save cart to localStorage
const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
};

// Update the cart count badge in navbar
const updateCartBadge = () => {
  const badge = document.getElementById('cartCount');
  if (badge) {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = total;
  }
};

// Add item to cart
const addToCart = (id, name, price, imageUrl) => {
  if (!isLoggedIn()) {
    alert('Please login to add items to cart!');
    window.location.href = 'login.html';
    return;
  }

  const cart = getCart();
  const existing = cart.find(item => item.product_id === id);

  if (existing) {
    existing.quantity += 1;
    if (imageUrl) existing.imageUrl = imageUrl;
  } else {
    cart.push({ product_id: id, name, price, quantity: 1, imageUrl });
  }

  saveCart(cart);
  showCartNotification(name);
};

// Show a small notification when item added
const showCartNotification = (name) => {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    background: #27ae60; color: white;
    padding: 12px 20px; border-radius: 8px;
    font-size: 14px; z-index: 999;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  `;
  notif.textContent = `✅ ${name} added to cart!`;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2500);
};

// Display cart items (for cart.html)
const displayCart = () => {
  const cartItems = document.getElementById('cartItems');
  const cartSummary = document.getElementById('cartSummary');
  if (!cartItems) return;

  const cart = getCart();

  if (cart.length === 0) {
    if (cartSummary) cartSummary.style.display = 'none';
    cartItems.innerHTML = `
      <div class="empty-state">
        <div class="icon">🛒</div>
        <p>Your cart is empty</p>
        <a href="index.html" class="btn btn-primary">Start Shopping</a>
      </div>
    `;
    return;
  }

  if (cartSummary) cartSummary.style.display = 'block';

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img 
        src="${item.imageUrl || `https://via.placeholder.com/80?text=${encodeURIComponent(item.name)}`}" 
        alt="${item.name}" 
        onerror="this.onerror=null;this.src='https://via.placeholder.com/80?text=No+Image';"
      />
      <div class="item-details">
        <h4>${item.name}</h4>
        <div class="item-price">Rs. ${Number(item.price).toLocaleString()}</div>
      </div>
      <div class="quantity-control-wrapper">
        <div class="quantity-control">
          <button onclick="changeQty(${item.product_id}, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQty(${item.product_id}, 1)">+</button>
        </div>
      </div>
      <div class="item-total">
        Rs. ${(item.price * item.quantity).toLocaleString()}
      </div>
      <button 
        class="btn btn-icon delete-btn" 
        onclick="removeFromCart(${item.product_id})"
        title="Remove item">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  `).join('');

  updateSummary(cart);
};

// Change quantity
const changeQty = (id, delta) => {
  const cart = getCart();
  const item = cart.find(i => i.product_id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }
  }
  saveCart(cart);
  displayCart();
};

// Remove item
const removeFromCart = (id) => {
  const cart = getCart().filter(i => i.product_id !== id);
  saveCart(cart);
  displayCart();
};

// Update order summary totals
const updateSummary = (cart) => {
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.getElementById('itemCount').textContent = count;
  document.getElementById('totalPrice').textContent = 
    `Rs. ${total.toLocaleString()}`;
};

// Keep cart/orders header search usable without products.js
const buildProductsPageUrl = () => {
  const params = new URLSearchParams();
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');

  const search = searchInput ? searchInput.value.trim() : '';
  const category = categoryFilter ? categoryFilter.value : '';

  if (search) params.set('search', search);
  if (category) params.set('category', category);

  const query = params.toString();
  return `index.html${query ? `?${query}` : ''}#products`;
};

const loadHeaderCategories = async () => {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;

  // Index page loads categories via products.js already.
  if (document.getElementById('productsGrid')) return;

  try {
    const response = await fetch(`${API_URL}/products/categories`);
    if (!response.ok) return;

    const data = await response.json();
    const categories = Array.isArray(data.categories) ? data.categories : [];

    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      categoryFilter.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load header categories:', error);
  }
};

if (typeof window.filterProducts !== 'function') {
  window.filterProducts = () => {
    window.location.href = buildProductsPageUrl();
  };
}

const initializeHeaderSearch = () => {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && typeof window.filterProducts === 'function') {
        window.filterProducts();
      }
    });
  }

  loadHeaderCategories();
};

// Checkout — place the order
const checkout = async () => {
  if (!isLoggedIn()) {
    alert('Please login first!');
    window.location.href = 'login.html';
    return;
  }

  const cart = getCart();
  if (cart.length === 0) return alert('Your cart is empty!');

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ cartItems: cart })
    });

    const data = await response.json();

    if (!response.ok) {
      return alert(data.message || 'Order failed');
    }

    // Clear cart after successful order
    localStorage.removeItem('cart');
    alert(`🎉 Order placed! Order ID: #${data.orderId}`);
    window.location.href = 'orders.html';

  } catch (error) {
    alert('Something went wrong. Please try again.');
  }
};

// Load orders (for orders.html)
const loadOrders = async () => {
  const list = document.getElementById('ordersList');
  if (!list) return;

  if (!isLoggedIn()) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="icon">🔐</div>
        <p>Please login to see your orders</p>
        <a href="login.html" class="btn btn-primary">Login</a>
      </div>
    `;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/orders/my-orders`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();

    if (data.orders.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="icon">📦</div>
          <p>No orders yet</p>
          <a href="index.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      return;
    }

    list.innerHTML = data.orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <strong>Order #${order.id}</strong>
          <span class="status-badge status-${order.status}">
            ${order.status.toUpperCase()}
          </span>
        </div>
        <p>🛍️ Items: ${order.items || 'N/A'}</p>
        <p>💰 Total: <strong>Rs. ${Number(order.total_price).toLocaleString()}</strong></p>
        <p>📅 Date: ${new Date(order.created_at).toLocaleDateString()}</p>
      </div>
    `).join('');

  } catch (error) {
    list.innerHTML = '<p>Failed to load orders.</p>';
  }
};

// Initialize on page load
updateCartBadge();
displayCart();
loadOrders();
initializeHeaderSearch();