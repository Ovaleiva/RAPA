const dgram = require('dgram');

const [myId, myPort, nextHost, nextPort] = process.argv.slice(2);

if (!myId || !myPort) {
    console.log("Uso: node proceso.js <mi_id> <mi_puerto> [host_siguiente] [puerto_siguiente]");
    process.exit(1);
}

let lamportClock = 0;
const socket = dgram.createSocket('udp4');

function doWork() {
    lamportClock++;
    console.log(`[P${myId}] 🕒 Reloj: ${lamportClock}. Iniciando mi tarea.`);

    console.log(`[P${myId}] ... trabajando ...`);

    if (nextHost && nextPort) {
        lamportClock++;
        const message = JSON.stringify({
            timestamp: lamportClock,
            from: myId
        });

        console.log(`[P${myId}] 🕒 Reloj: ${lamportClock}. Terminando tarea y enviando permiso a P${parseInt(myId) + 1}.`);
        socket.send(Buffer.from(message), nextPort, nextHost, (err) => {
            if (err) console.error(err);
            socket.close(); 
        });
    } else {
        console.log(`[P${myId}] ✅ Soy el último proceso. Secuencia completada.`);
        socket.close();
    }
}

socket.on('listening', () => {
    console.log(`[P${myId}] Proceso iniciado. Escuchando en el puerto ${myPort}.`);
    if (myId === '1') {
        doWork();
    }
});

socket.on('message', (msg, rinfo) => {
    const message = JSON.parse(msg.toString());
    const receivedTimestamp = message.timestamp;

    console.log(`[P${myId}] Mensaje recibido de P${message.from} con tiempo ${receivedTimestamp}.`);

    lamportClock = Math.max(lamportClock, receivedTimestamp) + 1;
    console.log(`[P${myId}] 🕒 Reloj actualizado a: ${lamportClock} (max(${lamportClock - 1}, ${receivedTimestamp}) + 1).`);

    doWork();
});


socket.bind(myPort);