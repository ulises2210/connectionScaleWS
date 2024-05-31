import { CommandsPermissScale, password } from "./scaleConnection.js";

// permisos para la bascula con sudo 

// Accedemos al proceso hijo y la contraseña exportados
const commands = CommandsPermissScale;
const passSudo = password;

// Enviamos la contraseña al proceso hijo
commands.stdin.write(passSudo + '\n');

// Manejamos eventos del proceso hijo
commands.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

commands.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

commands.on('error', (error) => {
    console.error(`Error al ejecutar el comando: ${error.message}`);
});

commands.on('close', (code) => {
    console.log(`Proceso hijo finalizado con código ${code}`);
});
