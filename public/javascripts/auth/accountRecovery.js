document.addEventListener('DOMContentLoaded', function () {
    const changePasswordForm = document.getElementById('changePasswordForm');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const loaderButton = document.getElementById('loaderButton');

    changePasswordBtn.addEventListener('click', (event) => {
        event.preventDefault();

        loaderButton.hidden = false;
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
                    loaderButton.hidden = true;
                    changePasswordBtn.hidden = false;
                    showToast('error', error);
                } else {
                    setTimeout(function () {
                        window.location.href = '/auth/login';
                    }, 500);
                }
            })
    })
});


let isVisible  = false;

function togglePassword() {
    const pwd = document.getElementById('password');
    const cpwd = document.getElementById('confirmPassword');
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