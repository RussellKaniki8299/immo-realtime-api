/** Événements métier émis par les clients (compatibilité) : commandes, cuisine, ventes. */
module.exports = (io, socket) => {
  socket.on('new_order', (data = {}) => {
    if (!data.agenceId) return;
    io.to(`agence_${data.agenceId}`).emit('receive_order', data);
    io.to(`agence_agents_${data.agenceId}`).emit('receive_order_agent', data);
  });

  socket.on('new_order_kitchen', (data = {}) => {
    if (!data.agenceId) return;
    io.to(`agence_kitchen_${data.agenceId}`).emit('receive_order_kitchen', data);
  });

  socket.on('new_sale_kitchen', (data = {}) => {
    if (!data.agenceId) return;
    io.to(`agence_kitchen_${data.agenceId}`).emit('receive_sale_kitchen', data);
  });
};
