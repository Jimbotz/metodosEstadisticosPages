let myChiChart; 

// Chi Cuadrado Functions
function calculateChi() {
    const input = document.getElementById('chiInput').value.trim();
    if (!input) {
        alert('Por favor ingresa una tabla de contingencia');
        return;
    }

    const rows = input.split('\n').map(row => 
        row.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
    ).filter(row => row.length > 0);

    if (rows.length < 2 || rows[0].length < 2) {
        alert('La tabla debe tener al menos 2 filas y 2 columnas');
        return;
    }
    
    const nColsFirstRow = rows[0].length;
    for(let i = 1; i < rows.length; i++) {
        if(rows[i].length !== nColsFirstRow) {
            alert(`Error: La fila ${i+1} tiene ${rows[i].length} columnas, pero la fila 1 tiene ${nColsFirstRow}. Todas las filas deben tener el mismo número de columnas.`);
            return;
        }
    }

    const nRows = rows.length;
    const nCols = rows[0].length;
    const total = rows.flat().reduce((a, b) => a + b, 0);

    const rowTotals = rows.map(row => row.reduce((a, b) => a + b, 0));
    const colTotals = Array(nCols).fill(0);
    
    for (let j = 0; j < nCols; j++) {
        for (let i = 0; i < nRows; i++) {
            colTotals[j] += rows[i][j];
        }
    }

    let chiSquare = 0;
    const expected = [];
    const contributions = []; // Matriz para guardar las contribuciones

    for (let i = 0; i < nRows; i++) {
        expected[i] = [];
        contributions[i] = []; // Inicializar la fila interna
        for (let j = 0; j < nCols; j++) {
            const exp = (rowTotals[i] * colTotals[j]) / total;
            if (exp === 0) {
                alert(`Error: La frecuencia esperada en la celda (${i+1}, ${j+1}) es 0. Chi Cuadrado no se puede calcular.`);
                return;
            }
            expected[i][j] = exp;
            
            // --- Cálculo de contribución individual ---
            const contrib = Math.pow(rows[i][j] - exp, 2) / exp;
            contributions[i][j] = contrib; // Guardar contribución
            chiSquare += contrib; // Sumar la contribución
        }
    }

    const df = (nRows - 1) * (nCols - 1);
    
    // Cálculo del valor p con jStat
    const pValue = 1 - jStat.chisquare.cdf(chiSquare, df);

    let interpretationText = '';
    let interpretationClass = '';
    if (pValue < 0.05) {
        interpretationText = 'se considera estadísticamente significativa (las variables parecen ser dependientes).';
        interpretationClass = 'significant';
    } else {
        interpretationText = 'no se considera estadísticamente significativa (las variables parecen ser independientes).';
        interpretationClass = 'not-significant';
    }

    const resultDiv = document.getElementById('chiResult');
    resultDiv.innerHTML = `
        <div class="result-summary">
            <h3 class="results-header">Resultados</h3>
            <p><strong>Valor estadístico χ²</strong> = ${chiSquare.toFixed(4)}</p>
            <p><strong>Grados de libertad (gl)</strong> = ${df}</p>
            <p><strong>Valor p</strong> = ${pValue.toFixed(8)}</p>
            <p>Este resultado <span class="${interpretationClass}">${interpretationText}</span></p>
        </div>

        <div>
            <h3 class="results-header">Tabla de frecuencias observadas</h3>
            ${createChiHtmlTable(rows, nRows, nCols, "Fila", "Col")}
        </div>
        
        <div>
            <h3 class="results-header">Tabla de frecuencias esperadas</h3>
            ${createChiHtmlTable(expected, nRows, nCols, "Fila", "Col", (val) => val.toFixed(2))}
        </div>

        <div>
            <h3 class="results-header">Tabla de Contribuciones al χ²</h3>
            <p style="text-align: center; font-size: 0.9em; margin-top: -10px;">(La suma de esta tabla es el valor total de χ²)</p>
            ${createChiHtmlTable(contributions, nRows, nCols, "Fila", "Col", (val) => val.toFixed(5))}
        </div>
        `;

    renderChiChart(rows, nRows, nCols);
}

// Función auxiliar para crear tablas 
function createChiHtmlTable(data, nRows, nCols, rowHeader, colHeader, formatter = (val) => val) {
    let table = '<table class="results-table"><thead><tr>';
    table += `<th>${rowHeader} / ${colHeader}</th>`;
    for (let j = 0; j < nCols; j++) table += `<th>${colHeader} ${j + 1}</th>`;
    table += '</tr></thead><tbody>';
    for (let i = 0; i < nRows; i++) {
        table += `<tr><td>${rowHeader} ${i + 1}</td>`;
        for (let j = 0; j < nCols; j++) {
            table += `<td>${formatter(data[i][j])}</td>`;
        }
        table += '</tr>';
    }
    table += '</tbody></table>';
    return table;
}

function renderChiChart(data, nRows, nCols) {
    const ctx = document.getElementById('chiChart').getContext('2d');
    
    if (myChiChart) {
        myChiChart.destroy();
    }
    
    const colors = ['rgba(94, 33, 41, 0.6)', 'rgba(148, 52, 23, 0.6)', 'rgba(255, 193, 7, 0.6)', 'rgba(108, 117, 125, 0.6)'];
    
    myChiChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({ length: nCols }, (_, j) => `Columna ${j + 1}`), // Etiquetas Eje X
            datasets: Array.from({ length: nRows }, (_, i) => ({
                label: `Fila ${i + 1}`,
                data: data[i], // Datos para esta fila
                backgroundColor: colors[i % colors.length],
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: { display: true, text: 'Frecuencias observadas por grupo' }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Frecuencia' } }
            }
        }
    });
}

function clearChi() {
    document.getElementById('chiInput').value = '';
    document.getElementById('chiResult').innerHTML = '';
    if (myChiChart) {
        myChiChart.destroy();
    }
}

function loadChiExample1() {
    document.getElementById('chiInput').value = "50, 30, 20\n20, 40, 40";
}

function loadChiExample2() {
    document.getElementById('chiInput').value = "25, 25\n25, 25";
}