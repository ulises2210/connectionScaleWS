//  ***** importamos los archivos necesarios para el correcto funcionamiento ******** 

import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { exec } from 'child_process';
import serverSky from './app.js';
import path from 'path';
import { parser, port } from '../serialport/readingScaleConnection.js'

// termionamos de crear el servidor con io, para la correcta emision con los websockets
const appConf = serverSky;
const server = createServer(appConf);
const io = new SocketServer(server, {
  // !!!!! SE DEBE CAMNBIAR ESTE POR LA MISMA IP DE LA MAQUINA, TODO ESTA DENTRO DE LA MISMA MAQUINA
  cors: 'http:// 172.16.103.60:4200/#/sky/yarn/bobinas-cortas',
  methods: ['GET', 'POST'],
  credentials: true,
});

const dataParser = parser;


// ***** ACCEDEMOS A EL DIRECTORIO 3N EK QUE ESTAMOS, ESTO PARA CORRER LA CONEXION CON LA BASCULA 
// Obtén la ruta absoluta del directorio actual
const currentDirectory = process.cwd();
// Ruta al directorio del script permissions-console
const permissionsConsoleDirectory = path.join(currentDirectory, 'permissions-console');
// Ejecutar el script de Node.js desde el directorio correcto
// ********** EJECUTAMOS EL SRIPT PARA DARLE PERMISOS A LOS PUERTOS, MANEJAMOS LA RESPUESTA Y EL ERROR 
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


// parseamos la informacion que nos mande el serial
dataParser.on('data', (data) => {
  // dataParser = data.ReadlineParser();
  console.log(`Parsed data server: ${data}`);
  // port.emi
});


// realizamos la conexion y emitimnos por el websocket 
// envaimos la data por el wensoket
io.on('connection', socket => {
  socket.emit("conexion realizada");

  port.on('data', (data) => {
    socket.emit('reading', data);
    console.log(`Raw data server: ${data}`);
  });

});


server.listen(3535);
console.log('listening on port: ', 3535);

