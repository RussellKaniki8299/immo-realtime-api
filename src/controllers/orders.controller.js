const registry = require('../state/registry');
const logger = require('../lib/logger')('orders');

/** Exécute `emit(io)` ou répond 503 si Socket.IO n'est pas prêt ; erreurs → 500. */
const withIo = (emit) => (req, res) => {
  const io = registry.getIo();
  if (!io) return res.status(503).json({ success: false, message: 'Socket.IO non initialisé' });
  try {
    const extra = emit(io, req.body || {}) || {};
    return res.json({ success: true, ...extra });
  } catch (error) {
    logger.error('erreur', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.newOrder = withIo((io, data) => {
  io.to(`agence_${data.agenceId}`).emit('receive_order', data);
  io.to(`agence_agents_${data.agenceId}`).emit('receive_order_agent', data);
  const agents = registry.agentsOf(data.agenceId);
  logger.debug(`commande ${data.commandeId ?? ''} → agence ${data.agenceId} (${agents.length} agent(s) connecté(s))`);
  return { message: 'Commande envoyée en temps réel', notifiedAgents: agents };
});

exports.orderStatusUpdated = withIo((io, data) => {
  io.to(`client_${data.clientId}`).emit('order_status_updated', data);
  return { message: 'Statut envoyé' };
});

exports.ordersCount = withIo((io, { agenceId, count }) => {
  io.to(`agence_${agenceId}`).emit('agence_orders_count', { agenceId, count });
  io.to(`agence_agents_${agenceId}`).emit('agence_orders_count', { agenceId, count });
  return { message: 'Compteur envoyé' };
});

exports.newOrderKitchen = withIo((io, data) => {
  io.to(`agence_kitchen_${data.agenceId}`).emit('receive_order_kitchen', data);
  return { message: 'Commande cuisine envoyée' };
});

exports.newSaleKitchen = withIo((io, data) => {
  io.to(`agence_kitchen_${data.agenceId}`).emit('receive_sale_kitchen', data);
  return { message: 'Vente cuisine envoyée' };
});

exports.newContact = withIo((io, data) => {
  io.to('admins').emit('new_contact', data);
  return { message: 'Contact envoyé', notifiedAdmins: registry.connectedAdmins };
});
