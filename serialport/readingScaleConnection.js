import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { EventEmitter } from "events";

let port = null;
let parser = null;
const eventEmitter = new EventEmitter();

function openPort(pathPort) {
  if (port && port.isOpen) {
    port.close(() => {
      console.log(`Puerto cerrado: ${port.path}`);
      configurePort(pathPort);
    });
  } else {
    configurePort(pathPort);
  }
}

function configurePort(pathPort) {
  port = new SerialPort({
    path: pathPort,
    baudRate: 9600,
    autoOpen: true, // Abrir automáticamente
  });

  port.on("open", () => {
    console.log(`Puerto abierto: ${pathPort}`);
    parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
    emitData();
  });

  port.on("close", () => {
    console.log(`Puerto cerrado: ${pathPort}`);
  });

  port.on("error", (err) => {
    console.error("Error en el puerto: ", err.message);
  });
}

function emitData() {
  let lastValue = null;

    if (parser) {
    parser.on("data", (data) => {
      const match = data.match(/(\d+(\.\d+)?)\s*kg/);
      if (match) {
        const currentValue = match[1];

        if (currentValue !== lastValue) {
          lastValue = currentValue;

          // Emitir el valor mediante EventEmitter
          eventEmitter.emit("newValue", lastValue);
        }
      }
    });
  }
}

export { parser, port, openPort, eventEmitter };
