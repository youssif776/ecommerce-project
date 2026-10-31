const SUPABASE_URL = "https://degjnhwograoklbabmue.supabase.co";
const SUPABASE_ANON_KEY = "";
const supabaseClient = window.supabase && SUPABASE_ANON_KEY
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
window.shopSupabaseClient = supabaseClient;

const products = [
  { product_id: 1, name: "Business Laptop", category: "Computers", price: 3499, stock: 10 },
  { product_id: 2, name: "IPhone17", category: "Phones", price: 299, stock: 25 },
  { product_id: 3, name: "Camera Device", category: "Samsung Camera", price: 180, stock: 0 },
  { product_id: 4, name: "HP Laptop", category: "Computers", price: 2999, stock: 4 },
  { product_id: 5, name: "Lenovo Laptop", category: "Computers", price: 2599, stock: 8 },
  { product_id: 6, name: "Wireless Mouse", category: "Accessories", price: 129, stock: 25 },
  { product_id: 7, name: "Keyboard", category: "Accessories", price: 199, stock: 3 },
  { product_id: 8, name: "USB-C Cable", category: "Accessories", price: 49, stock: 20 },
  { product_id: 9, name: "Headphones", category: "Accessories", price: 299, stock: 6 },
  { product_id: 10, name: "Smartphone", category: "Phones", price: 2499, stock: 0 },
  { product_id: 11, name: "iPhone 15", category: "Phones", price: 3299, stock: 5 },
  { product_id: 12, name: "Samsung Galaxy", category: "Phones", price: 2799, stock: 12 },
  { product_id: 13, name: "Google Pixel", category: "Phones", price: 2399, stock: 2 },
  { product_id: 14, name: "Tablet", category: "Computers", price: 1599, stock: 7 },
  { product_id: 15, name: "Webcam", category: "Accessories", price: 179, stock: 10 },
  { product_id: 16, name: "Gaming Monitor", category: "Computers", price: 1899, stock: 0 },
  { product_id: 17, name: "Power Bank", category: "Accessories", price: 99, stock: 1 }
];
window.shopProducts = products;

let currentProducts = products;
let activeCategory = "All";

function categoryName(product) {
  return product.category?.category_name ?? product.category ?? "Uncategorized";
}

function renderProducts(list) {
  const container = document.getElementById("product-list")
    ?? document.getElementById("featured-products");
  if (!container) return;

  const displayedProducts = container.id === "featured-products" ? list.slice(0, 4) : list;
  container.replaceChildren();
  if (displayedProducts.length === 0) {
    container.textContent = "No products match your search.";
    return;
  }

  displayedProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "product";

    const name = document.createElement("h3");
    name.textContent = product.name;
    card.append(name);

    const price = document.createElement("p");
    price.textContent = `AED ${Number(product.price).toLocaleString()}`;
    card.append(price);

    const stock = Number(product.stock ?? 0);
    const stockLabel = document.createElement("p");
    stockLabel.className = "stock";
    stockLabel.textContent = stock === 0 ? "Out of Stock"
      : stock <= 5 ? "Low Stock" : "In Stock";
    card.append(stockLabel);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "Add to Cart";
    addButton.disabled = stock === 0;
    addButton.addEventListener("click", () => addToCart(product));
    card.append(addButton);

    const detailsLink = document.createElement("a");
    detailsLink.href = `product-details.html?id=${encodeURIComponent(product.product_id)}`;
    detailsLink.textContent = "View details";
    card.append(detailsLink);
    container.append(card);
  });
}

function applyProductFilters() {
  const searchTerm = document.getElementById("search-box")?.value.trim().toLowerCase() ?? "";
  const sortValue = document.getElementById("sort-select")?.value ?? "featured";
  const filtered = currentProducts.filter(product => {
    const matchesSearch = `${product.name} ${categoryName(product)}`.toLowerCase().includes(searchTerm);
    return matchesSearch && (activeCategory === "All" || categoryName(product) === activeCategory);
  });

  if (sortValue === "low-high") filtered.sort((a, b) => Number(a.price) - Number(b.price));
  if (sortValue === "high-low") filtered.sort((a, b) => Number(b.price) - Number(a.price));
  renderProducts(filtered);
}

async function loadProducts() {
  const hasCatalog = document.getElementById("product-list")
    || document.getElementById("featured-products");
  if (!hasCatalog) return;
  const status = document.getElementById("product-status");
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("product")
        .select("*, category(category_name)")
        .order("name");

      if (error) {
        if (status) status.textContent = `Could not load live products; showing sample products. ${error.message}`;
      } else if (data) {
        currentProducts = data.map(product => ({
          ...product,
          product_id: product.product_id ?? product.id,
          stock: Number(product.stock ?? 0)
        }));
      }
    } catch (error) {
      if (status) status.textContent = `Could not load live products; showing sample products. ${error.message}`;
    }
  } else if (status) {
    status.textContent = "Showing sample products. Configure Supabase to load live products.";
  }

  if (document.getElementById("product-list")) {
    applyProductFilters();
  } else {
    renderProducts(currentProducts);
  }
}

