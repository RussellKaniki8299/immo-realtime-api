/**
 * Signalisation WebRTC 1-à-1 (audio / vidéo), adressée par userId (et non par socket.id) :
 * un appel survit à une reconnexion et fonctionne avec plusieurs onglets / appareils.
 *
 * Séquence :
 *  1. Appelant  → Laravel POST /api/calls            → call:incoming (via REST) chez l'appelé
 *  2. Appelé    → Laravel POST /api/calls/{id}/accept → call:accepted chez les deux
 *  3. Appelé    → socket  call:ready {to: appelant}   (micro/caméra prêts)
 *  4. Appelant  → socket  call:signal {offer}  ───────► Appelé
 *  5. Appelé    → socket  call:signal {answer} ───────► Appelant
 *  6. Les deux  → socket  call:signal {candidate} …
 */
module.exports = (io, socket) => {
  const forward = (event, to, payload) => {
    if (!to) return;
    io.to(`user_${Number(to)}`).emit(event, payload);
  };

  // { to, roomId }
  socket.on('call:ready', ({ to, roomId } = {}) => {
    const from = socket.data.userId;
    if (!from) return;
    forward('call:ready', to, { from, roomId });
  });

  // { to, roomId, data: { type: 'offer'|'answer'|'candidate', sdp?, candidate? } }
  socket.on('call:signal', ({ to, roomId, data } = {}) => {
    const from = socket.data.userId;
    if (!from || !data) return;
    forward('call:signal', to, { from, roomId, data });
  });

  // { to, roomId, micOn, cameraOn }
  socket.on('call:media-state', ({ to, roomId, micOn, cameraOn } = {}) => {
    const from = socket.data.userId;
    if (!from) return;
    forward('call:media-state', to, { from, roomId, micOn, cameraOn });
  });
};
