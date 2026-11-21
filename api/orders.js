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

// Get all orders for the current user
router.get("/", async (req, res) => {
  const orders = await getOrdersByUserId(req.user.id);
  res.send(orders);
});

// Get all orders (admin only)
router.get("/all", requireAdmin, async (req, res) => {
  const orders = await getAllOrders();
  res.send(orders);
});

// Load an order by orderId and attach it to req.order
router.param("id", async (req, res, next, id) => {
  const order = await getOrderById(id);

  if (!order) {
    return res.status(404).send("Order not found");
  }

  if (order.user_id !== req.user.id && !req.user.is_admin) {
    return res.status(403).send("This is not your order.");
  }

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

// Delete an order (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  await deleteOrder(req.order.id);
  res.sendStatus(204);
});
