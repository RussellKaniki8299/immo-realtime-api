const crypto = require('crypto');
const { internalSecret } = require('../config/env');

/**
 * Protège les routes appelées par Laravel (header x-internal-secret).
 * Si INTERNAL_API_SECRET est vide → on laisse passer (migration progressive) avec un avertissement.
 */
let warned = false;

module.exports = function internalAuth(req, res, next) {
  if (!internalSecret) {
    if (!warned) {
      console.warn('[realtime] INTERNAL_API_SECRET non défini : routes internes NON protégées.');
      warned = true;
    }
    return next();
  }

  const provided = String(req.headers['x-internal-secret'] || '');
  const a = Buffer.from(provided);
  const b = Buffer.from(internalSecret);

  if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();

  return res.status(401).json({ success: false, message: 'Non autorisé' });
};
