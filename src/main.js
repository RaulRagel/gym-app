
var config = {
    dias: 4
};

// Ruta del archivo JSON
const configPath = './config.json';
const defaultConfigPath = './config-default.json';

/** Guardar información en el archivo JSON */
async function writeConfig() {
    const response = await fetch(configPath, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config, null, 4)
    });
    if (response.ok) {
        console.log('Configuración guardada en config.json');
    } else {
        console.error('Error al guardar la configuración');
    }
}

/** Leer información del archivo JSON */
async function readConfig() {
    const response = await fetch(configPath);
    if (response.ok) {
        config = await response.json();
    } else {
        console.error('Error al leer la configuración');
    }
}

function updateConfig() {
    config.dias = 5;
    writeConfig();
}

// Función para desplegar el contenedor .exs
function toggleExs(element) {
    const exs = element.nextElementSibling;
    if (exs.style.display === 'none' || exs.style.display === '') {
        exs.style.display = 'block';
        element.innerHTML = '&#9650;'; // Cambiar icono a flecha hacia arriba
    } else {
        exs.style.display = 'none';
        element.innerHTML = '&#9660;'; // Cambiar icono a flecha hacia abajo
    }
}
