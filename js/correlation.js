let myCorrChart; // Variable para la instancia del gráfico

function parseInputArray(input) {
    return input.split(',')
        .map(v => parseFloat(v.trim()))
        .filter(v => !isNaN(v));
}

function getMean(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Correlation Functions
function calculateCorrelation() {
    const xInput = document.getElementById('corrX').value;
    const yInput = document.getElementById('corrY').value;

    const x = parseInputArray(xInput);
    const y = parseInputArray(yInput);

    if (x.length === 0 || y.length === 0) {
        alert('Por favor ingresa datos válidos en ambas variables.');
        return;
    }

    if (x.length !== y.length) {
        alert(`Error: Las variables X (${x.length} valores) e Y (${y.length} valores) deben tener el mismo número de elementos.`);
        return;
    }

    const n = x.length;
    if (n < 2) {
        alert('Se necesitan al menos 2 puntos de datos para calcular la correlación.');
        return;
    }

    const meanX = getMean(x);
    const meanY = getMean(y);

    let numerator = 0;
    let denX = 0;
    let denY = 0;
    const scatterData = []; // Array para el gráfico

    for (let i = 0; i < n; i++) {
        const diffX = x[i] - meanX;
        const diffY = y[i] - meanY;
        numerator += diffX * diffY;
        denX += Math.pow(diffX, 2);
        denY += Math.pow(diffY, 2);
        scatterData.push({ x: x[i], y: y[i] }); // Guardar datos para el gráfico
    }

    const denominator = Math.sqrt(denX) * Math.sqrt(denY);

    if (denominator === 0) {
        document.getElementById('corrResult').innerHTML = `
            <div class="result-summary">
                <h3 class="results-header">Error</h3>
                <p>No se puede calcular la correlación porque al menos una de las variables no tiene varianza (todos los valores son iguales).</p>
            </div>
        `;
        return;
    }

    const r = numerator / denominator;
    
    // --- INICIO DE LA CORRECCIÓN ---
    
    const df = n - 2;
    let tStat, pValue;

    // Si r es 1 o -1 (o un error de punto flotante muy cercano),
    // el p-value es 0 y t-statistic es infinito.
    if (Math.abs(r) >= 0.999999999) {
        tStat = (r > 0) ? Infinity : -Infinity;
        pValue = 0;
    } else {
        // Si no, calcula normalmente.
        tStat = r * Math.sqrt(df / (1 - r*r));
        // Se usa (1 - cdf) * 2 para ser consistente con anova.js y chi.js
        pValue = (1 - jStat.studentt.cdf(Math.abs(tStat), df)) * 2; 
    }
    
    // --- FIN DE LA CORRECCIÓN ---

    // Interpretación
    let interpretation = '';
    const rAbs = Math.abs(r);
    
    if (rAbs >= 0.8) {
        interpretation = 'Correlación muy fuerte ';
    } else if (rAbs >= 0.6) {
        interpretation = 'Correlación fuerte ';
    } else if (rAbs >= 0.4) {
        interpretation = 'Correlación moderada ';
    } else if (rAbs >= 0.2) {
        interpretation = 'Correlación débil ';
    } else {
        interpretation = 'Correlación muy débil o inexistente ';
    }
    
    if (r > 0.05) { // Se ajusta el umbral para incluir correlaciones débiles
        interpretation += '(positiva)';
    } else if (r < -0.05) {
        interpretation += '(negativa)';
    } else {
        interpretation = 'Sin correlación lineal aparente';
    }

    let interpretationText = '';
    let interpretationClass = '';
    if (pValue < 0.05) {
        interpretationText = `se considera estadísticamente significativa. (${interpretation.trim()})`;
        interpretationClass = 'significant';
    } else {
        interpretationText = `no se considera estadísticamente significativa. (${interpretation.trim()})`;
        interpretationClass = 'not-significant';
    }


    document.getElementById('corrResult').innerHTML = `
        <div class="result-summary">
            <h3 class="results-header">Resultados</h3>
            <p><strong>Coeficiente de correlación (r)</strong> = ${r.toFixed(6)}</p>
            <p><strong>Valor p</strong> = ${pValue.toFixed(6)}</p>
            <p>La correlación <span class="${interpretationClass}">${interpretationText}</span></p>
        </div>

        <div>
            <h3 class="results-header">Resumen de los datos</h3>
            <table class="results-table">
                <thead>
                    <tr><th>Variable</th><th>N</th><th>Media</th></tr>
                </thead>
                <tbody>
                    <tr><td>Variable X</td><td>${n}</td><td>${meanX.toFixed(2)}</td></tr>
                    <tr><td>Variable Y</td><td>${n}</td><td>${meanY.toFixed(2)}</td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    // --- Dibujar el gráfico ---
    renderCorrChart(scatterData);
}

function renderCorrChart(data) {
    const ctx = document.getElementById('corrChart').getContext('2d');
    
    if (myCorrChart) {
        myCorrChart.destroy();
    }

    myCorrChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Relación X-Y',
                data: data, // Array de objetos {x, y}
                backgroundColor: 'rgba(94, 33, 41, 0.6)' // Color guinda
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: { display: true, text: 'Gráfico de dispersión' },
                legend: { display: false }
            },
            scales: {
                x: { title: { display: true, text: 'Variable X' } },
                y: { title: { display: true, text: 'Variable Y' } }
            }
        }
    });
}

function clearCorrelation() {
    document.getElementById('corrX').value = '';
    document.getElementById('corrY').value = '';
    document.getElementById('corrResult').innerHTML = '';
    if (myCorrChart) {
        myCorrChart.destroy();
    }
}

function loadCorrExample1() {
    document.getElementById('corrX').value = '1, 2, 3, 4, 5, 6, 7, 8';
    document.getElementById('corrY').value = '2.1, 3.9, 6.1, 7.8, 10.2, 11.8, 14.1, 16.2';
}

function loadCorrExample2() {
    document.getElementById('corrX').value = '10, 15, 20, 25, 30, 35';
    document.getElementById('corrY').value = '88, 75, 62, 51, 40, 29';
}

function loadCorrExample3() {
    document.getElementById('corrX').value = '1, 2, 3, 4, 5, 6, 7, 8';
    document.getElementById('corrY').value = '5, -2, 8, 1, 9, 3, 7, 4';
}