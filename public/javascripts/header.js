const socket = io();
document.addEventListener("DOMContentLoaded", () => {
    try {
        if (localStorage.getItem('token')) {
            if (typeof socket !== "undefined" && sendId) {
                socket.emit('requestMyFriendsCount', sendId);
            } else {
                console.error(`Socket or sendId is not defined.`);
                showToast('error', localeType === 'en' ? "There was an error in the site. Restoring..." : 'Возникла ошибка в работе сайта. Идёт восстановление...');
                setTimeout(function () {
                    window.location.reload();
                }, 5000);
            }
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
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


function checkGamePath(){
    if (!window.location.pathname.startsWith('/game/') && sessionStorage.getItem('gamePage') === 'true'){
        sessionStorage.setItem('gamePage', 'false');
    }
}
checkGamePath();

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


function authMenu() {
    const authBorder = document.getElementById('authBorder');
    const barrier = document.getElementById('barrier');
    const closeAuthBorder = document.getElementById('closeAuthBorder');

    const mainPage = window.location.pathname;

    authBorder.hidden = false;
    barrier.hidden = false;
    document.body.style.overflowY = 'hidden';

    closeAuthBorder.addEventListener('click', () => {
        authBorder.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = mainPage !== '/' ? 'auto' : 'hidden';

    })
    barrier.addEventListener('click', () => {
        authBorder.hidden = true;
        barrier.hidden = true;
        document.body.style.overflowY = mainPage !== '/' ? 'auto' : 'hidden';
    })
}

function mediaMenu() {
    const mediaBorder = document.getElementById('mediaBorder');
    const closeMediaBorder = document.getElementById('closeMediaBorder');

    mediaBorder.style.display = 'block';

    closeMediaBorder.addEventListener('click', () => {
        mediaBorder.style.display = 'none';
    });
}

function findGame() {
    if (localStorage.getItem('token')) {
        const barrier = document.getElementById('barrier');
        const border = document.getElementById('border');
        const close = document.getElementById('close');

        barrier.hidden = false;
        border.hidden = false;
        document.body.style.overflow = 'hidden';

        barrier.addEventListener('click', () => {
            barrier.hidden = true;
            border.hidden = true;
        })
        close.addEventListener('click', () => {
            barrier.hidden = true;
            border.hidden = true;
        })
    }
    else {
        authMenu();
    }
}


function redirectPage(page){
    const menus = JSON.parse(sessionStorage.getItem('menus') || '{}');
    if (localStorage.getItem('token')) {
        if (page === '/channels/@me') {
            menus.friendsContainerMenu = 'true';
            menus.addFriendMenu = 'false';
            sessionStorage.setItem('menus', JSON.stringify(menus));
            window.location.href = page;
        }
        else {
            window.location.href = page;
        }
    }
    else {
        authMenu();
    }
}