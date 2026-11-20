import db from "#db/client";

export async function createOrder(
  date,
  discountCode,
  shippingAddress,
  total,
  completed,
  userId,
) {
  const sql = `
  INSERT INTO orders
    (date, discount_code, shipping_address, total, completed, user_id)
  VALUES
    ($1, $2, $3, $4, $5, $6)
  RETURNING *
  `;
  const {
    rows: [order],
  } = await db.query(sql, [
    date,
    discountCode,
    shippingAddress,
    total,
    completed,
    userId,
  ]);
  return order;
}

export async function getOrdersByUserId(userId) {
  const sql = `SELECT * FROM orders WHERE user_id = $1`;
  const { rows: orders } = await db.query(sql, [userId]);
  return orders;
}

export async function getAllOrders() {
  const sql = `SELECT * FROM orders ORDER BY id`;
  const { rows: orders } = await db.query(sql);
  return orders;
}

export async function getOrderById(id) {
  const sql = `SELECT * FROM orders WHERE id = $1`;
  const {
    rows: [order],
  } = await db.query(sql, [id]);
  return order;
}

export async function getOrdersByUserIdAndProductId(userId, productId) {
  const sql = `
  SELECT
    orders.*
  FROM
    orders
    JOIN orders_products ON orders.id = orders_products.order_id
  WHERE
    orders.user_id = $1
    AND orders_products.product_id = $2
  `;
  const { rows: orders } = await db.query(sql, [userId, productId]);
  return orders;
}
/**
 * Find the user's current cart
 * (their incomplete, non-canceled order)
 */
export async function getOpenOrderByUserId(userId) {
  const sql = `
    SELECT *
    FROM orders
    WHERE user_id = $1
      AND completed = false
      AND canceled = false
  `;

  const {
    rows: [order],
  } = await db.query(sql, [userId]);

  return order;
}

/**
 * Update an order's total
 */
export async function updateOrderTotal(orderId, total) {
  const sql = `
    UPDATE orders
    SET total = $2
    WHERE id = $1
    RETURNING *
  `;

  const {
    rows: [order],
  } = await db.query(sql, [orderId, total]);

  return order;
}

//add complete order

export async function completeOrder(orderId) {
  const sql = `
    UPDATE orders
    SET completed = true
    WHERE id = $1
    RETURNING *
  `;

  const {
    rows: [order],
  } = await db.query(sql, [orderId]);

  return order;
}

/**
 * Mark an order as canceled
 */
export async function cancelOrder(orderId) {
  const sql = `
    UPDATE orders
    SET canceled = true
    WHERE id = $1
    RETURNING *
  `;

  const {
    rows: [order],
  } = await db.query(sql, [orderId]);

  return order;
}

/**
 * Delete an order.
 * Its orders_products rows are removed by ON DELETE CASCADE.
 * Returns the deleted order, or undefined if it doesn't exist.
 */
export async function deleteOrder(orderId) {
  const sql = `
    DELETE FROM orders
    WHERE id = $1
    RETURNING *
  `;

  const {
    rows: [order],
  } = await db.query(sql, [orderId]);

  return order;
}
