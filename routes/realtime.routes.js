const express = require("express");

const router = express.Router();

const {
  newOrder,
  orderStatusUpdated,
  ordersCount,
  newOrderKitchen,
  newSaleKitchen
} = require("../controllers/realtime.controller");

// =========================
// NEW ORDER
// =========================
router.post(
  "/new-order",
  newOrder
);

// =========================
// UPDATE STATUS
// =========================
router.post(
  "/order-status-updated",
  orderStatusUpdated
);

// =========================
// ORDERS COUNT REALTIME
// =========================
router.post(
  "/orders-count",
  ordersCount
);

// =========================
// NEW ORDER KITCHEN
// =========================
router.post(
  "/new-order-kitchen",
  newOrderKitchen
);

// =========================
// NEW SALE KITCHEN
// =========================
router.post(
  "/new-sale-kitchen",
  newSaleKitchen
);

module.exports = router;