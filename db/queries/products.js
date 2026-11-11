import db from "#db/client";

export async function createProduct(
  title,
  description,
  category,
  brand,
  imageUrl,
  price,
  stockQuantity,
) {
  const sql = `
  INSERT INTO products
    (title,
    description,
    category,
    brand,
    image_url,
    price,
    stock_quantity)
  VALUES
    ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *
  `;
  const {
    rows: [product],
  } = await db.query(sql, [
    title,
    description,
    category,
    brand,
    imageUrl,
    price,
    stockQuantity,
  ]);
  return product;
}
