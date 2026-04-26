const fs = require('fs');

const prodPath = '../frontend/js/products.js';
if (fs.existsSync(prodPath)) {
  let content = fs.readFileSync(prodPath, 'utf-8');
  
  const initLogic = "\n// Enhanced Load everything on page start\nconst initCategoriesAndProducts = async () => {\n  await loadCategories();\n\n  const urlParams = new URLSearchParams(window.location.search);\n  const urlCat = urlParams.get('category') || '';\n  const urlSearch = urlParams.get('search') || '';\n\n  const catSelect = document.getElementById('categoryFilter');\n  if (catSelect && urlCat) {\n    catSelect.value = urlCat;\n  }\n  \n  const searchInput = document.getElementById('searchInput');\n  if (searchInput && urlSearch) {\n    searchInput.value = urlSearch;\n  }\n\n  loadProducts(urlSearch, urlCat);\n};\ninitCategoriesAndProducts();\n";

  content = content.replace(/\/\/\s*Load everything on page start[\s\S]*?loadProducts\(\);/g, initLogic.trim());
  fs.writeFileSync(prodPath, content, 'utf-8');
}

const files = [
  '../frontend/index.html',
  '../frontend/cart.html',
  '../frontend/orders.html', 
  '../frontend/login.html',
  '../frontend/register.html',
  '../frontend/change-password.html'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');

    c = c.replace(/<a href="[^"]*">Today's Deals<\/a>/g, '<a href="index.html#products">Today\'s Deals<\/a>');
    c = c.replace(/<a href="[^"]*">Fashion<\/a>/g, '<a href="index.html?category=2#products">Fashion<\/a>');
    c = c.replace(/<a href="[^"]*">Electronics<\/a>/g, '<a href="index.html?category=1#products">Electronics<\/a>');
    c = c.replace(/<a href="[^"]*">Books<\/a>/g, '<a href="index.html?category=3#products">Books<\/a>');
    c = c.replace(/<a href="[^"]*">Home & Kitchen<\/a>/g, '<a href="index.html?category=4#products">Home & Kitchen<\/a>');

    fs.writeFileSync(f, c, 'utf8');
  }
});

console.log('Categories updated successfully!');
