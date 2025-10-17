const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const SERVER_PORT = 9000;
const SERVER_HOST = '127.0.0.1';
const SYNC_INTERVAL = 5000; 
let clockOffset = -10000;

function getLocalTime() {
    return Date.now() + clockOffset;
}

function startSync() {
    console.log(`\n--- 🔄 Iniciando sincronización ---`);
    console.log(`Mi hora actual (antes de sincronizar): ${new Date(getLocalTime()).toLocaleTimeString('es-AR', { hour12: false })}`);

    const requestTime = Date.now(); 
    client.send(Buffer.from('TIME_REQUEST'), SERVER_PORT, SERVER_HOST);
}

client.on('message', (msg, rinfo) => {
    const responseTime = Date.now(); 
    const serverTime = parseInt(msg.toString()); 

    const rtt = responseTime - requestTime;
    
    const newTime = serverTime + (rtt / 2);

    const currentLocalTime = getLocalTime();
    const adjustment = newTime - currentLocalTime;

    clockOffset += adjustment;

    console.log(`   Respuesta del servidor recibida.`);
    console.log(`   - Tiempo de Ida y Vuelta (RTT): ${rtt} ms`);
    console.log(`   - Hora del Servidor reportada:   ${new Date(serverTime).toLocaleTimeString('es-AR', { hour12: false })}`);
    console.log(`   - Ajuste calculado: ${adjustment.toFixed(2)} ms`);
    console.log(`✅ Mi nueva hora sincronizada: ${new Date(getLocalTime()).toLocaleTimeString('es-AR', { hour12: false })}`);
});

console.log(`🤖 Cliente iniciado. Sincronizará cada ${SYNC_INTERVAL / 1000} segundos.`);
setInterval(startSync, SYNC_INTERVAL);
startSync();