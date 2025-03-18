

function toggle(target, className) {
    const elem = typeof target === 'string' 
        ? document.querySelector(target)
        : target;
    var className = className || 'show';

    if (elem.classList.contains(className)) {
        elem.classList.remove(className);
    } else {
        elem.classList.add(className);
    }
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

function scrollDown(container) {
    container.scrollTop = container.scrollHeight;
}