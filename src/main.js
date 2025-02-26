var days, exs;
var editModal;

const PATHS = {
    config: './config.json',
    days: './days.json',
    exs: './ejercicios.json',
};

/* INICIALIZACIÓN */

document.addEventListener('DOMContentLoaded', async function () {
    await getLocalData();

    editModal = document.querySelector('#edit-modal');

    renderInfo();
});

async function getLocalData() {
    days = getData('days');
    exs = getData('exs');
    
    if (!days) days = await readJSON(PATHS.days);
    if (!exs) exs = await readJSON(PATHS.exs);
    
    console.log('Dias', days);
    console.log('Ejercicios', exs);
}

function renderInfo() {
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
        dayElement.querySelector('.edit-btn').onclick = () => editDay(day);
        const exsElement = dayElement.querySelector('.exs');
        day.ejercicios.forEach(exName => {
            const ex = exs[exName];
            if (ex) {
                const exElement = document.createElement('div');
                exElement.className = 'ex';
                exElement.onclick = (event) => editEx(event, ex);
                exElement.innerHTML = `
                    <div class="ex-muscle">${ex.musculo}</div>
                    <div class="ex-title">${ex.nombre}</div>
                    <div class="ex-wg">${ex.pesos && ex.pesos.join(', ')}</div>
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

/* DIAS */

function editDay(day) {
    event.stopPropagation();
    console.log('Ejercicios del día', day.ejercicios);

    renderDay(day);
    renderEditModal(day, "day");
}

function renderDay(day) {
    const modalDay = document.querySelector('.modal-day');
    modalDay.innerHTML = '';
    day.ejercicios.forEach(exName => {
        const exElement = document.createElement('div');
        exElement.className = 'm-ex';
        exElement.innerHTML = `
            <div class="icon">${exName}</div>
            <div class="remove-btn btn">
                <div class="icon">🗑️</div>
            </div>
        `;
        exElement.querySelector('.remove-btn').onclick = () => removeEx(day, exName);
        modalDay.appendChild(exElement);
    });
}

function resetDay(day) {
    renderDay(day);
}

function saveDay(day) {
    console.log('save', days);
    console.log('save', day);
    const index = days.dias.findIndex(d => d.nombre === day.nombre);
    days.dias[index] = day;
}

function removeEx(day, exName) {
    console.log('remove', exName);
    const index = day.ejercicios.findIndex(ex => ex === exName);
    day.ejercicios.splice(index, 1);
    // saveData('days', days);
    renderDay(day);
}

/* EJERCICIOS */

function editEx(event, ex) {
    event.stopPropagation();
    console.log('Detalle del ejercicio', ex);
    renderEditModal(ex, "ex");
}

function resetEx(ex) {
    setExInfo(ex);
}

function saveEx(ex) {
    console.log('save ex', ex);

    var target = exs[ex.nombre];
    target.descripcion = document.getElementById('m-desc').value;
    target.musculo = document.getElementById('m-muscle').value;
    target.pesos = document.getElementById('m-wg').value;
    target.series = document.getElementById('m-ser').value;
    target.repeticiones = document.getElementById('m-rep').value;

    saveData('exs', exs);
}

/* MODALES */

function renderEditModal(target, mode) {
    closeModal();
    var saveBtn = document.getElementById('save-edit');
    var resetBtn = document.getElementById('reset-edit');
    var closeBtn = document.getElementById('close-edit');

    // cerrar modal al hacer click fuera
    // editModal.addEventListener('click', function (event) {
    //     if (event.target === editModal) closeModal();
    // });
  
    if (mode === 'ex') {
        setExInfo(target);

        saveBtn.onclick = () => saveEx(target);
        resetBtn.onclick = () => resetEx(target);

        toggleModalInfo('ex');
    } else {
        setDayInfo(target);

        saveBtn.onclick = () => saveDay(target);
        resetBtn.onclick = () => resetDay(target);

        toggleModalInfo('day');
    }
    closeBtn.onclick = closeModal;
    editModal.classList.add('show');
}

function setExInfo(ex) {
    document.getElementById('m-title').innerHTML = ex.nombre;
    document.getElementById('m-muscle').value = ex.musculo;
    document.getElementById('m-desc').value = ex.descripcion;
    document.getElementById('m-wg').value = ex.pesos;
    document.getElementById('m-ser').value = ex.series;
    document.getElementById('m-rep').value = ex.repeticiones;
}

function setDayInfo(day) {
    document.getElementById('m-title').innerHTML = day.nombre;
}

function toggleModalInfo(type) {
    var target = document.querySelector('.modal-' + type);
    const infoElements = document.querySelectorAll('.info');

    infoElements.forEach(element => {
        element.style.display = 'none';
    });

    target.style.display = 'block';
}

function closeModal() {
    editModal.classList.remove('show');
}