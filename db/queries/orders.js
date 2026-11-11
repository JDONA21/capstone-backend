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
