document.addEventListener('DOMContentLoaded', function (){
    let registerButton = document.getElementById('registerButton');
    let loginForm = document.getElementById('loginForm');
    let name = document.getElementById('name');
    let email = document.getElementById('email');
    let pwd = document.getElementById('pwd');
    let cpwd = document.getElementById('cpwd');
    let loaderButton = document.getElementById('loaderButton');

    registerButton.addEventListener('click', (evt) => {
        evt.preventDefault();

        registerButton.hidden = true;
        loaderButton.hidden = false;

        if (!name.value || !email.value || !pwd.value || !cpwd.value) {
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
            name.style.border = '3px solid #780000';
            email.style.border = '3px solid #780000';
            pwd.style.border = '3px solid #780000';
            cpwd.style.border = '3px solid #780000';
            registerButton.hidden = false;
            loaderButton.hidden = true;
            return;
        }

        let registerInfo = {
            email: loginForm.elements['email'].value,
            name: loginForm.elements['name'].value,
            password: loginForm.elements['password'].value,
            confirmPassword: loginForm.elements['confirmPassword'].value
        };

        fetch('https://api.ipify.org?format=json')
        // fetch('http://ipwho.is/')
            .then(response => response.json())
            .then(data => {
                const ip = data.ip;
                // const userData = [data];

                // document.cookie = `ip=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
                // document.cookie = `ip=${encodeURIComponent(ip)}; max-age=${24 * 60 * 60}`;

                // fetch(`/auth/register/${ip}/${encodeURIComponent(JSON.stringify(userData))}`, {
                fetch(`/auth/register/${ip}`, {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(registerInfo)
                }).then(res => res.json())
                    .then(data => {
                        const {error} = data;
                        if (error) {
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
                            name.style.border = '3px solid #780000';
                            email.style.border = '3px solid #780000';
                            pwd.style.border = '3px solid #780000';
                            cpwd.style.border = '3px solid #780000';
                            registerButton.hidden = false;
                            loaderButton.hidden = true;
                            return;
                        }
                        Swal.fire({
                            text: localeType === 'en' ? 'Successful registration!' : 'Успешная регистрация!',
                            icon: "success",
                            position: "top-end",
                            timer: 2000,
                            showConfirmButton: false,
                            toast: true,
                            customClass: {
                                popup: "small-alert"
                            }
                        });
                        name.style.border = '1px solid #0d2818';
                        email.style.border = '1px solid #0d2818';
                        pwd.style.border = '1px solid #0d2818';
                        cpwd.style.border = '1px solid #0d2818';
                        registerButton.hidden = false;
                        loaderButton.hidden = true;
                        fetch('/acceptCookies/true', {
                            method: 'POST'
                        })
                        setTimeout(function () {
                            window.location.href = `/auth/login`;
                            setTimeout(function () {
                                window.location.reload();
                            }, 500);
                        }, 1000);
                    });
            });

    });
});


let isVisible  = false;

function togglePassword() {
    const pwd = document.getElementById('pwd');
    const cpwd = document.getElementById('cpwd');
    const eye = document.getElementById('tp');

    isVisible  = !isVisible ;

    pwd.type = isVisible ? 'text' : 'password';
    cpwd.type = isVisible ? 'text' : 'password';
    eye.setAttribute('data-lucide', isVisible ? 'eye' : 'eye-off');
    lucide.createIcons();
}

lucide.createIcons();

document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
});