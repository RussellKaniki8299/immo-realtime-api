const os = require("os");


// =========================================================
// HEALTH GLOBAL
// =========================================================

exports.health = async (req, res) => {
  try {
    const memory = getMemoryMetrics();
    const cpu = getCpuMetrics();

    const socketStatus = global.io ? "ok" : "error";

    const status =
      socketStatus === "ok"
        ? "ok"
        : "error";

    return res.status(status === "ok" ? 200 : 503).json({
      status,
      service: "realtime-server",
      timestamp: new Date().toISOString(),

      uptime_seconds: Math.floor(process.uptime()),

      socket: {
        status: socketStatus,
        connections: getConnectionCount(),
      },

      server: {
        hostname: os.hostname(),
        platform: os.platform(),
        architecture: os.arch(),
        node_version: process.version,
        cpu_count: os.cpus().length,
      },

      cpu,

      memory,
    });
  } catch (error) {
    console.error("Health error:", error);

    return res.status(500).json({
      status: "error",
      service: "realtime-server",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};


// =========================================================
// LIVE
// =========================================================

exports.live = async (req, res) => {
  return res.json({
    status: "ok",
    service: "realtime-server",
    timestamp: new Date().toISOString(),
  });
};


// =========================================================
// READY
// =========================================================

exports.ready = async (req, res) => {
  const socketReady = !!global.io;

  const ready = socketReady;

  return res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    service: "realtime-server",
    timestamp: new Date().toISOString(),

    checks: {
      socket: {
        status: socketReady ? "ok" : "error",
        message: socketReady
          ? "Socket.IO opérationnel"
          : "Socket.IO non initialisé",
      },
    },
  });
};


// =========================================================
// METRICS
// =========================================================

exports.metrics = async (req, res) => {
  try {
    return res.json({
      status: "ok",
      service: "realtime-server",
      timestamp: new Date().toISOString(),

      metrics: {
        cpu: getCpuMetrics(),

        memory: getMemoryMetrics(),

        uptime_seconds: Math.floor(process.uptime()),

        websocket: {
          connections: getConnectionCount(),
        },

        load_average: os.loadavg(),
      },
    });
  } catch (error) {
    console.error("Metrics error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};


// =========================================================
// CONNECTIONS
// =========================================================

exports.connections = async (req, res) => {
  try {
    const connections = getConnectionCount();

    return res.json({
      status: "ok",
      service: "realtime-server",
      timestamp: new Date().toISOString(),

      websocket: {
        status: global.io ? "ok" : "error",
        connections,
      },
    });
  } catch (error) {
    console.error("Connections error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};


// =========================================================
// SERVER
// =========================================================

exports.server = async (req, res) => {
  try {
    const memory = getMemoryMetrics();

    return res.json({
      status: "ok",
      service: "realtime-server",

      timestamp: new Date().toISOString(),

      server: {
        hostname: os.hostname(),
        platform: os.platform(),
        release: os.release(),
        architecture: os.arch(),
        node_version: process.version,
        cpu_count: os.cpus().length,
        uptime_seconds: Math.floor(os.uptime()),
      },

      cpu: getCpuMetrics(),

      memory,

      load_average: os.loadavg(),
    });
  } catch (error) {
    console.error("Server metrics error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};


// =========================================================
// HELPERS
// =========================================================

function getConnectionCount() {
  try {
    if (!global.io) {
      return 0;
    }

    return global.io.engine?.clientsCount || 0;
  } catch (error) {
    return 0;
  }
}


function getMemoryMetrics() {
  const total = os.totalmem();
  const free = os.freemem();

  const used = total - free;

  const processMemory = process.memoryUsage();

  return {
    total_mb: Math.round(total / 1024 / 1024),

    used_mb: Math.round(used / 1024 / 1024),

    free_mb: Math.round(free / 1024 / 1024),

    usage_percent: Number(
      ((used / total) * 100).toFixed(2)
    ),

    process_rss_mb: Math.round(
      processMemory.rss / 1024 / 1024
    ),

    process_heap_used_mb: Math.round(
      processMemory.heapUsed / 1024 / 1024
    ),

    process_heap_total_mb: Math.round(
      processMemory.heapTotal / 1024 / 1024
    ),
  };
}


function getCpuMetrics() {
  const cpus = os.cpus();

  let idle = 0;
  let total = 0;

  cpus.forEach((cpu) => {
    idle += cpu.times.idle;

    total +=
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.idle +
      cpu.times.irq;
  });

  const usage = total > 0
    ? ((total - idle) / total) * 100
    : 0;

  return {
    usage_percent: Number(usage.toFixed(2)),
    cores: cpus.length,
  };
}