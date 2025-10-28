function showTab(tabId, element) {
    // Ocultar contenido del tab q no este
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // Quitar 'active' de todas las pestañas
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Mostrar el contenido de la pestaña seleccionada
    document.getElementById(tabId).classList.add('active');
    
    // Añadir 'active' a la pestaña en la que se hizo clic
    element.classList.add('active');
}