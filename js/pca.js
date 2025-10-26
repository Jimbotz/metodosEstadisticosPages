'use strict';

// PCA Functions
function calculatePca() {
    const input = document.getElementById('pcaInput').value.trim();
    if (!input) {
        alert('Por favor ingresa una matriz de datos');
        return;
    }

    const data = input.split('\n').map(row => 
        row.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
    ).filter(row => row.length > 0);

    if (data.length < 2) {
        alert('Se necesitan al menos 2 observaciones');
        return;
    }
    
    const nColsFirstRow = data[0].length;
    if(nColsFirstRow < 2) {
        alert('Se necesitan al menos 2 variables (columnas)');
        return;
    }
    for(let i = 1; i < data.length; i++) {
        if(data[i].length !== nColsFirstRow) {
            alert(`Error: La fila ${i+1} tiene ${data[i].length} columnas, pero la fila 1 tiene ${nColsFirstRow}. Todas las filas deben tener el mismo número de columnas.`);
            return;
        }
    }

    const nRows = data.length;
    const nCols = data[0].length;

    // 1. Calcular medias de cada columna
    const means = Array(nCols).fill(0);
    for (let j = 0; j < nCols; j++) {
        for (let i = 0; i < nRows; i++) {
            means[j] += data[i][j];
        }
        means[j] /= nRows;
    }

    // 2. Centrar los datos
    const centered = data.map(row => 
        row.map((val, j) => val - means[j])
    );

    // 3. Calcular la matriz de covarianza
    const covMatrix = Array(nCols).fill(0).map(() => Array(nCols).fill(0));
    for (let i = 0; i < nCols; i++) {
        for (let j = 0; j < nCols; j++) {
            let sum = 0;
            for (let k = 0; k < nRows; k++) {
                sum += centered[k][i] * centered[k][j];
            }
            covMatrix[i][j] = sum / (nRows - 1);
        }
    }

    // 4. Extraer varianzas (diagonal de la matriz) y varianza total
    const variances = covMatrix.map((row, i) => row[i]);
    const totalVariance = variances.reduce((a, b) => a + b, 0);
    const variancePercent = variances.map(v => (v / totalVariance * 100));

    // Formatear la matriz de covarianza para mostrarla
    let covMatrixHtml = '<strong>Matriz de Varianza-Covarianza:</strong><pre>';
    covMatrix.forEach(row => {
        covMatrixHtml += row.map(val => val.toFixed(4).padStart(10)).join(' ') + '\n';
    });
    covMatrixHtml += '</pre>';
    
    let varianceHtml = '<strong>Varianza por variable original:</strong><pre>';
    variances.forEach((v, i) => {
        varianceHtml += `Var ${i+1}: ${v.toFixed(4)} (${variancePercent[i].toFixed(2)}%)\n`;
    });
    varianceHtml += '</pre>';

    document.getElementById('pcaResult').innerHTML = `
        <div class="result-box">
            <h3>📊 Resultados del Análisis de Varianza (Paso previo al PCA)</h3>
            <div class="result-item">
                <strong>Dimensiones:</strong>
                <span class="result-value">${nRows} observaciones × ${nCols} variables</span>
            </div>
            <div class="result-item">
                <strong>Medias de las variables:</strong>
                <span class="result-value">${means.map(m => m.toFixed(4)).join(', ')}</span>
            </div>
            <div class="result-item">
                ${covMatrixHtml}
            </div>
            <div class="result-item">
                <strong>Varianza total:</strong>
                <span class="result-value">${totalVariance.toFixed(4)}</span>
            </div>
            <div class="result-item">
                ${varianceHtml}
            </div>
            <div class="result-item">
                <strong>Nota:</strong>
                <span class="result-value" style="font-size: 0.9em;">Esto muestra la varianza de las variables originales. Un PCA completo calcula los 'eigenvalores' y 'eigenvectores' de la matriz de covarianza para encontrar los nuevos componentes, lo cual requiere una librería de álgebra lineal.</span>
            </div>
        </div>
    `;
}

function clearPca() {
    document.getElementById('pcaInput').value = '';
    document.getElementById('pcaResult').innerHTML = '';
}

function loadPcaExample() {
    document.getElementById('pcaInput').value = "2.5, 2.4, 1.5\n0.5, 0.7, 0.3\n2.2, 2.9, 1.8\n1.9, 2.2, 1.2\n3.1, 3.0, 2.1";
}
