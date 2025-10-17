const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const MY_PORT = 4001;

server.bind(MY_PORT);
server.on('listening', () => console.log(`Servidor escuchando en ${MY_PORT} 🚀`));

server.on('message', (msg, rinfo) => {
    const message = msg.toString();
    console.log(`Mensaje de ${rinfo.port}: "${message}"`);

    if (message === 'FIN') {
        const ack = Buffer.from('ACK');
        server.send(ack, rinfo.port, rinfo.address, () => console.log('2. ACK enviado al cliente.'));

        setTimeout(() => {
            const fin = Buffer.from('FIN');
            server.send(fin, rinfo.port, rinfo.address, () => console.log('3. FIN enviado al cliente.'));
        }, 500);
    }

    if (message === 'ACK') {
        console.log('4. ACK final recibido. Cerrando servidor.');
        server.close();
    }
});