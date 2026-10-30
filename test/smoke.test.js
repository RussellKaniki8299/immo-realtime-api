/** Test de fumée sans réseau (faux io / req / res). Lancer : node test/smoke.test.js */
const Module = require('module');
const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'dotenv') return { config() {} };
  return origLoad.call(this, request, ...rest);
};
const assert = require('assert');

const emitted = [];
const fakeIo = {
  to(room) {
    const rooms = [room];
    const chain = { to: (r) => { rooms.push(r); return chain; }, emit: (event, payload) => rooms.forEach((r) => emitted.push({ room: r, event, payload })) };
    return chain;
  },
};
const registry = require('../src/state/registry');
registry.setIo(fakeIo);

const makeSocket = (data = {}) => {
  const handlers = {};
  return { data, rooms: new Set(), on: (e, f) => { handlers[e] = f; }, join(r) { this.rooms.add(r); }, fire: (e, ...a) => handlers[e] && handlers[e](...a) };
};
const res = () => { const r = { code: 200, body: null, status(c) { r.code = c; return r; }, json(b) { r.body = b; return r; } }; return r; };
const find = (event, room) => emitted.filter((e) => e.event === event && (!room || e.room === room));

// 1. chat : mode "none" (client déclare son id) et mode authentifié (id du jeton prioritaire)
const chat = require('../src/sockets/chat.socket');
const s1 = makeSocket(); chat(fakeIo, s1); s1.fire('join_user', 5);
assert(s1.rooms.has('user_5'));
const s2 = makeSocket({ authenticated: true, userId: 7 }); chat(fakeIo, s2);
assert(s2.rooms.has('user_7'), 'rattaché dès la connexion');
s2.fire('join_user', 99);
assert(!s2.rooms.has('user_99'), 'impossible d\'usurper un autre utilisateur');
console.log('✔ chat : identité du jeton prioritaire');

emitted.length = 0;
s1.fire('chat:typing', { to: 7, typing: true });
assert.deepStrictEqual(find('chat:typing', 'user_7')[0].payload, { from: 5, typing: true });
console.log('✔ chat : saisie en cours');

// 2. appels : signalisation filtrée
const call = require('../src/sockets/call.socket');
emitted.length = 0;
call(fakeIo, s1);
s1.fire('call:signal', { to: 7, roomId: 'r', data: { type: 'offer', sdp: 'x' } });
s1.fire('call:signal', { to: 7, roomId: 'r', data: { type: 'evil' } });
s1.fire('call:signal', { to: 7, roomId: 'r' });
assert.strictEqual(find('call:signal').length, 1, 'seuls offer/answer/candidate sont relayés');
assert.strictEqual(find('call:signal')[0].payload.from, 5);
s1.fire('call:ready', { to: 7, roomId: 'r' });
assert.strictEqual(find('call:ready', 'user_7').length, 1);
const anon = makeSocket(); call(fakeIo, anon); anon.fire('call:signal', { to: 7, data: { type: 'offer' } });
assert.strictEqual(find('call:signal').length, 1, 'un socket sans identité ne signale rien');
console.log('✔ appels : signalisation filtrée');

// 3. messagerie (appelée par Laravel)
const msg = require('../src/controllers/messaging.controller');
emitted.length = 0;
let r = res(); msg.chatMessage({ body: { message: { id: 1, sender_id: 5, receiver_id: 7, contenu: 'salut', attachments: [] } } }, r);
assert.strictEqual(find('new_message').length, 2, 'expéditeur ET destinataire');
r = res(); msg.chatMessage({ body: { message: { id: 2 } } }, r); assert.strictEqual(r.code, 400);
msg.unreadCount({ body: { user_id: 7, total_unread: '3' } }, res());
assert.deepStrictEqual(find('unread_count_updated', 'user_7')[0].payload, { user_id: 7, total_unread: 3 });
msg.messagesRead({ body: { sender_id: 5, reader_id: 7 } }, res());
assert.deepStrictEqual(find('messages_read', 'user_5')[0].payload, { reader_id: 7 });
console.log('✔ messagerie : new_message / non-lus / vu');

// 4. événements d'appel (Laravel)
const calls = require('../src/controllers/calls.controller');
emitted.length = 0;
r = res(); calls.callEvent({ body: { event: 'call:incoming', user_ids: [7], payload: { call_id: 1 } } }, r);
assert.strictEqual(find('call:incoming', 'user_7').length, 1);
r = res(); calls.callEvent({ body: { event: 'hack', user_ids: [7] } }, r); assert.strictEqual(r.code, 400);
console.log('✔ appels : événements Laravel validés');

// 5. commandes
const orders = require('../src/controllers/orders.controller');
emitted.length = 0;
orders.newOrder({ body: { agenceId: 3, commandeId: 9 } }, res());
assert.strictEqual(find('receive_order', 'agence_3').length, 1);
orders.orderStatusUpdated({ body: { clientId: 5, status: 'confirmee' } }, res());
assert.strictEqual(find('order_status_updated', 'client_5').length, 1);
registry.setIo(null); r = res(); orders.newOrder({ body: { agenceId: 3 } }, r); assert.strictEqual(r.code, 503);
console.log('✔ commandes : diffusion + 503 si io absent');
console.log('\nTous les tests passent');
