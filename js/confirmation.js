const orderId = new URLSearchParams(window.location.search).get("id");
const orderNumber = document.getElementById("order-number");
const itemsContainer = document.getElementById("items");
const confirmationMessage = document.getElementById("confirmation-message");

function setConfirmationMessage(message) {
  if (confirmationMessage) confirmationMessage.textContent = message;
}

async function loadConfirmation() {
  if (!orderNumber || !itemsContainer) return;
  if (!orderId) {
    setConfirmationMessage("No order was selected.");
    return;
  }

  const client = window.shopSupabaseClient;
  if (!client) {
    setConfirmationMessage("Order details are unavailable because Supabase is not configured.");
    return;
  }

  try {
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) {
      setConfirmationMessage(`Could not check your login: ${userError.message}`);
      return;
    }
    if (!userData.user) {
      window.location.href = "login.html";
      return;
    }

    const { data: order, error: orderError } = await client
      .from("order")
      .select("order_id, total, status")
      .eq("order_id", orderId)
      .eq("customer_id", userData.user.id)
      .maybeSingle();

    if (orderError) {
      setConfirmationMessage(`Could not load your order: ${orderError.message}`);
      return;
    }
    if (!order) {
      setConfirmationMessage("Order not found.");
      return;
    }

    const { data: items, error: itemsError } = await client
      .from("order_item")
      .select("quantity, price, product(name)")
      .eq("order_id", order.order_id);

    if (itemsError) {
      setConfirmationMessage(`Could not load order items: ${itemsError.message}`);
      return;
    }

    orderNumber.textContent = order.order_id;
    itemsContainer.replaceChildren();
    if (!items || items.length === 0) {
      itemsContainer.textContent = "This order does not contain any items.";
    } else {
      items.forEach(item => {
        const productName = item.product?.name ?? "Product";
        const quantity = Number(item.quantity);
        const price = Number(item.price);
        const line = document.createElement("p");
        line.textContent = `${productName} × ${quantity} — AED ${(price * quantity).toFixed(2)}`;
        itemsContainer.append(line);
      });
    }

    const total = Number(order.total);
    document.getElementById("order-total").textContent = Number.isFinite(total)
      ? `Total: AED ${total.toFixed(2)}`
      : "Order total is unavailable.";
    document.getElementById("order-status").textContent = `Status: ${order.status ?? "Pending"}`;
    setConfirmationMessage("Your order has been placed.");
  } catch (error) {
    setConfirmationMessage(`Could not load your order: ${error.message}`);
  }
}

loadConfirmation();
