// import { createHeader } from '/src/scripts/header.js';
import { currentList } from './login';
document.addEventListener('DOMContentLoaded', () => {

            
// Add logout button functionality
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('priorUser');
        window.location.href = '/index.html';
    });
}
});
const deleteAccountButton = document.getElementById('deleteAccountButton');
deleteAccountButton.addEventListener('click', () => {
    // Show the modal
    const modal = document.getElementById('delete_user_modal');
    modal.style.display = 'flex';
});
const confirmRemovalButton = document.getElementById('removalButton');
confirmRemovalButton.addEventListener('click', () => {
    removeAccount(document.getElementById('RemovalEmail').value, document.getElementById('RemovalPassword').value);
});
function removeAccount(email, password) {
    const rEmail = document.getElementById('RemovalEmail').value;
    const rPassword = document.getElementById('RemovalPassword').value;
    for (const user of currentList.list) {
        if (user.email === rEmail) {
            if (user.password === rPassword) {
                localStorage.removeItem('priorUser');
                const index = currentList.list.findIndex(u => u.email === rEmail);
                currentList.list.splice(index, 1);
                localStorage.setItem('myUserList', JSON.stringify(currentList.list));
                window.location.href = '/index.html';
                return;
            } else {
                alert('Password Incorrect');
                return;
            }
        }
    }
    alert('Account does not exist');
}