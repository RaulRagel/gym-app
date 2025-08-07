
var menu;
var menuBtn;

function initMenu() {
    menuBtn = document.querySelector('#menu-btn');
    menuBtn.onclick = () => toggle('.main-header');

    menu = document.querySelector('#menu');
    menu.querySelector('#add').onclick = () => addGlobalEx();
    menu.querySelector('#exsList').onclick = () => showExsList();
    menu.querySelector('#removeData').onclick = () => removeData();
    menu.querySelector('#resetData').onclick = () => resetData();
    menu.querySelector('#config').onclick = () => showConfig();

    if(isMobile) {
        document.querySelector('.main-header').classList.add('mobile-header');
    }
}

function addGlobalEx() {
    renderEditModal('new');
}

function showExsList() {
    // No pasamos el día para indicar que no hay día concreto, si no que es la lista global
    renderEditModal('list', null, {
        // readonly: true, // Con readonly no podriamos ni agregar ni borrar
        canBeRemoved: true,
        disableBtns: true,
        canShowInfo: true
    });
}

function resetData() { // si local esta vacío, obtenemos datos por defecto
    localStorage.clear();
    window.location.reload();
}

function removeData() {
    saveData('days', {});
    saveData('exs', {});
    saveData('vars', {});
    window.location.reload();
}

function showConfig() {
  showToast('warning', 'Advertencia', 'Esta funcionalidad no está implementada.'); 
}