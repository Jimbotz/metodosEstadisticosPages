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

    for (let i = 0; i < nRows; i++) {
        expected[i] = [];
        for (let j = 0; j < nCols; j++) {
            const exp = (rowTotals[i] * colTotals[j]) / total;
            if (exp === 0) {
                alert(`Error: La frecuencia esperada en la celda (${i+1}, ${j+1}) es 0. Chi Cuadrado no se puede calcular.`);
                return;
            }
            expected[i][j] = exp;
            chiSquare += Math.pow(rows[i][j] - exp, 2) / exp;
        }
    }

    const df = (nRows - 1) * (nCols - 1);
    
    // Tabla simplificada de valores críticos de Chi Cuadrado para α=0.05
    const criticalValues = {
        1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488, 5: 11.070,
        6: 12.592, 7: 14.067, 8: 15.507, 9: 16.919, 10: 18.307
    };
    
    const critical = criticalValues[df] || (df > 0 ? 1.645 * Math.sqrt(2 * df) + df : 3.841); // Aproximación para df > 10
    
    let interpretation = '';
    if (chiSquare > critical) {
        interpretation = `Las variables parecen ser DEPENDIENTES (χ² = ${chiSquare.toFixed(4)} > valor crítico ≈ ${critical.toFixed(4)})`;
    } else {
        interpretation = `Las variables parecen ser INDEPENDIENTES (χ² = ${chiSquare.toFixed(4)} ≤ valor crítico ≈ ${critical.toFixed(4)})`;
    }

    document.getElementById('chiResult').innerHTML = `
        <div class="result-box">
            <h3>Resultados del Chi Cuadrado</h3>
            <div class="result-item">
                <strong>Dimensión de la tabla:</strong>
                <span class="result-value">${nRows} × ${nCols}</span>
            </div>
            <div class="result-item">
                <strong>Estadístico χ²:</strong>
                <span class="result-value">${chiSquare.toFixed(4)}</span>
            </div>
            <div class="result-item">
                <strong>Grados de libertad (gl):</strong>
                <span class="result-value">${df}</span>
            </div>
            <div class="result-item">
                <strong>Valor crítico aprox. (α=0.05):</strong>
                <span class="result-value">${critical.toFixed(4)}</span>
            </div>
            <div class="result-item">
                <strong>Interpretación:</strong>
                <span class="result-value">${interpretation}</span>
            </div>
        </div>
    `;
}

function clearChi() {
    document.getElementById('chiInput').value = '';
    document.getElementById('chiResult').innerHTML = '';
}

function loadChiExample1() {
    document.getElementById('chiInput').value = "50, 30, 20\n20, 40, 40";
}

function loadChiExample2() {
    document.getElementById('chiInput').value = "25, 25\n25, 25";
}