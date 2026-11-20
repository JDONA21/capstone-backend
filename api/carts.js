import express from "express";
const router = express.Router();

import {
  createOrder,
  getOpenOrderByUserId,
  updateOrderTotal,
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

// GET /cart - Get cart and products
router.get("/", async (req, res) => {
  let cart = await getOpenOrderByUserId(req.user.id);

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

  const products = await getProductsByOrderId(cart.id);

  res.send({
    id: cart.id,
    items: products,
    total: cart.total,
  });
});

// POST /cart/:cartId/products - Add product
router.post(
  "/:cartId/products",
  requireBody(["productId"]),
  async (req, res) => {
    const { productId } = req.body;
    const cart = await getOpenOrderByUserId(req.user.id);

    if (!cart || cart.id != req.params.cartId) {
      return res.status(404).send("Cart not found");
    }

    const existingProduct = await getOrderProduct(cart.id, productId);

    if (existingProduct) {
      await updateOrderProduct(
        cart.id,
        productId,
        existingProduct.quantity + 1,
      );
    } else {
      await createOrderProduct(cart.id, productId, 1);
    }

    const products = await getProductsByOrderId(cart.id);

    let total = 0;

    for (const product of products) {
      total += product.price * product.quantity;
    }

    await updateOrderTotal(cart.id, total);

    res.status(201).send("Product added to cart");
  },
);

router.patch(
  "/:cartId/products/:productId",
  requireBody(["quantity"]),
  async (req, res) => {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;

    const cart = await getOpenOrderByUserId(req.user.id);

    if (!cart || cart.id != cartId) {
      return res.status(404).send("Cart not found");
    }

    const product = await getOrderProduct(cart.id, productId);

    if (!product) {
      return res.status(404).send("Product not found in cart");
    }

    await updateOrderProduct(cart.id, productId, quantity);

    const products = await getProductsByOrderId(cart.id);

    let total = 0;

    for (const item of products) {
      total += item.price * item.quantity;
    }

    await updateOrderTotal(cart.id, total);

    res.send("Product quantity updated");
  },
);

// DELETE /cart/:cartId/products/:productId - Remove product

router.delete("/:cartId/products/:productId", async (req, res) => {
  const { cartId, productId } = req.params;

  const cart = await getOpenOrderByUserId(req.user.id);

  if (!cart || cart.id != cartId) {
    return res.status(404).send("Cart not found");
  }

  const product = await getOrderProduct(cart.id, productId);

  if (!product) {
    return res.status(404).send("Product not found in cart");
  }

  await deleteOrderProduct(cart.id, productId);

  const products = await getProductsByOrderId(cart.id);

  let total = 0;

  for (const item of products) {
    total += item.price * item.quantity;
  }

  await updateOrderTotal(cart.id, total);

  res.send("Product removed from cart");
});

export default router;
