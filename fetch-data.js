const puppeteer = require('puppeteer');
const fs = require('fs'); // Necesitas importar fs para escribir archivos

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://example.com');

    // Scroll hasta el final de la página para cargar todas las compras
    await autoScroll(page);
    
    // Obtener el contenido HTML de la página
    const content = await page.content();
    
    // Guardar el contenido HTML en un archivo
    fs.writeFileSync('data.html', content);

    await browser.close();
})();

async function autoScroll(page){
   await page.evaluate(async () => {
       await new Promise((resolve, reject) => {
           var totalHeight = 0;
           var distance = 100;
           var timer = setInterval(() => {
               var scrollHeight = document.body.scrollHeight;
               window.scrollBy(0, distance);
               totalHeight += distance;

               if(totalHeight >= scrollHeight - window.innerHeight){
                   clearInterval(timer);
                   resolve();
               }
           }, 100);
       });
   });
}
