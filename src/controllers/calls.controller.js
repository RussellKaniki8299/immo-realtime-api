const registry = require('../state/registry');

const ALLOWED = new Set([
  'call:incoming', 'call:accepted', 'call:declined', 'call:cancelled',
  'call:ended', 'call:missed', 'call:scheduled', 'call:reminder', 'call:due',
]);

/** Événements du cycle de vie d'un appel, émis par Laravel vers une liste d'utilisateurs. */
exports.callEvent = (req, res) => {
  const io = registry.getIo();
  if (!io) return res.status(503).json({ success: false, message: 'Socket.IO non initialisé' });

  const { event, user_ids: userIds, payload } = req.body || {};
  if (!ALLOWED.has(event) || !Array.isArray(userIds) || !userIds.length) {
    return res.status(400).json({ success: false, message: 'Événement invalide' });
  }

  userIds.forEach((id) => registry.toUser(id, event, payload));
  return res.json({ success: true });
};
