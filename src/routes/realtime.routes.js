const express = require('express');
const internalAuth = require('../middleware/internalAuth');
const { protectBusinessRoutes } = require('../config/env');
const orders = require('../controllers/orders.controller');
const messaging = require('../controllers/messaging.controller');
const calls = require('../controllers/calls.controller');

const router = express.Router();

// Routes métier : protégées si PROTECT_BUSINESS_ROUTES=true (sinon ouvertes, comme avant)
const business = protectBusinessRoutes ? [internalAuth] : [];
router.post('/new-order', ...business, orders.newOrder);
router.post('/order-status-updated', ...business, orders.orderStatusUpdated);
router.post('/orders-count', ...business, orders.ordersCount);
router.post('/new-order-kitchen', ...business, orders.newOrderKitchen);
router.post('/new-sale-kitchen', ...business, orders.newSaleKitchen);
router.post('/contact-created', ...business, orders.newContact);

// Messagerie & appels : toujours protégées (x-internal-secret)
router.post('/chat-message', internalAuth, messaging.chatMessage);
router.post('/unread-count', internalAuth, messaging.unreadCount);
router.post('/messages-read', internalAuth, messaging.messagesRead);
router.post('/call-event', internalAuth, calls.callEvent);

module.exports = router;
