document.addEventListener('DOMContentLoaded', function (){
    const togglePassword1 = document.getElementById('togglePassword1');
    const togglePassword2 = document.getElementById('togglePassword2');
    let passwordField = document.getElementById('pwd');
    let passwordFieldType = passwordField.getAttribute('type');
    togglePassword1.addEventListener('click', function () {
        if (passwordFieldType === 'password') {
            passwordField.setAttribute('type', 'text');
            togglePassword2.hidden = false;
            togglePassword1.hidden = true;
        }
    })
    togglePassword2.addEventListener('click', function () {
        if (passwordFieldType === 'password') {
            passwordField.setAttribute('type', 'password');
            togglePassword2.hidden = true;
            togglePassword1.hidden = false;
        }
    });

    let loginButton = document.getElementById('loginButton');
    let loginForm = document.getElementById('loginForm');
    let email = document.getElementById('email');
    let pwd = document.getElementById('pwd');
    let loaderButton = document.getElementById('loaderButton');

    loginForm.addEventListener('input', () => {
        if (email.value !== '' && pwd.value !== ''){
            loginButton.style.backgroundColor = '#0653c7';
        }
        else{
            loginButton.style.backgroundColor = '#2879f3';
        }
    })

    const local = localStorage.getItem('local');

    loginButton.addEventListener('click', (ev) => {
        ev.preventDefault();

        loginButton.hidden = true;
        loaderButton.hidden = false;

        if (!email.value || !pwd.value) {
            // local === 'ru' ? errorMenu('Пожалуйста, заполните все поля') : errorMenu('Please fill in all fields');
            Swal.fire({
                text: local === 'ru' ? 'Пожалуйста, заполните все поля' : 'Please fill in all fields',
                icon: "error",
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                customClass: {
                    popup: "small-alert"
                }
            });
            email.style.border = '1px solid #780000';
            pwd.style.border = '1px solid #780000';
            loginButton.hidden = false;
            loaderButton.hidden = true;
            return;
        }

        let loginInfo = {
            email: loginForm.elements['email'].value,
            password: loginForm.elements['password'].value
        };

        fetch('https://api.ipify.org?format=json')
        // fetch('http://ipwho.is/')
            .then(response => response.json())
            .then(data => {
                const ip = data.ip;

                fetch(`/auth/login/${ip}`, {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(loginInfo)
                }).then(res => res.json())
                    .then(data => {
                        let {error, token, user} = data;
                        if (error) {
                            console.log('error', error)
                            // errorMenu(error)
                            Swal.fire({
                                text: error,
                                icon: "error",
                                position: "top-end",
                                timer: 2000,
                                showConfirmButton: false,
                                toast: true,
                                customClass: {
                                    popup: "small-alert"
                                }
                            });
                            email.style.border = '1px solid #780000';
                            pwd.style.border = '1px solid #780000';
                            loginButton.hidden = false;
                            loaderButton.hidden = true;
                            return;
                        }

                        if (token) {
                            // local === 'en' ? alert('Successful login!') : alert('Успешный вход!');
                            Swal.fire({
                                text: 'Успешный вход',
                                icon: "success",
                                position: "top-end",
                                timer: 2000,
                                showConfirmButton: false,
                                toast: true,
                                customClass: {
                                    popup: "small-alert"
                                }
                            });
                            email.style.border = '1px solid #0d2818';
                            pwd.style.border = '1px solid #0d2818';
                            loginButton.hidden = false;
                            loaderButton.hidden = true;
                            localStorage.setItem('token', token);
                            localStorage.setItem('name', user.name);
                            const checkbox = document.getElementById('rememberMeCheckbox');
                            if (checkbox.checked){
                                localStorage.setItem('session', 'true');
                            }
                            else{
                                localStorage.setItem('session', 'false');
                            }
                            localStorage.setItem('ref', 'refMain');
                            setTimeout(function () {
                                window.location.href = `/`;
                                setTimeout(function () {
                                    window.location.reload();
                                }, 500);
                            }, 1000);
                        }
                    });
            })
    });
})

document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
});