import db from "#db/client";

export async function createOrderProduct(orderId, productId, quantity) {
  const sql = `
  INSERT INTO orders_products
    (order_id, product_id, quantity)
  VALUES
    ($1, $2,$3)
  RETURNING *
  `;
  const {
    rows: [orderProduct],
  } = await db.query(sql, [orderId, productId, quantity]);
  return orderProduct;
}
/**
 * Find one product in an order
 */
export async function getOrderProduct(
  orderId,
  productId,
) {
  const {
    rows: [orderProduct],
  } = await db.query(
    `
    SELECT *
    FROM orders_products
    WHERE order_id = $1
    AND product_id = $2
    `,
    [orderId, productId],
  );

  return orderProduct;
}

/**
 * Update quantity
 */
export async function updateOrderProduct(
  orderId,
  productId,
  quantity,
) {
  const {
    rows: [orderProduct],
  } = await db.query(
    `
    UPDATE orders_products
    SET quantity = $3
    WHERE order_id = $1
    AND product_id = $2
    RETURNING *
    `,
    [orderId, productId, quantity],
  );

  return orderProduct;
}

/**
 * Delete product from order
 */
export async function deleteOrderProduct(
  orderId,
  productId,
) {
  await db.query(
    `
    DELETE FROM orders_products
    WHERE order_id = $1
    AND product_id = $2
    `,
    [orderId, productId],
  );
}