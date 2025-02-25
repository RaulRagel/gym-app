
var days, exs;
var editModal;

const PATHS = {
    config: './config.json',
    days: './days.json',
    exs: './ejercicios.json',
};

document.addEventListener('DOMContentLoaded', async function () {
    days = await readJSON(PATHS.days);
    exs = await readJSON(PATHS.exs);
    console.log('Dias', days);
    console.log('Ejercicios', exs);

    editModal = document.querySelector('#edit-ex');

    renderExs();
});

/* RENDER EJERCICIOS */

function renderExs() {
    const container = document.querySelector('.container');
    container.innerHTML = '';
    days.dias.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.innerHTML = `
            <div class="edit-btn btn">
                <div class="icon">✏️</div>
            </div>
            <div class="dropdown" onclick="toggleExs(this)">
                <div class="title">${day.nombre}</div>
                <div class="icon">⬇️</div>
            </div>
            <div class="exs">
            </div>
        `;
        dayElement.onclick = () => editDay(day);
        const exsElement = dayElement.querySelector('.exs');
        day.ejercicios.forEach(exName => {
            const ex = exs[exName];
            if (ex) {
                const exElement = document.createElement('div');
                exElement.className = 'ex';
                exElement.onclick = (event) => showDetails(event, ex);
                exElement.innerHTML = `
                    <div class="ex-muscle">${ex.musculo}</div>
                    <div class="ex-title">${ex.nombre}</div>
                    <div class="ex-wg">${ex.pesos.join(', ')}</div>
                    <div class="ex-sets">${ex.series} x ${ex.repeticiones}</div>
                `;
                exsElement.appendChild(exElement);
            }
        });
        container.appendChild(dayElement);
    });
}

function toggleExs(element) {
    const exs = element.nextElementSibling;
    const icon = element.querySelector('.icon');
    if (exs.classList.contains('show')) {
        exs.classList.remove('show');
        icon.innerHTML = '⬇️';
    } else {
        exs.classList.add('show');
        icon.innerHTML = '⬆️';
    }
}

function editDay(day) {
    console.log(day);

    // TO DO modificar el dia de days y actualizar el json
}

/* RENDER MODAL */

document.addEventListener('onclick', function () {
    console.log('hello')
});

function showDetails(event, ex) {
    event.stopPropagation();
    console.log('Detalle del ejercicio', ex);
    renderEditModal(ex);
}

function renderEditModal(ex) {
    closeModal();

    editModal.addEventListener('click', function (event) {
        if (event.target === editModal) closeModal();
    });

    document.getElementById('m-title').innerHTML = ex.nombre;
    document.getElementById('m-muscle').value = ex.musculo;
    document.getElementById('m-desc').innerHTML = ex.descripcion;
    document.getElementById('m-wg').value = ex.pesos;
    document.getElementById('m-ser').value = ex.series;
    document.getElementById('m-rep').value = ex.repeticiones;

    editModal.classList.add('show');
}

function closeModal() {
    editModal.classList.remove('show');
}

function reset() {
    // TO DO Obtener la info que hay ahora mismo en el ejercico
}

function save() {
    // TO DO Sobreescribir la info del ejercicio y actualizar el json
}