document.addEventListener('DOMContentLoaded', function () {
    const togglePassword1 = document.getElementById('togglePassword1');
    const togglePassword2 = document.getElementById('togglePassword2');
    let passwordField = document.getElementById('password');
    let confirmPasswordField = document.getElementById('confirmPassword');
    let passwordFieldType = passwordField.getAttribute('type');
    togglePassword1.addEventListener('click', function () {
        if (passwordFieldType === 'password') {
            passwordField.setAttribute('type', 'text');
            confirmPasswordField.setAttribute('type', 'text');
            togglePassword2.hidden = false;
            togglePassword1.hidden = true;
        }
    })
    togglePassword2.addEventListener('click', function () {
        if (passwordFieldType === 'password') {
            passwordField.setAttribute('type', 'password');
            confirmPasswordField.setAttribute('type', 'password');
            togglePassword2.hidden = true;
            togglePassword1.hidden = false;
        }
    });

   const changePasswordForm = document.getElementById('changePasswordForm');
   const changePasswordBtn = document.getElementById('changePasswordBtn');
   const loaderBtn = document.getElementById('loaderBtn');

   const code = document.getElementById('code');
   const password = document.getElementById('password');
   const confirmPassword = document.getElementById('confirmPassword');

    changePasswordBtn.addEventListener('click', (event) => {
        event.preventDefault();

        loaderBtn.hidden = false;
        changePasswordBtn.hidden = true;

        let formData = {
            code: changePasswordForm.elements['code'].value,
            password: changePasswordForm.elements['password'].value,
            confirmPassword: changePasswordForm.elements['confirmPassword'].value,
        }

        fetch('/auth/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(res => res.json())
            .then(data => {
                let {error} = data;
                if (error) {
                    loaderBtn.hidden = true;
                    changePasswordBtn.hidden = false;
                    Swal.fire({
                        text: error,
                        icon: "error",
                        position: "top-end",
                        timer: 4000,
                        showConfirmButton: false,
                        toast: true,
                        customClass: {
                            popup: "small-alert"
                        }
                    });
                    return;
                } else {
                    setTimeout(function () {
                        window.location.href = '/auth/login';
                    }, 500);
                }
            })
    })
});

document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
});