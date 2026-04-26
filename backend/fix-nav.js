const fs = require('fs');

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
    
    if (!c.includes('<li><a href="index.html">Home</a></li>')) {
      c = c.replace('<ul class="market-actions">', '<ul class="market-actions">\n        <li><a href="index.html">Home</a></li>');
    }
    
    fs.writeFileSync(f, c, 'utf8');
  }
});

let cssPath = '../frontend/css/style.css';
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  if (!css.includes('.market-actions a.active')) {
    css += '\n\n/* Active Nav Link Highlight */\n.market-actions a.active {\n  color: #ff3f6c;\n  font-weight: 600;\n  border-bottom: 2px solid #ff3f6c;\n  padding-bottom: 2px;\n}\n';
    fs.writeFileSync(cssPath, css, 'utf8');
  }
}

let jsPath = '../frontend/js/api.js';
if (fs.existsSync(jsPath)) {
  let js = fs.readFileSync(jsPath, 'utf8');
  if (!js.includes('highlightActiveNav')) {
    let addJs = "\n\nfunction highlightActiveNav() {\n  let currentPath = window.location.pathname.split('/').pop();\n  if (!currentPath) currentPath = 'index.html';\n  const navLinks = document.querySelectorAll('.market-actions a');\n  navLinks.forEach(link => {\n    const href = link.getAttribute('href');\n    if (href === currentPath) {\n      link.classList.add('active');\n    } else {\n      link.classList.remove('active');\n    }\n  });\n}\ndocument.addEventListener('DOMContentLoaded', highlightActiveNav);\n";
    js += addJs;
    fs.writeFileSync(jsPath, js, 'utf8');
  }
}

console.log('Nav fixed and highlight added!');
