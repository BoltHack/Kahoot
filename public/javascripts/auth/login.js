document.addEventListener('DOMContentLoaded', function (){
    let loginButton = document.getElementById('loginButton');
    let loginForm = document.getElementById('loginForm');
    let email = document.getElementById('email');
    let pwd = document.getElementById('pwd');
    let loaderButton = document.getElementById('loaderButton');

    loginButton.addEventListener('click', (ev) => {
        ev.preventDefault();

        loginButton.hidden = true;
        loaderButton.hidden = false;

        if (!email.value || !pwd.value) {
            showToast('error', localeType === 'ru' ? 'Пожалуйста, заполните все поля' : 'Please fill in all fields')
            email.style.border = '3px solid #780000';
            pwd.style.border = '3px solid #780000';
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
                document.cookie = `ip=${ip}; max-age=${10 * 24 * 60 * 60}; path=/;`;

                fetch(`/auth/login/${ip}`, {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(loginInfo)
                }).then(res => res.json())
                    .then(data => {
                        let {error, token, user, previousPage} = data;
                        if (error) {
                            console.log('error', error);
                            showToast('error', error);
                            email.style.border = '3px solid #780000';
                            pwd.style.border = '3px solid #780000';
                            loginButton.hidden = false;
                            loaderButton.hidden = true;
                            return;
                        }

                        if (token) {
                            showToast('success', localeType === 'en' ? 'Successful login!' : 'Успешный вход!');
                            email.style.border = '3px solid #0d2818';
                            pwd.style.border = '3px solid #0d2818';
                            loginButton.hidden = false;
                            loaderButton.hidden = true;
                            localStorage.setItem('token', token);
                            localStorage.setItem('userInfo', JSON.stringify({
                                'id': user._id,
                                'name': user.name
                            }));
                            const checkbox = document.getElementById('rememberMeCheckbox');
                            if (checkbox.checked){
                                localStorage.setItem('session', 'true');
                            }
                            else{
                                localStorage.setItem('session', 'false');
                            }
                            setTimeout(function () {
                                if (previousPage) {
                                    window.location.href = previousPage;
                                    return;
                                }
                                window.location.href = `/`;
                            }, 1000);
                        }
                    });
            })
    });
});

let isVisible  = false;

function togglePassword() {
    const pwd = document.getElementById('pwd');
    const showPassword = document.getElementById('showPassword');
    const hidePassword = document.getElementById('hidePassword');

    isVisible  = !isVisible ;

    pwd.type = isVisible ? 'text' : 'password';
    if (isVisible) {
        showPassword.hidden = true;
        hidePassword.hidden = false;
    } else {
        showPassword.hidden = false;
        hidePassword.hidden = true;
    }
}

document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
});