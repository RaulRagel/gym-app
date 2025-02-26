/** Leer información del archivo JSON */
async function readJSON(path) {
    const response = await fetch(path);
    if (response.ok) {
        return await response.json();
    } else {
        console.error('Error al leer la configuración');
    }
}

function saveData(type, data) {
  localStorage.setItem(type, JSON.stringify(data));
}

function getData(data) {
  return JSON.parse(localStorage.getItem(data));
}