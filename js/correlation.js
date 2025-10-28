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

    for (let i = 0; i < n; i++) {
        const diffX = x[i] - meanX;
        const diffY = y[i] - meanY;
        numerator += diffX * diffY;
        denX += Math.pow(diffX, 2);
        denY += Math.pow(diffY, 2);
    }

    const denominator = Math.sqrt(denX) * Math.sqrt(denY);

    if (denominator === 0) {
        document.getElementById('corrResult').innerHTML = `
            <div class="result-box">
                <h3>Resultados de Correlación</h3>
                <div class="result-item">
                    <strong>Coeficiente (r):</strong>
                    <span class="result-value">No se puede calcular</span>
                </div>
                <div class="result-item">
                    <strong>Interpretación:</strong>
                    <span class="result-value">No hay varianza en al menos una de las variables.</span>
                </div>
            </div>
        `;
        return;
    }

    const r = numerator / denominator;
    
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
    
    if (r > 0.1) {
        interpretation += '(positiva)';
    } else if (r < -0.1) {
        interpretation += '(negativa)';
    } else {
        interpretation = 'Sin correlación lineal aparente';
    }


    document.getElementById('corrResult').innerHTML = `
        <div class="result-box">
            <h3>Resultados de Correlación de Pearson</h3>
            <div class="result-item">
                <strong>Coeficiente de correlación (r):</strong>
                <span class="result-value">${r.toFixed(6)}</span>
            </div>
            <div class="result-item">
                <strong>Número de pares (n):</strong>
                <span class="result-value">${n}</span>
            </div>
            <div class="result-item">
                <strong>Interpretación:</strong>
                <span class="result-value">${interpretation}</span>
            </div>
        </div>
    `;
}

function clearCorrelation() {
    document.getElementById('corrX').value = '';
    document.getElementById('corrY').value = '';
    document.getElementById('corrResult').innerHTML = '';
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