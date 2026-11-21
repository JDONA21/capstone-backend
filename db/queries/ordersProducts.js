import db from "#db/client";

// Add a product to an order or cart
export async function createOrderProduct(orderId, productId, quantity) {
  const sql = `
    INSERT INTO orders_products
      (order_id, product_id, quantity)
    VALUES
      ($1, $2, $3)
    RETURNING *
  `;

  const {
    rows: [orderProduct],
  } = await db.query(sql, [orderId, productId, quantity]);

  return orderProduct;
}

// Get a specific product from an order or cart
export async function getOrderProduct(orderId, productId) {
  const sql = `
    SELECT *
    FROM orders_products
    WHERE order_id = $1
      AND product_id = $2
  `;

  const {
    rows: [orderProduct],
  } = await db.query(sql, [orderId, productId]);

  return orderProduct;
}

// Update the quantity of a product in an order or cart
export async function updateOrderProduct(orderId, productId, quantity) {
  const sql = `
    UPDATE orders_products
    SET quantity = $3
    WHERE order_id = $1
      AND product_id = $2
    RETURNING *
  `;

  const {
    rows: [orderProduct],
  } = await db.query(sql, [orderId, productId, quantity]);

  return orderProduct;
}

// Remove a product from an order or cart
export async function deleteOrderProduct(orderId, productId) {
  await db.query(
    `
    DELETE FROM orders_products
    WHERE order_id = $1
      AND product_id = $2
    `,
    [orderId, productId],
  );
}
