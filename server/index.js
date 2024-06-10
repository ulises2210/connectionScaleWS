import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { exec } from 'child_process';
import serverSky from './app.js';
import path from 'path';
import { parser, port } from '../serialport/readingScaleConnection.js';

const server = createServer(serverSky);
const io = new SocketServer(server, {
  cors: {
    origin: 'http://172.16.103.60:4200',
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

// Emitir datos por WebSocket
io.on('connection', (socket) => {
  console.log("Client connected");

  port.on('data', (data) => {
    socket.emit('reading', data.toString());
    console.log(`Raw data server: ${data}`);
  });

  parser.on('data', (data) => {
    console.log(`Parsed data server: ${data}`);
  });
});

server.listen(3535, () => {
  console.log('Listening on port: 3535');
});
