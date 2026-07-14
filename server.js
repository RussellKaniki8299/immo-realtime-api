require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");

const setupSocket = require("./config/socket");

const realtimeRoutes = require("./routes/realtime.routes");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// SOCKET
setupSocket(server);

// ROUTES
app.use("/api/realtime", realtimeRoutes);

// TEST
app.get("/", (req, res) => {
  res.send("Realtime server running...");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});