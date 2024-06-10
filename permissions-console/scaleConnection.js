import { spawn } from 'child_process';

const command = "sudo";
const args = ["-S", "chmod", "666", "/dev/ttyUSB0"];

// Creamos el proceso hijo y lo exportamos
export const CommandsPermissScale = spawn(command, args);

// Contraseña para el comando sudo
const password = '22710';
CommandsPermissScale.stdin.write(password + '\n');

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
