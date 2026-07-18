const { Server } = require("socket.io");

const ordersSocket = require("../sockets/orders.socket");


module.exports = (server) => {

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  global.io = io;

  global.connectedAgents = {};
  global.connectedAdmins = [];

  // =========================
  // CONNECTED AGENTS
  // =========================

  io.on("connection", (socket) => {

    console.log(
      "User connected :",
      socket.id
    );

    // =========================
    // JOIN CLIENT
    // =========================
    socket.on(
      "join_client",
      (clientId) => {

        socket.join(
          `client_${clientId}`
        );

        console.log(
          `Client joined client_${clientId}`
        );

      }
    );


    socket.on("join_admin", (admin) => {

        socket.join("admins");

        const exists = global.connectedAdmins.find(
            a => a.userId === admin.userId
        );

        if (!exists) {
            global.connectedAdmins.push({
                ...admin,
                socketId: socket.id
            });
        }

        console.log(
            `Admin ${admin.nom} connecté`
        );

        console.table(global.connectedAdmins);

    });

    // =========================
    // JOIN agence
    // =========================
    socket.on(
      "join_agence",
      (agenceId) => {

        socket.join(
          `agence_${agenceId}`
        );

        console.log(
          `Joined agence_${agenceId}`
        );

      }
    );
    

    // =========================
    // JOIN agence AGENT
    // =========================
    socket.on(
      "join_agence_agent",
      (data) => {

        const {
          agenceId,
          userId,
          nom,
          role,
        } = data;

        socket.join(
          `agence_agents_${agenceId}`
        );

        if (
          !global.connectedAgents[
            agenceId
          ]
        ) {

          global.connectedAgents[
            agenceId
          ] = [];

        }

        const exists =
          global.connectedAgents[
            agenceId
          ].find(
            (a) =>
              a.userId === userId
          );

        if (!exists) {

          global.connectedAgents[
            agenceId
          ].push({
            userId,
            nom,
            role,
            socketId: socket.id,
          });

        }

        console.log(
          `Agent ${nom} joined agence_agents_${agenceId}`
        );

      }
    );

    // JOIN agence KITCHEN
    // =========================
    socket.on(
      "join_agence_kitchen",
      (agenceId) => {

        socket.join(
          `agence_kitchen_${agenceId}`
        );

        console.log(
          `Joined kitchen agence_kitchen_${agenceId}`
        );

      }
    );

    // SOCKET MODULES
    ordersSocket(io, socket);

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", (reason) => {

        console.log("User disconnected :", reason);

        Object.keys(global.connectedAgents).forEach((agenceId) => {

            global.connectedAgents[agenceId] =
                global.connectedAgents[agenceId].filter(
                    agent => agent.socketId !== socket.id
                );

        });

        global.connectedAdmins =
            global.connectedAdmins.filter(
                admin => admin.socketId !== socket.id
            );

    });

  }); 


};