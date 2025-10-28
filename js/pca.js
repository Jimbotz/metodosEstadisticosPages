let myPcaChart; // Variable para la instancia del gráfico

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

    // 1. Calcular medias
    const means = Array(nCols).fill(0);
    for (let j = 0; j < nCols; j++) {
        for (let i = 0; i < nRows; i++) {
            means[j] += data[i][j];
        }
        means[j] /= nRows;
    }

    // 2. Centrar datos
    const centered = data.map(row => 
        row.map((val, j) => val - means[j])
    );

    // 3. Calcular matriz de covarianza
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

    // 4. Extraer varianzas y porcentaje
    const variances = covMatrix.map((row, i) => row[i]);
    const totalVariance = variances.reduce((a, b) => a + b, 0);
    const variancePercent = variances.map(v => (v / totalVariance * 100));

    // --- Generación del nuevo HTML ---
    const resultDiv = document.getElementById('pcaResult');
    
    // Formatear la matriz de covarianza para la tabla
    let covTable = `<table class="results-table"><thead><tr><th></th>`;
    for(let j=0; j<nCols; j++) covTable += `<th>Var ${j+1}</th>`;
    covTable += `</tr></thead><tbody>`;
    covMatrix.forEach((row, i) => {
        covTable += `<tr><td>Var ${i+1}</td>`;
        covTable += row.map(val => `<td>${val.toFixed(4)}</td>`).join('');
        covTable += `</tr>`;
    });
    covTable += `</tbody></table>`;
    
    // Formatear la tabla de varianza
    let varTable = `<table class="results-table"><thead><tr><th>Variable</th><th>Varianza</th><th>% de Varianza</th></tr></thead><tbody>`;
    variances.forEach((v, i) => {
        varTable += `<tr><td>Var ${i+1}</td><td>${v.toFixed(4)}</td><td>${variancePercent[i].toFixed(2)}%</td></tr>`;
    });
    varTable += `<tr><td><strong>Total</strong></td><td><strong>${totalVariance.toFixed(4)}</strong></td><td><strong>100.00%</strong></td></tr>`;
    varTable += `</tbody></table>`;
    
    resultDiv.innerHTML = `
        <div class="result-summary">
            <h3 class="results-header">Resumen de varianza</h3>
            <p><strong>Dimensiones:</strong> ${nRows} observaciones × ${nCols} variables</p>
            <p><strong>Varianza total:</strong> ${totalVariance.toFixed(4)}</p>
            ${varTable}
        </div>

        <div>
            <h3 class="results-header">Matriz de varianza-covarianza</h3>
            ${covTable}
        </div>
        <div class="result-summary" style="margin-top: 15px;">
            <p><strong>Nota:</strong> Un PCA completo calcula "Eigenvalores" (varianza de nuevos componentes) a partir de esta matriz. Esta tabla y el gráfico muestran la varianza de las *variables originales*.</p>
        </div>
    `;
    
    // --- Dibujar el gráfico ---
    renderPcaChart(variancePercent);
}

function renderPcaChart(variancePercent) {
    const ctx = document.getElementById('pcaChart').getContext('2d');
    
    if (myPcaChart) {
        myPcaChart.destroy();
    }
    
    const labels = variancePercent.map((_, i) => `Variable ${i+1}`);
    
    myPcaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '% de Varianza Explicada',
                data: variancePercent,
                backgroundColor: 'rgba(94, 33, 41, 0.6)',
                borderColor: 'rgba(94, 33, 41, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: { display: true, text: 'Gráfico de varianza por variable' },
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: '% de Varianza' } 
                }
            }
        }
    });
}

function clearPca() {
    document.getElementById('pcaInput').value = '';
    document.getElementById('pcaResult').innerHTML = '';
    if (myPcaChart) {
        myPcaChart.destroy();
    }
}

function loadPcaExample() {
    document.getElementById('pcaInput').value = "2.5, 2.4, 1.5\n0.5, 0.7, 0.3\n2.2, 2.9, 1.8\n1.9, 2.2, 1.2\n3.1, 3.0, 2.1";
}