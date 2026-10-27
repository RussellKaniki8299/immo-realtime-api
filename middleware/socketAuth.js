const { socketAuthMode, laravelApiUrl, laravelAuthEndpoint } = require('../config/env');

/**
 * Mode "laravel" : vérifie le token Sanctum fourni par le client
 *   io(URL, { auth: { token } })
 * et fixe socket.data.userId (impossible à usurper ensuite).
 */
module.exports = async function socketAuth(socket, next) {
  if (socketAuthMode !== 'laravel') return next();

  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('unauthorized'));

    const res = await fetch(`${laravelApiUrl}${laravelAuthEndpoint}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!res.ok) return next(new Error('unauthorized'));

    const user = await res.json();
    const id = user?.id ?? user?.data?.id;
    if (!id) return next(new Error('unauthorized'));

    socket.data.userId = Number(id);
    socket.data.authenticated = true;
    return next();
  } catch (e) {
    return next(new Error('auth_failed'));
  }
};
