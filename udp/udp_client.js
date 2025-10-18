const dgram = require("dgram");
const client = dgram.createSocket("udp4");
client.send("Hola servidor UDP", 5005, "localhost", (err) => {
  if (err) console.error(err);
});
client.on("message", (msg) => {
  console.log("Respuesta:", msg.toString());
  client.close();
});
