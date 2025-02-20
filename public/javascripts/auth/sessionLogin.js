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

    let loginErr = document.getElementById('loginErr');
    let loginForm = document.getElementById('loginForm');
    let email = document.getElementById('email');
    let pwd = document.getElementById('pwd');

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

        if (!email.value || !pwd.value) {
            local === 'ru' ? errorMenu('Пожалуйста, заполните все поля') : errorMenu('Please fill in all fields');
            email.style.border = '1px solid #780000';
            pwd.style.border = '1px solid #780000';
            return;
        }

        let loginInfo = {
            email: loginForm.elements['email'].value,
            password: loginForm.elements['password'].value
        };

        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                const ip = data.ip;
                // document.cookie = `ip=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
                // document.cookie = `ip=${encodeURIComponent(ip)}; max-age=${24 * 60 * 60}`;

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
                            errorMenu(error)
                            email.style.border = '1px solid #780000';
                            pwd.style.border = '1px solid #780000';
                            return;
                        }

                        if (token) {
                            local === 'en' ? successMenu('Successful login!') : successMenu('Успешный вход!');
                            email.style.border = '1px solid #0d2818';
                            pwd.style.border = '1px solid #0d2818';
                            localStorage.setItem('token', token);
                            localStorage.setItem('name', user.name);
                            localStorage.setItem('profileImage', 'data:image/png;base64,' + user.image);
                            localStorage.setItem('id', user._id);
                            localStorage.setItem('ip', user.ip);
                            localStorage.setItem('ref', 'refMain');
                            localStorage.setItem('favorites', JSON.stringify(user.favorites));
                            const checkbox = document.getElementById('rememberMeCheckbox');
                            if (checkbox.checked){
                                localStorage.setItem('session', 'true');
                            }
                            else{
                                localStorage.setItem('session', 'false');
                            }
                            setTimeout(function () {
                                window.location.href = `/`;
                                setTimeout(function () {
                                    window.location.reload();
                                }, 500);
                            }, 1000);
                        }
                    });
            });
    });
})

document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
});