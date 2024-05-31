import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

// Configuración del parser
// const parser = new ReadlineParser({ delimiter: '\r\n' }); // Puedes ajustar el delimitador según sea necesario

// let dataParser = "";

// Configuración del puerto serie
const port = new SerialPort({
    path: '/dev/ttyUSB0', // Asegúrate de que esta sea la ruta correcta de tu puerto serie
    // path: '/dev/tty/S0', // Asegúrate de que esta sea la ruta correcta de tu puerto serie
    baudRate: 9600
});

const parser = port.pipe(new ReadlineParser ({delimiter : '\r\n'}) )



export { parser, port };

