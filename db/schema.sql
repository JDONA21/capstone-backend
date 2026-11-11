DROP TABLE IF EXISTS orders_products CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  brand VARCHAR(50),
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY, 
  date DATE NOT NULL,
  discount_code TEXT,
  shipping_address TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
   user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE orders_products (
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (order_id, product_id)
);