const net = require('net');

const server = net.createServer();

const PORT = 5000;
const HOST = '127.0.0.1';

server.on('connection', (socket) => {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`Nuevo cliente conectado: ${clientAddress} 🎉`);

    socket.on('data', (data) => {
        console.log(`Datos recibidos de ${clientAddress}: ${data.toString()}`);

        socket.write('Mensaje recibido por el servidor. ¡Gracias!');
    });

    socket.on('close', () => {
        console.log(`Conexión cerrada con ${clientAddress}.`);
    });

    socket.on('error', (err) => {
        console.error(`Error en el socket del cliente ${clientAddress}: ${err.message}`);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Servidor TCP escuchando en ${HOST}:${PORT} 🚀`);
});