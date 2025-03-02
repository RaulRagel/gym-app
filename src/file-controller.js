/** Leer información del archivo JSON */
async function readJSON(path) {
    const response = await fetch(path);
    if (response.ok) {
        return await response.json();
    } else {
        console.error('Error al leer la configuración');
    }
}

/**
 * Guardamos datos en local storage
 * @param {String} name 
 * @param {Object} data 
 */
function saveData(name, data) {
  localStorage.setItem(name, JSON.stringify(data));
}

/**
 * Leer datos del local storage
 * @param {String} name 
 */
function getData(data) {
  return JSON.parse(localStorage.getItem(data));
}

// ! probar si lo necesitamos
// function getData(data) {
//     const parsedData = JSON.parse(localStorage.getItem(data));
//     return convertEmptyStringsToArrays(parsedData);
// }

// function convertEmptyStringsToArrays(obj) {
//     if (typeof obj !== 'object' || obj === null) {
//         return obj;
//     }

//     for (const key in obj) {
//         if (obj.hasOwnProperty(key)) {
//             if (obj[key] === '') {
//                 obj[key] = [];
//             } else if (typeof obj[key] === 'object') {
//                 obj[key] = convertEmptyStringsToArrays(obj[key]);
//             }
//         }
//     }

//     return obj;
// }