'use strict';

/**
 * Muestra una pestaña de contenido y oculta las demás.
 * @param {string} tabId - El ID del contenido de la pestaña a mostrar.
 * @param {HTMLElement} element - El elemento (botón) de la pestaña en el que se hizo clic.
 */
function showTab(tabId, element) {
    // Ocultar todo el contenido
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