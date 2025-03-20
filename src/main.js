var days, exs;

var editModal;
var exListModal;
var closeBtn;
var addVariationBtn;

var auxDay = {}; // Día auxiliar para mostrar cambios antes de guardar
var newExs = {}; // Ejercicios nuevos, a la espera de guardar el día. Al guardar se reinicia la variable
var lastModal = ''; // True cuando hay un modal al que podemos volver

const PATHS = {
    config: './config.json',
    days: './days.json',
    exs: './exercises.json',
    vars: './variations.json'
};

var ELEMENTS = null;
var MODALS = null;

/* INICIALIZACIÓN */

document.addEventListener('DOMContentLoaded', async function () {
    await getLocalData();

    editModal = document.querySelector('#edit-modal');
    closeBtn = document.getElementById('close-modal');
    closeBtn.onclick = closeModal; // Cerramos modal por defecto

    addVariationBtn = document.querySelector('.vars-container .new-var');

    initMenu();
    initElements();
    initToast();
    renderInfo();
});

function initElements() {
    ELEMENTS = {
        title: document.getElementById('m-title'),
        desc: document.getElementById('m-desc'),
        musc: document.getElementById('m-musc'),
        wg: document.getElementById('m-wg'),
        ser: document.getElementById('m-ser'),
        rep: document.getElementById('m-rep'),
        var: document.getElementById('m-var')
    };

    MODALS = {
        ex: document.querySelector('.modal-ex'),
        day: document.querySelector('.modal-day'),
        list: document.querySelector('.modal-list')
    };

    ELEMENTS.wg.onchange = function() {
        ELEMENTS.wg.value = stringToNumberArray(ELEMENTS.wg.value);
    }

    ELEMENTS.title.onchange = function() {
        ELEMENTS.title.value = capitalize(ELEMENTS.title.value);
    }
}

/**
 * Leemos la información de los días y ejercicios del el local storage.
 * Si no existe, leemos los archivos JSON
 */
