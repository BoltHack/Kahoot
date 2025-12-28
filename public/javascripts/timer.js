function getCookie(name) {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(row => row.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

const ACCESS_TIMER_DURATION = 900000;
const REFRESH_TIMER_DURATION = 777600000;
function startTokenTimer (duration, tokenType) {
    const startTime = Date.now();
    const endTime = startTime + duration;
    const maxAge = duration / 1000;

    document.cookie = `${tokenType}=${endTime}; max-age=${maxAge}; path=/;`;

    updateTokenTimer(tokenType);
}

function updateTokenTimer(tokenType) {
    const endTime = parseInt(getCookie(tokenType), 10);

    const interval = setInterval(() => {
        const currentTime = Date.now();
        const remainingTime = endTime - currentTime;

        if (remainingTime <= 0) {
            clearInterval(interval);
            getToken(tokenType);
            document.cookie = `${tokenType}=; max-age=0; path=/;`;
        }
    }, 1000);
}

function storedTime(tokenType) {
    const storedEndTime = getCookie(tokenType);

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
    if (!['accessTokenEndTime', 'refreshTokenEndTime'].includes(tokenType)) {
        console.error(`Неизвестный тип токена: ${tokenType}`);
        return;
    }

    if (!navigator.onLine) {
        console.warn('Нет интернета. Пропускаем получение токена.');
        return;
    }

    const setTokenType = tokenType === 'accessTokenEndTime' ? '/accessToken' : '/refreshToken';

    try {
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
            console.warn('Токен отсутствует в ответе сервера.');
            return;
        }

        if (tokenType === 'accessTokenEndTime') {
            startTokenTimer(ACCESS_TIMER_DURATION, 'accessTokenEndTime');
            console.log('Access-токен выдан и таймер запущен.');
        } else {
            startTokenTimer(REFRESH_TIMER_DURATION, 'refreshTokenEndTime');
            console.log('Refresh-токен выдан и таймер запущен.');
        }
        localStorage.setItem('token', token);
    } catch (error) {
        console.error('Ошибка при запросе токена:', error.message || error);
        setTimeout(() => {
            console.log('Повторная попытка получить access токен...');
            getToken(tokenType);
        }, 5000);
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
if (sessionEndTime === typeof String){
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
            localStorage.removeItem('session');
            localStorage.removeItem('sessionEndTime');
            window.location.href = "/auth/sessionExpired";
            return;
        }
    });
}