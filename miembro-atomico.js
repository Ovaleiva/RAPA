
const dgram = require('dgram');

const MULTICAST_ADDR = '239.0.0.1';
const MULTICAST_PORT = 5000;

const COORD_HOST = '127.0.0.1'; 
const COORD_ACK_PORT = 4001;

const multicastListener = dgram.createSocket({ type: 'udp4', reuseAddr: true });
const ackSender = dgram.createSocket('udp4');

const pendingBuffer = new Map();

multicastListener.on('listening', () => {
  multicastListener.addMembership(MULTICAST_ADDR);
  const address = multicastListener.address();
  console.log(`[MIEMBRO ATÓMICO PID: ${process.pid}] escuchando en ${address.address}:${address.port}`);
});

multicastListener.on('message', (msg, rinfo) => {
  let parsedMsg;
  try {
    parsedMsg = JSON.parse(msg.toString());
  } catch (e) {
    return;
  }

  const { type, msgId, data } = parsedMsg;

  switch (type) {
    case 'PREPARE':
      if (!pendingBuffer.has(msgId)) {
        console.log(`[ID:${msgId}] ⬇️ PREPARE recibido. Guardando y enviando ACK.`);
        pendingBuffer.set(msgId, data);
        
        const ack = Buffer.from(JSON.stringify({ type: 'ACK', msgId }));
        ackSender.send(ack, COORD_ACK_PORT, COORD_HOST);
      }
      break;

    case 'COMMIT':
      if (pendingBuffer.has(msgId)) {
        const deliveredData = pendingBuffer.get(msgId);
        console.log(`\n=========================================`);
        console.log(`✅ [ID:${msgId}] MENSAJE ATÓMICO ENTREGADO: ${deliveredData}`);
        console.log(`=========================================\n`);
        pendingBuffer.delete(msgId); 
      }
      break;

    case 'ABORT':
      if (pendingBuffer.has(msgId)) {
        console.log(`[ID:${msgId}] ❌ ABORT recibido. Descartando mensaje.`);
        pendingBuffer.delete(msgId);
      }
      break;
  }
});


multicastListener.bind(MULTICAST_PORT);