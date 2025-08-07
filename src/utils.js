

function getPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
        return 'android';
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
    }
    if (/Win/.test(userAgent)) {
        return 'windows';
    }
    if (/Mac/.test(userAgent)) {
        return 'mac';
    }
    if (/Linux/.test(userAgent)) {
        return 'linux';
    }
    return '';
}

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

function hasKeys(obj) {
    return obj && keys(obj).length > 0;
}

function keys(obj) {
    return obj ? Object.keys(obj) : [];
}