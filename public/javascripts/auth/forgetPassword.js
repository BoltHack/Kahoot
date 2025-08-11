document.addEventListener('DOMContentLoaded', function () {
    const findEmailBtn = document.getElementById('findEmailBtn');
    const loaderButton = document.getElementById('loaderButton');
    const email = document.getElementById('email');

    findEmailBtn.addEventListener('click', (event) => {
        event.preventDefault();

        loaderButton.hidden = false;
        findEmailBtn.hidden = true;

        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(async data => {
                const ip = data.ip;

                await fetch(`/auth/send-email/${ip}`, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded'
                    },
                    body: `email=${encodeURIComponent(email.value)}`
                })
                    .then(res => res.json())
                    .then(data => {
                        let {error} = data;
                        if (error) {
                            loaderButton.hidden = true;
                            findEmailBtn.hidden = false;
                            showToast('error', error);
                        } else {
                            setTimeout(function () {
                                window.location.href = '/auth/account-recovery';
                            }, 500);
                        }
                    })
            });
    });
});

document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
});