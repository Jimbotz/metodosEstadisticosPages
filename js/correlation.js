let myCorrChart; 

function parseInputArray(input) {
    return input.split(',')
        .map(v => parseFloat(v.trim()))
        .filter(v => !isNaN(v));
}

function getMean(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}


function createCorrCalcTable(details) {
    let table = '<table class="results-table"><thead><tr>';
    table += '<th>x_i</th>';
    table += '<th>y_i</th>';
    table += '<th>x_i - X̄</th>';       
    table += '<th>(x_i - X̄)²</th>';    
    table += '<th>y_i - Ȳ</th>';       
    table += '<th>(y_i - Ȳ)²</th>';    
    table += '<th>(x_i - X̄)(y_i - Ȳ)</th>'; 
    table += '</tr></thead><tbody>';

    details.forEach(row => {
        table += `<tr>
            <td>${row.xi}</td>
            <td>${row.yi}</td>
            <td>${row.diffX}</td>
            <td>${row.diffX2}</td>
            <td>${row.diffY}</td>
            <td>${row.diffY2}</td>
            <td>${row.diffXY}</td>
        </tr>`;
    });

    table += '</tbody></table>';
    return table;
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

    let numerator = 0;   // Suma de (x_i - X_bar)(y_i - Y_bar)
    let denX = 0;        // Suma de (x_i - X_bar)^2
    let denY = 0;        // Suma de (y_i - Y_bar)^2
    
    const scatterData = []; // Array para la grafica
    const calcDetails = []; // Array para la tabla 

    for (let i = 0; i < n; i++) {
        const diffX = x[i] - meanX;
        const diffY = y[i] - meanY;
        const diffX2 = Math.pow(diffX, 2);
        const diffY2 = Math.pow(diffY, 2);
        const diffXY = diffX * diffY;
        
        numerator += diffXY;
        denX += diffX2;
        denY += diffY2;
        
        scatterData.push({ x: x[i], y: y[i] }); 

        calcDetails.push({
            xi: x[i],
            yi: y[i],
            diffX: diffX.toFixed(3),
            diffX2: diffX2.toFixed(3),
            diffY: diffY.toFixed(3),
            diffY2: diffY2.toFixed(3),
            diffXY: diffXY.toFixed(3)
        });
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
    
    // --- Cálculo de p-value ---
    const df = n - 2;
    let tStat, pValue;
    if (Math.abs(r) >= 0.999999999) {
        tStat = (r > 0) ? Infinity : -Infinity;
        pValue = 0;
    } else {
        tStat = r * Math.sqrt(df / (1 - r*r));
        pValue = (1 - jStat.studentt.cdf(Math.abs(tStat), df)) * 2; 
    }
    
    // --- Interpretación ---
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
    
    if (r > 0.05) {
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

    // --- Cálculo de Regresión Lineal (y = mx + b) ---
    const m = numerator / denX; // Pendiente (slope)
    const b = meanY - (m * meanX); // Intercepto-y
    const sign = b >= 0 ? '+' : '-';
    const regressionEq = `y = ${m.toFixed(4)}x ${sign} ${Math.abs(b).toFixed(4)}`;

    // --- Puntos para la línea de regresión ---
    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    const linePoints = [
        { x: minX, y: m * minX + b },
        { x: maxX, y: m * maxX + b }
    ];

    document.getElementById('corrResult').innerHTML = `
        <div class="result-summary">
            <h3 class="results-header">Resultados</h3>
            <p><strong>Coeficiente de correlación (r)</strong> = ${r.toFixed(6)}</p>
            <p><strong>Línea de Regresión</strong> = ${regressionEq}</p>
            <p><strong>Valor p</strong> = ${pValue.toFixed(6)}</p>
            <p>La correlación <span class="${interpretationClass}">${interpretationText}</span></p>
        </div>

        <details class="calculation-steps">
            <summary>Mostrar/Ocultar Pasos de Cálculo</summary>
            
            <h4 class="results-header">1. Medias de los Datasets</h4>
            <p style="text-align: center;">
                <strong>Media X (X̄)</strong> = ${x.reduce((a, b) => a + b, 0).toFixed(2)} / ${n} = <strong>${meanX.toFixed(4)}</strong>
            </p>
            <p style="text-align: center;">
                <strong>Media Y (Ȳ)</strong> = ${y.reduce((a, b) => a + b, 0).toFixed(2)} / ${n} = <strong>${meanY.toFixed(4)}</strong>
            </p>

            <h4 class="results-header">2. Tabla de Cálculos</h4>
            ${createCorrCalcTable(calcDetails)}

            <h4 class="results-header">3. Sumatorias</h4>
            <p><strong>Suma de (x_i - X̄)(y_i - Ȳ)</strong> = ${numerator.toFixed(4)}</p>
            <p><strong>Suma de (x_i - X̄)²</strong> = ${denX.toFixed(4)}</p>
            <p><strong>Suma de (y_i - Ȳ)²</strong> = ${denY.toFixed(4)}</p>
            
            <h4 class="results-header">4. Cálculo de r</h4>
            <div class="formula">
                r = Σ[(x_i - X̄)(y_i - Ȳ)] / √[ Σ(x_i - X̄)² × Σ(y_i - Ȳ)² ]
            </div>
            <div class="formula">
                r = ${numerator.toFixed(4)} / √[ ${denX.toFixed(4)} × ${denY.toFixed(4)} ]
            </div>
            <div class="formula">
                r = ${numerator.toFixed(4)} / √[ ${(denX * denY).toFixed(4)} ]
            </div>
            <div class="formula">
                r = ${numerator.toFixed(4)} / ${denominator.toFixed(4)}
            </div>
            <p style="text-align: center; font-weight: bold; font-size: 1.1em;">r = ${r.toFixed(6)}</p>

        </details>
    `;
    
    // --- Dibujar el gráfico ---
    renderCorrChart(scatterData, linePoints);
}


function renderCorrChart(scatterData, linePoints) {
    const ctx = document.getElementById('corrChart').getContext('2d');
    
    if (myCorrChart) {
        myCorrChart.destroy();
    }

    myCorrChart = new Chart(ctx, {
        type: 'scatter', 
        data: {
            datasets: [
                {
                    label: 'Puntos de Datos',
                    data: scatterData, 
                    backgroundColor: 'rgba(94, 33, 41, 0.6)', // Color guinda
                    type: 'scatter'
                },
                {
                    label: 'Línea de Regresión',
                    data: linePoints, 
                    borderColor: 'rgba(255, 0, 0, 0.8)', // Color rojo
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    type: 'line', 
                    pointRadius: 0 
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: { display: true, text: 'Gráfico de Dispersión y Línea de Regresión' },
                legend: { display: true } // Mostrar leyenda
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