
var toastElem = null;
var toastTout = null;
const timeToShow = 3000;
const ICONS = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
}

function initToast() {
    toastElem = document.getElementById('toast');

    document.getElementById('close-toast').onclick = closeToast;
}

function showToast(type, title, message, time) {
    closeToast();

    toastElem.classList.remove('success', 'error', 'warning', 'info');
    toastElem.classList.add(type.toLowerCase());

    document.querySelector('.t-icon').innerHTML = ICONS[type] || '';
    document.querySelector('.t-title').innerHTML = title;
    document.querySelector('.t-msg').innerHTML = message;

    toastElem.classList.add('show');

    toastTout = setTimeout(() => {
        closeToast();
    }, time ? time * 1000 : timeToShow);
}

function closeToast() {
    if (toastTout) {
        clearTimeout(toastTout);
        toastElem.classList.remove('show');
    }
}

window.showToast = showToast;