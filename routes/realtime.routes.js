const express = require("express");
const router = express.Router();

const {
  newOrder,
  orderStatusUpdated,
  ordersCount,
  newOrderKitchen,
  newSaleKitchen,
  newContact,
  chatMessage, // <--- Import de la nouvelle fonction
} = require("../controllers/realtime.controller");

// =========================
// NEW ORDER
// =========================
router.post("/new-order", newOrder);

// =========================
// UPDATE STATUS
// =========================
router.post("/order-status-updated", orderStatusUpdated);

// =========================
// ORDERS COUNT REALTIME
// =========================
router.post("/orders-count", ordersCount);

// =========================
// NEW ORDER KITCHEN
// =========================
router.post("/new-order-kitchen", newOrderKitchen);

// =========================
// NEW SALE KITCHEN
// =========================
router.post("/new-sale-kitchen", newSaleKitchen);

// =========================
// NEW CONTACT
// =========================
router.post("/contact-created", newContact);

// =========================
// CHAT MESSAGE (Privé entre 2 users)
// =========================
router.post("/chat-message", chatMessage); // <--- Nouvelle route appelée par Laravel

module.exports = router;