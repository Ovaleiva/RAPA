const net = require("net");
const client = net.createConnection({ port: 6000 }, () => {
  client.write("Hola servidor TCP");
});
client.on("data", (data) => {
  console.log("Respuesta:", data.toString());
  client.end();
});
