let currentList;

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const navBar = document.createElement('div');
    navBar.classList.add('nav-bar');
    let checkList = JSON.parse(localStorage.getItem('myUserList'));

if (checkList) {
    currentList = new UserList();
    currentList.list = checkList;
} else {
    currentList = new UserList();
}

let userCheck = localStorage.getItem('priorUser');
userCheck = JSON.parse(userCheck);
console.log(userCheck);
if (userCheck === null) {
        navBar.innerHTML = `
        <h1>Movie Site</h1>

        <a href='login.html'>Login</a>
    `;
    } else {
    navBar.innerHTML = `
        <h1>Movie Site</h1>

        <a href='#'>Hello ${userCheck.firstName}</a>
    `;
    }
    nav.appendChild(navBar);
});

function logOut() {
    localStorage.removeItem('priorUser');
    location.reload();
}

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
                location.reload();
                return;
            } else {
                alert('Password Incorrect');
                return;
            }
        }
    }
    alert('Account does not exist');
}
// button code
const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');

document.addEventListener('DOMContentLoaded', () => {
    button1.classList.add('active');
    loginForm.classList.remove('inactive');
});

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