const puppeteer = require('puppeteer');
const fs = require('fs'); // Necesitas importar fs para escribir archivos

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(
        'https://www.comprasestatales.gub.uy/consultas/buscar/tipo-pub/VIG/inciso/3/ue/4/tipo-doc/C/tipo-fecha/ROF/rango-fecha/2025-04-01_2025-04-30/filtro-cat/CAT/orden/ORD_ROF/tipo-orden/ASC',
        { waitUntil: 'networkidle2' } // Espera hasta que la red esté inactiva
    );

    // Esperar a que aparezcan las compras en la página
    await page.waitForSelector('.row.item', { timeout: 10000 });

    // Scroll hasta el final de la página para cargar todas las compras
    await autoScroll(page);

    // Esperar un poco más para asegurarnos de que todo cargó
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Obtener el contenido HTML de la página
    const content = await page.content();
    
    // Guardar el contenido HTML en un archivo
    fs.writeFileSync('data.html', content);

    await browser.close();
})();

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 200; // Aumenta la distancia para hacer scroll más rápido
            const delay = 500; // Esperar un poco después de cada scroll
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    setTimeout(resolve, delay); // Esperar un poco antes de resolver
                }
            }, delay);
        });
    });
}
