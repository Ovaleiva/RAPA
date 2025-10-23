const dgram = require('dgram');

const MULTICAST_ADDR = '239.0.0.1';
const MULTICAST_PORT = 5000;

const EXTERNAL_PORT = 4000;

const ACK_PORT = 4001;


const EXPECTED_MEMBERS = 3; 

const multicastSender = dgram.createSocket('udp4');
const externalListener = dgram.createSocket('udp4');
const ackListener = dgram.createSocket('udp4');


const pendingMessages = new Map();
let messageIdCounter = 0;


function multicastSend(message) {
  const data = Buffer.from(JSON.stringify(message));
  multicastSender.send(data, 0, data.length, MULTICAST_PORT, MULTICAST_ADDR, (err) => {
    if (err) console.error('Error enviando multicast:', err);
  });
}


function abortMessage(msgId) {
  if (pendingMessages.has(msgId)) {
    console.log(`[ID:${msgId}] 🔴 ABORT. Faltaron ACKs. Notificando al grupo.`);
    multicastSend({ type: 'ABORT', msgId });
    pendingMessages.delete(msgId);
  }
}

externalListener.on('message', (msg, rinfo) => {
  const msgId = messageIdCounter++;
  const data = msg.toString();
  console.log(`[ID:${msgId}] Mensaje externo recibido de ${rinfo.address}:${rinfo.port}: "${data}"`);

  const timeout = setTimeout(() => abortMessage(msgId), 3000); 

  pendingMessages.set(msgId, {
    data: data,
    acks: new Set(),
    timer: timeout,
  });

  console.log(`[ID:${msgId}] ➡️ Fase 1: Enviando PREPARE al grupo...`);
  multicastSend({ type: 'PREPARE', msgId, data });
});

ackListener.on('message', (msg, rinfo) => {
  let parsedMsg;
  try {
    parsedMsg = JSON.parse(msg.toString());
  } catch (e) {
    return;
  }

  if (parsedMsg.type === 'ACK' && pendingMessages.has(parsedMsg.msgId)) {
    const msgState = pendingMessages.get(parsedMsg.msgId);
    const memberId = `${rinfo.address}:${rinfo.port}`;
    
    if (!msgState.acks.has(memberId)) {
      msgState.acks.add(memberId);
      console.log(`[ID:${parsedMsg.msgId}] ⬅️ Fase 2: ACK recibido de ${memberId} (${msgState.acks.size}/${EXPECTED_MEMBERS})`);
    }

    if (msgState.acks.size === EXPECTED_MEMBERS) {
      clearTimeout(msgState.timer); 
      console.log(`[ID:${parsedMsg.msgId}] ✅ Fase 3: COMMIT. Todos confirmaron.`);
      multicastSend({ type: 'COMMIT', msgId: parsedMsg.msgId });
      pendingMessages.delete(parsedMsg.msgId); 
    }
  }
});

externalListener.bind(EXTERNAL_PORT, () => {
  console.log(`Coordinador escuchando mensajes externos en UDP ${EXTERNAL_PORT}`);
});

ackListener.bind(ACK_PORT, () => {
  console.log(`Coordinador escuchando ACKs internos en UDP ${ACK_PORT}`);
});