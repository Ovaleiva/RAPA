const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const server = { host: '127.0.0.1', port: 4001 };
const MY_PORT = 3001;

client.bind(MY_PORT);

client.on('listening', () => {
    console.log(`Cliente escuchando en ${MY_PORT}`);
    
    const fin = Buffer.from('FIN');
    client.send(fin, server.port, server.host, () => console.log('1. Petición de cierre (FIN) enviada.'));
});

client.on('message', (msg, rinfo) => {
    const message = msg.toString();
    console.log(`Mensaje del servidor: "${message}"`);

    if (message === 'ACK') {
        console.log('2. ACK del servidor recibido.');
    }
    if (message === 'FIN') {
        console.log('3. FIN del servidor recibido.');
        const finalAck = Buffer.from('ACK');
        client.send(finalAck, server.port, server.host, () => {
            console.log('4. ACK final enviado. Cerrando cliente.');
            client.close();
        });
    }
});