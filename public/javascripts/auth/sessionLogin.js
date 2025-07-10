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

    loginButton.addEventListener('click', (ev) => {
        ev.preventDefault();

        loginButton.hidden = true;
        loaderButton.hidden = false;

        if (!email.value || !pwd.value) {
            Swal.fire({
                text: localeType === 'ru' ? 'Пожалуйста, заполните все поля' : 'Please fill in all fields',
                icon: "error",
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                customClass: {
                    popup: "small-alert"
                }
            });
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
                            email.style.border = '3px solid #780000';
                            pwd.style.border = '3px solid #780000';
                            loginButton.hidden = false;
                            loaderButton.hidden = true;
                            return;
                        }

                        if (token) {
                            Swal.fire({
                                text: localeType === 'en' ? 'Successful login!' : 'Успешный вход!',
                                icon: "success",
                                position: "top-end",
                                timer: 2000,
                                showConfirmButton: false,
                                toast: true,
                                customClass: {
                                    popup: "small-alert"
                                }
                            });
                            email.style.border = '3px solid #0d2818';
                            pwd.style.border = '3px solid #0d2818';
                            loginButton.hidden = false;
                            loaderButton.hidden = true;
                            localStorage.setItem('token', token);
                            localStorage.setItem('userInfo', JSON.stringify({ 'id': user._id, 'name': user.name, 'profileImage': 'data:image/png;base64,' + user.image }));
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