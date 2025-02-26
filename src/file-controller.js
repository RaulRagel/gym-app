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