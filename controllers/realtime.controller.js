// =========================
// NEW ORDER
// =========================
exports.newOrder = async (req, res) => {
  try {
    const data = req.body;
    console.log("Nouvelle commande :", data);

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

// =========================
// NEW CONTACT
// =========================
exports.newContact = async (req, res) => {
  try {
    const data = req.body;

    console.log("Nouveau message :", data);

    if (!global.io) {
      return res.status(500).json({
        success: false,
        message: "Socket.IO non initialisé",
      });
    }

    global.io.to("admins").emit("new_contact", data);

    console.log("\n=========================");
    console.log(`Admins notifiés : ${global.connectedAdmins?.length || 0}`);

    if (global.connectedAdmins) {
      global.connectedAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.nom} | ${admin.role}`);
      });
    }

    console.log("=========================\n");

    return res.json({
      success: true,
      notifiedAdmins: global.connectedAdmins || [],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
    });
  }
};

// =========================
// CHAT MESSAGE (Privé)
// =========================
exports.chatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    console.log("Nouveau message de chat reçu de Laravel :", message);

    if (!global.io) {
      return res.status(500).json({
        success: false,
        message: "Socket.IO non initialisé",
      });
    }

    if (!message || !message.sender_id || !message.receiver_id) {
      return res.status(400).json({
        success: false,
        message: "Données du message invalides (sender_id ou receiver_id manquant)",
      });
    }

    const senderRoom = `user_${message.sender_id}`;
    const receiverRoom = `user_${message.receiver_id}`;

    // Diffusion stricte uniquement aux deux utilisateurs concernés (Expéditeur et Destinataire)
    global.io.to(senderRoom).to(receiverRoom).emit("new_message", message);

    console.log(`\n=========================`);
    console.log(`Chat privé diffusé via Socket.IO :`);
    console.log(`- Expéditeur room : ${senderRoom}`);
    console.log(`- Destinataire room : ${receiverRoom}`);
    console.log(`=========================\n`);

    return res.json({
      success: true,
      message: "Message de chat transmis en temps réel aux utilisateurs concernés",
    });
  } catch (error) {
    console.error("Erreur chatMessage :", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};