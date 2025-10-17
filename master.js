const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const PORT = 8000;
const HOST = '127.0.0.1';
const SYNC_INTERVAL = 10000; 
const slaves = [
    { port: 8001, host: '127.0.0.1' },
    { port: 8002, host: '127.0.0.1' },
    { port: 8003, host: '127.0.0.1' }
];

let timeResponses = [];
let sendTimes = new Map();

function startSyncCycle() {
    console.log(`\n--- 🔄 Iniciando nuevo ciclo de sincronización ---`);
    timeResponses = []; 
    sendTimes.clear();

    slaves.forEach(slave => {
        const message = JSON.stringify({ type: 'TIME_REQUEST' });
        server.send(Buffer.from(message), slave.port, slave.host);
        sendTimes.set(`${slave.host}:${slave.port}`, Date.now()); 
    });

    setTimeout(calculateAndDistribute, 2000);
}

function calculateAndDistribute() {
    if (timeResponses.length === 0) {
        console.log("⚠️ No se recibieron respuestas de los esclavos. Abortando ciclo.");
        return;
    }

    console.log(`\n--- 📊 Calculando promedio de tiempo ---`);
    const allTimes = [{ source: 'master', time: Date.now() }, ...timeResponses];
    console.log("Tiempos recibidos (incluyendo RTT ajustado):");
    allTimes.forEach(t => console.log(`  - ${t.source}: ${new Date(t.time).toLocaleTimeString('es-AR', { hour12: false })}.${t.time % 1000}`));

    const sumOfTimes = allTimes.reduce((acc, curr) => acc + curr.time, 0);
    const averageTime = sumOfTimes / allTimes.length;

    console.log(`\n🕒 Hora Promedio Calculada: ${new Date(averageTime).toLocaleTimeString('es-AR', { hour12: false })}.${Math.round(averageTime % 1000)}`);

    allTimes.forEach(node => {
        const adjustment = averageTime - node.time;
        console.log(`  - Ajuste para ${node.source}: ${adjustment.toFixed(0)} ms`);

        if (node.source !== 'master') {
            const slaveInfo = slaves.find(s => s.port == node.source.split(':')[1]);
            if (slaveInfo) {
                const message = JSON.stringify({ type: 'ADJUST_TIME', adjustment });
                server.send(Buffer.from(message), slaveInfo.port, slaveInfo.host);
            }
        }
    });
     console.log("\n--- ✅ Ciclo de sincronización completado ---");
}

server.on('message', (msg, rinfo) => {
    const message = JSON.parse(msg.toString());
    const sourceKey = `${rinfo.address}:${rinfo.port}`;

    if (message.type === 'TIME_RESPONSE') {
        const rtt = Date.now() - sendTimes.get(sourceKey);
        const clientTime = message.time;
        const adjustedTime = clientTime + (rtt / 2); 

        console.log(`📧 Respuesta de ${sourceKey} | Hora reportada: ${clientTime} | RTT: ${rtt}ms`);
        
        timeResponses.push({ source: sourceKey, time: adjustedTime });

        if (timeResponses.length === slaves.length) {
            calculateAndDistribute();
        }
    }
});

server.on('listening', () => {
    console.log(`👑 Servidor Maestro Berkeley escuchando en ${HOST}:${PORT}`);
    setInterval(startSyncCycle, SYNC_INTERVAL);
});

server.bind(PORT, HOST);