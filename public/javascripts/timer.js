const ACCESS_TIMER_DURATION = 900000;
const REFRESH_TIMER_DURATION = 777600000;
function startTokenTimer (duration, tokenType) {
    const endTime = Date.now() + duration;

    localStorage.setItem(tokenType, endTime)
    updateTokenTimer(tokenType);
}

const timers = {
    accessTokenEndTime: null,
    refreshTokenEndTime: null,
    sessionEndTime: null
}

function updateTokenTimer(tokenType) {
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
            timers[tokenType] = null;
            getToken(tokenType);
            localStorage.removeItem(tokenType);
        }
    }, 1000);
}

function storedTime(tokenType) {
    const storedEndTime = parseInt(localStorage.getItem(tokenType), 10);

    if (storedEndTime) {
        updateTokenTimer(tokenType);
    } else {
        getToken(tokenType);
    }
}

if (localStorage.getItem('token')) {
    console.log('Работа с токенами...');
    storedTime('accessTokenEndTime');
    storedTime('refreshTokenEndTime');
}

async function getToken(tokenType) {
    if (localStorage.getItem('isRefreshing') === "true") return;

    if (!['accessTokenEndTime', 'refreshTokenEndTime'].includes(tokenType)) {
        console.error(`Неизвестный тип токена: ${tokenType}`);
        return;
    }

    if (!navigator.onLine) return;

    const setTokenType = tokenType === 'accessTokenEndTime' ? '/accessToken' : '/refreshToken';

    try {
        localStorage.setItem('isRefreshing', 'true');

        const response = await fetch(setTokenType, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.status === 401 || response.status === 403) {
            sessionLogout();
            return;
        }

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

        const duration = tokenType === 'accessTokenEndTime' ? ACCESS_TIMER_DURATION : REFRESH_TIMER_DURATION;
        startTokenTimer(duration, tokenType);
        localStorage.setItem('token', token);
        console.log(`[${tokenType}] Токен успешно обновлен.`);
    } catch (error) {
        console.error('Ошибка при запросе токена:', error.message || error);
        // setTimeout(() => {
        // console.log(`Повторная попытка получить токен...`);
        // getToken(tokenType);
        // }, 5000);
    } finally {
        localStorage.removeItem('isRefreshing');
    }
}

window.addEventListener('storage', (event) => {
    if (['accessTokenEndTime', 'refreshTokenEndTime'].includes(event.key)) {
        updateTokenTimer(event.key);
    }

    if (event.key === 'sessionEndTime' && !event.newValue) {
        sessionLogout();
    }
})




const SESSION_TIMER_DURATION = 86400000;
const session = localStorage.getItem('session');
function sessionTimerStart(duration) {
    const endTime = Date.now() + duration;

    if (session === "false" && localStorage.getItem('token')) {
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
        if (endTime - Date.now() <= 0) {
            clearInterval(timers.sessionEndTime);
            sessionLogout();
        }
    }, 1000);
}

const sessionEndTime = localStorage.getItem('sessionEndTime');

if (sessionEndTime) {
    sessionUpdateTimer();
}
else if (!sessionEndTime && localStorage.getItem('token')) {
    sessionTimerStart(SESSION_TIMER_DURATION);
}


function sessionLogout() {
    fetch('/auth/logout', {
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => res.json()).then((res) => {
        const {error} = res;
        if (error) {
            console.log('Ошибка очистки данных:', error);
        } else {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            localStorage.removeItem('session');
            localStorage.removeItem('sessionEndTime');
            localStorage.removeItem('accessTokenEndTime');
            localStorage.removeItem('refreshTokenEndTime');
            window.location.href = "/auth/sessionExpired";
        }

    }).catch(error => {
        console.log('Ошибка выдачи сессии', error);
        logout();
    })
}