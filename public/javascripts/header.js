const socket = io();
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem('token')) {
        if (typeof socket !== "undefined" && sendId) {
            socket.emit('requestMyFriendsCount', sendId);
        } else {
            console.error(`Socket or sendId(${sendId}) is not defined.`);
            setTimeout(function () {
                window.location.reload();
            }, 3000);
        }
    }
});

const account = document.getElementById('account');
const myToken = localStorage.getItem('token');
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
if (myToken){
    account.innerHTML = `
<div class="dropdown">
    <p class="ha dropdown-title" style="color: #ced4da; background-color: #1C2025;">${userInfo.name}</p>
    <div class="dropdown-content">
        <a onclick="logout();">${localeType === 'en' ? 'Sign Out' : 'Выйти'}</a>
    </div>
</div>
`
}
else{
    account.innerHTML = `<p class="ha dropdown-title" onclick="window.location.href = '/auth/login'">${localeType === 'en' ? 'Sign in' : 'Войти'}</p>`
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
            return;
        }

        if (status) {
            localStorage.removeItem('name');
            localStorage.removeItem('return_id');
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

const dropdownTitles = document.querySelectorAll('.dropdown-title');
const dropdownContents = document.querySelectorAll('.dropdown-content');
const dropdown = document.querySelectorAll('.dropdown');

dropdown.forEach((title, index) => {
    title.addEventListener('mouseover', () => {
        dropdownContents[index].style.display = 'flex';
        dropdownContents[index].style.transform = 'scaleY(1)';
    });

    title.addEventListener('mouseout', () => {
        dropdownContents[index].style.display = 'none';
        dropdownContents[index].style.transform = 'scaleY(0)';
    });
});