import db from "#db/client";

// Create a new order
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

// Get all orders for a specific user
export async function getOrdersByUserId(userId) {
  const sql = `SELECT *
  FROM orders
  WHERE user_id = $1
  ORDER BY id DESC`;
  const { rows: orders } = await db.query(sql, [userId]);
  return orders;
}

// Get a single order by its ID
export async function getOrderById(orderId) {
  const sql = `SELECT * FROM orders WHERE id = $1`;
  const {
    rows: [order],
  } = await db.query(sql, [orderId]);
  return order;
}

// Get the user's active shopping cart
export async function getCartByUserId(userId) {
  const sql = `
    SELECT *
    FROM orders
    WHERE user_id = $1
     AND completed = false
    LIMIT 1
  `;

  const {
    rows: [order],
  } = await db.query(sql, [userId]);

  return order;
}

// Update an order's total price
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

// Mark an order as completed
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

// Delete an order
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
