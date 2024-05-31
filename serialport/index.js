
import { parser , port } from './readingScaleConnection.js'

const dataParser = parser;

// const  dataParser = ""

// Encadenar el puerto con el parser
port.pipe(dataParser);

// Manejar los datos recibidos
dataParser.on('data', (data) => {
    console.log(`Data received: ${data}`);
});

// Manejar errores
port.on('error', (err) => {
    console.error('Error: ', err.message);
});

// Confirmar que el puerto está abierto
port.on('open', () => {
    console.log('Port is open');
});

port.on('data', (data) => {
    console.log(`Raw data: ${data}`);
});

dataParser.on('data', (data) => {
    // dataParser = data.ReadlineParser();
    console.log(`Parsed data: ${data}`);
    // port.emi
});


export {dataParser} 


