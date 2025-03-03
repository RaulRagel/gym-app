
var menu;
var menuBtn;

function initMenu() {
    menuBtn = document.querySelector('#menu-btn');
    menuBtn.onclick = () => toggle('.main-header');

    menu = document.querySelector('#menu');
    menu.querySelector('#add').onclick = () => {};
    menu.querySelector('#exsList').onclick = () => showExsList();
    menu.querySelector('#removeData').onclick = () => removeData();
    menu.querySelector('#config').onclick = () => {};
}


function removeData() {
    localStorage.clear();
    window.location.reload();
}

function showExsList() {
    // setExList(true);
    // toggleModalInfo('list');
    // toggle('.modal-list', 'full-list');
    // editModal.classList.add('show');
    renderEditModal('list', null, {
        readonly: true,
        disableBtns: true
    });
}