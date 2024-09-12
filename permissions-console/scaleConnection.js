import { spawn } from 'child_process';
import { fs } from 'fs';

const command = "sudo";
// const args = ["-S", "chmod", "666", "/dev/ttyS0"];
const args = ["-S", "chmod", "666", "/dev/ttyUSB0"];

// Creamos el proceso hijo y lo exportamos
export const CommandsPermissScale = spawn(command, args);

// Contraseña para el comando sudo
const password = 'inspeccion';
CommandsPermissScale.stdin.write(password + '\n');

try {
    CommandsPermissScale.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    
    CommandsPermissScale.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    
    CommandsPermissScale.on('error', (error) => {
        console.error(`Error al ejecutar el comando: ${error.message}`);
    });
    
    CommandsPermissScale.on('close', (code) => {
        console.log(`Proceso hijo finalizado con código ${code}`);
    });
} catch (error) {
    console.error('Error al ejecutar el comando', error);
}
