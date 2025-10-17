const net = require('net');

const PORT = 5000;
const HOST = '127.0.0.1';

const client = new net.Socket();

client.connect(PORT, HOST, () => {
    console.log('Conectado al servidor con éxito. ✅');

    client.write('¡Hola, servidor! Soy un cliente TCP.');
});

client.on('data', (data) => {
    console.log(`Respuesta del servidor: "${data.toString()}"`);
    
    client.end();
});

client.on('close', () => {
    console.log('Conexión cerrada.');
});

client.on('error', (err) => {
    console.error(`Error de conexión: ${err.message}`);
});