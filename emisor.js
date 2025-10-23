const dgram = require('dgram');

const MULTICAST_ADDR = '239.0.0.1';
const PORT = 6000;

const client = dgram.createSocket('udp4');

const message = process.argv[2] || "Mensaje de prueba para el grupo";
const data = Buffer.from(message);

client.send(data, 0, data.length, PORT, MULTICAST_ADDR, (err) => {
  if (err) {
    console.error('Error al enviar el mensaje:', err);
  } else {
    console.log(`Mensaje "${message}" enviado al grupo ${MULTICAST_ADDR}:${PORT}`);
  }
  client.close();
});