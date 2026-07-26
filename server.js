require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");

const setupSocket = require("./config/socket");
const realtimeRoutes = require("./routes/realtime.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// INITIALISATION SOCKET.IO (injecte global.io et gère les rooms)
setupSocket(server);

// ROUTES REALTIME
app.use("/api/realtime", realtimeRoutes);

// ROUTE DE TEST
app.get("/", (req, res) => {
  res.send("Realtime server running...");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});