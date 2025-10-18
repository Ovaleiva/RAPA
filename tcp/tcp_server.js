const net = require("net");
const server = net.createServer((socket) => {
  console.log("Cliente conectado");
  socket.on("data", (data) => {
    console.log("Recibido:", data.toString());
    socket.write("Mensaje recibido por TCP");
  });
});

server.listen(6000, () => console.log("Servidor TCP en puerto 6000"));
