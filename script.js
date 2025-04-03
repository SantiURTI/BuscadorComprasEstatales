async function buscarCompras() {
    try {
        // Busca los datos de la pagina y los localiza en data.html
        const response = await fetch('data.html');
        const htmlText = await response.text();

        // Encuentra el div con id 'container'
        const doc = new DOMParser().parseFromString(htmlText, 'text/html');
        let comprasData = [];
        const compras = [...doc.querySelectorAll('.row.item')].filter(item => !item.id.startsWith('ias_noneleft_'));
        
        console.log(`Found ${compras.length} items`);
        
        // Veo si se encontraron compras
        if (compras.length === 0) {
            console.log("No se encontraron compras publicadas.");
            isFetchingData = false;
            return;
        }
        
        compras.forEach(compra => {
            // Busco el titulo de la compra, lo aislo y lo abrevio
            let titulo = compra.querySelector('.col-md-5 h3').innerText;
            titulo = titulo.replace(compra.querySelector('.col-md-5 span').innerText, "");
            titulo = titulo.replace("Licitación Abreviada", "L.A. N°").replace("Compra Directa", "C.D. N°");
            
            // Busco la descripcion, fecha y hora de apertura
            let descripcion = compra.querySelector('.desc-sniped .buy-object').innerText;
            let fechaHora = compra.querySelector('.desc-sniped strong').innerText ;

            // Busco la fecha de publicacion y de modificacion, si es que se modifico
            let fechaPublicacion = "No disponible";
            let fechaUltimaModificacion = "Sin Modificaciones";
            const textMutedElements = compra.querySelectorAll('.v-middle > span.text-muted');
            console.log("Texto detectado TextMuted:", textMutedElements[0].innerText);
            
            if (textMutedElements.length > 0) {
                const matchPublicado = textMutedElements[0].innerText.match(/Publicado: (.*)/);
                fechaPublicacion = matchPublicado ? matchPublicado[1] : "No disponible";
                const matchModificado = textMutedElements[0].innerText.match(/Última Modificación: (.*)/);
                fechaUltimaModificacion = matchModificado ? matchModificado[1] : "Sin Modificaciones";
            }

            comprasData.push([titulo, descripcion, fechaHora, fechaPublicacion, fechaUltimaModificacion]);
        });
        
        console.log('Data extracted:', comprasData);
        
        //Crea excel con los datos, crea un libro nuevo excel (archivo vacio) y agrega la hoja, finalmente descarga el excel
        const ws = XLSX.utils.aoa_to_sheet([["Título", "Descripción", "Fecha y Hora", "Fecha de Publicación", "Fecha de Última Modificación"], ...comprasData]);
        
        // Estilos
        const headerStyle = { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" } };
        const cellStyle = { alignment: { horizontal: "center", vertical: "center" } };
        const cellBorder = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
        const dateFormat = { alignment: { horizontal: "center", vertical: "center" }, z: "yyyy-mm-dd hh:mm" };
        
        // Obtener el rango de datos
        const range = XLSX.utils.decode_range(ws["!ref"]);
        
        // Aplicar estilos a los encabezados
        for (let C = range.s.c; C <= range.e.c; C++) { 
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C }); // Celda de encabezado
            if (ws[cellAddress]) {
                ws[cellAddress].s = headerStyle;
            }
        }

        
        // Autoajustar el ancho de las columnas
        ws["!cols"] = [
            { wch: 16 }, // Título
            { wch: 90 }, // Descripción
            { wch: 18 }, // Fecha y Hora
            { wch: 18 }, // Fecha de Publicación
            { wch: 18 }  // Fecha de Última Modificación
        ];
        
        // Aplicar formato a las fechas y bordes
        for (let R = 1; R <= range.e.r; R++) { // Saltamos la fila de encabezado
            for (let C = 0; C <= range.e.c; C++) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (ws[cellAddress]) {
                    if (C === 2 || C === 3 || C === 4) { 
                        ws[cellAddress].s = { ...dateFormat, border: cellBorder }; // Formato de fecha con bordes
                    } else {
                        ws[cellAddress].s = { ...cellStyle, border: cellBorder }; // Centrado para otras celdas
                    }
                }
            }
        }


        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Compras");
        
        XLSX.writeFile(wb, "Compras.xlsx");
        console.log("Se han extraído todas las compras.");
        
    } catch (error) {
        console.error('Error fetching the data:', error);
        alert('Error fetching the data.');
    }
}
