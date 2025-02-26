
var days, exs;
var editModal;

const PATHS = {
    config: './config.json',
    days: './days.json',
    exs: './ejercicios.json',
};

document.addEventListener('DOMContentLoaded', async function () {
    
    await updateInfo();

    editModal = document.querySelector('#edit-ex');

    renderExs();
});

async function updateInfo() {
    days = await readJSON(PATHS.days);
    exs = await readJSON(PATHS.exs);
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
  
    if(ex === 'ex') {
      setExInfo(ex);
  
      reset.onclick = () => reset(ex);
      close.onclick = closeModal;
      save.onclick = () => save(ex);
  
      editModal.classList.add('show');
    }
}

function setExInfo(ex) {
    document.getElementById('m-title').innerHTML = ex.nombre;
    document.getElementById('m-muscle').value = ex.musculo;
    document.getElementById('m-desc').value = ex.descripcion;
    document.getElementById('m-wg').value = ex.pesos;
    document.getElementById('m-ser').value = ex.series;
    document.getElementById('m-rep').value = ex.repeticiones;
}

function dayInfo() {
  
}

function closeModal() {
    editModal.classList.remove('show');
}

function reset(ex) {
    // TO DO Obtener la info que hay ahora mismo en el ejercicio
    console.log('reset', ex);

    setExInfo(ex);
}

async function save(ex) {
    // TO DO Sobreescribir la info del ejercicio y actualizar el json
    console.log('save', ex);

    var target = exs[ex.nombre];
    target.descripcion = document.getElementById('m-desc').value;
    target.musculo = document.getElementById('m-muscle').value;
    target.pesos = document.getElementById('m-wg').value;
    target.series = document.getElementById('m-ser').value;
    target.repeticiones = document.getElementById('m-rep').value;

    try {
        await writeJSON(PATHS.exs, exs);
        await updateInfo();
    } catch (error) {
        console.error('Error al guardar la configuración:', error);
    }
}