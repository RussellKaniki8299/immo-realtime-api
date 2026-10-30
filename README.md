# Kinmak · Serveur temps réel (Socket.IO)

Commandes en direct, **messagerie** (nouveaux messages, non-lus, « vu », saisie) et **signalisation d'appels audio/vidéo**.
La voix/vidéo ne passe pas par ce serveur (WebRTC pair-à-pair) : il ne relaie que les messages de signalisation.

```bash
cp .env.example .env     # INTERNAL_API_SECRET, SOCKET_AUTH_MODE=laravel, LARAVEL_API_URL…
npm install && npm run dev
npm test                 # test de fumée (sans réseau)
```

```
src/
├─ server.js · app.js            Bootstrap HTTP + arrêt propre
├─ config/env.js                 Configuration validée au démarrage
├─ state/registry.js             io + agents/admins connectés (remplace les `global.*`)
├─ middleware/                   internalAuth (x-internal-secret) · socketAuth (jeton Sanctum)
├─ sockets/                      chat · call · orders + index (rooms métier)
├─ controllers/                  orders · messaging · calls · health
└─ routes/                       /api/realtime/* · /api/health/*
```

## Changements
| Sujet | Avant | Maintenant |
|---|---|---|
| Identité des sockets | `join_user` croyait le client (usurpation possible) | `SOCKET_AUTH_MODE=laravel` : jeton Sanctum vérifié, `userId` imposé par le serveur |
| `join_client` | n'importe quel client pouvait écouter les commandes d'un autre | un client ne rejoint que sa propre room |
| Signalisation d'appels | — (déjà par `userId`) | seuls `offer` / `answer` / `candidate` sont relayés ; un socket sans identité ne signale rien |
| Routes `/api/realtime/*` | ouvertes | messagerie et appels : `x-internal-secret` obligatoire ; commandes : `PROTECT_BUSINESS_ROUTES=true` |
| État partagé | `global.io`, `global.connectedAgents` | `state/registry.js` |
| Reconnexion côté clients | abandon après 10 essais | illimitée, jeton renvoyé à chaque tentative |
| Messages Socket.IO | illimités | 1 Mo max |

Tous les noms d'événements et toutes les routes existantes sont conservés.
