var days, exs;

const PATHS = {
    config: './config.json',
    days: './days.json',
    exs: './ejercicios.json',
};

document.addEventListener('DOMContentLoaded', async function () {
    days = await readJSON(PATHS.days);
    exs = await readJSON(PATHS.exs);
    console.log('Dias', days);
    console.log('Ejercicios', exs);

    renderExs();
});

function renderExs() {
    const container = document.querySelector('.container');
    container.innerHTML = '';
    days.dias.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.innerHTML = `
            <div class="dropdown" onclick="toggleExs(this)">
                <div class="title">${day.nombre}</div>
                <div class="icon">⬇️</div>
            </div>
            <div class="exs">
            </div>
        `;
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

function showDetails(event, ex) {
    event.stopPropagation();
    console.log('Detalle del ejercicio', ex);
}

function updatesExcercises() {
    writeJSON(path, data);
}