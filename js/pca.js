function calculatePca() {
    const input = document.getElementById('pcaInput').value.trim();
    if (!input) {
        alert('Por favor ingresa una matriz de datos');
        return;
    }

    // --- 1. Parseo de los datos ---
    let data;
    try {
        data = input.split('\n').map((row, i) => {
            const cols = row.split(',').map(v => parseFloat(v.trim()));
            if (cols.some(isNaN)) {
                throw new Error(`La fila ${i + 1} contiene valores no numéricos.`);
            }
            return cols;
        }).filter(row => row.length > 0);
    } catch (e) {
        alert(e.message);
        return;
    }

    if (data.length < 2) {
        alert('Se necesitan al menos 2 observaciones (filas)');
        return;
    }
    
    const nRows = data.length;
    const nCols = data[0].length;

    if (nCols < 2) {
        alert('Se necesitan al menos 2 variables (columnas) para PCA');
        return;
    }
    for (let i = 1; i < data.length; i++) {
        if (data[i].length !== nCols) {
            alert(`Error: La fila ${i + 1} tiene ${data[i].length} columnas, pero la fila 1 tiene ${nCols}. Todas las filas deben tener el mismo número de columnas.`);
            return;
        }
    }
    
    const rowLabels = Array.from({ length: nRows }, (_, i) => `Obs ${i + 1}`);
    const colLabels = Array.from({ length: nCols }, (_, i) => `Var ${i + 1}`);
    const pcLabels = Array.from({ length: nCols }, (_, i) => `PC ${i + 1}`);


    // --- 2. Estandarización ---
    const means = Array(nCols).fill(0);
    const stdDevs = Array(nCols).fill(0);

    for (let j = 0; j < nCols; j++) {
        let sum = 0;
        for (let i = 0; i < nRows; i++) {
            sum += data[i][j];
        }
        means[j] = sum / nRows;
    }

    for (let j = 0; j < nCols; j++) {
        let sumSqDiff = 0;
        for (let i = 0; i < nRows; i++) {
            sumSqDiff += Math.pow(data[i][j] - means[j], 2);
        }
        stdDevs[j] = Math.sqrt(sumSqDiff / (nRows - 1));
        if (stdDevs[j] === 0) {
            alert(`Error: La variable ${colLabels[j]} tiene desviación estándar 0. No se puede continuar.`);
            return;
        }
    }

    const standardizedData = data.map(row => 
        row.map((val, j) => (val - means[j]) / stdDevs[j])
    );
    const standardizedMatrix = math.matrix(standardizedData);
    
    // --- 3. Matriz de Correlación ---
    let correlationMatrix = math.multiply(
        math.transpose(standardizedMatrix),
        standardizedMatrix
    );
    correlationMatrix = math.multiply(correlationMatrix, 1 / (nRows - 1));

    // --- 4. Eigen-descomposición ---
    let eig;
    try {
        eig = math.eigs(correlationMatrix);
    } catch (error) {
        alert("Error al calcular los eigenvalores. Error: " + error.message);
        return;
    }

    const eigenvalues = eig.values.toArray();
    const eigenvectorsMatrix = eig.eigenvectors; 

    // --- 5. Ordenar resultados ---
    const n = eigenvalues.length;
    let pairs = [];
    
    for (let i = 0; i < n; i++) {
        let vector;
        
        // Verificamos que el eigenvectorsMatrix es un array de objetos {value, vector}
        if (Array.isArray(eigenvectorsMatrix) && eigenvectorsMatrix[i].vector) {
            vector = eigenvectorsMatrix[i].vector;
            if (vector.toArray) {
                vector = vector.toArray();
            }
            if (Array.isArray(vector[0])) {
                vector = vector.flat();
            }
        } else {
            try {
                const col = math.column(eigenvectorsMatrix, i);
                vector = col.toArray ? col.toArray().flat() : col;
            } catch (e) {
                // Si falla, intentar acceder como array 2D
                const eigArray = eigenvectorsMatrix.toArray ? eigenvectorsMatrix.toArray() : eigenvectorsMatrix;
                vector = eigArray.map(row => row[i]);
            }
        }
        
        pairs.push({
            value: eigenvalues[i],
            vector: vector
        });
    }
    
    pairs.sort((a, b) => b.value - a.value);

    // --- 6. Calculo de la varianza  ---
    const allSortedEigenvalues = pairs.map(p => p.value);
    const allSortedEigenvectors = pairs.map(p => p.vector); 

    const totalEigenvalue = allSortedEigenvalues.reduce((a, b) => a + b, 0);
    const variancePercent = allSortedEigenvalues.map(v => (v / totalEigenvalue) * 100);
    
    const cumulativePercent = [];
    variancePercent.reduce((acc, val, i) => {
        cumulativePercent[i] = acc + val;
        return acc + val;
    }, 0);

    const eigenvaluesTableData = allSortedEigenvalues.map((val, i) => [
        val,
        variancePercent[i],
        cumulativePercent[i]
    ]);

    // --- 7. REDUCCIÓN A 2D ---
    const nComps = 2;

    // Cortamos vectores/valores a nComps
    const topEigenvectors = allSortedEigenvectors.slice(0, nComps); // [2 x nCols]
    const topPcLabels = pcLabels.slice(0, nComps); // [PC 1, PC 2]
    const varianceForChart = variancePercent.slice(0, nComps);

    // Creación la matriz de proyección (nCols x 2)
    const projectionMatrix = math.transpose(math.matrix(topEigenvectors));

    // --- 8. Tabla scores ---
    // El resultado es [nRows x 2]
    const scoresMatrix = math.multiply(standardizedMatrix, projectionMatrix);
    const scores = scoresMatrix.toArray();

    const resultDiv = document.getElementById('pcaResult');
    
    // Transponer Eigenvectores para la tabla (nCols x 2)
    const eigenvectorsTableData = math.transpose(math.matrix(topEigenvectors)).toArray();

    resultDiv.innerHTML = `
        <h3 class="results-header">Resumen de Varianza (Eigenvalores)</h3>
        <p>Muestra cuánta de la información total es capturada por los primeros componentes.</p>
        ${createPcaHtmlTable(eigenvaluesTableData, ["Eigenvalor", "% de Varianza", "% Acumulado"], pcLabels)}

        <h3 class="results-header">Loadings (Cargas de los Componentes)</h3>
        <p>Muestra cómo cada variable original contribuye a los nuevos ejes PC1 y PC2.</p>
        ${createPcaHtmlTable(eigenvectorsTableData, topPcLabels, colLabels)}
        
        <h3 class="results-header">Scores (Nuevas coordenadas 2D)</h3>
        <p>Las coordenadas de cada observación en el nuevo espacio de PC1 y PC2.</p>
        ${createPcaHtmlTable(scores, topPcLabels, rowLabels)}

        <details class="calculation-steps">
            <summary>Mostrar/Ocultar Pasos de Cálculo Intermedios</summary>
            
            <p><strong>1. Datos Estandarizados ( (x - media) / sd )</strong></p>
            ${createPcaHtmlTable(standardizedData, colLabels, rowLabels)}

            <p><strong>2. Matriz de Correlación (Covarianza de datos estandarizados)</strong></p>
            ${createPcaHtmlTable(correlationMatrix.toArray(), colLabels, colLabels)}
        </details>
    `;
    

    renderPcaChart(scores, varianceForChart, topPcLabels, rowLabels);
}


