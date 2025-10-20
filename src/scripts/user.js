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

// Wire up close behavior for any modal close buttons
document.querySelectorAll('.close_button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modalEl = btn.closest('.modal');
        if (modalEl) {
            modalEl.style.display = 'none';
        }
    });
});

// Allow clicking on backdrop (outside the form) to close the modal
document.querySelectorAll('.modal').forEach((modalEl) => {
    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
            modalEl.style.display = 'none';
        }
    });
});

// Close any open modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach((m) => {
            if (getComputedStyle(m).display !== 'none') {
                m.style.display = 'none';
            }
        });
    }
});
});
let modal;
const changePasswordButton = document.getElementById('changePasswordButton');
changePasswordButton.addEventListener('click', () => {
    // Show the modal
    modal = document.getElementById('change_password_modal');
    modal.style.display = 'flex';
});
const deleteAccountButton = document.getElementById('deleteAccountButton');
deleteAccountButton.addEventListener('click', () => {
    // Show the modal
    modal = document.getElementById('delete_user_modal');
    modal.style.display = 'flex';
});

const confirmRemovalButton = document.getElementById('removalButton');
confirmRemovalButton.addEventListener('click', (e) => {
    // Prevent form submission/page reload
    e.preventDefault();
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

function checkNewPassword(newPass, checkPass) {
    if (newPass === '' || checkPass === '') {
        alert('Enter New Password')
        return false;
    } else if (newPass !== checkPass) {
        alert("Passwords Don't Match")
        return false;
    } else {
        return true;
    }
}
function changePassword(email, password, newPass, checkPass) {
    if (checkNewPassword(newPass, checkPass) === false) {
        return
    }
    for (const user of currentList.list) {
        if (user.email === email) {
            if (user.password === password) {
                user.password = newPass;
                localStorage.setItem('priorUser', JSON.stringify(user));
                localStorage.setItem('myUserList', JSON.stringify(currentList.list));
                location.reload();
                return;
            } else {
                alert('Current Password Incorrect');
                return;
            }
        }
    }
    alert('Account does not exist');
}

const changePassSubmit = document.getElementById('changePassSubmit');
changePassSubmit.addEventListener('click', (e) => {
    // Prevent form submission/page reload
    e.preventDefault();
    const email = document.getElementById("changePassEmail").value;
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const conPassword = document.getElementById('conPassword').value;
    changePassword(email, oldPassword, newPassword, conPassword);
});