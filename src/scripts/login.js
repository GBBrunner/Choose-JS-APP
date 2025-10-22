import {createFooter} from './header.js';
let currentList;

document.addEventListener('DOMContentLoaded', () => {
    // Create the header dynamically
    createFooter();
    
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
        signupButton.addEventListener('click', (e) => {
            // Prevent default form submission if this button is inside a <form>
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value.toLowerCase();
            const password = document.getElementById('password').value;
            if (firstName === '' || lastName === '' || email === '' || password === '') {
                alert('Please fill in all fields');
                return;
            }
            if (password.length < 8) {
                alert('Password must be at least 8 characters long');
                return;
            }
            logNewUser(firstName, lastName, email, password);
            window.location.href = '../../index.html';
        });
    }

    if (loginButton) {
        loginButton.addEventListener('click', (e) => {
            // Prevent default form submission if this button is inside a <form>
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            const loginEmail = document.getElementById('loginEmail').value.toLowerCase();
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
    constructor(first, last, email, password, joined) {
        this.firstName = first;
        this.lastName = last;
        this.email = email;
        this.password = password;
        this.joined = joined;
    }

    save() {
        localStorage.setItem('priorUser', JSON.stringify({
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            password: this.password,
            joined: this.joined
        }));
    }
}
function getUserDate() {
    const d = new Date();
    const Day = JSON.stringify(d.getDate());
    const Month = JSON.stringify(d.getMonth() + 1);
    const Year = JSON.stringify(d.getFullYear());
    let Hour = JSON.stringify(d.getHours());
    let Minute = JSON.stringify(d.getMinutes());
    let timeOfDay = 'AM'
    if (Minute.length < 2) {
        Minute = '0' + Minute;
    }
    if (Number(Hour) > 12) {
        Hour = String(Hour - 12);
        timeOfDay = 'PM'
    }
    const myDate = `${Month}/${Day}/${Year} at ${Hour}:${Minute} ${timeOfDay}`;
    return myDate;
}

function logNewUser(first, last, email, password) {
    const checkThisUser = new User(first, last, email, password, getUserDate());
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


const logIn = (email, password) => {
    const user = currentList.list.find(user => user.email === email);
    if (!user) {
        alert('Account does not exist');
        return;
    }
    if (user.password !== password) {
        alert('Password Incorrect');
        return;
    }
    new User(user.firstName, user.lastName, user.email, user.password, user.joined).save();
    window.location.href = '../../index.html';
};
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
export {currentList};