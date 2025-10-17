const dgram = require('dgram');

const client = dgram.createSocket('udp4');
const server = { host: '127.0.0.1', port: 4001 };
const MY_PORT = 3001;

client.bind(MY_PORT);

client.on('listening', () => {
    console.log(`Cliente escuchando en el puerto ${MY_PORT}`);
    
    const message = Buffer.from('Hola, ¿puedes darme la hora?');
    client.send(message, server.port, server.host, (err) => {
        if (err) console.error(err);
        console.log('Petición enviada al servidor. ✅');
    });
});

client.on('message', (msg, rinfo) => {
    console.log(`Respuesta recibida del servidor: "${msg.toString()}"`);
    client.close();
});