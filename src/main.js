var days, exs;

var editModal;
var exListModal;
var closeBtn;

var auxDay; // Día auxiliar para mostrar cambios antes de guardar
var newExs = {}; // Ejercicios nuevos, a la espera de guardar el día. Al guardar se reinicia la variable
var returnableModal = false; // True cuando hay un modal al que podemos volver

const PATHS = {
    config: './config.json',
    days: './days.json',
    exs: './ejercicios.json',
};

/* INICIALIZACIÓN */

document.addEventListener('DOMContentLoaded', async function () {
    await getLocalData();

    editModal = document.querySelector('#edit-modal');
    closeBtn = document.getElementById('close-modal');
    closeBtn.onclick = closeModal; // Cerramos modal por defecto

    initMenu();
    renderInfo();
});

/**
 * Leemos la información de los días y ejercicios del el local storage.
 * Si no existe, leemos los archivos JSON
 */
async function getLocalData() {
    days = getData('days');
    exs = getData('exs');
    
    if (!days) days = await readJSON(PATHS.days);
    if (!exs) exs = await readJSON(PATHS.exs);
    
    console.log('Dias', days);
    console.log('Ejercicios', exs);
}

/**
 * Reenderizado de la información obteniendo los datos de los días y ejercicios
 * de la variable global
 * @param {Boolean} update 
 */
