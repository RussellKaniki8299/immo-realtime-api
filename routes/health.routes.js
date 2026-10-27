const express = require("express");

const {
  health,
  live,
  ready,
  metrics,
  connections,
  server,
} = require("../controllers/health.controller");

const router = express.Router();


// État général
router.get("/", health);


// Serveur vivant
router.get("/live", live);


// Serveur prêt
router.get("/ready", ready);


// Métriques
router.get("/metrics", metrics);


// Connexions WebSocket
router.get("/connections", connections);


// Informations serveur
router.get("/server", server);


module.exports = router;