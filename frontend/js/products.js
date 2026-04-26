let allProducts = [];

const getFallbackImage = (name) => {
  const label = encodeURIComponent(name || 'Product');
  return `data:image/svg+xml;utf8,` +
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23f3f4f6'/><stop offset='100%' stop-color='%23e5e7eb'/></linearGradient></defs>` +
    `<rect width='600' height='400' fill='url(%23g)'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%234b5563' font-size='28' font-family='Segoe UI, Arial, sans-serif'>${label}</text>` +
    `</svg>`;
};

const resolveImageUrl = (imageUrl, name) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return getFallbackImage(name);
  }

  const trimmed = imageUrl.trim();

  // Keep absolute URLs as-is; for local filenames, try frontend images folder.
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  return `images/${trimmed}`;
};

const showProductsMessage = (message, buttonText = 'Retry') => {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="empty-state" style="grid-column: 1/-1">
      <div class="icon">ℹ️</div>
      <p>${message}</p>
      <button class="btn btn-primary" onclick="loadProducts()">
        ${buttonText}
      </button>
    </div>
  `;
};

// Load products from backend
const loadProducts = async (search = '', category = '') => {
  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);

    const url = `${API_URL}/products${params.toString() ? `?${params.toString()}` : ''}`;

    showProductsMessage('Loading products...', 'Refresh');

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    allProducts = Array.isArray(data.products) ? data.products : [];
    displayProducts(allProducts);

  } catch (error) {
    console.error('Failed to load products:', error);
    showProductsMessage('Could not load products. Make sure backend is running on port 5000.');
  }
};

// Load categories into dropdown
const loadCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/products/categories`);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    const select = document.getElementById('categoryFilter');
    if (!select) return;

    const categories = Array.isArray(data.categories) ? data.categories : [];
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      select.appendChild(option);
    });

  } catch (error) {
    console.error('Failed to load categories:', error);
  }
};

// Display products in the grid
const displayProducts = (products) => {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <div class="icon">🔍</div>
        <p>No products found</p>
        <button class="btn btn-primary" onclick="loadProducts()">
          Show All
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(product => `
    <div class="product-card">
      <img 
        src="${resolveImageUrl(product.image_url, product.name)}"
        alt="${product.name}" 
        onerror="this.onerror=null;this.src='${getFallbackImage('Image not available')}';"
      />
      <div class="card-body">
        <span class="category-badge">${product.category_name || 'Uncategorized'}</span>
        <h3>${product.name}</h3>
        <p>${product.description || 'No description available.'}</p>
        <div class="price">Rs. ${Number(product.price).toLocaleString()}</div>
        <div class="stock ${product.stock < 10 ? 'low' : ''}">
          ${product.stock > 0 
            ? `✅ In Stock (${product.stock})` 
            : '❌ Out of Stock'}
        </div>
        <button 
          class="btn btn-primary" 
          style="width:100%"
          onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${resolveImageUrl(product.image_url, product.name)}')"
          ${product.stock === 0 ? 'disabled' : ''}>
          🛒 Add to Cart
        </button>
      </div>
    </div>
  `).join('');
};

// Filter products on search
const filterProducts = () => {
  const search = document.getElementById('searchInput').value;
  const category = document.getElementById('categoryFilter').value;
  loadProducts(search, category);
};

// Search on Enter key
document.getElementById('searchInput')
  ?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') filterProducts();
  });

// Enhanced Load everything on page start
const initCategoriesAndProducts = async () => {
  await loadCategories();

  const urlParams = new URLSearchParams(window.location.search);
  const urlCat = urlParams.get('category') || '';
  const urlSearch = urlParams.get('search') || '';

  const catSelect = document.getElementById('categoryFilter');
  if (catSelect && urlCat) {
    catSelect.value = urlCat;
  }
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput && urlSearch) {
    searchInput.value = urlSearch;
  }

  loadProducts(urlSearch, urlCat);
};
initCategoriesAndProducts();