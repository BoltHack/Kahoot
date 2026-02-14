// function getCookie(name) {
//     const cookies = document.cookie.split('; ');
//     const cookie = cookies.find(row => row.startsWith(`${name}=`));
//     return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
// }

const ACCESS_TIMER_DURATION = 900000;
const REFRESH_TIMER_DURATION = 777600000;
function startTokenTimer (duration, tokenType) {
    const startTime = Date.now();
    const endTime = startTime + duration;
    // const maxAge = duration / 1000;

    localStorage.setItem(tokenType, endTime)
    // document.cookie = `${tokenType}=${endTime}; max-age=${maxAge}; path=/;`;

    updateTokenTimer(tokenType);
}

const timers = {
    accessTokenEndTime: null,
    refreshTokenEndTime: null,
    sessionEndTime: null
}

function updateTokenTimer(tokenType) {
    // const endTime = parseInt(getCookie(tokenType), 10);
    const endTime = parseInt(localStorage.getItem(tokenType), 10);
    if (!endTime) return;

    if (timers[tokenType]) {
        clearInterval(timers[tokenType])
    }

    timers[tokenType] = setInterval(() => {
        const currentTime = Date.now();
        const remainingTime = endTime - currentTime;

        if (remainingTime <= 0) {
            clearInterval(timers[tokenType]);
            getToken(tokenType);
            // document.cookie = `${tokenType}=; max-age=0; path=/;`;
            localStorage.removeItem(tokenType);
        }
    }, 1000);
}

function storedTime(tokenType) {
    // const storedEndTime = getCookie(tokenType);
    const storedEndTime = localStorage.getItem(tokenType);

    if (storedEndTime) {
        updateTokenTimer(tokenType);
        return;
    }
    if (!Number(storedEndTime)){
        console.log('Значение токена было изменено. Выдаю новый токен...');
        getToken(tokenType);
    }
    else if (localStorage.getItem('token') && !storedEndTime){
        console.log('Выдаю токен');
        getToken(tokenType);
    }
}

if (localStorage.getItem('token')) {
    console.log('Работа с токенами...');
    storedTime('accessTokenEndTime');
    storedTime('refreshTokenEndTime');
}

async function getToken(tokenType) {
    if (localStorage.getItem('isRefreshing') === 'true') {
        return;
    }

    if (!['accessTokenEndTime', 'refreshTokenEndTime'].includes(tokenType)) {
        console.error(`Неизвестный тип токена: ${tokenType}`);
        return;
    }

    if (!navigator.onLine) {
        console.warn('Нет интернета. Соединение потеряно.');
        return;
    }

    const setTokenType = tokenType === 'accessTokenEndTime' ? '/accessToken' : '/refreshToken';

    try {
        localStorage.setItem('isRefreshing', 'true')

        const response = await fetch(setTokenType, {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            console.error(`Ошибка: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();
        const { token } = data;

        if (!token) {
            console.warn('Токен отсутствует.');
            return;
        }

        if (tokenType === 'accessTokenEndTime') {
            startTokenTimer(ACCESS_TIMER_DURATION, 'accessTokenEndTime');
            console.log('Access-токен выдан.\nТаймер запущен.');
        } else {
            startTokenTimer(REFRESH_TIMER_DURATION, 'refreshTokenEndTime');
            console.log('Refresh-токен выдан.\nТаймер запущен.');
        }
        localStorage.setItem('token', token);
    } catch (error) {
        console.error('Ошибка при запросе токена:', error.message || error);
        setTimeout(() => {
            console.log(`Повторная попытка получить ${tokenType} токен...`);
            getToken(tokenType);
        }, 5000);
    } finally {
        localStorage.removeItem('isRefreshing');
    }
}

window.addEventListener('storage', (event) => {
    if (event.key === 'accessTokenEndTime' || event.key === 'refreshTokenEndTime') {
        console.log('Обновление токена...');
        updateTokenTimer(event.key);
    }

    if (event.key === 'sessionEndTime' && !event.newValue) {
        sessionLogout();
    }
})




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
    if (!endTime) return;

    if (timers.sessionEndTime) {
        clearInterval(timers.sessionEndTime);
    }

    timers.sessionEndTime = setInterval(() => {
        const currentTime = Date.now();
        const remainingTime = endTime - currentTime;

        if (remainingTime <= 0) {
            clearInterval(timers.sessionEndTime);
            sessionLogout();
            localStorage.removeItem('sessionEndTime');
        }
    }, 1000);
}

const sessionEndTime = localStorage.getItem('sessionEndTime');

if (sessionEndTime) {
    sessionUpdateTimer();
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
            localStorage.removeItem('session');
            localStorage.removeItem('sessionEndTime');
            localStorage.removeItem('accessTokenEndTime');
            localStorage.removeItem('refreshTokenEndTime');
            window.location.href = "/auth/sessionExpired";
            return;
        }
    });
}