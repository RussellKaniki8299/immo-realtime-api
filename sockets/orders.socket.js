module.exports = (io, socket) => {

  socket.on(
    "new_order",
    (data) => {

      console.log(
        "New order received :",
        data
      );

      // CLIENTS agence
      io.to(
        `agence_${data.agenceId}`
      ).emit(
        "receive_order",
        data
      );

      // AGENTS
      io.to(
        `agence_agents_${data.agenceId}`
      ).emit(
        "receive_order_agent",
        data
      );

    }
  );

  // =========================
  // NEW ORDER KITCHEN
  // =========================
  socket.on(
    "new_order_kitchen",
    (data) => {

      console.log(
        "New order kitchen :",
        data
      );

      io.to(
        `agence_kitchen_${data.agenceId}`
      ).emit(
        "receive_order_kitchen",
        data
      );

    }
  );

  // =========================
  // NEW SALE KITCHEN
  // =========================
  socket.on(
    "new_sale_kitchen",
    (data) => {

      console.log(
        "New sale kitchen :",
        data
      );

      io.to(
        `agence_kitchen_${data.agenceId}`
      ).emit(
        "receive_sale_kitchen",
        data
      );

    }
  );

};