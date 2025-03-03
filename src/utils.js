

function toggle(id, className) {
    const elem = document.querySelector(id);
    var className = className || 'show';

    if (elem.classList.contains(className)) {
        elem.classList.remove(className);
    } else {
        elem.classList.add(className);
    }
}