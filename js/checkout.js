const checkoutForm = document.getElementById("checkout-form");
const checkoutMessage = document.getElementById("checkout-message");
const checkoutSubmitButton = checkoutForm?.querySelector('button[type="submit"]');

function setCheckoutMessage(message) {
  if (checkoutMessage) checkoutMessage.textContent = message;
}

async function initializeCheckout() {
  if (!checkoutForm || !checkoutSubmitButton) return;

  const client = window.shopSupabaseClient;
  if (!client) {
    setCheckoutMessage("Checkout is unavailable because Supabase is not configured.");
    return;
  }

  try {
    const { data, error } = await client.auth.getUser();
    if (error) {
      setCheckoutMessage(`Could not check your login: ${error.message}`);
      return;
    }
    if (!data.user) {
      window.location.href = "login.html";
      return;
    }

    const who = document.getElementById("who");
    if (who) who.textContent = data.user.email ?? "";

    if (getCart().length === 0) {
      setCheckoutMessage("Your cart is empty. Add products before checking out.");
      return;
    }
    checkoutSubmitButton.disabled = false;
  } catch (error) {
    setCheckoutMessage(`Could not prepare checkout: ${error.message}`);
  }
}

checkoutForm?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!checkoutForm.reportValidity()) return;

  const client = window.shopSupabaseClient;
  if (!client || !checkoutSubmitButton) {
    setCheckoutMessage("Checkout is unavailable because Supabase is not configured.");
    return;
  }

  const name = document.getElementById("name")?.value.trim() ?? "";
  const address = document.getElementById("address")?.value.trim() ?? "";
  const phone = document.getElementById("phone")?.value.trim() ?? "";
  const phoneDigits = phone.replace(/\D/g, "");
  if (!name || !address) {
    setCheckoutMessage("Name and address are required.");
    return;
  }
  if (!/^\+?[0-9\s()-]+$/.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
    setCheckoutMessage("Enter a valid phone number.");
    return;
  }

  let cart;
  try {
    cart = getCart();
  } catch (error) {
    setCheckoutMessage(`Could not read your cart: ${error.message}`);
    return;
  }
  if (cart.length === 0) {
    setCheckoutMessage("Your cart is empty.");
    return;
  }

  const validItems = cart.every(item =>
    item.product_id != null
    && Number.isInteger(Number(item.quantity))
    && Number(item.quantity) > 0
    && Number.isFinite(Number(item.price))
    && Number(item.price) >= 0
  );
  if (!validItems) {
    setCheckoutMessage("Your cart contains invalid product data. Please review your cart.");
    return;
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );
  if (!Number.isFinite(subtotal)) {
    setCheckoutMessage("Could not calculate your order total.");
    return;
  }

  checkoutSubmitButton.disabled = true;
  checkoutSubmitButton.textContent = "Placing order...";
  setCheckoutMessage("");

  let orderCreated = false;
  let createdOrderId;
  try {
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) {
      setCheckoutMessage(`Could not check your login: ${userError.message}`);
      return;
    }
    if (!userData.user) {
      window.location.href = "login.html";
      return;
    }

    const { data: order, error: orderError } = await client
      .from("order")
      .insert([{
        customer_id: userData.user.id,
        total: subtotal,
        status: "Pending",
      }])
      .select("order_id")
      .single();

    if (orderError) {
      setCheckoutMessage(`Could not place order: ${orderError.message}`);
      return;
    }

    orderCreated = true;
    createdOrderId = order?.order_id;
    if (order?.order_id == null) {
      setCheckoutMessage("The order was created, but no order number was returned. Please contact support.");
      return;
    }

    const items = cart.map(item => ({
      order_id: order.order_id,
      product_id: item.product_id,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    const { error: itemsError } = await client.from("order_item").insert(items);
    if (itemsError) {
      setCheckoutMessage(
        `Order ${order.order_id} was created, but its items could not be saved: ${itemsError.message}. `
        + "Your cart has been kept; please contact support before trying again."
      );
      return;
    }

    localStorage.removeItem("cart");
    window.location.href = `order-confirmation.html?id=${encodeURIComponent(order.order_id)}`;
  } catch (error) {
    setCheckoutMessage(orderCreated
      ? `Order ${createdOrderId} was created, but checkout could not finish: ${error.message}. Please contact support.`
      : `Could not place order: ${error.message}`);
  } finally {
    checkoutSubmitButton.textContent = "Place order";
    checkoutSubmitButton.disabled = orderCreated;
  }
});

initializeCheckout();
