import fs from 'fs';
import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';

export async function printFile(data) {
    try {
        const result = await fillInfo(data);
        return await printPdf(data[0].printer);
    } catch (error) {
        console.error('Error Any', error);
        return { success: false, decs: error.decs || 'Unknown error', nameFunc: error.nameFunc || 'Unknown function' };
    }
}

async function generateQRCode(data) {
    try {
        return await QRCode.toDataURL(data);
    } catch (err) {
        console.error('Error al generar el código QR:', err);
        return null;
    }
}

async function fillInfo(dataArray) {
    const directory = directoryFiles();
    let browser;
    // copyLatestPdf(dataArray , directory);

    try {
        browser         = await puppeteer.launch({ headless: true });
        const page      = await browser.newPage();
        const mergedPdf = await PDFDocument.create();

        for (let data of dataArray) {
            const html    = await generateHtmlTemplate(directory, data);
            const pdfPath = await generatePdf(page, html, dataArray, directory);
            await mergePdf(mergedPdf, pdfPath);

            // fs.renameSync(pdfPath, directory + "/backup_public/");
            // Eliminar el PDF temporal después de agregarlo al merger
            fs.unlinkSync(pdfPath); 
        }
        // console.log(data.img)
        if(dataArray[0].hasOwnProperty('img') && dataArray[0].img.length > 0)
            for(let i=0; i<dataArray[0].img.length; i++){
                await embedWatermark(mergedPdf, directory , dataArray[0].img[i].nameImg , dataArray[0].img[i].scale , dataArray[0].img[i].opacity , dataArray[0].img[i].posX , dataArray[0].img[i].posY , dataArray[0].img[i].ext);
            }
        const finalPdfPath = getFinalPdfPath(dataArray, directory);
        await savePdf(mergedPdf, finalPdfPath);

        return { success: true, decs: 'PDF generado correctamente', nameFunc: 'fillInfo' };
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        return { success: false, decs: error.message || 'Error al generar el PDF', nameFunc: 'fillInfo' };
    } finally {
        if (browser) await browser.close();
    }
}

async function generateHtmlTemplate(directory, data) {
    const templatePath = path.join(directory, 'etiquetasSkyYarn', data.fileName, `${data.fileName}.html`);

    if (!fs.existsSync(templatePath)) {
        throw new Error(`El archivo de plantilla no existe: ${templatePath}`);
    }

    let html = fs.readFileSync(templatePath, 'utf8');
    const cssPath = path.join(directory, 'etiquetasSkyYarn', data.fileName, `${data.fileName}.css`);
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    html = html.replace('<head>', `<style>${cssContent}</style><link rel="stylesheet" href="https://unpkg.com/primeflex@latest/primeflex.css" /></head>`);

    for (let clave in data) {
        const regex = new RegExp(`{{${clave}}}`, 'g');
        html = html.replace(regex, data[clave]);
    }

    if (data.qrcode && data.qrcode.length > 0) {
        for (let qr of data.qrcode) {
            const qrCodeDataURL = qr.qrcodeDetail ? await generateQRCode(qr.qrcodeDetail) : '';
            html = html.replace(`{{${qr.idQrCode}}}`, `<img src="${qrCodeDataURL}" width="${qr.width}" alt="${qr.qrcodeDetail}" />`);
        }
    }

    return html;
}

async function generatePdf(page, html, dataArray, directory) {
    await page.setContent(html);
    await page.emulateMediaType('screen');

    const pdfPath = path.join(directory, 'public', dataArray[0].printer === 'ticket' ? 'ticket.pdf' : 'sheet.pdf');
    const pdfOptions = {
        width: dataArray[0].orientation === 'l' ? '297mm' : '210mm',
        height: dataArray[0].orientation === 'l' ? '210mm' : '297mm',
        printBackground: true,
        margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }
    };

    await page.pdf({ path: pdfPath, ...pdfOptions });
    return pdfPath;
}

async function mergePdf(mergedPdf, pdfPath) {
    const tempPdfBytes = fs.readFileSync(pdfPath);
    const tempPdf = await PDFDocument.load(tempPdfBytes);
    const copiedPages = await mergedPdf.copyPages(tempPdf, tempPdf.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
}

async function embedWatermark(mergedPdf, directory ,nameImg , scale , opacity , posX , posY , ext) {
    const pages              = mergedPdf.getPages();
    const watermarkImagePath = path.join(directory, 'public/img/' + nameImg + ext);
    const imageBytes         = fs.readFileSync(watermarkImagePath);
    let image;
    ext == ".png" ? image = await mergedPdf.embedPng(imageBytes) : image = await mergedPdf.embedJpeg(imageBytes);
    const imageDims          = image.scale(scale);

    pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawImage(image, {
            x: width / posX - imageDims.width / posX,
            y: height / posY - imageDims.height / posY,
            width: imageDims.width,
            height: imageDims.height,
            opacity: opacity
        });
    });
}

function getFinalPdfPath(dataArray, directory) {
    return path.join(directory, 'public', dataArray[0].printer === 'ticket' ? 'ticket.pdf' : 'sheet.pdf');
}

async function savePdf(mergedPdf, finalPdfPath) {
    const pdfBytes = await mergedPdf.save();
    fs.writeFileSync(finalPdfPath, pdfBytes);
}

async function printPdf(typePrint) {

    const directory = directoryFiles();

    return new Promise((resolve, reject) => {
        exec(`sh ${path.join(directory, 'archivos_SH', `print${typePrint}.sh`)}`, (err, stdout, stderr) => {
            if (err) {
                return reject({ success: false, decs: err.message || 'Error de ejecución', nameFunc: 'printPdf' });
            }
            if (stderr) {
                return reject({ success: false, decs: stderr, nameFunc: 'printPdf' });
            }
            resolve({ success: true, decs: 'Impresión exitosa', nameFunc: 'printPdf' });
        });
    });
}

function directoryFiles() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, '..');
}

function copyLatestPdf(dataArray,directory){
    const pdfPathBackup = path.join(directory, 'backup_public', dataArray[0].printer === 'ticket' ? 'ticket.pdf' : 'sheet.pdf');
    const pdfPath = path.join(directory, 'public', dataArray[0].printer === 'ticket' ? 'ticket.pdf' : 'sheet.pdf');
    if (fs.existsSync(pdfPath)) {
        console.log('El archivo existe, procediendo a copiarlo.');
        // Copiar el archivo a la nueva ubicación
        fs.copyFileSync(pdfPath, pdfPathBackup);
        console.log('Archivo copiado con éxito a la nueva ubicación.');
    }

}
