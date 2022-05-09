const loginForm = document.getElementById('login-form');
const btnToShowReg = document.getElementById('show-reg');
const regForm = document.getElementById('reg-form');
const btnToShowLogin = document.getElementById('show-login');

loginForm.addEventListener( 'submit', evt => {
    evt.preventDefault();
    // validate login credentials
    // loggedIn = true;
    window.location.href = "open.html";
});

btnToShowReg.addEventListener( 'click', evt => {
    evt.preventDefault();
    loginForm.style.display = "none";
    regForm.style.display = "flex";
});

regForm.addEventListener( 'submit', evt => {
    evt.preventDefault();
    // validate reg credentials
    alert("Sign up works too!");
});

btnToShowLogin.addEventListener( 'click', evt => {
    evt.preventDefault();
    regForm.style.display = "none";
    loginForm.style.display = "flex";
});