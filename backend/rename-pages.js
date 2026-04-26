const fs = require('fs');

const filesToUpdate = [
  '../frontend/cart.html',
  '../frontend/orders.html',
  '../frontend/login.html',
  '../frontend/register.html',
  '../frontend/change-password.html'
];

const newHeader = \  <div class="market-top">
    <span>Free shipping above Rs. 2,500</span>
    <span>Top marketplace picks updated daily</span>
  </div>

  <header class="market-nav-wrap">
    <nav class="market-nav" style="justify-content: space-between;">
      <a class="market-logo" href="index.html">ShopEase</a>

      <ul class="market-actions">
        <li><a href="index.html">Home</a></li>
        <li><a href="orders.html">Orders</a></li>
        <li class="cart-icon">
          <a href="cart.html">Cart <span class="cart-badge" id="cartCount">0</span></a>
        </li>
        <li id="authLink"><a href="login.html">Login</a></li>
        <li id="changePasswordLink" style="display:none"><a href="change-password.html">Password</a></li>
        <li id="logoutBtn" style="display:none"><a href="#" onclick="logout()">Logout</a></li>
      </ul>
    </nav>
  </header>\;

const newFooter = \  <footer class="home-footer">
    <p> 2026 ShopEase Marketplace.</p>
  </footer>\;

filesToUpdate.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');

  content = content.replace(/<nav class="navbar(?:[\\s\\S]*?)<\\/nav>/gi, newHeader.trim());
  content = content.replace(/<footer>(?:[\\s\\S]*?)<\\/footer>/gi, newFooter.trim());
  content = content.replace(/<body>/g, '<body class="home-page">');

  fs.writeFileSync(file, content, 'utf-8');
});

console.log('Pages updated successfully.');
