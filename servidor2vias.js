const dgram = require('dgram');

const server = dgram.createSocket('udp4');
const MY_PORT = 4001;

server.bind(MY_PORT);

server.on('listening', () => {
    console.log(`Servidor escuchando en el puerto ${MY_PORT} 🚀`);
});

server.on('message', (msg, rinfo) => {
    console.log(`Petición recibida de ${rinfo.address}:${rinfo.port}: "${msg.toString()}"`);
    
    const response = Buffer.from(`Son las ${new Date().toLocaleTimeString()}`);
    server.send(response, rinfo.port, rinfo.address, (err) => {
        if (err) console.error(err);
        console.log('Respuesta enviada al cliente. ✅');
    });
});