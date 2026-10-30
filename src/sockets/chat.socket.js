const { userRoom } = require('../state/registry');

/**
 * Chat privé : room `user_{id}` (tous les appareils d'un utilisateur) et saisie en cours.
 * Les nouveaux messages arrivent par REST depuis Laravel (controllers/messaging.controller.js).
 */
module.exports = (io, socket) => {
  // En mode "laravel" l'identité vient du jeton ; sinon du client (migration).
  const bindUser = (claimedId) => {
    const id = Number(socket.data.authenticated ? socket.data.userId : claimedId);
    if (!id) return;
    socket.data.userId = id;
    socket.join(userRoom(id));
  };

  // Utilisateur authentifié : on le rattache à sa room dès la connexion (plus besoin d'attendre join_user)
  if (socket.data.authenticated) bindUser(socket.data.userId);

  socket.on('join_user', bindUser);

  // { to: userId, typing: boolean }
  socket.on('chat:typing', ({ to, typing } = {}) => {
    const from = socket.data.userId;
    if (!from || !to) return;
    io.to(userRoom(to)).emit('chat:typing', { from, typing: !!typing });
  });
};
