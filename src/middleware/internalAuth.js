const crypto = require('crypto');
const { internalSecret } = require('../config/env');
const logger = require('../lib/logger')('auth');

let warned = false;

/** Protège les routes appelées par Laravel (en-tête x-internal-secret, comparaison à temps constant). */
function internalAuth(req, res, next) {
  if (!internalSecret) {
    if (!warned) {
      logger.warn('INTERNAL_API_SECRET non défini : routes internes NON protégées (développement uniquement).');
      warned = true;
    }
    return next();
  }
  const provided = Buffer.from(String(req.headers['x-internal-secret'] || ''));
  const expected = Buffer.from(internalSecret);
  if (provided.length === expected.length && crypto.timingSafeEqual(provided, expected)) return next();
  return res.status(401).json({ success: false, message: 'Non autorisé' });
}

module.exports = internalAuth;
