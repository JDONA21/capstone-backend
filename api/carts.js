import express from "express";
const router = express.Router();

import {
  createOrder,
  getCartByUserId,
  updateOrderTotal,
  completeOrder,
} from "#db/queries/orders";

import {
  createOrderProduct,
  getOrderProduct,
  updateOrderProduct,
  deleteOrderProduct,
} from "#db/queries/ordersProducts";

import { getProductsByOrderId } from "#db/queries/products";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

router.use(requireUser);

// Recalculate and update the cart total
async function refreshCartTotal(cartId) {
  const products = await getProductsByOrderId(cartId);

  let total = 0;

  for (const product of products) {
    total += product.price * product.quantity;
  }

  await updateOrderTotal(cartId, total);
}

// Get the current user's cart
router.get("/", async (req, res) => {
  // Find the user's active cart
  let cart = await getCartByUserId(req.user.id);

  // Create a cart if the user doesn't have one
  if (!cart) {
    cart = await createOrder(
      new Date(),
      null,
      "Pending",
      0,
      false,
      req.user.id,
    );
  }

  // Get all products in the cart
  const products = await getProductsByOrderId(cart.id);

  res.send({
    id: cart.id,
    items: products,
    total: cart.total,
  });
});

// Add a product to the cart
router.post("/products", requireBody(["productId"]), async (req, res) => {
  const { productId } = req.body;

  // Find the user's active cart
  const cart = await getCartByUserId(req.user.id);

  // Check if product already exists in the cart
  const existingProduct = await getOrderProduct(cart.id, productId);

  if (existingProduct) {
    // Increase quantity if product already exists
    await updateOrderProduct(cart.id, productId, existingProduct.quantity + 1);
  } else {
    // Add product to cart
    await createOrderProduct(cart.id, productId, 1);
  }

  // Update cart total
  await refreshCartTotal(cart.id);

  res.status(201).send("Product added to cart");
});

// Update a product quantity in the cart
router.patch(
  "/products/:productId",
  requireBody(["quantity"]),
  async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Find the user's active cart
    const cart = await getCartByUserId(req.user.id);

    // Check if product exists in the cart
    const product = await getOrderProduct(cart.id, productId);

    if (!product) {
      return res.status(404).send("Product not found in cart");
    }

    // Update quantity
    await updateOrderProduct(cart.id, productId, quantity);

    // Update cart total
    await refreshCartTotal(cart.id);

    res.send("Product quantity updated");
  },
);

// Remove a product from the cart
router.delete("/products/:productId", async (req, res) => {
  const { productId } = req.params;

  // Find the user's active cart
  const cart = await getCartByUserId(req.user.id);

  // Check if product exists in the cart
  const product = await getOrderProduct(cart.id, productId);

  if (!product) {
    return res.status(404).send("Product not found in cart");
  }

  // Remove product from cart
  await deleteOrderProduct(cart.id, productId);

  // Update cart total
  await refreshCartTotal(cart.id);

  res.send("Product removed from cart");
});

// Complete checkout for the current cart
router.patch("/complete", async (req, res) => {
  // Find the user's active cart
  const cart = await getCartByUserId(req.user.id);

  if (!cart) {
    return res.status(404).send("No active cart");
  }

  // Mark cart as completed order
  await completeOrder(cart.id);

  res.send("Order completed");
});

export default router;
