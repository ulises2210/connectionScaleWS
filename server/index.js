import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { exec } from 'child_process';
import serverSky from './app.js';
import path from 'path';
import { parser, port } from '../serialport/readingScaleConnection.js';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import html2canvas from 'html2canvas';
import { printFile } from './ticketController.js'

const server = createServer(serverSky);
const io = new SocketServer(server, {
  cors: {
    cors: 'https://skynet.skytex.com.mx:8195/#/sky/yarn/',
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

  socket.on('ticket', (data) => {
    console.log('data')
    console.log(data)
    printFile(data);
  })

  socket.on('sendDataTicket', async (data)  => {
    try {
      // Leer la plantilla HTML
      const templatePath = path.join(__dirname, 'etiquetasSkyYarn/'+data.file, data.file+'.html');
      let html = fs.readFileSync(templatePath, 'utf8');

      // Reemplazar los marcadores de posición con los datos recibidos
      html = html.replace('{{id}}', data.id);
      html = html.replace('{{fecha}}', data.fecha);
      html = html.replace('{{muda_posicion}}', data.muda_posicion);
      html = html.replace('{{elemento}}', data.elemento);
      html = html.replace('{{qr_text}}', data.qr_text);

      // Usar jsdom para manipular el DOM
      const dom = new JSDOM(html);
      const window = dom.window;
      const document = window.document;

      // Generar el código QR en el documento
      const script = document.createElement('script');
      script.textContent = `
        (${generateQR.toString()})('${data.qr_text}');
      `;
      document.body.appendChild(script);

      // Usar html2canvas para convertir el HTML a un canvas
      const canvas = await html2canvas(document.body);

      // Crear el PDF usando jsPDF
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0);

      // Guardar el PDF en el servidor temporalmente
      const pdfPath = path.join(currentDirectory, 'public', 'ticket.pdf');
      pdf.save(pdfPath, { returnPromise: true }).then(() => {
        // Enviar el PDF al cliente
        io.emit('pdfGenerated', { url: 'ticket.pdf' });
      }).catch((error) => {
        console.error('Error al generar el PDF:', error);
        io.emit('pdfError', { message: 'Error al generar el PDF' });
      });
    } catch (error) {
      console.error('Error en el procesamiento:', error);
      io.emit('pdfError', { message: 'Error en el procesamiento' });
    }
  })

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
  //  console.log('Datos crudos desde index:', data);
  
    // Buscar el valor numérico seguido de "kg"
    // La expresión regular maneja signos, espacios y la falta de espacio antes de "kg"
    const match = data.match(/[\+\-]?(\d+(\.\d+)?)\s*kg/i);
  //  console.log('match:', match);
  
    if (match) {
      const currentValue = match[1]; // Captura el valor numérico
    //  console.log('Valor capturado:', currentValue);
  
      // Solo emitir si el valor ha cambiado y está correctamente formado
      if (currentValue !== lastValue && /^\d+(\.\d+)?$/.test(currentValue)) {
       // console.log('parser-server:', currentValue);
        io.emit('reading', currentValue); // Emitir a todos los clientes conectados
        lastValue = currentValue;
      }
    } else {
      console.log('No se encontró una coincidencia con la expresión regular.');
    }
  });
  
  
  
  server.listen(3535, () => {
    console.log('Listening on port: 3535');
  });
  
  
  function generateQR(texto) {
    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
      text: texto,
      width: 250,
      height: 250,
    })};
