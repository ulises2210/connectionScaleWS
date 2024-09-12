import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import serverSky from './app.js';
import { printFile } from './ticketController.js'
import { exec } from 'child_process'
import path from 'path';
import { fileURLToPath } from 'url';

const server = createServer(serverSky);
const io = new SocketServer(server, {
  cors: {
    cors: 'https://skynet.skytex.com.mx:8195/#/sky/yarn/',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

const dataPrinter = {
  typePrinter: 'sheet',
}

// ************* DESCOMENTAR PARA HACER LAS PRUEBAS PARA GENERAR EL PDF *********************


// const data = [ {
//   type: "print",
//   fileName: 'sky-packing',
//   printer: 'ticket',
//   orientation : 'l',
//   format : [210,297], 
//   sku_cve:'VDTY1501441SR2SI1RWS0101',
//   sku_cve_name: 'DTY 150D/144F (167 DTEX)',
//   lote_cve: '01',
//   calidad:'AA',
//   afinidad:'AA',
//   no_bobinas:'6',
//   peso_bruto:'37.7 Kg / 83.1 Lb',
//   peso_Neto:'36.0 Kg / 79.4 Lb',
//   date: '18/08/2024',
//   tarima_cve: 'CM|PN19601545952',

// }, {
//   type: "print",
//   fileName: 'sky-yarn',
//   printer: 'sheet',
//   orientation: 'l',
//   format :  [210,297],
//   carro: 'pruebas_carro',
//   sku_cve: 'pruebas_sku_cve',
//   lote: 'pruebas_lote',
//   afinidad: 'pruebas_afinidad',
//   bobinas: 'pruebas_bobinas',
//   peso_neto: 'pruebas_peso_neto',
//   calcNetWeight: '123456789',
//   fol_dispo: 'pruebas_fol_dispo',
//   qrcode: [{
//     width: '200px',
//     height: '200px',
//     qrcodeDetail: 'pruebas-qr-+',
//     idQrCode : "qrcodeImage"
//   },{
//     width: '100px',
//     height: '100px',
//     qrcodeDetail: 'pruebas-qr-+',
//     idQrCode : "qrcodeImage1"
  // }]
// }]

// printFile(data);

// installPrintSheet(dataPrinter);

// Emitir datos por WebSocket
io.on('connection', async (socket) => {
  console.log("Client connected");

  socket.on('disconnect', () => {
    console.log("Client disconnected");
  });

  socket.on('reconnection', () => {
    console.log("Client reestablished");
  });

  socket.on('ticket', async (data) => {
    console.log(data);
    try {
      const result = await printFile(data);
      socket.emit('printResult', result);
    } catch (error) {
      socket.emit('printResult', { success: false, error });
    }
  })

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
        decs: error.decs || 'Unknown error', 
        nameFunc: error.nameFunc || 'Unknown function' 
      });
    }
  });

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
          nameFunc: 'installPrint'+data.typePrinter,
          decs: err.decs || err.message
        });
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return reject({
          success: false,
          nameFunc: 'installPrint'+data.typePrinter,
          decs: stderr
        });
      }
      console.log('PrintSheet installed successfully', result);
      resolve({
        success: true,
        nameFunc: 'installPrint'+data.typePrinter,
        decs: result
      });
    });
  });
}


function directoryFiles() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const directory = path.join(__dirname, '..');
  // console.log('Directory', directory);
  return directory;
}
