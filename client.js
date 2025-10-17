const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const [myPort, initialOffset] = process.argv.slice(2);
const MASTER_PORT = 8000;
const MASTER_HOST = '127.0.0.1';

if (!myPort || !initialOffset) {
    console.log("Uso: node client.js <puerto> <desfase_en_ms>");
    process.exit(1);
}

let clockOffset = parseInt(initialOffset);

function getLocalTime() {
    return Date.now() + clockOffset;
}

client.on('message', (msg, rinfo) => {
    const message = JSON.parse(msg.toString());

    if (message.type === 'TIME_REQUEST') {
        const response = JSON.stringify({
            type: 'TIME_RESPONSE',
            time: getLocalTime()
        });
        console.log(`
-> Petición de tiempo recibida.
   Mi hora actual: ${new Date(getLocalTime()).toLocaleTimeString('es-AR', { hour12: false })}.${getLocalTime() % 1000}
   Enviando respuesta...`);
        client.send(Buffer.from(response), MASTER_PORT, MASTER_HOST);
    }
    
    if (message.type === 'ADJUST_TIME') {
        const adjustment = message.adjustment;
        console.log(`<- Recibido ajuste de ${adjustment.toFixed(0)} ms.`);
        clockOffset += adjustment;
        console.log(`   ✅ Reloj sincronizado. Nueva hora: ${new Date(getLocalTime()).toLocaleTimeString('es-AR', { hour12: false })}.${getLocalTime() % 1000}`);
    }
});

client.on('listening', () => {
    console.log(`🤖 Cliente Esclavo escuchando en el puerto ${myPort}`);
    console.log(`   Desfase inicial: ${clockOffset} ms.`);
});

client.bind(myPort);