const registry = require('../state/registry');
const logger = require('../lib/logger')('messaging');

const ready = (res) => {
  const io = registry.getIo();
  if (!io) res.status(503).json({ success: false, message: 'Socket.IO non initialisé' });
  return io;
};

/** Nouveau message (texte et/ou pièces jointes) → expéditeur ET destinataire (tous leurs appareils). */
exports.chatMessage = (req, res) => {
  const io = ready(res);
  if (!io) return;

  const { message } = req.body || {};
  if (!message || !message.sender_id || !message.receiver_id) {
    return res.status(400).json({ success: false, message: 'sender_id ou receiver_id manquant' });
  }

  io.to(registry.userRoom(message.sender_id)).to(registry.userRoom(message.receiver_id)).emit('new_message', message);
  logger.debug(`message ${message.id} : ${message.sender_id} → ${message.receiver_id}`);
  return res.json({ success: true });
};

/** Badge de messages non lus. */
exports.unreadCount = (req, res) => {
  const io = ready(res);
  if (!io) return;

  const { user_id, total_unread } = req.body || {};
  if (!user_id) return res.status(400).json({ success: false, message: 'user_id manquant' });

  io.to(registry.userRoom(user_id)).emit('unread_count_updated', {
    user_id: Number(user_id),
    total_unread: Number(total_unread) || 0,
  });
  return res.json({ success: true });
};

/** « Vu » côté expéditeur. */
exports.messagesRead = (req, res) => {
  const io = ready(res);
  if (!io) return;

  const { sender_id, reader_id } = req.body || {};
  if (!sender_id || !reader_id) return res.status(400).json({ success: false });

  io.to(registry.userRoom(sender_id)).emit('messages_read', { reader_id: Number(reader_id) });
  return res.json({ success: true });
};
