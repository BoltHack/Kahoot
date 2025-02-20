function getCookie(name) {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(row => row.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

const ACCESS_TIMER_DURATION = 900000;
function accessStartTimer(duration) {
    const startTime = Date.now();
    const endTime = startTime + duration;

    if (localStorage.getItem('token')){
        document.cookie = `accessTokenEndTime=${endTime}; path=/;`;
    }

    accessUpdateTimer();
}

function accessUpdateTimer() {
    const endTime = parseInt(getCookie('accessTokenEndTime'), 10);

    const interval = setInterval(() => {
        const currentTime = Date.now();
        const remainingTime = endTime - currentTime;

        if (remainingTime <= 0) {
            clearInterval(interval);
            getAccessTokens();
            document.cookie = `accessTokenEndTime=; max-age=0; path=/;`;
        }
    }, 1000);
}

const accessStoredEndTime = getCookie('accessTokenEndTime');

if (accessStoredEndTime) {
    accessUpdateTimer();
}
if (accessStoredEndTime === typeof String){
    getAccessTokens();
}
else if (localStorage.getItem('token') && !accessStoredEndTime){
    console.log('test')
    getAccessTokens();
}
// else {
//     console.log('test');
//     getAccessTokens();
// }


async function getAccessTokens() {
    try {
        const response = await fetch('/accessToken', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            const { token } = data;

            if(!token) {
                console.log('Токен не найден')
                return;
            }

            if (token){
                localStorage.setItem('token', token);
            }
            accessStartTimer(ACCESS_TIMER_DURATION);
            console.log('токен выдан')
            // window.location.reload();

        } else {
            console.error('Ошибка', response.status);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}








const REFRESH_TIMER_DURATION = 864000000;
function refreshStartTimer(duration) {
    const startTime = Date.now();
    const endTime = startTime + duration;

    if (localStorage.getItem('token')) {
        document.cookie = `refreshTokenEndTime=${endTime}; path=/;`;
    }

    refreshUpdateTimer();
}

function refreshUpdateTimer() {
    const endTime = parseInt(getCookie('refreshTokenEndTime'), 10);

    const interval = setInterval(() => {
        const currentTime = Date.now();
        const remainingTime = endTime - currentTime;

        if (remainingTime <= 0) {
            clearInterval(interval);
            getRefreshTokens()
            document.cookie = `refreshTokenEndTime=; max-age=0; path=/;`;
        }
    }, 1000);
}

const refreshStoredEndTime = getCookie('refreshTokenEndTime');

if (refreshStoredEndTime) {
    refreshUpdateTimer();
}
if (refreshStoredEndTime === typeof String){
    refreshStartTimer(REFRESH_TIMER_DURATION);
}
else {
    refreshStartTimer(REFRESH_TIMER_DURATION);
}


async function getRefreshTokens() {
    try {
        const response = await fetch('/refreshToken', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            const { token } = data;

            if(!token) {
                console.log('Токен не найден')
            }

            window.location.reload();
        } else {
            console.error('Ошибка', response.status);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}










const SESSION_TIMER_DURATION = 86400000;
const session = localStorage.getItem('session');
function sessionTimerStart(duration) {
    const startTime = Date.now();
    const endTime = startTime + duration;

    if (session === 'false' && localStorage.getItem('token')) {
        localStorage.setItem('sessionEndTime', endTime);
    }

    sessionUpdateTimer();
}

function sessionUpdateTimer() {
    const endTime = parseInt(localStorage.getItem('sessionEndTime'), 10);

    const interval = setInterval(() => {
        const currentTime = Date.now();
        const remainingTime = endTime - currentTime;

        if (remainingTime <= 0) {
            clearInterval(interval);
            sessionLogout();
            localStorage.removeItem('sessionEndTime');
        }
    }, 1000);
}

const sessionEndTime = localStorage.getItem('sessionEndTime');

if (sessionEndTime) {
    sessionUpdateTimer();
}
if (typeof sessionEndTime === "string"){
    sessionTimerStart(SESSION_TIMER_DURATION);
}
else {
    sessionTimerStart(SESSION_TIMER_DURATION);
}


function sessionLogout() {
    fetch('/auth/logout', {
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => res.json()).then((res) => {
        const {status, error} = res;
        if (error) {
            return;
        }

        if (status) {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            localStorage.removeItem('ref');
            localStorage.removeItem('favorites');
            localStorage.removeItem('session');
            localStorage.removeItem('sessionEndTime');
            localStorage.removeItem('menus');
            window.location.href = "/auth/sessionExpired";
            return;
        }
    });
}