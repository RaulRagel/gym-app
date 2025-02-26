
var days, exs;
var editModal;

const PATHS = {
    config: './config.json',
    days: './days.json',
    exs: './ejercicios.json',
};

document.addEventListener('DOMContentLoaded', async function () {
    
    getLocalData();

    editModal = document.querySelector('#edit-ex');

    renderExs();
});

function getLocalData() {
    days = localStorage.getItem('days');
    exs = localStorage.getItem('exs');
    
    if(!days) days = await readJSON(PATHS.days);
    if(!exs) exs = await readJSON(PATHS.exs);
    
    console.log('Dias', days);
    console.log('Ejercicios', exs);
}

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
    renderEditModal(ex, "ex");
}

function renderEditModal(ex, mode) {
    closeModal();
    var save = document.getElementById('save-edit');
      reset = document.getElementById('reset-edit');
      close = document.getElementById('close-edit');

    console.log('renderEditModal', ex);

    // cerrar modal al hacer click fuera
    // editModal.addEventListener('click', function (event) {
    //     if (event.target === editModal) closeModal();
    // });
  
    if(mode === 'ex') {
      setExInfo(ex);
  
      reset.onclick = () => resetEx(ex);
      close.onclick = closeModal;
      save.onclick = () => saveEx(ex);
  
    } else {
        
    }
    editModal.classList.add('show');
}

function setExInfo(ex) {
    toggleModalInfo('info-ex');
    document.getElementById('m-title').innerHTML = ex.nombre;
    document.getElementById('m-muscle').value = ex.musculo;
    document.getElementById('m-desc').value = ex.descripcion;
    document.getElementById('m-wg').value = ex.pesos;
    document.getElementById('m-ser').value = ex.series;
    document.getElementById('m-rep').value = ex.repeticiones;
}

function dayInfo(day) {
    toggleModalInfo('info-day');
}

function toggleModalInfo(mode) {
    
}

function closeModal() {
    editModal.classList.remove('show');
}

function reset(ex) {
    // TO DO Obtener la info que hay ahora mismo en el ejercicio
    console.log('reset', ex);

    setExInfo(ex);
}

function saveEx(ex) {
    // TO DO Sobreescribir la info del ejercicio y actualizar el json
    console.log('save', ex);

    var target = exs[ex.nombre];
    target.descripcion = document.getElementById('m-desc').value;
    target.musculo = document.getElementById('m-muscle').value;
    target.pesos = document.getElementById('m-wg').value;
    target.series = document.getElementById('m-ser').value;
    target.repeticiones = document.getElementById('m-rep').value;

    saveData('exs', exs);
    renderExs();
}