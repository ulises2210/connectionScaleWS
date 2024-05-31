import { createServer } from 'http'; 
import { Server as SocketServer } from 'socket.io';
import { exec } from 'child_process';
import serverSky from './app.js'; 
import { dataParser } from '../serialport/index.js'; 
import path from 'path';





// Obtén la ruta absoluta del directorio actual
const currentDirectory = process.cwd();
// Ruta al directorio del script permissions-console
const permissionsConsoleDirectory = path.join(currentDirectory, 'permissions-console');

// Ejecutar el script de Node.js desde el directorio correcto
exec('node index.js', { cwd: permissionsConsoleDirectory }, (error, stdout, stderr) => {
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







dataParser.on('data', (data) => {
  // dataParser = data.ReadlineParser();
  console.log(`Parsed data: ${data}`);
  // port.emi
});







const appConf = serverSky;

const server = createServer(appConf); 

const io = new SocketServer(server, { 
  cors: 'http://localhost:4200/#/sky/yarn/bobinas-cortas',
  methods: ['GET', 'POST'],
  credentials: true,
});

io.on('connection', socket => {
  socket.emit("conexion realizada");
  
  socket.on('peso bascula', (data) => { 
    console.log(data);
    parser.on('reading', (ParserData) => {
      io.emit( ParserData);
      // dataParser = ParserData.ReadlineParser();
      console.log(`Parsed data: ${ParserData}`);
      // port.emi
    });
  });
  socket.emit('hola')
});

server.listen(3535);
console.log('listening on port: ', 3000);
