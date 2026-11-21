import db from "#db/client";

// Create a new product in the database
export async function createProduct(
  title,
  description,
  category,
  brand,
  color,
  size,
  imageUrl,
  priceCents,
  stockQuantity,
) {
  const sql = `
  INSERT INTO products
    (title,
  description,
  category,
  brand,
  color,
  size,
  image_url,
  price_cents,
  stock_quantity)
  VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *
  `;
  const {
    rows: [product],
  } = await db.query(sql, [
    title,
    description,
    category,
    brand,
    color,
    size,
    imageUrl,
    priceCents,
    stockQuantity,
  ]);
  return product;
}

// Get all products
export async function getProducts() {
  const sql = `SELECT * FROM products`;
  const { rows: products } = await db.query(sql);
  return products;
}

// Get a single product by its ID
export async function getProductById(id) {
  const sql = `SELECT * FROM products WHERE id = $1`;
  const {
    rows: [product],
  } = await db.query(sql, [id]);
  return product;
}

// Get all products that belong to a specific order/cart
export async function getProductsByOrderId(orderId) {
  const sql = `
    SELECT
      products.*,
      orders_products.quantity
    FROM products
    JOIN orders_products
      ON products.id = orders_products.product_id
    WHERE orders_products.order_id = $1
  `;

  const { rows: products } = await db.query(sql, [orderId]);

  return products;
}