async function getLocalData() {
    days = getData('days');
    exs = getData('exs');
    vars = getData('vars');
    
    if (!days) days = await readJSON(PATHS.days);
    if (!exs) exs = await readJSON(PATHS.exs);
    if (!vars) vars = await readJSON(PATHS.vars);
    
    console.log('Dias', days);
    console.log('Ejercicios', exs);
    console.log('Alternativas', vars);
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
    Object.keys(days).forEach(key => {
        const day = days[key];
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.innerHTML = `
            <div class="edit-btn btn">
                <div class="icon">✏️</div>
            </div>
            <div class="dropdown" onclick="dropdownExs(this)">
                <div class="title">${day.title}</div>
                <div class="icon">⬇️</div>
            </div>
            <div class="exs">
            </div>
        `;
        dayElement.querySelector('.edit-btn').onclick = () => editDay(day);
        // Ejercicios de cada día
        const exsElement = dayElement.querySelector('.exs');
        if(!day.exercises.length) {
            const msgElement = document.createElement('div');
            msgElement.className = 'no-ex';
            msgElement.innerHTML = 'No tienes ejercicios este día';
            exsElement.appendChild(msgElement);
        }
        day.exercises.forEach(exName => {
            const ex = exs[exName];
            if (ex) {
                const exElement = document.createElement('div');
                exElement.className = 'ex';
                exElement.onclick = () => editEx(ex);
                exElement.innerHTML = `
                    <div class="ex-muscle">${ex.muscle}</div>
                    <div class="ex-title">${ex.name}</div>
                    <div class="ex-wg">${ex.weights && ex.weights.join(', ')}</div>
                    <div class="ex-sets">${ex.series} x ${ex.reps}</div>
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
        var dayLength = Object.keys(days).length + 1;
        days['day' + dayLength] = {
            title: 'Día ' + dayLength,
            name: 'day' + dayLength,
            description: '',
            exercises: []
        };
        saveData('days', days);
        renderInfo(true);
    };
    return btnElement;
}

function dropdownExs(element) {
    const exs = element.nextElementSibling;
    const icon = element.querySelector('.icon');
    if (exs.classList.contains('show')) {
        exs.classList.remove('show');
        icon.innerHTML = '⬇️';
        element.classList.remove('edit');
    } else {
        exs.classList.add('show');
        icon.innerHTML = '⬆️';
        element.classList.add('edit');
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
    const modalDay = MODALS.day;
    modalDay.innerHTML = '';
    day.exercises.forEach(exName => {
        const exElement = document.createElement('div');
        exElement.className = 'm-ex';
        if(newExs[exName]) exElement.classList.add('is-new');
        exElement.innerHTML = `<div>${exName}</div>`;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn btn';
        removeBtn.innerHTML = '<div class="icon">🗑️</div>';
        removeBtn.onclick = (event) => removeEx(event, day, exName);
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
    var recoverDay = days[auxDay.name];
    // Reseteamos auxDay porque hemos reestablecido la info
    auxDay = JSON.parse(JSON.stringify(recoverDay)); // Copia profunda del objeto
    // Usamos el nombre del dia auxiliar para buscar el dia original
    renderDay(auxDay);
}

function saveDay() {
    days[auxDay.name] = JSON.parse(JSON.stringify(auxDay)); // Copia profunda del objeto
    auxDay = {};
    if(Object.keys(newExs).length) { // Si se han creado nuevos ejercicios, los agregamos
        exs = Object.assign(exs, newExs);
        newExs = {};
        saveData('exs', exs);
    }
    saveData('days', days);
    renderInfo(true);
    closeModal();
    showToast('success', 'Hecho!', 'Día añadido correctamente.', '✅');
}

function deleteDay() {
    delete days[auxDay.name];
    auxDay = {};
    saveData('days', days);
    renderInfo(true);
    closeModal();
    showToast('success', 'Hecho!', 'Día borrado correctamente.', '✅');
}

function saveExList() {
    // Obtenemos las checkbox seleccionadas y buscamos su ejercicio asociado para agregarlo al día
    const checkedBoxes = document.querySelectorAll('.ex input:checked');
    const exsToAdd = [];
    checkedBoxes.forEach(checkbox => {
        exsToAdd.push(checkbox.parentElement.innerText);
    });
    // Actualizamos el dia auxiliar ya que aún no hemos confirmado el guardado del día
    auxDay.exercises = exsToAdd;
    // Agregamos posibles nuevos ejercicios
    if(Object.keys(newExs).length) {
        auxDay.exercises = auxDay.exercises.concat(Object.keys(newExs));
    }
    backToLastModal(auxDay);
}

function backToLastModal(target) {
    var hasLastModal = lastModal;
    lastModal = ''; // Reseteamos antes de decidir si volvemos a setearlo
    // Volvemos al día auxiliar con los ejercicios seleccionados
    if(hasLastModal === 'day') {
        editDay(target);
    } else if(hasLastModal === 'list') {
        renderEditModal('list', null, {
            canBeRemoved: true,
            disableBtns: true,
            canShowInfo: true
        });
    } else {
        closeModal();
    }
}

function newEx(day) {
    renderEditModal('new', day);
}

/**
 * Borrado del ejercicio.
 * Si se especifica el día, se borra del día provisionalmente hasta que confirmemos la información auxiliar.
 * Si no se especifica el día, se borrará de la lista global.
 * @param {*} event 
 * @param {*} day 
 * @param {*} exName 
 */
function removeEx(event, day, exName) {
    event.stopPropagation(); // IMPORTANTE en el caso que borramos de la lista global, ya que el elemento padre tambien tiene un onclick
    if(day) { // Borramos de un día concreto
        const exIndex = day.exercises.findIndex(ex => ex === exName);
        auxDay.exercises.splice(exIndex, 1); // Actualizamos dia auxiliar
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
    Object.keys(days).forEach(key => {
        const day = days[key];
        const exIndex = day.exercises.findIndex(ex => ex === exName);
        if(exIndex !== -1) day.exercises.splice(exIndex, 1);
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
    const modalList = MODALS.list;
    modalList.innerHTML = '';

    // Si no hay botones, agregamos la clase para que ocupe todo el modal
    if(disableBtns) modalList.classList.add('extended');
    else modalList.classList.remove('extended');

    setTitle('Lista de ejercicios');

    Object.keys(exsByMuscle).forEach(muscle => {
        const muscleElement = document.createElement('div');
        muscleElement.className = 'm-set';
        muscleElement.innerHTML = `<div class='m-musc'>${muscle}</div>`;
        exsByMuscle[muscle].forEach(exName => {
            const exElement = document.createElement('div');
            exElement.className = 'ex';
            exElement.innerHTML = `<div>${exName}</div>`;
            if(!config.readonly) { // canShowInfo
                if(day) { // Lógica para agregar ejercicios al día
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.onclick = () => {
                        checkbox.checked = !checkbox.checked;
                    };
                    exElement.appendChild(checkbox);
                    if(day.exercises.includes(exName)) checkbox.checked = true;
                    exElement.onclick = checkbox.onclick;
                } else { // Lógica para borrar ejercicios de la lista global
                    if(config.canBeRemoved) {
                        const removeBtn = document.createElement('button');
                        removeBtn.className = 'remove-btn btn';
                        removeBtn.innerHTML = '<div class="icon">🗑️</div>';
                        removeBtn.onclick = (event) => removeEx(event, null, exName);
                        exElement.appendChild(removeBtn);
                    }
                    if(config.canShowInfo) {
                        exElement.onclick = () => editEx(exs[exName], {canShowInfo: true});
                    }
                }
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
        if(!ex.muscle) ex.muscle = 'Otros';
        if (!exsByMuscle[ex.muscle]) exsByMuscle[ex.muscle] = [];
        exsByMuscle[ex.muscle].push(exName);
    });
    return exsByMuscle;
}

/* EJERCICIOS */

function editEx(ex, config) {
    renderEditModal('ex', ex, config);
}

function resetEx(ex) {
    setExInfo(ex);
}

/**
 * 
 * @param {Object} ex Donde vamos a guardar la info
 */
function saveEx(ex, config) {
    var target = exs[ex.name],
        config = config || {},
        goLastModal = config.canShowInfo;
    target.description = ELEMENTS.desc.value.trim();
    target.muscle = ELEMENTS.musc.value.trim();
    target.weights = stringToNumberArray(ELEMENTS.wg.value);
    target.series = ELEMENTS.ser.value.trim();
    target.reps = ELEMENTS.rep.value.trim();

    saveVariations(ex.name);

    saveData('exs', exs);
    setExInfo(ex);
    renderInfo(true);
    showToast('success', 'Hecho!', 'Ejercicio actualizado correctamente.', '✅');

    if(lastModal && goLastModal) { // Si tenemos configurado un modal al que volver al guardar
        // Por el momento este caso solo ocurre cuando volvemos atrás desde la info de un ejercicio
        // en la lista global de ejercicios
        backToLastModal();
    } else if(appConfig.closeModalOnSave) {
        closeModal();
    }
}

/**
 * Función para agregar un nuevo ejercicio
 */
function addEx() {
    var title = capitalize(ELEMENTS.title.value);
    if(title) {
        if(exs[title]) {
            showToast('error', 'Error!', 'Este ejercicio ya existe.', '❌');
            return;
        }
        newExs[title] = {
            name: title,
            description: ELEMENTS.desc.value.trim(),
            muscle: capitalize(ELEMENTS.musc.value),
            weights: stringToNumberArray(ELEMENTS.wg.value),
            series: ELEMENTS.ser.value.trim(),
            reps: ELEMENTS.rep.value.trim(),
        };
        if(auxDay.exercises) { // si es un dia concreto, tendremos auxDay
            if(!auxDay.exercises.includes(title)) auxDay.exercises.push(title);
            // else // TO DO: mostrar modal de ejercicio ya existente
        } else { // si no, lo buscamos en la lista global
            exs[title] = newExs[title];
            newExs = {};
        }
        saveVariations(title);
    }

    if(lastModal) {
        backToLastModal(auxDay);
    } else {
        closeModal();
    }
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
    hideButtons(); // Para casos como tener botones e ir a un modal que no tiene botones ni los cambia, como la lista
    var config = config || {};

    // Nueva funcionalidad futura
    // editModal.addEventListener('click', function (event) {
    //     if (event.target === editModal) closeModal();
    // });

    if (type === 'ex') {
        setExInfo(target);
        toggleFromGroup(type);
        setButtons(target, type, ['save', 'reset'], config);
    } else if (type === 'day') {
        setDayInfo(target);
        toggleFromGroup(type);
        setButtons(target, type, ['save', 'reset', 'new', 'delete']);
        lastModal = type;
    } else if(type === 'new') {
        setNewExInfo();
        toggleFromGroup('ex'); // es el mismo tipo de modal
        setButtons(target, type, ['save', 'reset']);
    } else { // 'list'
        setExList(target, config);
        toggleFromGroup(type);
        setButtons(target, type, ['save'], config);
        // La lista global tiene habilitado el mostrar información del ejercicio, y
        // al volver atrás debemos poder volver a la lista
        if(config.canShowInfo) lastModal = type;
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
        saveBtn.onclick = () => saveEx(target, config);
        resetBtn.onclick = () => resetEx(target);
        if(config.canShowInfo) closeBtn.onclick = () => backToLastModal(target);
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
    setTitle(ex.name || '', false);

    ELEMENTS.musc.value = ex.muscle || '';
    ELEMENTS.desc.value = ex.description || '';
    ELEMENTS.wg.value = ex.weights || '';
    ELEMENTS.ser.value = ex.series || '';
    ELEMENTS.rep.value = ex.reps || '';
    ELEMENTS.var.innerHTML = '';

    updateExVariations(ex);
    addVariationBtn.onclick = (event) => addVariation(event, ex);
}

function updateExVariations(ex) {
    ELEMENTS.var.innerHTML = ''; // actualizamos de nuevo siempre antes de renderizar
    const variations = vars[ex.name] || [];
    if(variations.length) {
        variations.forEach(variation => {
            renderVariation(variation);
        });
    }
}

function renderVariation(variation) {
    const varElement = document.createElement('div'),
        titleElement = document.createElement('div'),
        setsElement = document.createElement('div'),
        extraElement = document.createElement('div');
    varElement.className = 'm-var';

    titleElement.className = 'm-var-title';
    titleElement.innerHTML = `
        <input class="var-name" type="text" value="${variation.name || ''}" placeholder="Nombre de la variante">
        <div class="remove-btn"></div>
    `;
    const varName = titleElement.querySelector('.var-name');
    titleElement.querySelector('.remove-btn').appendChild(deleteVariationBtn());
    varName.onchange = () => {
        varName.value = capitalize(varName.value);
    };
    varElement.appendChild(titleElement);
    setsElement.className = 'm-var-sets';
    setsElement.innerHTML = `
        <label>Peso/Tiempo</label>
        <input class="var-amount" type="text" value="${variation.amount || ''}" placeholder="Cuánto?">
        <input type="text" class="var-ser" value="${variation.series || '3'}">
        <label> x </label>
        <input type="text" class="var-rep" value="${variation.reps || '10'}">
    `;
    varElement.appendChild(setsElement);
    // extraElement.className = 'm-var-extra';
    // extraElement.innerHTML = ``;
    // varElement.appendChild(extraElement);

    ELEMENTS.var.appendChild(varElement);
}

/**
 * Función para guardar todas las variantes del ejercicio actual.
 * Actualiza el objeto vars con las variantes que están actualmente abiertas
 * dentro de un ejercicio que está siendo mostrado por pantalla
 * @param {String} exName Guardamos por el nombre
 */
function saveVariations(exName) {
    var updatedVariations = [],
        unsavedVariations = document.querySelectorAll('.m-var');
    
    if(!unsavedVariations.length) {
        delete vars[exName];
        return;
    }

    unsavedVariations.forEach(variationElem => {
        updatedVariations.push({
            main: exName,
            name: variationElem.querySelector('.var-name').value || 'Otra variante',
            amount: variationElem.querySelector('.var-amount').value,
            series: variationElem.querySelector('.var-ser').value,
            reps: variationElem.querySelector('.var-rep').value
        });
    });

    vars[exName] = updatedVariations;
    saveData('vars', vars);
}

function deleteVariationBtn() {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn';
    removeBtn.innerHTML = '<div class="icon">🗑️</div>';
    removeBtn.onclick = (event) => deleteVariation(event);
    return removeBtn;
}

function deleteVariation(event) {
    event.stopPropagation();
    event.currentTarget.closest('.m-var').remove();
}

function addVariation(_, ex) {
    var newVariation = null;

    scrollDown(MODALS.ex);
    if(alreadyAdding()) return;
    newVariation = {
        main: ex && ex.name || ''
    };

    renderVariation(newVariation);
}

/**
 * Si ya hay alguna variante en proceso de creación, no podemos crear otra.
 * @return {Boolean}
 */
function alreadyAdding() {
    var unsavedVariations = document.querySelectorAll('.m-var'),
        alreadyAdding = false;

    if(!unsavedVariations.length) return alreadyAdding;

    unsavedVariations.forEach(variationElem => {
        if(variationElem.querySelector('.var-name').value === '') {
            alreadyAdding = true;
        }
    });

    return alreadyAdding;
}

/**
 * Setear la info del dia en el modal. Como se crea en tiempo de ejecución, solo falta el título
 */
function setDayInfo(day) {
    setTitle(day.title, false);
}

/**
 * Setear la info del nuevo ejercicio en el modal
 */
function setNewExInfo() {
    setTitle('', true, 'Nuevo Ejercicio ✏️');

    ELEMENTS.musc.value = '';
    ELEMENTS.desc.value = '';
    ELEMENTS.wg.value = '';
    ELEMENTS.ser.value = '';
    ELEMENTS.rep.value = '';
    ELEMENTS.var.innerHTML = '';

    addVariationBtn.onclick = (event) => addVariation(event);
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
    lastModal = ''; // reiniciamos porque hemos cerrado los modales
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
        titleElem = ELEMENTS.title;
    
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

