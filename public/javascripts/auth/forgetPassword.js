fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        const ip = data.ip;
        const form = document.getElementById('passwordResetForm');
        form.action = `/auth/send-email/${ip}`;
    });