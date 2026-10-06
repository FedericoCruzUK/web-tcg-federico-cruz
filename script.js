// ==========================================
// TCG VAULT - SCRIPT GENERAL Y CARRITO DE COMPRAS
// ==========================================

// 1. Estado global del carrito (Carga inicial desde localStorage)
let cart = JSON.parse(localStorage.getItem('tcg_cart')) || [];

// Selección de elementos del DOM del Carrito
const cartIcon = document.querySelector('.cart-icon');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');

// ==========================================
// ABRIR Y CERRAR PANEL DEL CARRITO
// ==========================================
if (cartIcon) cartIcon.addEventListener('click', toggleCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

function toggleCart() {
  if (cartDrawer) cartDrawer.classList.toggle('open');
  if (cartOverlay) cartOverlay.classList.toggle('active');
}

// ==========================================
// EVENT DELEGATION PARA AGREGAR AL CARRITO
// ==========================================
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-add')) {
    const button = e.target;
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price')) || 0;
    const img = button.getAttribute('data-img');

    addToCart(id, name, price, img);
  }
});

// Función para agregar un producto o incrementar su cantidad
function addToCart(id, name, price, img) {
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, img, quantity: 1 });
  }

  updateUI();
  toggleCart(); // Abre automáticamente el carrito al agregar
}

// Función para modificar cantidades (+ / - / eliminar)
function changeQuantity(id, delta) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  updateUI();
}

// Guardar estado del carrito en el almacenamiento local del navegador
function saveCartToStorage() {
  localStorage.setItem('tcg_cart', JSON.stringify(cart));
}

// Renderizar carrito y recalcular totales
function updateUI() {
  if (!cartItemsContainer || !cartTotalElement || !cartIcon) return;

  // Limpiar HTML previo
  cartItemsContainer.innerHTML = '';

  let total = 0;
  let totalItemsCount = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align: center; color: #94a3b8; margin-top: 2rem;">El carrito está vacío.</p>';
  } else {
    cart.forEach(item => {
      total += item.price * item.quantity;
      totalItemsCount += item.quantity;

      const itemRow = document.createElement('div');
      itemRow.classList.add('cart-item-row');
      itemRow.innerHTML = `
        <div class="cart-item-info">
          <img src="${item.img}" alt="${item.name}">
          <div>
            <h4 style="font-size: 0.9rem;">${item.name}</h4>
            <span style="color: #38bdf8; font-size: 0.85rem;">$${item.price.toLocaleString('es-AR')} ARS</span>
          </div>
        </div>
        <div class="cart-controls">
          <button onclick="changeQuantity('${item.id}', -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity('${item.id}', 1)">+</button>
        </div>
      `;
      cartItemsContainer.appendChild(itemRow);
    });
  }

  // Actualizar precio total y contador del ícono
  cartTotalElement.textContent = `$${total.toLocaleString('es-AR')} ARS`;
  cartIcon.textContent = `🛒 Cart (${totalItemsCount})`;

  // Guardar en localStorage
  saveCartToStorage();
}

// ==========================================
// FILTROS, BUSCADOR Y ORDENAMIENTO DE CATÁLOGO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar UI del carrito al cargar cualquier página
  updateUI();

  itemRow.innerHTML = `
  <div class="cart-item-info">
    <img src="${item.img}" alt="${item.name}">
    <div>
      <h4 style="font-size: 0.9rem; color: #0f172a;">${item.name}</h4>
      <span style="color: #0284c7; font-size: 0.85rem;">$${item.price.toLocaleString('es-AR')} ARS</span>
    </div>
  </div>`;

  const subTabs = document.querySelectorAll('.sub-tab');
  const expansionSelect = document.getElementById('filter-expansion');
  const sortSelect = document.getElementById('sort-by');
  const searchBar = document.querySelector('.search-bar');
  const catalog = document.querySelector('.catalog');

  if (!catalog) return; // Si la página no tiene catálogo, termina la ejecución de filtros

  // Función unificada para aplicar filtros y ordenamiento
  function applyFiltersAndSort() {
    const cardItems = Array.from(document.querySelectorAll('.card-item'));

    const activeTab = document.querySelector('.sub-tab.active');
    const selectedType = activeTab ? activeTab.getAttribute('data-filter') : 'all';
    const selectedExpansion = expansionSelect ? expansionSelect.value : 'all';
    const selectedSort = sortSelect ? sortSelect.value : 'default';
    const searchQuery = searchBar ? searchBar.value.toLowerCase().trim() : '';

    // 1. Filtrar por Tipo, Expansión y Búsqueda por Texto
    cardItems.forEach(item => {
      const itemType = item.getAttribute('data-type');
      const itemExpansion = item.getAttribute('data-expansion');
      const itemName = (item.getAttribute('data-name') || item.querySelector('h3')?.textContent || '').toLowerCase();

      const matchType = (selectedType === 'all' || itemType === selectedType);
      const matchExpansion = (selectedExpansion === 'all' || itemExpansion === selectedExpansion);
      const matchSearch = (searchQuery === '' || itemName.includes(searchQuery));

      if (matchType && matchExpansion && matchSearch) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });

    // 2. Ordenar elementos
    cardItems.sort((a, b) => {
      const priceA = parseFloat(a.getAttribute('data-price')) || 0;
      const priceB = parseFloat(b.getAttribute('data-price')) || 0;
      const nameA = (a.getAttribute('data-name') || '').toLowerCase();
      const nameB = (b.getAttribute('data-name') || '').toLowerCase();

      if (selectedSort === 'price-asc') return priceA - priceB;
      if (selectedSort === 'price-desc') return priceB - priceA;
      if (selectedSort === 'name-asc') return nameA.localeCompare(nameB);
      if (selectedSort === 'name-desc') return nameB.localeCompare(nameA);
      return 0; // Orden por defecto
    });

    // 3. Re-insertar en el DOM en el orden correcto
    cardItems.forEach(item => catalog.appendChild(item));
  }

  // Event Listeners para Filtros
  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      subTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      applyFiltersAndSort();
    });
  });

  if (expansionSelect) expansionSelect.addEventListener('change', applyFiltersAndSort);
  if (sortSelect) sortSelect.addEventListener('change', applyFiltersAndSort);
  if (searchBar) searchBar.addEventListener('input', applyFiltersAndSort);
});

document.addEventListener('DOMContentLoaded', () => {
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const menuOverlay = document.getElementById('menu-overlay');

  function toggleMobileMenu() {
    if (navMenu) navMenu.classList.toggle('open');
    if (menuOverlay) menuOverlay.classList.toggle('active');
  }

  if (menuToggleBtn) menuToggleBtn.addEventListener('click', toggleMobileMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMobileMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', toggleMobileMenu);
});