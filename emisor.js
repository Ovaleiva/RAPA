const dgram = require('dgram');

const PORT = 3333;
const HOST = '127.0.0.1'; 

const client = dgram.createSocket('udp4');

const message = Buffer.from('¡Hola desde el cliente!');

client.send(message, PORT, HOST, (err) => {
  if (err) {
    console.error('¡Error al enviar el mensaje!', err);
    client.close();
  } else {
    console.log('Mensaje enviado con éxito. ✅');
    client.close(); 
  }
});