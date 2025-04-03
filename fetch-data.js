const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

app.post('/fetch-data', async (req, res) => {
    const { fecha1, fecha2 } = req.body;

    if (!fecha1 || !fecha2) {
        return res.status(400).json({ error: "Se requieren ambas fechas" });
    }

    const url = `https://www.comprasestatales.gub.uy/consultas/buscar/tipo-pub/VIG/inciso/3/ue/4/tipo-doc/C/tipo-fecha/ROF/rango-fecha/${fecha1}_${fecha2}/filtro-cat/CAT/orden/ORD_ROF/tipo-orden/ASC`;

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.row.item', { timeout: 10000 });
    await autoScroll(page);
    await new Promise(resolve => setTimeout(resolve, 3000));

    const content = await page.content();
    fs.writeFileSync('data.html', content);

    await browser.close();
    res.json({ mensaje: "Datos extraídos correctamente", url });
});

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
