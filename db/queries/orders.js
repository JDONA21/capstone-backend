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
