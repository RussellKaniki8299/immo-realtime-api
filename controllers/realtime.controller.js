exports.newOrder = async (req, res) => {
  try {
    const data = req.body;
    console.log("Nouvelle commande :", data);

    // Vérifier io
    if (!global.io) {
      return res.status(500).json({
        success: false,
        message: "Socket.IO non initialisé",
      });
    }

    // ENVOI CLIENTS agence
    global.io.to(`agence_${data.agenceId}`).emit("receive_order", data);

    // ENVOI AGENTS
    global.io.to(`agence_agents_${data.agenceId}`).emit("receive_order_agent", data);

    // LOG AGENTS
    const agents = global.connectedAgents?.[data.agenceId] || [];
    console.log("\n=========================");
    console.log(`agence concerné : ${data.agenceId}`);

    if (agents.length > 0) {
      console.log(`Agents notifiés (${agents.length}) :`);
      agents.forEach((agent, index) => {
        console.log(`${index + 1}. ${agent.nom} | ${agent.role} | userId=${agent.userId}`);
      });
    } else {
      console.log("Aucun agent connecté.");
    }
    console.log("=========================\n");

    return res.json({
      success: true,
      message: "Commande envoyée en temps réel",
      notifiedAgents: agents,
    });
  } catch (error) {
    console.error("Erreur realtime :", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// =========================
// ORDER STATUS UPDATED
// =========================
exports.orderStatusUpdated = async (req, res) => {
  try {
    const data = req.body;
    console.log("Status commande update :", data);

    if (!global.io) {
      return res.status(500).json({
        success: false,
        message: "Socket.IO non initialisé",
      });
    }

    global.io.to(`client_${data.clientId}`).emit("order_status_updated", data);

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
};

// =========================
// ORDERS COUNT
// =========================
exports.ordersCount = async (req, res) => {
  try {
    const { agenceId, count } = req.body;

    if (!global.io) {
      return res.status(500).json({
        success: false,
        message: "Socket.IO non initialisé",
      });
    }

    // EMIT CLIENTS agence
    global.io.to(`agence_${agenceId}`).emit("agence_orders_count", { agenceId, count });

    // EMIT AGENTS
    global.io.to(`agence_agents_${agenceId}`).emit("agence_orders_count", { agenceId, count });

    console.log(`Count envoyé realtime agence ${agenceId} : ${count}`);
    return res.json({ success: true });
  } catch (error) {
    console.error("ordersCount error :", error);
    return res.status(500).json({ success: false });
  }
};

// =========================
// NEW ORDER KITCHEN
// =========================
exports.newOrderKitchen = async (req, res) => {
  try {
    const data = req.body;
    console.log("Nouvelle commande cuisine :", data);

    if (!global.io) {
      return res.status(500).json({
        success: false,
        message: "Socket.IO non initialisé",
      });
    }

    // EMIT KITCHEN
    global.io.to(`agence_kitchen_${data.agenceId}`).emit("receive_order_kitchen", data);

    return res.json({
      success: true,
      message: "Commande cuisine envoyée",
    });
  } catch (error) {
    console.error("Erreur newOrderKitchen :", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// =========================
// NEW SALE KITCHEN
// =========================
exports.newSaleKitchen = async (req, res) => {
  try {
    const data = req.body;
    console.log("Nouvelle vente cuisine :", data);

    if (!global.io) {
      return res.status(500).json({
        success: false,
        message: "Socket.IO non initialisé",
      });
    }

    // EMIT KITCHEN
    global.io.to(`agence_kitchen_${data.agenceId}`).emit("receive_sale_kitchen", data);

    return res.json({
      success: true,
      message: "Vente cuisine envoyée",
    });
  } catch (error) {
    console.error("Erreur newSaleKitchen :", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};