// ANOVA Functions
function addGroup() {
    const container = document.getElementById('anovaGroups');
    const groupCount = container.children.length + 1;
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group-input';
    groupDiv.innerHTML = `
        <input type="text" placeholder="Grupo ${groupCount}: ej. 25, 28, 30, 32">
        <button class="btn-remove-group" onclick="removeGroup(this)">✕</button>
    `;
    container.appendChild(groupDiv);
    
    // Mostrar botones de eliminar si hay más de un grupo
    updateRemoveButtons();
}

function removeGroup(btn) {
    const container = document.getElementById('anovaGroups');
    if (container.children.length > 1) {
        btn.parentElement.remove();
    }
    updateRemoveButtons();
}

function updateRemoveButtons() {
    const container = document.getElementById('anovaGroups');
    const buttons = container.querySelectorAll('.btn-remove-group');
    const display = container.children.length > 1 ? 'inline-block' : 'none';
    buttons.forEach(btn => btn.style.display = display);
}

function calculateAnova() {
    const inputs = document.querySelectorAll('#anovaGroups input');
    const groups = [];
    
    for (let input of inputs) {
        if (input.value.trim()) {
            const values = input.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
            if (values.length > 0) groups.push(values);
        }
    }

    if (groups.length < 2) {
        alert('Por favor ingresa al menos 2 grupos con datos válidos');
        return;
    }

    const allValues = groups.flat();
    const n = allValues.length;
    const k = groups.length;
    const grandMean = allValues.reduce((a, b) => a + b, 0) / n;

    let ssb = 0; // Sum of squares between groups
    let ssw = 0; // Sum of squares within groups

    groups.forEach(group => {
        const groupMean = group.reduce((a, b) => a + b, 0) / group.length;
        ssb += group.length * Math.pow(groupMean - grandMean, 2);
        
        group.forEach(value => {
            ssw += Math.pow(value - groupMean, 2);
        });
    });

    const dfb = k - 1; // Degrees of freedom between
    const dfw = n - k; // Degrees of freedom within
    const msb = ssb / dfb; // Mean square between
    const msw = ssw / dfw; // Mean square within
    const fValue = (msw === 0) ? 0 : msb / msw; // Evitar división por cero

    // Interpretación simple (sin tabla F completa)
    let interpretation = '';
    if (fValue > 3.5) { // Un valor crítico común aproximado
        interpretation = 'Existe evidencia de diferencias significativas entre las medias de los grupos.';
    } else {
        interpretation = 'No hay evidencia suficiente para concluir que existen diferencias significativas entre las medias de los grupos.';
    }
    if (msw === 0 && msb > 0) {
        interpretation = 'La varianza dentro de los grupos es cero, pero entre los grupos no. Diferencias perfectas.';
    } else if (msw === 0 && msb === 0) {
        interpretation = 'Todos los valores son idénticos. No hay varianza.';
    }


    document.getElementById('anovaResult').innerHTML = `
        <div class="result-box">
            <h3>Resultados del ANOVA</h3>
            <div class="result-item">
                <strong>Número de grupos (k):</strong>
                <span class="result-value">${k}</span>
            </div>
            <div class="result-item">
                <strong>Total de observaciones (N):</strong>
                <span class="result-value">${n}</span>
            </div>
            <div class="result-item">
                <strong>Suma de cuadrados entre grupos (SSB):</strong>
                <span class="result-value">${ssb.toFixed(4)}</span>
            </div>
            <div class="result-item">
                <strong>Suma de cuadrados dentro de grupos (SSW):</strong>
                <span class="result-value">${ssw.toFixed(4)}</span>
            </div>
             <div class="result-item">
                <strong>Grados de libertad (entre, dentro):</strong>
                <span class="result-value">${dfb}, ${dfw}</span>
            </div>
            <div class="result-item">
                <strong>Estadístico F:</strong>
                <span class="result-value">${fValue.toFixed(4)}</span>
            </div>
            <div class="result-item">
                <strong>Interpretación:</strong>
                <span class="result-value">${interpretation}</span>
            </div>
        </div>
    `;
}

function clearAnova() {
    const container = document.getElementById('anovaGroups');
    container.innerHTML = `
        <div class="group-input">
            <input type="text" placeholder="Grupo 1: ej. 12, 15, 18, 20, 22">
            <button class="btn-remove-group" onclick="removeGroup(this)" style="display:none;">✕</button>
        </div>
    `;
    document.getElementById('anovaResult').innerHTML = '';
    updateRemoveButtons();
}

function loadAnovaExample1() {
    clearAnova();
    const container = document.getElementById('anovaGroups');
    container.innerHTML = `
        <div class="group-input">
            <input type="text" value="12, 15, 14, 13, 16">
            <button class="btn-remove-group" onclick="removeGroup(this)">✕</button>
        </div>
    `;
    addGroup();
    container.children[1].querySelector('input').value = "22, 25, 24, 26, 23";
    addGroup();
    container.children[2].querySelector('input').value = "18, 19, 20, 17, 21";
    updateRemoveButtons();
}

function loadAnovaExample2() {
    clearAnova();
    const container = document.getElementById('anovaGroups');
    container.innerHTML = `
        <div class="group-input">
            <input type="text" value="20, 22, 21, 19, 23">
            <button class="btn-remove-group" onclick="removeGroup(this)">✕</button>
        </div>
    `;
    addGroup();
    container.children[1].querySelector('input').value = "21, 20, 22, 23, 19";
    addGroup();
    container.children[2].querySelector('input').value = "22, 21, 20, 19, 24";
    updateRemoveButtons();
}