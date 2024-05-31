import { spawn } from 'child_process';

const command = "sudo";
const args = ["-S", "chmod", "666" , "/dev/ttyUSB0"];

// Creamos el proceso hijo y lo exportamos
export const CommandsPermissScale = spawn(command, args);

// Contraseña para el comando sudo
export const password = '22710';
