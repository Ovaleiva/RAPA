const dgram = require('dgram');

const server = dgram.createSocket('udp4');
const MY_PORT = 4001;

server.bind(MY_PORT);

server.on('listening', () => console.log(`Servidor escuchando en ${MY_PORT} 🚀`));

server.on('message', (msg, rinfo) => {
    const message = msg.toString();
    console.log(`Mensaje de ${rinfo.port}: "${message}"`);
    
    if (message.startsWith('REQ')) {
        const ack = Buffer.from('ACK: Listo');
        server.send(ack, rinfo.port, rinfo.address, () => console.log('ACK enviado.'));
    }
    

    if (message.startsWith('DATA')) {
        console.log('Datos finales recibidos con éxito. ✨');

    }
});