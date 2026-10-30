/**
 * État partagé du serveur (remplace les anciens `global.io`, `global.connectedAgents`, `global.connectedAdmins`).
 */
let ioInstance = null;
const connectedAgents = new Map(); // agenceId -> [{ userId, nom, role, socketId }]
const connectedAdmins = []; // [{ userId, ..., socketId }]

const setIo = (io) => { ioInstance = io; };
const getIo = () => ioInstance;

const userRoom = (userId) => `user_${Number(userId)}`;

/** Émet vers tous les appareils d'un utilisateur */
const toUser = (userId, event, payload) => ioInstance?.to(userRoom(userId)).emit(event, payload);

function addAgent(agenceId, agent) {
  const list = connectedAgents.get(String(agenceId)) || [];
  if (!list.some((a) => a.userId === agent.userId)) list.push(agent);
  connectedAgents.set(String(agenceId), list);
}

function addAdmin(admin) {
  if (!connectedAdmins.some((a) => a.userId === admin.userId)) connectedAdmins.push(admin);
}

function removeSocket(socketId) {
  for (const [agenceId, list] of connectedAgents.entries()) {
    connectedAgents.set(agenceId, list.filter((a) => a.socketId !== socketId));
  }
  for (let i = connectedAdmins.length - 1; i >= 0; i--) {
    if (connectedAdmins[i].socketId === socketId) connectedAdmins.splice(i, 1);
  }
}

const agentsOf = (agenceId) => connectedAgents.get(String(agenceId)) || [];

module.exports = { setIo, getIo, userRoom, toUser, addAgent, addAdmin, removeSocket, agentsOf, connectedAdmins };
