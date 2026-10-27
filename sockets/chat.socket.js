/**
 * Chat privé : rooms `user_{id}`, saisie en cours.
 * (Les nouveaux messages arrivent via REST depuis Laravel → controllers/realtime.controller.js)
 */
module.exports = (io, socket) => {
  socket.on('join_user', (userId) => {
    const id = Number(socket.data.authenticated ? socket.data.userId : userId);
    if (!id) return;

    socket.data.userId = id;
    socket.join(`user_${id}`);
  });

  // { to: userId, typing: boolean }
  socket.on('chat:typing', ({ to, typing } = {}) => {
    const from = socket.data.userId;
    if (!from || !to) return;
    io.to(`user_${Number(to)}`).emit('chat:typing', { from, typing: !!typing });
  });
};