function getCart() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (!Array.isArray(cart)) throw new Error("Saved cart data is invalid.");
  return cart;
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function showCartError(error) {
  const output = document.getElementById("cart-message")
    ?? document.getElementById("cart-items");
  if (output) output.textContent = `Could not update your cart: ${error.message}`;
}

function addToCart(product) {
  try {
    const cart = getCart();
    const productId = product.product_id ?? product.id;
    const existing = cart.find(item => String(item.product_id) === String(productId));
    const stock = Number(product.stock ?? 0);

    if (existing && existing.quantity >= stock) {
      window.alert("There is no more stock available for this product.");
      return;
    }
    if (stock <= 0) return;

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, product_id: productId, quantity: 1 });
    }
    saveCart(cart);
    const message = document.getElementById("cart-message");
    if (message) message.textContent = `${product.name} added to cart.`;
  } catch (error) {
    showCartError(error);
  }
}

function removeFromCart(productId) {
  try {
    saveCart(getCart().filter(item => String(item.product_id) !== String(productId)));
  } catch (error) {
    showCartError(error);
  }
}

function updateQuantity(productId, quantity) {
  try {
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    const cart = getCart().map(item =>
      String(item.product_id) === String(productId)
        ? { ...item, quantity: Math.min(parsedQuantity, Number(item.stock ?? parsedQuantity)) }
        : item
    );
    saveCart(cart);
  } catch (error) {
    showCartError(error);
  }
}

function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const subtotalElement = document.getElementById("subtotal");
  try {
    const cart = getCart();
    container.replaceChildren();
    if (cart.length === 0) {
      container.textContent = "Your cart is empty.";
      if (subtotalElement) subtotalElement.textContent = "0.00";
      return;
    }

    let subtotal = 0;
    cart.forEach(item => {
      const lineTotal = Number(item.price) * Number(item.quantity);
      subtotal += lineTotal;

      const row = document.createElement("div");
      row.className = "cart-item";
      const name = document.createElement("span");
      name.textContent = item.name;
      row.append(name);

      const quantity = document.createElement("input");
      quantity.type = "number";
      quantity.min = "1";
      quantity.max = String(item.stock ?? "");
      quantity.value = String(item.quantity);
      quantity.setAttribute("aria-label", `Quantity for ${item.name}`);
      quantity.addEventListener("change", () => {
        updateQuantity(item.product_id, quantity.value);
        renderCart();
      });
      row.append(quantity);

      const total = document.createElement("span");
      total.textContent = `AED ${lineTotal.toFixed(2)}`;
      row.append(total);

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => {
        removeFromCart(item.product_id);
        renderCart();
      });
      row.append(removeButton);
      container.append(row);
    });

    if (subtotalElement) subtotalElement.textContent = subtotal.toFixed(2);
  } catch (error) {
    container.textContent = `Could not read your cart: ${error.message}`;
  }
}

async function updateNavForAuth() {
  const navSlot = document.getElementById("auth-nav-slot");
  if (!navSlot) return;
  navSlot.replaceChildren();

  if (!supabaseClient) {
    navSlot.innerHTML = '<a href="login.html">Login</a> | <a href="register.html">Register</a>';
    return;
  }

  let data;
  try {
    const response = await supabaseClient.auth.getUser();
    if (response.error) {
      navSlot.textContent = `Could not check login status: ${response.error.message}`;
      return;
    }
    data = response.data;
  } catch (error) {
    navSlot.textContent = `Could not check login status: ${error.message}`;
    return;
  }

  if (data.user) {
    const greeting = document.createElement("span");
    greeting.textContent = `Hi, ${data.user.email} `;
    const logoutLink = document.createElement("a");
    logoutLink.href = "#";
    logoutLink.textContent = "Log out";
    logoutLink.addEventListener("click", async event => {
      event.preventDefault();
      await logout();
    });
    navSlot.append(greeting, logoutLink);
  } else {
    navSlot.innerHTML = '<a href="login.html">Login</a> | <a href="register.html">Register</a>';
  }
}

async function logout() {
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      window.alert(`Could not log out: ${error.message}`);
      return;
    }
    window.location.href = "index.html";
  } catch (error) {
    window.alert(`Could not log out: ${error.message}`);
  }
}

async function requireLogin() {
  const who = document.getElementById("who");
  if (!supabaseClient) {
    if (who) who.textContent = "Authentication is not configured.";
    return null;
  }
  try {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) {
      if (who) who.textContent = `Could not check login status: ${error.message}`;
      return null;
    }
    if (!data.user) {
      window.location.href = "login.html";
      return null;
    }
    return data.user;
  } catch (error) {
    if (who) who.textContent = `Could not check login status: ${error.message}`;
    return null;
  }
}

document.getElementById("search-box")?.addEventListener("input", applyProductFilters);
document.getElementById("sort-select")?.addEventListener("change", applyProductFilters);
document.querySelectorAll(".category-btn").forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category ?? "All";
    applyProductFilters();
  });
});

loadProducts();
renderCart();
updateNavForAuth();
