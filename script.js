async function buscarCompras() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();

        // Encuentra el div con id 'container'
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.html, 'text/html');
        const container = doc.getElementById('container');
        if (container) {
            // Busca el primer div con clase 'row item' dentro del container
            const rowItem = container.querySelector('.row.item');
            if (rowItem) {
                // Busca el div con clase 'col-md-5' dentro del rowItem
                const colMd5 = rowItem.querySelector('.col-md-5');
                if (colMd5) {
                    // Busca el primer enlace dentro del col-md-5
                    const enlace = colMd5.querySelector('a');
                    if (enlace) {
                        // Obtiene el texto del enlace y lo muestra en un prompt
                        const texto = enlace.textContent || enlace.innerText;
                        prompt('Texto encontrado:', texto);
                    } else {
                        alert('No se encontró un enlace dentro del div con clase col-md-5.');
                    }
                } else {
                    alert('No se encontró un div con clase col-md-5 dentro del div con clase row item.');
                }
            } else {
                alert('No se encontró un div con clase row item dentro del container.');
            }
        } else {
            alert('No se encontró el div con id container.');
        }
    } catch (error) {
        console.error('Error fetching the data:', error);
        alert('Error fetching the data.');
    }
