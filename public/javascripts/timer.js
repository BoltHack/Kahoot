const ACCESS_TIMER_DURATION = 900000;
const REFRESH_TIMER_DURATION = 777600000;
const SESSION_TIMER_DURATION = 86400000;
function startTokenTimer (tokenType, tokenTimerType, tokenTimerDuration) {
    const endTime = Date.now() + tokenTimerDuration;

    localStorage.setItem(tokenTimerType, endTime)
    updateTokenTimer(tokenType, tokenTimerType, tokenTimerDuration);
}

const timers = {
    accessTokenEndTime: null,
    refreshTokenEndTime: null,
    sessionEndTime: null
}

function updateTokenTimer(tokenType, tokenTimerType, tokenTimerDuration) {
    const endTime = parseInt(localStorage.getItem(tokenTimerType), 10);
    if (!endTime) return;

    if (timers[tokenTimerType]) {
        clearInterval(timers[tokenTimerType])
    }

    timers[tokenTimerType] = setInterval(() => {
        const currentTime = Date.now();
        const remainingTime = endTime - currentTime;

        // if (timers[tokenTimerType]) clearInterval(timers[tokenTimerType]);
        if (remainingTime <= 30000) {
            clearInterval(timers[tokenTimerType]);
            timers[tokenTimerType] = null;
            getToken(tokenType, tokenTimerType, tokenTimerDuration);
            localStorage.removeItem(tokenTimerType);
        }
    }, 1000);
}

function storedTime(tokenType, tokenTimerType, tokenTimerDuration) {
    const storedEndTime = parseInt(localStorage.getItem(tokenTimerType), 10);

    if (storedEndTime) {
        updateTokenTimer(tokenType, tokenTimerType, tokenTimerDuration);
    } else {
        getToken(tokenType, tokenTimerType, tokenTimerDuration);
    }
}

if (localStorage.getItem('token')) {
    console.log('Работа с токенами...');
    storedTime('accessToken', 'accessTokenEndTime', ACCESS_TIMER_DURATION);
    storedTime('refreshToken', 'refreshTokenEndTime', REFRESH_TIMER_DURATION);
}

async function getToken(tokenType, tokenTimerType, tokenTimerDuration) {
    if (localStorage.getItem('isRefreshing') === "true") return;

    if (!['accessToken', 'refreshToken'].includes(tokenType)) {
        console.error(`Неизвестный тип токена: ${tokenType}`);
        return;
    }

    if (!navigator.onLine) return;

    try {
        localStorage.setItem('isRefreshing', 'true');

        const response = await fetch('/' + tokenType, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.status === 401 || response.status === 403) {
            console.log('error 401 || 403', response.status);
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

        startTokenTimer(tokenType, tokenTimerType, tokenTimerDuration);
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
    if (localStorage.getItem('isRefreshing') === "true") return;

    // if (['accessTokenEndTime', 'refreshTokenEndTime'].includes(event.key)) {
    //     updateTokenTimer(event.key);
    // }

    if (event.key === 'sessionEndTime' && !event.newValue) {
        sessionLogout();
    }
});




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

if (sessionEndTime && localStorage.getItem('session') === 'false') {
    sessionUpdateTimer();
}
else if (!sessionEndTime && localStorage.getItem('token') && localStorage.getItem('session') === 'false') {
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
        }
        else {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            localStorage.removeItem('session');
            localStorage.removeItem('sessionEndTime');
            localStorage.removeItem('accessTokenEndTime');
            localStorage.removeItem('refreshTokenEndTime');
            window.location.href = "/auth/login";
        }

    }).catch(error => {
        console.log('Ошибка выдачи сессии', error);
        // logout();
    })
}