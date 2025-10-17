const dgram = require('dgram');

const client = dgram.createSocket('udp4');
const server = { host: '127.0.0.1', port: 4001 };
const MY_PORT = 3001;

client.bind(MY_PORT);

client.on('listening', () => {
    console.log(`Cliente escuchando en ${MY_PORT}`);
    
    const request = Buffer.from('REQ: ¿Estás listo para recibir datos?');
    client.send(request, server.port, server.host, () => console.log('Petición enviada.'));
});

client.on('message', (msg, rinfo) => {
    const message = msg.toString();
    console.log(`Mensaje del servidor: "${message}"`);
    
  
    if (message === 'ACK: Listo') {
        const finalData = Buffer.from('DATA: Aquí está la información.');
        client.send(finalData, server.port, server.host, () => {
            console.log('Dato final enviado. Cerrando cliente.');
            client.close();
        });
    }
});