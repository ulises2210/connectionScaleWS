import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { exec } from 'child_process';
import serverSky from './app.js';
import path from 'path';
import { parser, port } from '../serialport/readingScaleConnection.js';

const server = createServer(serverSky);
const io = new SocketServer(server, {
  cors: {
    cors: 'https://skynet.skytex.com.mx:8195/#/sky/yarn/bobinas-cortas',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Ejecutar el script de permisos
const currentDirectory = process.cwd();
const permissionsConsoleDirectory = path.join(currentDirectory, 'permissions-console');

exec('node scaleConnection.js', { cwd: permissionsConsoleDirectory }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

let lastValue = null
// Emitir datos por WebSocket


// Emitir datos por WebSocket
io.on('connection', (socket) => {
  console.log("Client connected");

  // Emitir el último valor conocido cuando un cliente se conecta
  if (lastValue) {
    socket.emit('ultimate-Value', lastValue);
  }

  socket.on('disconnect', () => {
    console.log("Client disconnected");
  });

  socket.on('reconnection', () => {
    if (lastValue) {
      socket.emit('ultimate-Value', lastValue);
    }
  });

});

// ***** REVISAR EL PARSER, ESTE A VECES EMITE EL VALOR INCOMPLETO, HACER PRUEBAS O AJUSTAR
// parser.on('data', (data) => {
//   const match = data.match(/(\d+(\.\d+)?)\s*yds/);
//   if (match) {
//     const currentValue = match[1]; // Captura el valor numérico

//     // Solo emitir si el valor ha cambiado y no es una fracción incompleta
//     if (currentValue !== lastValue && /^\d+(\.\d+)?$/.test(currentValue)) {
//       console.log('parser-server: ', currentValue);
//       io.emit('reading', currentValue); // Emitir a todos los clientes conectados
//       lastValue = currentValue;
//     }
//   }
// });

// ***** REVISAR O HACER PRUEBAS CON ESTA FUNCION DE PARSEADO
parser.on('data', (data) => {
  // Eliminar caracteres no numéricos, excepto el punto decimal y los espacios
  const cleanedData = data.replace(/[^0-9.\s]/g, '');

  // Buscar el valor numérico seguido de un espacio y "yds"
  const match = cleanedData.match(/(\d+(\.\d+)?)\s*yds/);
  if (match) {
    const currentValue = match[1]; // Captura el valor numérico

    // Solo emitir si el valor ha cambiado y está correctamente formado
    if (currentValue !== lastValue && /^\d+(\.\d+)?$/.test(currentValue)) {
      console.log('parser-server: ', currentValue);
      io.emit('reading', currentValue); // Emitir a todos los clientes conectados
      lastValue = currentValue;
    }
  }
});



server.listen(3535, () => {
  console.log('Listening on port: 3535');
});

