const dgram = require('dgram');

const server = dgram.createSocket('udp4');

const PORT = 3333;
const HOST = '127.0.0.1';

server.on('listening', () => {
  const address = server.address();
  console.log(`Servidor UDP escuchando en ${address.address}:${address.port} 🚀`);
});

server.on('message', (msg, rinfo) => {
  console.log(`Mensaje recibido de ${rinfo.address}:${rinfo.port}: ${msg.toString()}`);
});

server.bind(PORT, HOST);