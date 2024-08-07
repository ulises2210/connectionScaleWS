import { jsPDF } from 'jspdf';
import fs from 'fs';



export async  function printFile(data) {
    switch (data.fileName) {
        case 'shorts-coils':
            //   templatePath = path.join(__dirname, 'etiquetasSkyYarn/shorts-coils', fileName+'.html');
            await fillInfo(data)
        break;

        default:

        break;
    }
}


async function fillInfo(data) {
    const templatePath = '/etiquetasSkyYarn/'+data.fileName+'/'+data.fileName+'.html';
    console.log('Template path:', templatePath);

    if (!fs.existsSync(templatePath)) {
        console.error('Error: El archivo de plantilla no existe:', templatePath);
        return;
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    // Reemplazo de placeholders en el HTML
    for (let clave in data) {
        console.log(`Reemplazando {{${clave}}} con ${data[clave]}`);
        const regex = new RegExp(`{{${clave}}}`, 'g');
        html = html.replace(regex, data[clave]);
    }

    // Usar Puppeteer para renderizar HTML y tomar una captura de pantalla
    try {
        const browser = await  puppeteer.launch({ headless: true });
        const page =  await browser.newPage();
        await page.setContent(html);

        // Capturar una imagen del contenido renderizado
        const canvas = await page.screenshot({ fullPage: true, type: 'png' });
        await browser.close();

        // Crear el PDF usando jsPDF
        const pdf = new jsPDF();
        const imgData = canvas.toString('base64');
        pdf.addImage(imgData, 'PNG', 0, 0);

        // Guardar el PDF en el servidor
        const pdfPath = '/'+'public'+'ticket.pdf';
        const pdfBuffer = pdf.output('arraybuffer');
        fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));

        console.log('PDF generado correctamente:', pdfPath);
        // Enviar el PDF al cliente
        // io.emit('pdfGenerated', { url: 'ticket.pdf' });
    } catch (error) {
        console.error('Error al generar el PDF:', error);
    }



}

