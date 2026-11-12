import express from "express";
const router = express.Router();
export default router;

import { getOrdersByUserIdAndProductId } from "#db/queries/orders";
import {
  createProduct,
  getProductById,
  getProducts,
} from "#db/queries/products";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import requireAdmin from "#middleware/requireAdmin";

router.get("/", async (req, res) => {
  const products = await getProducts();
  res.send(products);
});

router.post(
  "/",
  requireAdmin,
  requireBody(["title", "description", "category", "brand", "price"]),
  async (req, res) => {
    const {
      title,
      description,
      category,
      brand,
      imageUrl,
      price,
      stockQuantity,
    } = req.body;
    const product = await createProduct(
      title,
      description,
      category,
      brand,
      imageUrl,
      price,
      stockQuantity,
    );
    res.status(201).send(product);
  },
);
router.param("id", async (req, res, next, id) => {
  const product = await getProductById(id);
  if (!product) return res.status(404).send("Product not found");
  req.product = product;
  next();
});

router.get("/:id", (req, res) => {
  res.send(req.product);
});

router.get("/:id/orders", requireUser, async (req, res) => {
  const orders = await getOrdersByUserIdAndProductId(
    req.user.id,
    req.product.id,
  );
  res.send(orders);
});
