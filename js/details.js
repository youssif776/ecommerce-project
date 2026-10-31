const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProduct() {
  const detail = document.getElementById("detail");
  if (!detail) return;
  if (!productId) {
    detail.textContent = "No product was selected.";
    return;
  }

  let product = window.shopProducts?.find(item =>
    String(item.product_id ?? item.id) === productId
  );
  const client = window.shopSupabaseClient;
  if (client) {
    try {
      const { data, error } = await client
        .from("product")
        .select("*, category(category_name)")
        .eq("product_id", productId)
        .maybeSingle();

      if (error) {
        detail.textContent = `Could not load product: ${error.message}`;
        return;
      }
      product = data;
    } catch (error) {
      detail.textContent = `Could not load product: ${error.message}`;
      return;
    }
  }

  if (!product) {
    detail.textContent = "Product not found.";
    return;
  }

  const heading = document.createElement("h2");
  heading.textContent = product.name;
  const description = document.createElement("p");
  description.textContent = product.description ?? "";
  const price = document.createElement("p");
  price.textContent = `AED ${Number(product.price).toLocaleString()}`;
  const category = document.createElement("p");
  category.textContent = `Category: ${product.category?.category_name ?? product.category ?? "Uncategorized"}`;
  detail.replaceChildren(heading, description, price, category);
}

loadProduct();
