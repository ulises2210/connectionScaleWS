import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

// Configuración del puerto serie y el parser
const port = new SerialPort({
    // path: '/dev/ttyS0', // Asegúrate de que esta sea la ruta correcta de tu puerto serie
    path: '/dev/ttyUSB0', // Asegúrate de que esta sea la ruta correcta de tu puerto serie
    baudRate: 9600
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));


let lastValue = null;

parser.on('data', (data) => {
    // Filtrar los valores numéricos de las líneas que contienen "yds"
    const match = data.match(/(\d+(\.\d+)?)\s*kg/);
    if (match) {
        const currentValue = match[1]; // Captura el valor numérico

        if (currentValue !== lastValue) {
            console.log('parser: ', currentValue);
            lastValue = currentValue;
        }
    }
});

export { parser, port };