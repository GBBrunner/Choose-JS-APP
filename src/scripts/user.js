import { createHeader } from '/src/scripts/header.js';
document.addEventListener('DOMContentLoaded', () => {
createHeader();
            
// Add logout button functionality
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('priorUser');
        window.location.href = '/index.html';
    });
}
});
