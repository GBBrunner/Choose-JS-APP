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
let userDisplay = document.getElementById('userData');
let priorUser = JSON.parse(localStorage.getItem('priorUser'));
if (userDisplay && priorUser) {
    userDisplay.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">User Information</h2>
        <p><strong>First Name:</strong> ${priorUser.firstName}</p>
        <p><strong>Last Name:</strong> ${priorUser.lastName}</p>
        <p><strong>Email:</strong> ${priorUser.email}</p>
        <p>${priorUser.joined}</p>
    `;
}