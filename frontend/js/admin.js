// Check admin access on every admin page
const checkAdmin = () => {
  const user = getUser();
  if (!user || user.role !== 'admin') {
    const notice = document.getElementById('adminAccessNotice');
    const layout = document.querySelector('.admin-layout');

    if (notice && layout) {
      notice.style.display = 'flex';
      Array.from(layout.children).forEach((child) => {
        if (child.id !== 'adminAccessNotice') child.style.display = 'none';
      });
    } else {
      window.location.href = '../login.html';
    }

    return false;
  }
  // Show admin name in topbar
  const nameEl = document.getElementById('adminName');
  if (nameEl) nameEl.textContent = user.name;
  return true;
};

// Admin logout
const adminLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../login.html';
};

// ================================
// DASHBOARD
// ================================
const loadDashboard = async () => {
  if (!checkAdmin()) return;

  try {
    // Load stats
    const res = await fetch(`${API_URL.replace('/api','')}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const stats = await res.json();

    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('totalRevenue').textContent = 
      Number(stats.totalRevenue).toLocaleString();

    // Load recent orders
    const ordRes = await fetch(`${API_URL}/orders/all`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const ordData = await ordRes.json();

    // Show only last 5 orders
    const recent = ordData.orders.slice(0, 5);
    const tbody = document.getElementById('recentOrders');

    if (recent.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" 
            style="text-align:center; padding:20px; color:#999">
            No orders yet
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = recent.map(order => `
      <tr>
        <td><strong>#${order.id}</strong></td>
        <td>${order.customer_name || 'N/A'}</td>
        <td style="max-width:200px; overflow:hidden; 
          text-overflow:ellipsis; white-space:nowrap">
          ${order.items || 'N/A'}
        </td>
        <td><strong>Rs. ${Number(order.total_price).toLocaleString()}</strong></td>
        <td>
          <span class="status-badge status-${order.status}">
            ${order.status.toUpperCase()}
          </span>
        </td>
        <td>${new Date(order.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Dashboard error:', error);
  }
};

// ================================
// PRODUCTS MANAGEMENT
// ================================
const loadAdminProducts = async () => {
  if (!checkAdmin()) return;

  try {
    const res = await fetch(`${API_URL}/products`);
    const data = await res.json();
    const products = data.products;

    document.getElementById('productCount').textContent = 
      `${products.length} products total`;

    const tbody = document.getElementById('productsTable');

    if (products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" 
            style="text-align:center; padding:30px; color:#999">
            No products yet. Add your first product!
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>#${p.id}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.category_name || 'N/A'}</td>
        <td>Rs. ${Number(p.price).toLocaleString()}</td>
        <td>
          <span style="color: ${p.stock < 10 ? '#e74c3c' : '#27ae60'}; 
            font-weight: bold">
            ${p.stock}
          </span>
        </td>
        <td style="display:flex; gap:8px">
          <button class="btn btn-primary" 
            style="padding:7px 14px; font-size:13px"
            onclick="openEditModal(${p.id},'${p.name.replace(/'/g,"\\'")}',
              '${(p.description||'').replace(/'/g,"\\'")}',
              ${p.price},${p.stock},${p.category_id},'${p.image_url||''}')">
            ✏️ Edit
          </button>
          <button class="btn btn-danger" 
            style="padding:7px 14px; font-size:13px"
            onclick="deleteProduct(${p.id})">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Load products error:', error);
  }
};

// Load categories into modal dropdown
const loadCategoriesForModal = async () => {
  try {
    const res = await fetch(`${API_URL}/products/categories`);
    const data = await res.json();
    const select = document.getElementById('productCategory');

    data.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error('Load categories error:', error);
  }
};

// Open modal to ADD new product
const openAddModal = () => {
  document.getElementById('modalTitle').textContent = 'Add New Product';
  document.getElementById('productId').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productDesc').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productStock').value = '';
  document.getElementById('productImage').value = '';
  document.getElementById('productModal').classList.add('active');
};

// Open modal to EDIT product
const openEditModal = (id, name, desc, price, stock, catId, image) => {
  document.getElementById('modalTitle').textContent = 'Edit Product';
  document.getElementById('productId').value = id;
  document.getElementById('productName').value = name;
  document.getElementById('productDesc').value = desc;
  document.getElementById('productPrice').value = price;
  document.getElementById('productStock').value = stock;
  document.getElementById('productCategory').value = catId;
  document.getElementById('productImage').value = image;
  document.getElementById('productModal').classList.add('active');
};

// Close modal
const closeModal = () => {
  document.getElementById('productModal').classList.remove('active');
};

// Save product (add or update)
const saveProduct = async () => {
  const id = document.getElementById('productId').value;
  const name = document.getElementById('productName').value.trim();
  const description = document.getElementById('productDesc').value.trim();
  const price = document.getElementById('productPrice').value;
  const stock = document.getElementById('productStock').value;
  const category_id = document.getElementById('productCategory').value;
  const image_url = document.getElementById('productImage').value.trim();

  if (!name || !price) {
    return alert('Name and price are required!');
  }

  const productData = { name, description, price, stock, category_id, image_url };
  const isEdit = !!id;

  try {
    const res = await fetch(
      `${API_URL}/products${isEdit ? '/'+id : ''}`,
      {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(productData)
      }
    );

    const data = await res.json();

    if (!res.ok) return alert(data.message);

    alert(data.message);
    closeModal();
    loadAdminProducts(); // refresh table

  } catch (error) {
    alert('Something went wrong!');
  }
};

// Delete product
const deleteProduct = async (id) => {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const data = await res.json();
    alert(data.message);
    loadAdminProducts();

  } catch (error) {
    alert('Delete failed!');
  }
};

// ================================
// ORDERS MANAGEMENT
// ================================
const loadAllOrders = async () => {
  if (!checkAdmin()) return;

  try {
    const res = await fetch(`${API_URL}/orders/all`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    const tbody = document.getElementById('allOrdersTable');

    if (data.orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" 
            style="text-align:center; padding:30px; color:#999">
            No orders found
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = data.orders.map(order => `
      <tr>
        <td><strong>#${order.id}</strong></td>
        <td>
          ${order.customer_name || 'N/A'}<br/>
          <small style="color:#999">${order.email || ''}</small>
        </td>
        <td style="max-width:180px; overflow:hidden; 
          text-overflow:ellipsis; white-space:nowrap">
          ${order.items || 'N/A'}
        </td>
        <td><strong>Rs. ${Number(order.total_price).toLocaleString()}</strong></td>
        <td>
          <span class="status-badge status-${order.status}">
            ${order.status.toUpperCase()}
          </span>
        </td>
        <td>${new Date(order.created_at).toLocaleDateString()}</td>
        <td>
          <select onchange="updateStatus(${order.id}, this.value)"
            style="padding:6px 10px; border-radius:6px; 
              border:2px solid #ddd; font-size:13px; cursor:pointer">
            <option value="pending" 
              ${order.status==='pending'?'selected':''}>Pending</option>
            <option value="processing" 
              ${order.status==='processing'?'selected':''}>Processing</option>
            <option value="delivered" 
              ${order.status==='delivered'?'selected':''}>Delivered</option>
            <option value="cancelled" 
              ${order.status==='cancelled'?'selected':''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Load orders error:', error);
  }
};

// Update order status
const updateStatus = async (id, status) => {
  try {
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    alert(`✅ ${data.message}`);
    loadAllOrders();
  } catch (error) {
    alert('Update failed!');
  }
};