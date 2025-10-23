
const dgram = require('dgram');


const MULTICAST_ADDR = '239.0.0.1'; 
const PORT = 6000;                 


const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

socket.on('listening', () => {
  socket.addMembership(MULTICAST_ADDR);
  
  const address = socket.address();
  console.log(`[Nodo PID: ${process.pid}] escuchando en ${address.address}:${address.port}`);
  console.log(`[Nodo PID: ${process.pid}] se unió al grupo ${MULTICAST_ADDR}\n`);
});

socket.on('message', (msg, rinfo) => {
  console.log(`[Nodo PID: ${process.pid}] MENSAJE RECIBIDO de ${rinfo.address}:${rinfo.port}`);
  console.log(`>>> ${msg.toString()} \n`);
});

socket.bind(PORT);

socket.on('error', (err) => {
  console.error(`[Nodo PID: ${process.pid}] Error: ${err.stack}`);
  socket.close();
});