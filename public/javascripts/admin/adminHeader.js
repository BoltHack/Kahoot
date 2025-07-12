const socket = io();

socket.on('connect', () => {
    if (localStorage.getItem('token')) {
        if (typeof socket !== "undefined" && sendId) {
            socket.emit('registerUser', sendId);
            console.log(`Пользователь ${sendId} зарегистрирован`);
        }
        else {
            console.error(`Friend socket or sendId is not defined.`);
        }
    }
});

const dropdownContents = document.querySelectorAll('.dropdown-content');
const dropdownTitles = document.querySelectorAll('.dropdown-title');
const dropdown = document.querySelectorAll('.dropdown');

dropdown.forEach((title, index) => {
    title.addEventListener('mouseover', () => {
        dropdownContents[index].style.display = 'flex';
        dropdownContents[index].style.transform = 'scaleY(1)';
        dropdownTitles[index].querySelector('span').style.transform = 'rotate(0)';
        dropdownTitles[index].style.backgroundColor = '#303740';
    });

    title.addEventListener('mouseout', () => {
        dropdownContents[index].style.display = 'none';
        dropdownContents[index].style.transform = 'scaleY(0)';
        dropdownTitles[index].querySelector('span').style.transform = 'rotate(90deg)';
        dropdownTitles[index].style.backgroundColor = '#1C2025';
    });
});

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

socket.on('updateRole', () => {
    console.log('update');
    getRefreshTokens();
    setTimeout(() => window.location.reload(), 500);
});