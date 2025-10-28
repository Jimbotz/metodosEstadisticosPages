let myAnovaChart; // Variable para guardar la instancia del gráfico

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
    const groupStats = [];
    
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
    const grandMean = jStat.mean(allValues);

    let ssb = 0; // Sum of squares between groups
    let ssw = 0; // Sum of squares within groups

    groups.forEach((group, index) => {
        const stats = {};
        stats.N = group.length;
        stats.Media = jStat.mean(group);
        stats.DS = jStat.stdev(group, true); // true = sample stdev
        stats.ErrorEst = stats.DS / Math.sqrt(stats.N);
        groupStats.push(stats);

        ssb += stats.N * Math.pow(stats.Media - grandMean, 2);
        
        group.forEach(value => {
            ssw += Math.pow(value - stats.Media, 2);
        });
    });

    const dfb = k - 1;
    const dfw = n - k;
    const dft = n - 1;
    
    const sst = ssb + ssw; // Sum of squares total
    
    const msb = (dfb === 0) ? 0 : ssb / dfb;
    const msw = (dfw === 0) ? 0 : ssw / dfw;
    
    const fValue = (msw === 0) ? 0 : msb / msw;

    // Cálculo del Valor p (usando jStat)
    const pValue = 1 - jStat.centralF.cdf(fValue, dfb, dfw);

    let interpretationText = '';
    let interpretationClass = '';
    if (pValue < 0.05) {
        interpretationText = 'se considera estadísticamente significativa.';
        interpretationClass = 'significant';
    } else {
        interpretationText = 'no se considera estadísticamente significativa.';
        interpretationClass = 'not-significant';
    }

    // --- Generación del nuevo HTML ---
    const resultDiv = document.getElementById('anovaResult');
    resultDiv.innerHTML = `
        <div class="result-summary">
            <h3 class="results-header">Resultados</h3>
            <p><strong>Valor estadístico F</strong> = ${fValue.toFixed(4)}</p>
            <p><strong>Valor p</strong> = ${pValue.toFixed(4)}</p>
            <p>Según los criterios convencionales (p < 0.05), este valor 
               <span class="${interpretationClass}">${interpretationText}</span>
            </p>
        </div>

        <div>
            <h3 class="results-header">Resumen de los datos</h3>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Grupos</th>
                        <th>N</th>
                        <th>Media</th>
                        <th>DS</th>
                        <th>Error est.</th>
                    </tr>
                </thead>
                <tbody>
                    ${groupStats.map((stats, i) => `
                        <tr>
                            <td>Grupo ${i + 1}</td>
                            <td>${stats.N}</td>
                            <td>${stats.Media.toFixed(2)}</td>
                            <td>${stats.DS.toFixed(4)}</td>
                            <td>${stats.ErrorEst.toFixed(4)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div>
            <h3 class="results-header">Resumen ANOVA</h3>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Fuente</th>
                        <th>Grados de libertad</th>
                        <th>Suma de cuadrados</th>
                        <th>Cuadrado medio</th>
                        <th>F-Stat</th>
                        <th>Valor p</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Entre grupos</td>
                        <td>${dfb}</td>
                        <td>${ssb.toFixed(2)}</td>
                        <td>${msb.toFixed(2)}</td>
                        <td>${fValue.toFixed(4)}</td>
                        <td>${pValue.toFixed(4)}</td>
                    </tr>
                    <tr>
                        <td>En grupos</td>
                        <td>${dfw}</td>
                        <td>${ssw.toFixed(2)}</td>
                        <td>${msw.toFixed(2)}</td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Total</td>
                        <td>${dft}</td>
                        <td>${sst.toFixed(2)}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // --- Dibujar el gráfico ---
    renderAnovaChart(groupStats);
}

function renderAnovaChart(groupStats) {
    const ctx = document.getElementById('anovaChart').getContext('2d');
    
    if (myAnovaChart) {
        myAnovaChart.destroy();
    }

    myAnovaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: groupStats.map((_, i) => `Grupo ${i + 1}`),
            datasets: [{
                label: 'Media por Grupo',
                data: groupStats.map(stats => stats.Media),
                backgroundColor: 'rgba(94, 33, 41, 0.6)', // Color guinda
                borderColor: 'rgba(94, 33, 41, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Media'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Comparación de medias de grupos'
                },
                legend: {
                    display: false
                }
            }
        }
    });
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

    if (myAnovaChart) {
        myAnovaChart.destroy();
    }
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