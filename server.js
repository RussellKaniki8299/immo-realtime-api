require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");

const setupSocket = require("./config/socket");
const realtimeRoutes = require("./routes/realtime.routes");
const healthRoutes = require("./routes/health.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Socket.IO
setupSocket(server);

// Routes realtime
app.use("/api/realtime", realtimeRoutes);

// Monitoring
app.use("/api/health", healthRoutes);

// Route de test
app.get("/", (req, res) => {
  res.send("Realtime server running...");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});