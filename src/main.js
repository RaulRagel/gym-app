var days, exs;

var editModal;
var menu;

var originalDay;
var auxDay;

const PATHS = {
    config: './config.json',
    days: './days.json',
    exs: './ejercicios.json',
};

/* INICIALIZACIÓN */

document.addEventListener('DOMContentLoaded', async function () {
    await getLocalData();

    editModal = document.querySelector('#edit-modal');
    menu = document.querySelector('#menu');
    menu.onclick = () => displayMenu();

    renderInfo();
});

function displayMenu() {
    const header = document.querySelector('.header');
    if (header.classList.contains('show')) {
        header.classList.remove('show');
    } else {
        header.classList.add('show');
    }
}

async function getLocalData() {
    days = getData('days');
    exs = getData('exs');
    
    if (!days) days = await readJSON(PATHS.days);
    if (!exs) exs = await readJSON(PATHS.exs);
    
    console.log('Dias', days);
    console.log('Ejercicios', exs);
}

function renderInfo(update) {
    const container = document.querySelector('.container');
    var index = [];
    if(update) { // Guardamos el index de los dias que estaban abiertos
        document.querySelectorAll('.exs').forEach(function(elem, i) {
            if(elem.classList.contains('show')) index.push(i);
        });
    }
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
    if(index.length) { // Volvemos a abrir los dias que estaban abiertos
        document.querySelectorAll('.exs').forEach(function(elem, i) {
            if(index.includes(i)) elem.classList.add('show');
        });
    }
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

    originalDay = JSON.parse(JSON.stringify(day));
    auxDay = JSON.parse(JSON.stringify(day));
    renderDay(auxDay);
    renderEditModal(auxDay, 'day');
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

function resetDay() {
    auxDay = JSON.parse(JSON.stringify(originalDay));
    renderDay(auxDay);
}

function saveDay(day) {
    const index = days.dias.findIndex(d => d.nombre === day.nombre);
    days.dias[index] = day;
    originalDay = JSON.parse(JSON.stringify(day));
    auxDay = JSON.parse(JSON.stringify(day));
    renderInfo(true);
}

function newEx(day) {
    renderEditModal(day, 'new');
}

function removeEx(day, exName) {
    const exIndex = day.ejercicios.findIndex(ex => ex === exName);
    const dayIndex = days.dias.findIndex(d => d.nombre === day.nombre);
    day.ejercicios.splice(exIndex, 1); // actualizamos dia
    days.dias[dayIndex].ejercicios = day.ejercicios; // actualizamos dias
    saveData('days', days);
    renderDay(day);
}

/* EJERCICIOS */

function editEx(event, ex) {
    event.stopPropagation();
    renderEditModal(ex, 'ex');
}

function resetEx(ex) {
    setExInfo(ex);
}

/**
 * 
 * @param {Object} ex Donde vamos a guardar la info
 */
function saveEx(ex) {
    var target = exs[ex.nombre];
    target.descripcion = document.getElementById('m-desc').value.trim();
    target.musculo = document.getElementById('m-muscle').value.trim();
    target.pesos = stringToNumberArray(document.getElementById('m-wg').value);
    target.series = document.getElementById('m-ser').value.trim();
    target.repeticiones = document.getElementById('m-rep').value.trim();

    saveData('exs', exs);
    setExInfo(ex);
    renderInfo(true);
}

function addEx(day) {
    var title = document.getElementById('m-title').value,
        index = days.dias.findIndex(d => d.nombre === day.nombre);
    if(!exs[title]) {
        exs[title] = {
            nombre: title,
            descripcion: document.getElementById('m-desc').value.trim(),
            musculo: document.getElementById('m-muscle').value.trim(),
            pesos: stringToNumberArray(document.getElementById('m-wg').value),
            series: document.getElementById('m-ser').value.trim(),
            repeticiones: document.getElementById('m-rep').value.trim(),
        };
    }
    if(!days.dias[index].ejercicios.includes(title)) {
        days.dias[index].ejercicios.push(title);
    }
    saveData('exs', exs);
    saveData('days', days);
    renderInfo(true);
}

function stringToNumberArray(str) {
    return str.split(',')
        .map(num => parseFloat(num.trim()))
        .filter(num => !isNaN(num));
}

/* MODALES */

function renderEditModal(target, mode) {
    closeModal();
    var closeBtn = document.getElementById('close-modal');

    // Nueva funcionalidad futura
    // editModal.addEventListener('click', function (event) {
    //     if (event.target === editModal) closeModal();
    // });

    if (mode === 'ex') {
        setExInfo(target);
        toggleModalInfo('ex');
        setButtons(target, ['save', 'reset'], 'ex');
    } else if (mode === 'day') {
        setDayInfo(target);
        toggleModalInfo('day');
        setButtons(target, ['save', 'reset', 'new'], 'day');
    } else { // 'new'
        setNewExInfo();
        toggleModalInfo('ex');
        setButtons(target, ['save', 'reset']);
    }
    closeBtn.onclick = closeModal;
    editModal.classList.add('show');
}

/**
 * Creamos los botones de acuerdo al modo y los seteamos con sus respectivas funciones
 * @param {Object} target Objeto a editar
 * @param {Array} buttons Botones a mostrar
 * @param {String} mode Modo de edición
 */
function setButtons(target, buttons, mode) {
    var saveBtn = document.getElementById('save');
    var resetBtn = document.getElementById('reset');
    var newBtn = document.getElementById('new');

    hideButtons();
    if(mode === 'ex') {
        saveBtn.onclick = () => saveEx(target);
        resetBtn.onclick = () => resetEx(target);
    } else if(mode === 'day') {
        saveBtn.onclick = () => saveDay(target);
        resetBtn.onclick = () => resetDay(target);
        newBtn.onclick = () => newEx(target);
    } else {
        saveBtn.onclick = () => addEx(target);
        resetBtn.onclick = () => resetEx({});
    }
    showButtons(buttons);
}

/**
 * Setear la info del ejercicio en el mnodal
 * @param {Object} ex 
 */
function setExInfo(ex) {
    setTitle(ex.nombre || '', false);

    document.getElementById('m-muscle').value = ex.musculo || '';
    document.getElementById('m-desc').value = ex.descripcion || '';
    document.getElementById('m-wg').value = ex.pesos || '';
    document.getElementById('m-ser').value = ex.series || '';
    document.getElementById('m-rep').value = ex.repeticiones || '';
}

function setDayInfo(day) {
    setTitle(day.nombre, false);
}

/**
 * Setear la info del nuevo ejercicio en el modal
 */
function setNewExInfo() {
    setTitle('', true, 'Nuevo Ejercicio ✏️');

    document.getElementById('m-muscle').value = '';
    document.getElementById('m-desc').value = '';
    document.getElementById('m-wg').value = '';
    document.getElementById('m-ser').value = '';
    document.getElementById('m-rep').value = '';
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
    // hideButtons();
    // resetValues();
}

/**
 *  Ocultamos todos los botones. Util en casos en los que tenemos un modal
 * con 3 botones y luego uno con 2, como es el caso de ir a agregar un nuevo ejercicio
 */
function hideButtons() {
    var buttons = document.querySelectorAll('.btn-container .btn');
    buttons.forEach(button => {
        button.classList.add('hide');
    });
}

/**
 * Resetear valores que puedan ser mostrados accidentalmente en el siguiente modal
 */
function resetValues() {
    
}

function showButtons(buttonsToShow) {
    var buttons = document.querySelectorAll('.btn-container .btn');
    buttons.forEach(button => {
        if(buttonsToShow.includes(button.id)) button.classList.remove('hide');
    });
}

function setTitle(title, editable, placeholder) {
    var readonlyElem = document.querySelector('.readonly'),
        titleElem = document.getElementById('m-title');
    
    if(editable) {
        readonlyElem.classList.add('editable');
        titleElem.removeAttribute('readonly');
        titleElem.placeholder = placeholder;
    } else {
        readonlyElem.classList.remove('editable');
        titleElem.setAttribute('readonly', true);
    }
    titleElem.value = title;
}