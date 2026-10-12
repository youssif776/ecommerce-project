const SUPABASE_URL = "https://degjnhwograoklbabmue.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZ2puaHdvZ3Jhb2tsYmFibXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExOTQ5MTEsImV4cCI6MjEwNjc3MDkxMX0.-9FGSnuWbwleumTsSqPelSgaB92arDQRveiHNa69tps";
const supabaseclient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const products = [
    {
        id: 1,
        name: "Business Laptop",
        category: "Computers",
        price: 3499,
        stock: 10
    },

    {
        id: 2,
        name: "IPhone17",
        category: "Phones",
        price: 299,
        stock: 25
    },

    {
        id: 3,
        name: "Camera Device",
        category: "Samsung Camera",
        price: 180,
        stock: 0
    },
     {
        id: 4,
        name: "HP Laptop",
        category: "Computers",
        price: 2999,
        stock: 4
    },

    {
        id: 5,
        name: "Lenovo Laptop",
        category: "Computers",
        price: 2599,
        stock: 8
    },

    {
        id: 6,
        name: "Wireless Mouse",
        category: "Accessories",
        price: 129,
        stock: 25
    },

    {
        id: 7,
        name: "Keyboard",
        category: "Accessories",
        price: 199,
        stock: 3
    },

    {
        id: 8,
        name: "USB-C Cable",
        category: "Accessories",
        price: 49,
        stock: 20
    },

    {
        id: 9,
        name: "Headphones",
        category: "Accessories",
        price: 299,
        stock: 6
    },

    {
        id: 10,
        name: "Smartphone",
        category: "Phones",
        price: 2499,
        stock: 0
    },

    {
        id: 11,
        name: "iPhone 15",
        category: "Phones",
        price: 3299,
        stock: 5
    },

    {
        id: 12,
        name: "Samsung Galaxy",
        category: "Phones",
        price: 2799,
        stock: 12
    },

    {
        id: 13,
        name: "Google Pixel",
        category: "Phones",
        price: 2399,
        stock: 2
    },

    {
        id: 14,
        name: "Tablet",
        category: "Computers",
        price: 1599,
        stock: 7
    },

    {
        id: 15,
        name: "Webcam",
        category: "Accessories",
        price: 179,
        stock: 10
    },

    {
        id: 16,
        name: "Gaming Monitor",
        category: "Computers",
        price: 1899,
        stock: 0
    },

    {
        id: 17,
        name: "Power Bank",
        category: "Accessories",
        price: 99,
        stock: 1
    }


];

function renderProducts(list) {
  const container = document.getElementById("product-list");
  if (!container) return;
  container.innerHTML = "";
  if (list.length === 0) {
    container.innerHTML = "<p>No products match your search.</p>";
    return;
  }
  container.innerHTML = list.map(prod => {
    const stockLabel = prod.stock === 0 ? "Out of Stock"
      : prod.stock <= 5 ? "Low Stock" : "In Stock";
    return `
      <div class="product">
        <h3>${prod.name}</h3>
        <p>AED ${prod.price.toLocaleString()}</p>
        <p class="stock">${stockLabel}</p>
        <button ${prod.stock === 0 ? "disabled" : ""}>Add to Cart</button>
        <a href="product-details.html?id=${prod.product_id}">View details</a>

      </div>`;
  }).join("");
}

async function loadProducts() {
  const { data: products, error } = await supabaseclient
    .from("product")
    .select("*, category(category_name)")
    .order("name");

  if (error) {
    document.getElementById("product-list").innerHTML =
      `<p>Could not load products: ${error.message}</p>`;
    return;
  }
  renderProducts(products);
}

loadProducts();



const sortSelect = document.getElementById("sort-select");
if (sortSelect) sortSelect.addEventListener("change", e => {
  let sorted = [...products];
  if (e.target.value === "low-high") sorted.sort((a, b) => a.price - b.price);
  if (e.target.value === "high-low") sorted.sort((a, b) => b.price - a.price);
  renderProducts(sorted);
});
