import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import serverSky from './app.js';
import { parser, openPort } from '../serialport/readingScaleConnection.js';
import { printFile } from './ticketController.js';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { eventEmitter } from '../serialport/readingScaleConnection.js';



const server = createServer(serverSky);
const io = new SocketServer(server, {
  cors: {
    cors: 'https://skynet.skytex.com.mx:8195/#/sky/yarn/',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

let lastValue = null;

openPort('/dev/ttyS0');

io.on('connection', (socket) => {
  console.log("Client connected");

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

  socket.on('typeConnectionScale', (data) => {
    openPort(data)

  });

  socket.on('ticket', async (data) => {
    console.log(data);
    try {
      const result = await printFile(data);
      socket.emit('printResult', result);
    } catch (error) {
      socket.emit('printResult', { success: false, error });
    }
  });

  socket.on('installPrint', async (data) => {
    try {
      const result = await installPrint(data);
      socket.emit('installPrintResult', {
        success: true,
        decs: result.decs,
        nameFunc: result.nameFunc
      });
    } catch (error) {
      console.log(error);
      socket.emit('installPrintResult', {
        success: false,
        decs: error.decs || 'desconocido error',
        nameFunc: error.nameFunc || 'desconocido function'
      });
    }
  });


});

eventEmitter.on('newValue', (value) => {
  console.log('Valor constante recibido:', value);
  io.emit('reading', value);
  lastValue = value;
    // Aquí puedes hacer lo que necesites con el valor constante
});

server.listen(3535, () => {
  console.log('Listening on port: 3535');
});

async function installPrint(data) {
  console.log('Installing');

  const directory = directoryFiles();
  return new Promise((resolve, reject) => {
    exec("sh " + directory + '/archivos_SH/install' + data.typePrinter + "Printer.sh", (err, result, stderr) => {
      if (err) {
        console.log(`error: ${err}`);
        return reject({
          success: false,
          nameFunc: 'installPrint' + data.typePrinter,
          decs: err.decs || err.message
        });
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return reject({
          success: false,
          nameFunc: 'installPrint' + data.typePrinter,
          decs: stderr
        });
      }
      console.log('PrintSheet installed successfully', result);
      resolve({
        success: true,
        nameFunc: 'installPrint' + data.typePrinter,
        decs: result
      });
    });
  });
}

function directoryFiles() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const directory = path.join(__dirname, '..');
  console.log('Directory', directory);
  return directory;
}