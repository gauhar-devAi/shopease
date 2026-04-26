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
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  return `images/${trimmed}`;
};

const viewProduct = (productId) => {
  window.location.href = `product.html?id=${productId}`;
};

const getProductIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

const renderNotFound = () => {
  const shell = document.getElementById('productDetailShell');
  if (!shell) return;

  shell.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1; width:100%;">
      <div class="icon">Not found</div>
      <p>Product not found.</p>
      <a class="btn btn-primary" href="index.html#products">Back to products</a>
    </div>
  `;
};

const renderProduct = (product) => {
  const shell = document.getElementById('productDetailShell');
  if (!shell) return;

  const imageUrl = resolveImageUrl(product.image_url, product.name);
  const safeName = String(product.name || '').replace(/'/g, "\\'");

  shell.innerHTML = `
    <article class="detail-card">
      <div class="detail-media">
        <img
          src="${imageUrl}"
          alt="${product.name}"
          onerror="this.onerror=null;this.src='${getFallbackImage('Image not available')}';"
        />
      </div>

      <div class="detail-content">
        <a href="index.html#products" class="detail-back-link">Back to catalog</a>
        <span class="category-badge">${product.category_name || 'Uncategorized'}</span>
        <h1>${product.name}</h1>
        <p>${product.description || 'No description available for this product.'}</p>

        <div class="detail-meta">
          <div class="detail-price">Rs. ${Number(product.price || 0).toLocaleString()}</div>
          <div class="stock ${product.stock < 10 ? 'low' : ''}">
            ${product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </div>
        </div>

        <div class="detail-actions">
          <button
            class="btn btn-primary"
            onclick="addToCart(${product.id}, '${safeName}', ${Number(product.price || 0)}, '${imageUrl}')"
            ${Number(product.stock || 0) === 0 ? 'disabled' : ''}
          >
            Add to Cart
          </button>
          <a class="btn btn-primary outline-like" href="cart.html">Go to Cart</a>
        </div>
      </div>
    </article>
  `;
};

const renderRelatedProducts = (products) => {
  const grid = document.getElementById('relatedProductsGrid');
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <p>No related products found.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map((product) => {
    const imageUrl = resolveImageUrl(product.image_url, product.name);
    const safeName = String(product.name || '').replace(/'/g, "\\'");

    return `
      <div class="product-card" role="button" tabindex="0" onclick="viewProduct(${product.id})">
        <img
          src="${imageUrl}"
          alt="${product.name}"
          onerror="this.onerror=null;this.src='${getFallbackImage('Image not available')}';"
        />
        <div class="card-body">
          <span class="category-badge">${product.category_name || 'Uncategorized'}</span>
          <h3>${product.name}</h3>
          <p>${product.description || 'No description available.'}</p>
          <div class="price">Rs. ${Number(product.price || 0).toLocaleString()}</div>
          <div class="stock ${product.stock < 10 ? 'low' : ''}">
            ${product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </div>
          <button
            class="btn btn-primary"
            style="width:100%"
            onclick="event.stopPropagation(); addToCart(${product.id}, '${safeName}', ${Number(product.price || 0)}, '${imageUrl}')"
            ${Number(product.stock || 0) === 0 ? 'disabled' : ''}
          >
            Add to Cart
          </button>
        </div>
      </div>
    `;
  }).join('');
};

const loadProductDetails = async () => {
  const productId = getProductIdFromUrl();

  if (!productId) {
    renderNotFound();
    return;
  }

  try {
    const productResponse = await fetch(`${API_URL}/products/${productId}`);
    if (!productResponse.ok) {
      renderNotFound();
      return;
    }

    const productPayload = await productResponse.json();
    const product = productPayload.product;
    renderProduct(product);

    const allResponse = await fetch(`${API_URL}/products`);
    if (!allResponse.ok) {
      renderRelatedProducts([]);
      return;
    }

    const allPayload = await allResponse.json();
    const allProducts = Array.isArray(allPayload.products) ? allPayload.products : [];

    const candidates = allProducts.filter((item) => item.id !== product.id);
    const sameCategory = candidates.filter((item) => (
      product.category_id ? item.category_id === product.category_id : false
    ));

    const related = (sameCategory.length ? sameCategory : candidates).slice(0, 4);

    renderRelatedProducts(related);
  } catch (error) {
    console.error('Failed to load product details:', error);
    renderNotFound();
    renderRelatedProducts([]);
  }
};

const initializeProductDetailPage = () => {
  initializeHeaderSearch();
  updateCartBadge();
  loadProductDetails();
};

initializeProductDetailPage();
