const dgram = require("dgram");
const server = dgram.createSocket("udp4");
server.on("message", (msg, rinfo) => {
  console.log(`Mensaje de ${rinfo.address}:${rinfo.port}: ${msg}`);
  server.send("Mensaje recibido", rinfo.port, rinfo.address);
});
server.bind(5005, () => console.log("Servidor UDP en puerto 5005"));
