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
async function writeJSON(path, data) {
    const response = await fetch(path, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data, null, 4)
    });
    if (response.ok) {
        console.log('Configuración guardada en', path);
    } else {
        console.error('Error al guardar la configuración');
    }
}