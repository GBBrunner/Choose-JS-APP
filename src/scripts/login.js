import {createHeader} from './header.js';

let currentList;

document.addEventListener('DOMContentLoaded', () => {
    // Create the header dynamically
    createHeader();
    
    let checkList = JSON.parse(localStorage.getItem('myUserList'));

    if (checkList) {
        currentList = new UserList();
        currentList.list = checkList;
    } else {
        currentList = new UserList();
    }

    // Add event listeners for signup and login buttons
    const signupButton = document.getElementById('signupButton');
    const loginButton = document.getElementById('loginButton');

    if (signupButton) {
        signupButton.addEventListener('click', () => {
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            logNewUser(firstName, lastName, email, password);
        });
    }

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const loginEmail = document.getElementById('loginEmail').value;
            const loginPassword = document.getElementById('loginPassword').value;
            logIn(loginEmail, loginPassword);
        });
    }
});

class UserList {
    constructor() {
        this.list = [];
    }
    add(data) {
        this.list.unshift(data);
        localStorage.setItem('myUserList', JSON.stringify(this.list));
    }
}

class User {
    constructor(first, last, email, password) {
        this.firstName = first;
        this.lastName = last;
        this.email = email;
        this.password = password;
    }

    save() {
        localStorage.setItem('priorUser', JSON.stringify({
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            password: this.password
        }));
    }
}
function logNewUser(first, last, email, password) {
    const checkThisUser = new User(first, last, email, password);
    for (const user of currentList.list) {
        if (user.email === checkThisUser.email) {
            alert('A user with this email already exists');
            return;
        }
    }
    const currentUser = checkThisUser;
    currentUser.save();
    currentList.add(currentUser)
    location.reload();
}

function logIn(email, password) {
    for (const user of currentList.list) {
        if (user.email === email) {
            if (user.password === password) {
                const currentUser = new User(user.firstName, user.lastName, user.email, user.password);
                currentUser.save();
                // location.reload();
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
// button code for switching between login and signup forms
document.addEventListener('DOMContentLoaded', () => {
    const button1 = document.getElementById('button1');
    const button2 = document.getElementById('button2');
    const loginForm = document.querySelector('.login-form');
    const signupForm = document.querySelector('.signup-form');

    if (button1 && button2 && loginForm && signupForm) {
        button1.classList.add('active');
        loginForm.classList.remove('inactive');

        button1.addEventListener('click', () => {
            button1.classList.add('active');
            loginForm.classList.remove('inactive');
            button2.classList.remove('active');
        });

        button2.addEventListener('click', () => {
            button2.classList.add('active');
            loginForm.classList.add('inactive');
            button1.classList.remove('active');
        });
    }
});