function renderInfo(update) { // TO DO: agregar un boton para agregar dias
    const container = document.querySelector('.container');
    var openedDays = [];
    if(update) { // Guardamos el index de los dias que estaban abiertos
        document.querySelectorAll('.exs').forEach(function(elem, i) {
            if(elem.classList.contains('show')) openedDays.push(i);
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
        // Ejercicios de cada día
        const exsElement = dayElement.querySelector('.exs');
        if(!day.ejercicios.length) {
            const msgElement = document.createElement('div');
            msgElement.className = 'no-ex';
            msgElement.innerHTML = 'No tienes ejercicios este día';
            exsElement.appendChild(msgElement);
        }
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
    // Agregar botón de Nuevo día
    container.appendChild(newDayElement());

    if(openedDays.length) { // Volvemos a abrir los dias que estaban abiertos
        document.querySelectorAll('.exs').forEach(function(elem, i) {
            if(openedDays.includes(i)) elem.classList.add('show');
        });
    }
}

function newDayElement() {
    const btnElement = document.createElement('button');
    btnElement.classList.add('btn', 'new-day');
    btnElement.innerHTML = 'Agregar día ✚';
    btnElement.onclick = () => {
        days.dias.push({
            nombre: 'Día ' + (days.dias.length + 1),
            descripcion: '',
            ejercicios: []
        });
        saveData('days', days);
        renderInfo(true);
    };
    return btnElement;
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
    auxDay = JSON.parse(JSON.stringify(day)); // Copia profunda del objeto
    renderDay(auxDay);
    renderEditModal('day', auxDay);
}

function renderDay(day) {
    // Lista de ejercicios del día
    const modalDay = document.querySelector('.modal-day');
    modalDay.innerHTML = '';
    day.ejercicios.forEach(exName => {
        const exElement = document.createElement('div');
        exElement.className = 'm-ex';
        if(newExs[exName]) exElement.classList.add('is-new');
        exElement.innerHTML = `<div>${exName}</div>`;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn btn';
        removeBtn.innerHTML = '<div class="icon">🗑️</div>';
        removeBtn.onclick = () => removeEx(day, exName);
        exElement.appendChild(removeBtn);

        modalDay.appendChild(exElement);
    });
    // Botón de lista de ejercicios (editable por defecto)
    const newExElement = document.createElement('div');
    newExElement.className = 'm-ex new-ex';
    newExElement.innerHTML = `<div class='add-btn'>Lista de ejercicios</div>`;
    newExElement.querySelector('.add-btn').onclick = () => renderEditModal('list', day);
    modalDay.appendChild(newExElement);
}

function resetDay() {
    var recoverDay = getDay(auxDay.nombre);
    // Reseteamos auxDay porque hemos reestablecido la info
    auxDay = {};
    auxDay = JSON.parse(JSON.stringify(recoverDay)); // Copia profunda del objeto
    // Usamos el nombre del dia auxiliar para buscar el dia original
    renderDay(auxDay);
}

function saveDay() {
    const dayIndex = getDayIndex(auxDay.nombre);
    days.dias[dayIndex] = JSON.parse(JSON.stringify(auxDay)); // Copia profunda del objeto
    auxDay = {};
    if(Object.keys(newExs).length) { // Si se han creado nuevos ejercicios, los agregamos
        exs = Object.assign(exs, newExs);
        newExs = {};
        saveData('exs', exs);
    }
    saveData('days', days);
    renderInfo(true);
    closeModal();
}

function deleteDay() {
    const dayIndex = getDayIndex(auxDay.nombre);
    auxDay = {};
    days.dias.splice(dayIndex, 1);
    saveData('days', days);
    renderInfo(true);
    closeModal();
}

function saveExList() {
    // Obtenemos las checkbox seleccionadas y buscamos su ejercicio asociado para agregarlo al día
    const checkedBoxes = document.querySelectorAll('.ex input:checked');
    const exsToAdd = [];
    checkedBoxes.forEach(checkbox => {
        exsToAdd.push(checkbox.parentElement.innerText);
    });
    // Actualizamos el dia auxiliar ya que aún no hemos confirmado el guardado del día
    auxDay.ejercicios = exsToAdd;
    // Agregamos posibles nuevos ejercicios
    if(Object.keys(newExs).length) {
        auxDay.ejercicios = auxDay.ejercicios.concat(Object.keys(newExs));
    }
    backToLastModal(auxDay);
}

function backToLastModal(target) {
    if(!returnableModal) return;
    returnableModal = false;
    // Volvemos al día auxiliar con los ejercicios seleccionados
    editDay(target);
}

function newEx(day) {
    renderEditModal('new', day);
}

/**
 * Borrado del ejercicio.
 * Si se especifica el día, se borra del día provisionalmente hasta que confirmemos la información auxiliar.
 * Si no se especifica el día, se borrará de la lista global.
 * @param {*} day 
 * @param {*} exName 
 */
function removeEx(day, exName) {
    if(day) { // Borramos de un día concreto
        const exIndex = day.ejercicios.findIndex(ex => ex === exName);
        auxDay.ejercicios.splice(exIndex, 1); // Actualizamos dia auxiliar
        if(newExs[exName]) delete newExs[exName]; // Si se ha borrado un ejercicio nuevo, lo borramos
        renderDay(auxDay);
    } else { // Borramos de la lista general y de cada día
        bulkDelete(exName);
        delete exs[exName];
        showExsList();
        saveData('exs', exs);
        renderInfo(true);
    }
}

/**
 * Borrado de un ejercicio en todos los dias donde se encuentre
 * @param {String} exName 
 */
function bulkDelete(exName) {
    days.dias.forEach(day => {
        const exIndex = day.ejercicios.findIndex(ex => ex === exName);
        if(exIndex !== -1) day.ejercicios.splice(exIndex, 1);
    });
    saveData('days', days);
}

/**
 * Lista de ejercicios generales.
 * Se puede pasar por el objeto de configuración si la lista es de sólo lectura, o si se pueden
 * agregar o borrar ejercicios (a un día concreto si pasamos el parámetro day o a la lista global
 * de ejercicios).
 * @param {Object} day 
 * @param {Object} config 
 */
function setExList(day, config) {
    var config = config || {},
        disableBtns = config.disableBtns,
        exsByMuscle = orderByMuscle();
    const modalList = document.querySelector('.modal-list');
    modalList.innerHTML = '';

    // Si no hay botones, agregamos la clase para que ocupe todo el modal
    if(disableBtns) modalList.classList.add('extended');
    else modalList.classList.remove('extended');

    setTitle('Lista de ejercicios');

    Object.keys(exsByMuscle).forEach(muscle => {
        const muscleElement = document.createElement('div');
        muscleElement.className = 'm-set';
        muscleElement.innerHTML = `<div class='m-muscle'>${muscle}</div>`;
        exsByMuscle[muscle].forEach(exName => {
            const exElement = document.createElement('div');
            exElement.className = 'ex';
            exElement.innerHTML = `<div>${exName}</div>`;
            // Lógica para agregar ejercicios al día
            if(!config.readonly && day) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.onclick = () => {
                    checkbox.checked = !checkbox.checked;
                };
                exElement.appendChild(checkbox);
                if(day.ejercicios.includes(exName)) checkbox.checked = true;
                exElement.onclick = checkbox.onclick;
            }
            // Lógica para borrar ejercicios de la lista global
            if(!config.readonly && !day && config.removable) {
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn btn';
                removeBtn.innerHTML = '<div class="icon">🗑️</div>';
                removeBtn.onclick = () => removeEx(null, exName);
                exElement.appendChild(removeBtn);
            }
            muscleElement.appendChild(exElement);
        });
        modalList.appendChild(muscleElement);
    });
}

function orderByMuscle() {
    var exsByMuscle = {};
    Object.keys(exs).forEach(exName => {
        const ex = exs[exName];
        if(!ex.musculo) ex.musculo = 'Otros';
        if (!exsByMuscle[ex.musculo]) exsByMuscle[ex.musculo] = [];
        exsByMuscle[ex.musculo].push(exName);
    });
    return exsByMuscle;
}

/* EJERCICIOS */

function editEx(event, ex) {
    event.stopPropagation();
    renderEditModal('ex', ex);
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
    closeModal();
}

function addEx() {
    var title = capitalize(document.getElementById('m-title').value);
    if(title) {
        newExs[title] = {
            nombre: title,
            descripcion: document.getElementById('m-desc').value.trim(),
            musculo: document.getElementById('m-muscle').value.trim(),
            pesos: stringToNumberArray(document.getElementById('m-wg').value),
            series: document.getElementById('m-ser').value.trim(),
            repeticiones: document.getElementById('m-rep').value.trim(),
        };
        if(!auxDay.ejercicios.includes(title)) auxDay.ejercicios.push(title);
    }
    backToLastModal(auxDay);
}

function stringToNumberArray(str) {
    return str.split(',')
        .map(num => parseFloat(num.trim()))
        .filter(num => !isNaN(num));
}

/* MODALES */

/**
 * Función para renderizar cualquier modal. Por defecto, se renderiza la lista de ejercicios sin botones
 * @param {String} type Según el tipo de modal, se renderiza un modal distinto
 * @param {Object} target Si necesitamos editar, este es el objeto editable
 * @param {Object} config Si necesitamos una configuración adicional
 */
function renderEditModal(type, target, config) {
    closeModal();
    var config = config || {};

    // Nueva funcionalidad futura
    // editModal.addEventListener('click', function (event) {
    //     if (event.target === editModal) closeModal();
    // });

    if (type === 'ex') {
        setExInfo(target);
        toggleFromGroup(type);
        setButtons(target, type, ['save', 'reset']);
    } else if (type === 'day') {
        setDayInfo(target);
        toggleFromGroup(type);
        setButtons(target, type, ['save', 'reset', 'new', 'delete']); // TO DO: Boton para borrar dia
        returnableModal = true;
    } else if(type === 'new') {
        setNewExInfo();
        toggleFromGroup('ex');
        setButtons(target, type, ['save', 'reset']);
    } else { // 'list'
        setExList(target, config);
        toggleFromGroup(type);
        setButtons(target, type, ['save'], config);
    }
    editModal.classList.add('show');
}

/**
 * Creamos los botones de acuerdo al modo y los seteamos con sus respectivas funciones
 * @param {Object} target Objeto a editar
 * @param {String} type Tipo de modal
 * @param {Array} buttons Botones a mostrar
 * @param {Object} config configuración adicional
 */
function setButtons(target, type, buttons, config) {
    var saveBtn = document.getElementById('save');
    var resetBtn = document.getElementById('reset');
    var newBtn = document.getElementById('new');
    var deleteBtn = document.getElementById('delete');
    var config = config || {};

    closeBtn.onclick = closeModal; // Cerramos modal por defecto
    // hideButtons(); // Ocultamos botones si el modal anterior tenia botones y este no

    if(config.disableBtns) return;

    if(type === 'ex') {
        saveBtn.onclick = () => saveEx(target);
        resetBtn.onclick = () => resetEx(target);
    } else if(type === 'day') {
        saveBtn.onclick = () => saveDay();
        resetBtn.onclick = () => resetDay(target);
        deleteBtn.onclick = () => deleteDay(target);
        newBtn.onclick = () => newEx(target);
    } else if(type === 'new') {
        saveBtn.onclick = () => addEx();
        resetBtn.onclick = () => setNewExInfo();
        closeBtn.onclick = () => backToLastModal(target);
    } else { // 'list'
        saveBtn.onclick = () => saveExList();
        closeBtn.onclick = () => backToLastModal(target);
    }
    showButtons(buttons);
}

/**
 * Setear la info del ejercicio en el modal
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

/**
 * Setear la info del dia en el modal. Como se crea en tiempo de ejecución, solo falta el título
 */
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

function toggleFromGroup(type) {
    var target = document.querySelector('.modal-' + type);
    const groupElements = document.querySelectorAll('.group');

    groupElements.forEach(element => {
        element.classList.remove('show');
    });

    target.classList.add('show');
}

function closeModal() {
    editModal.classList.remove('show');
    hideButtons(); // Para casos como tener botones e ir a un modal que no tiene botones ni los cambia, como la lista
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

/**
 * Mostrar titulo del modal
 * @param {String} title titulo del modal
 * @param {Boolean} editable editable o no
 * @param {String} placeholder placeholder del input
 */
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

function getDayIndex(name) {
    return days.dias.findIndex(d => d.nombre === name);
}

function getDay(name) {
    return days.dias.find(d => d.nombre === name);
}

/**
 * Capitaliza y borra los espacio
 * @param {String} str
 * @return {String}
 */
function capitalize(str) {
    str = str.trim();
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}