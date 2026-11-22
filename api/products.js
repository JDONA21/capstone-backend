import express from "express";
const router = express.Router();
export default router;

import {
  createProduct,
  getProductById,
  getProducts,
} from "#db/queries/products";

import requireBody from "#middleware/requireBody";
import requireAdmin from "#middleware/requireAdmin";

// Get all products
router.get("/", async (req, res) => {
  const products = await getProducts();
  res.send(products);
});

// Create a new product (admin only)
router.post(
  "/",
  requireAdmin,
  requireBody([
    "title",
    "description",
    "category",
    "brand",
    "color",
    "size",
    "imageUrl",
    "priceCents",
    "stockQuantity",
  ]),
  async (req, res) => {
    const {
      title,
      description,
      category,
      brand,
      color,
      size,
      imageUrl,
      priceCents,
      stockQuantity,
    } = req.body;
    const product = await createProduct(
      title,
      description,
      category,
      brand,
      color,
      size,
      imageUrl,
      priceCents,
      stockQuantity,
    );
    res.status(201).send(product);
  },
);

// Get a single product by ID (Id -> productID)
router.get("/:id", async (req, res) => {
  const product = await getProductById(req.params.id);

  if (!product) {
    return res.status(404).send("Product not found");
  }

  res.send(product);
});
