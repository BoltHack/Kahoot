const socket = io();
document.addEventListener("DOMContentLoaded", () => {
    function getCookie(name) {
        const cookies = document.cookie.split('; ');
        const cookie = cookies.find(row => row.startsWith(`${name}=`));
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
    }

    try {
        if (getCookie('refreshTokenEndTime')) {
            if (typeof socket !== "undefined" && sendId) {
                socket.emit('requestMyFriendsCount', sendId);
            } else {
                console.error(`Socket or sendId is not defined.`);
                showToast('error', localeType === 'en' ? "There was an error in the site. Restoring..." : 'Возникла ошибка в работе сайта. Идёт восстановление...', 6000);
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
            localStorage.removeItem('accessTokenEndTime');
            localStorage.removeItem('refreshTokenEndTime');
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
const dropdownOpen = document.querySelectorAll('.dropdown-open');

dropdownOpen.forEach((title, index) => {
    title.addEventListener('mouseover', () => {
        dropdownContents[index].style.display = 'flex';
        dropdownContents[index].style.transform = 'scaleY(1)';
        dropdownTitles[index].querySelector('.dropdown-content-mode').style.transform = 'rotate(0)';
        dropdownTitles[index].style.backgroundColor = '#303740';
    });

    title.addEventListener('mouseout', () => {
        dropdownContents[index].style.display = 'none';
        dropdownContents[index].style.transform = 'scaleY(0)';
        dropdownTitles[index].querySelector('.dropdown-content-mode').style.transform = 'rotate(90deg)';
        dropdownTitles[index].style.backgroundColor = '#1C2025';
    });
});


function authMenu() {
    const authBorder = document.getElementById('authBorder');
    const barrier = document.getElementById('barrier');
    const closeAuthBorder = document.getElementById('closeAuthBorder');

    authBorder.hidden = false;
    barrier.hidden = false;
    disableScroll();

    closeAuthBorder.addEventListener('click', () => {
        authBorder.hidden = true;
        barrier.hidden = true;
        enableScroll();

    });
    barrier.addEventListener('click', () => {
        authBorder.hidden = true;
        barrier.hidden = true;
        enableScroll();
    });
}


function mediaMenu() {
    const checkIcon = document.getElementById('check-icon');
    const mediaBorder = document.getElementById('mediaBorder');

    if (checkIcon.checked) {
        mediaBorder.style.display = 'flex';

        mediaBorder.querySelector('.media-border').classList.remove('closeMediaMenu');
        mediaBorder.querySelector('.media-border').classList.add('openMediaMenu');

        document.querySelector('header').style.position = 'fixed';
        document.querySelector('header').style.zIndex = '100';
    } else {
        mediaBorder.querySelector('.media-border').classList.remove('openMediaMenu');
        mediaBorder.querySelector('.media-border').classList.add('closeMediaMenu');

        setTimeout(() => {
            mediaBorder.style.display = 'none';
            document.querySelector('header').style.position = 'absolute';
            document.querySelector('header').style.zIndex = '1';
        }, 100);

    }
}


function findGame() {
    if (localStorage.getItem('token')) {
        const barrier = document.getElementById('barrier');
        const border = document.getElementById('border');
        const close = document.getElementById('close');

        barrier.hidden = false;
        border.hidden = false;

        barrier.addEventListener('click', () => {
            barrier.hidden = true;
            border.hidden = true;
        })
        close.addEventListener('click', () => {
            barrier.hidden = true;
            border.hidden = true;
        })
        document.getElementById('searchButton').addEventListener('click', () => {
            const infoInput = document.getElementById('infoInput').value;
            if (infoInput !== ''){
                window.location.href = `/game/${infoInput}`;
            }
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


function changeTheme(themeType) {
    console.log('themeType', themeType)

    const formData = new FormData();
    formData.append('darkTheme', themeType);

    fetch(`/changeSettings/notAuth`, {
        method: "POST",
        body: formData
    })
        .then(response => {
            if (response.ok) {
                window.location.reload();
            }
            else {
                response.json().then(errorMessage => {
                    console.log("Ошибка: " + errorMessage);
                });
            }
        })
        .catch(error => {
            console.log('Произошла ошибка при отправке запроса:', error);
            console.log("Произошла ошибка при отправке запроса: " + error.message);
        });
}


// function menuController(menuBorderId, menuCloserId, tokenPresence) {
//     if (tokenPresence === true) {
//         if (!localStorage.getItem('token')) {
//             authMenu();
//             return;
//         }
//     }
//
//     const barrier = document.getElementById('barrier');
//
//     const border = document.getElementById(menuBorderId);
//     const close = document.getElementById(menuCloserId);
//
//     barrier.hidden = false;
//     border.hidden = false;
//     document.body.style.overflow = 'hidden';
//
//     barrier.addEventListener('click', () => {
//         barrier.hidden = true;
//         border.hidden = true;
//     })
//     close.addEventListener('click', () => {
//         barrier.hidden = true;
//         border.hidden = true;
//     })
// }

function hasVerticalScrollbar() {
    return document.documentElement.scrollHeight > document.documentElement.clientHeight;
}

function disableScroll() {
    if (hasVerticalScrollbar()) {
        document.body.style.overflowY = 'hidden';
        document.body.style.userSelect = 'none';
        document.documentElement.classList.add('scroll-bar-off');
    }
}

function enableScroll() {
    document.body.style.overflowY = '';
    document.body.style.userSelect = '';
    document.documentElement.classList.remove('scroll-bar-off');
}

function showUsername() {
    const username = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!sendId || !username.id || sendId.toString() !== username.id.toString()) return;

    document.querySelectorAll('.dropdown-username').forEach(getName => {
        const usernameLength = getName.getAttribute('data-usernameLength');
        getName.textContent = username.name.length > Number(usernameLength) ? username.name.slice(0, Number(usernameLength)) + '...' : username.name;
    })
}
showUsername();