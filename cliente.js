const dgram = require('dgram');

const COORD_HOST = '127.0.0.1';
const COORD_EXT_PORT = 4000;

const message = process.argv[2] || "Mensaje de prueba";
const buffer = Buffer.from(message);

const client = dgram.createSocket('udp4');

client.send(buffer, COORD_EXT_PORT, COORD_HOST, (err) => {
  if (err) {
    console.error('Error al enviar el mensaje:', err);
  } else {
    console.log(`Cliente envió: "${message}" al coordinador.`);
  }
  client.close();
});