import express from "express";
const router = express.Router();
export default router;

import {
  getOrderById,
  getOrdersByUserId,
  getAllOrders,
  deleteOrder,
} from "#db/queries/orders";
import { getProductsByOrderId } from "#db/queries/products";
import requireUser from "#middleware/requireUser";
import requireAdmin from "#middleware/requireAdmin";

router.use(requireUser);

function requireAdmin(req, res, next) {
  if (!req.user.is_admin) return res.status(403).send("Admins only.");
  next();
}

router.post(
  "/",
  requireBody(["date", "shippingAddress", "totalCents"]),
  async (req, res) => {
    const { date, discountCode, shippingAddress, totalCents, completed } =
      req.body;
    const order = await createOrder(
      date,
      discountCode,
      shippingAddress,
      totalCents,
      completed,
      req.user.id,
    );
    res.status(201).send(order);
  },
);

// Get all orders for the current user
router.get("/", async (req, res) => {
  const orders = await getOrdersByUserId(req.user.id);
  res.send(orders);
});

//cart routes
router.get("/cart", async (req, res) => {
  const order = await getOpenOrderByUserId(req.user.id);

  if (!order) {
    return res.send({
      items: [],
      total_cents: 0,
    });
  }

  const products = await getProductsByOrderId(order.id);

  res.send({
    items: products,
    total_cents: order.total_cents,
  });
});

//add to cart logic
router.post("/cart", requireBody(["productId"]), async (req, res) => {
  const { productId } = req.body;

  let order = await getOpenOrderByUserId(req.user.id);

  if (!order) {
    order = await createOrder(
      new Date(),
      null,
      "Pending",
      0,
      false,
      req.user.id,
    );
  }

  const orderProduct = await getOrderProduct(order.id, productId);

  if (orderProduct) {
    await updateOrderProduct(order.id, productId, orderProduct.quantity + 1);
  } else {
    await createOrderProduct(order.id, productId, 1);
  }

  const products = await getProductsByOrderId(order.id);

  let total = 0;

  for (let i = 0; i < products.length; i++) {
    total += Math.round(products[i].price * 100) * products[i].quantity;
  }

  await updateOrderTotal(order.id, total);

  res.send("Product added to cart");
});

//DELETE /orders/cart/:productId
router.delete("/cart/:productId", async (req, res) => {
  const order = await getOpenOrderByUserId(req.user.id);

  if (!order) {
    return res.send("Cart is empty");
  }

  const orderProduct = await getOrderProduct(order.id, req.params.productId);

  if (!orderProduct) {
    return res.status(404).send("Product not found");
  }

  if (orderProduct.quantity === 1) {
    await deleteOrderProduct(order.id, req.params.productId);
  } else {
    await updateOrderProduct(
      order.id,
      req.params.productId,
      orderProduct.quantity - 1,
    );
  }

  const products = await getProductsByOrderId(order.id);

  let total = 0;

  for (let i = 0; i < products.length; i++) {
    total += Math.round(products[i].price * 100) * products[i].quantity;
  }

  await updateOrderTotal(order.id, total);

  res.send("Product removed from cart");
});

//complete order
router.patch("/cart/complete", async (req, res) => {
  const order = await getOpenOrderByUserId(req.user.id);

  if (!order || order.total_cents === 0) {
    return res.status(400).send("Your cart is empty");
  }

  await completeOrder(order.id);

  res.send("Order completed");
});
//admin: all orders (must come before /:id)
// Get all orders (admin only)
router.get("/all", requireAdmin, async (req, res) => {
  const orders = await getAllOrders();
  res.send(orders);
});

// Load an order by orderId and attach it to req.order
router.param("id", async (req, res, next, id) => {
  const order = await getOrderById(id);
  if (!order) return res.status(404).send("Order not found");

  if (order.user_id !== req.user.id && !req.user.is_admin)
    return res.status(403).send("This is not your order.");

  req.order = order;
  next();
});

// Get a single order by orderId
router.get("/:id", (req, res) => {
  res.send(req.order);
});

// Get all products in an order
router.get("/:id/products", async (req, res) => {
  const products = await getProductsByOrderId(req.order.id);
  res.send(products);
});

//admin: delete any order
// Delete an order (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  await deleteOrder(req.order.id);
  res.sendStatus(204);
});
