const express = require("express");
const router = express.Router();

const internalAuth = require("../middleware/internalAuth");
const {
  newOrder,
  orderStatusUpdated,
  ordersCount,
  newOrderKitchen,
  newSaleKitchen,
  newContact,
  chatMessage,
  unreadCount,
  messagesRead,
  callEvent,
} = require("../controllers/realtime.controller");

// ---------- Routes métier existantes (inchangées, non protégées pour ne rien casser) ----------
router.post("/new-order", newOrder);
router.post("/order-status-updated", orderStatusUpdated);
router.post("/orders-count", ordersCount);
router.post("/new-order-kitchen", newOrderKitchen);
router.post("/new-sale-kitchen", newSaleKitchen);
router.post("/contact-created", newContact);

// ---------- Messagerie & appels : protégées par x-internal-secret ----------
router.post("/chat-message", internalAuth, chatMessage);
router.post("/unread-count", internalAuth, unreadCount);
router.post("/messages-read", internalAuth, messagesRead);
router.post("/call-event", internalAuth, callEvent);

module.exports = router;
