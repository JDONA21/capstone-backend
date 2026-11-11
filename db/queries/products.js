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

export async function getProducts() {
  const sql = `SELECT * FROM products`;
  const { rows: products } = await db.query(sql);
  return products;
}

export async function getProductById(id) {
  const sql = `SELECT * FROM products WHERE id = $1`;
  const {
    rows: [product],
  } = await db.query(sql, [id]);
  return product;
}

export async function getProductsByOrderId(orderId) {
  const sql = `SELECT products.* FROM products 
  JOIN orders_products 
  ON products.id = orders_products.product_id
  WHERE orders_products.order_id = $1`;
  const {
    rows: [product],
  } = await db.query(sql, [id]);
  return product;
}
