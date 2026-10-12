const SUPABASE_URL = "https://degjnhwograoklbabmue.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZ2puaHdvZ3Jhb2tsYmFibXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExOTQ5MTEsImV4cCI6MjEwNjc3MDkxMX0.-9FGSnuWbwleumTsSqPelSgaB92arDQRveiHNa69tps";
const supabaseclient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProduct() {
  const detail = document.getElementById("detail");
  if (!productId) {
    detail.textContent = "No product was selected.";
    return;
  }

  const { data: product, error } = await supabaseclient
    .from("product")
    .select("*, category(category_name)")
    .eq("product_id", productId)
    .single();

  if (error) {
    detail.textContent = `Could not load product: ${error.message}`;
    return;
  }

  if (!product) {
    detail.textContent = "Product not found.";
    return;
  }
  detail.innerHTML = `
    <h2>${product.name}</h2>
    <p>${product.description}</p>
    <p>AED ${product.price}</p>
    <p>Category: ${product.category?.category_name ?? "Uncategorized"}</p>`;
}
loadProduct();