function createPcaHtmlTable(data, headers = [], rowLabels = []) {
    let table = '<table class="results-table">';

    // Encabezados de Columna
    if (headers.length > 0) {
        table += '<thead><tr>';
        // Celda vacía para etiquetas de fila
        if (rowLabels.length > 0) table += '<th>Variable / Componente</th>';

        headers.forEach(h => table += `<th>${h}</th>`);
        table += '</tr></thead>';
    }
    
    // Cuerpo de la tabla
    table += '<tbody>';
    data.forEach((row, i) => {
        table += '<tr>';
        if (rowLabels.length > 0) table += `<th>${rowLabels[i]}</th>`; 
        
        // Formatear números en la fila
        row.forEach(cell => {
            let val = (typeof cell === 'number') ? cell.toFixed(4) : cell;
            table += `<td>${val}</td>`;
        });
        
        table += '</tr>';
    });
    table += '</tbody>';
    
    table += '</table>';
    return table;
}

function renderPcaChart(scores, variancePercent, pcLabels, rowLabels) {
    const ctx = document.getElementById('pcaChart').getContext('2d');
    
    if (window.myPcaChart) {
        window.myPcaChart.destroy();
    }

    const dataPoints = scores.map((row, i) => ({
        x: row[0],
        y: row[1],
        label: rowLabels[i] // Etiqueta para el tooltip
    }));

    window.myPcaChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Observaciones (Scores)',
                data: dataPoints,
                backgroundColor: 'rgba(0, 86, 156, 0.7)', 
                borderColor: 'rgba(0, 86, 156, 1)',
                borderWidth: 1,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            
            plugins: {
                title: {
                    display: true,
                    text: 'Proyección PCA de 2 Componentes',
                    font: {
                        size: 18
                    },
                    padding: 20
                },
                legend: {
                    display: false // Ocultar la leyenda ya que solo hay 1 dataset
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.dataset.data[context.dataIndex];
                            let label = point.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += `(${point.x.toFixed(3)}, ${point.y.toFixed(3)})`;
                            return label;
                        }
                    }
                }
            },
            
            scales: {
                x: { 
                    title: {
                        display: true,
                        text: `${pcLabels[0]} (${variancePercent[0].toFixed(2)}%)`
                    }
                },
                y: { 
                    title: {
                        display: true,
                        text: `${pcLabels[1]} (${variancePercent[1].toFixed(2)}%)`
                    }
                }
            }
        }
    });
}


function loadPcaExample() {
    document.getElementById('pcaInput').value = 
`2.5, 2.4, 1.5, 4.0
0.5, 0.7, 0.3, 1.0
2.2, 2.9, 1.8, 3.5
1.9, 2.2, 1.2, 2.0
3.1, 3.0, 2.1, 5.0
1.0, 1.1, 0.8, 1.2
1.5, 2.0, 1.0, 2.5`;
}


function clearPca() {
    document.getElementById('pcaInput').value = '';
    document.getElementById('pcaResult').innerHTML = '';
    if (window.myPcaChart) {
        window.myPcaChart.destroy();
    }
}