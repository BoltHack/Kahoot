// const isoDate = deleteDate;
// const date = new Date(isoDate);
// const options = { year: 'numeric', month: 'long', day: 'numeric' };
// const formattedDate = date.toLocaleDateString(localeType === 'en' ? 'en-US' : 'ru-RU', options);

// document.getElementById('countdown').innerHTML = `
//     <span>${formattedDate}</span>
//     <span>${date.getDate().toString().padStart(2, '0').(date.getMonth() + 1).toString().padStart(2, '0').date.getFullYear()}</p>
//     `;

function formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    const longDate = date.toLocaleDateString(localeType === 'en' ? 'en-US' : 'ru-RU', options);
    const shortDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;

    return { longDate, shortDate };
}

const { longDate, shortDate } = formatDate(deleteDate);

document.getElementById('countdown').innerHTML = `
    <span>${longDate}</span>
    <span>${shortDate}</span>
`;

function restoreAccount() {
    const btnS = document.querySelectorAll('.btn-s');
    btnS.forEach(btn => {
        btn.querySelector('.btn').style.display = 'none';
        btn.querySelector('.load-btn').style.display = 'inline-flex';
    });

    fetch('/auth/account-restore',{
        method: "POST",
        headers: {
            'Content-type': 'application/json'
        },
    }).then(res => res.json)
        .then(data => {
            const {error} = data;
            if (error) {
                showToast('error', error);
            } else {
                window.location.reload();
            }
        }).catch(error => {
        console.error('Ошибка:', error);
    });
}


function logout() {
    fetch('/auth/logout', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => res.json()).then((res) => {
        const {status, error} = res;
        if (error) {
            console.log('Ошибка выхода', error);
            return;
        }

        if (status) {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            localStorage.removeItem('session');
            localStorage.removeItem('sessionEndTime');
            window.location.href = "/auth/login";
            return;
        }
    });
}

document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
});