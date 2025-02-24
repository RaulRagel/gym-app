var config, exs;

const PATHS = {
    config: './src/config.json',
    defaultConfig: './src/config-default.json',
    exs: './src/ejercicios.json',
};

document.addEventListener('DOMContentLoaded', async function () {
    config = await readJSON(PATHS.defaultConfig);
    exs = await readJSON(PATHS.exs);
    console.log('Config', config);
    console.log('Exs', exs);
});

/** Leer información del archivo JSON */
async function readJSON(path) {
    const response = await fetch(path);
    if (response.ok) {
        return await response.json();
    } else {
        console.error('Error al leer la configuración');
    }
}

/** Guardar información en el archivo JSON */
async function writeJSON() {
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

// function updateJSON() {
//     writeJSON();
// }

function toggleExs(element) {
    const exs = element.nextElementSibling;
    const icon = element.querySelector('.icon');
    if (exs.classList.contains('show')) {
        exs.classList.remove('show');
        icon.innerHTML = '⬇️'; // Cambiar icono a flecha hacia abajo
    } else {
        exs.classList.add('show');
        icon.innerHTML = '⬆️'; // Cambiar icono a flecha hacia arriba
    }
}
