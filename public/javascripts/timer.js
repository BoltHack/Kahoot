function getCookie(name) {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(row => row.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

const ACCESS_TIMER_DURATION = 900000;
const REFRESH_TIMER_DURATION = 864000000;
function startTokenTimer (duration, tokenType) {
    const startTime = Date.now();
    const endTime = startTime + duration;

    document.cookie = `${tokenType}=${endTime}; path=/;`;

    updateTokenTimer(tokenType);
}

function updateTokenTimer(tokenType) {
    const endTime = parseInt(getCookie(tokenType), 10);

    const interval = setInterval(() => {
        const currentTime = Date.now();
        const remainingTime = endTime - currentTime;

        if (remainingTime <= 0) {
            clearInterval(interval);
            tokenType === 'accessTokenEndTime' ? getAccessTokens() : getRefreshTokens();
            document.cookie = `${tokenType}=; max-age=0; path=/;`;
        }
    }, 1000);
}

function storedTime(tokenType) {
    const storedEndTime = getCookie(tokenType);

    if (storedEndTime) {
        updateTokenTimer(tokenType);
    }
    if (!Number(storedEndTime)){
        tokenType === 'accessTokenEndTime' ? getAccessTokens() : getRefreshTokens();
    }
    else if (localStorage.getItem('token') && !storedEndTime){
        console.log('test')
        tokenType === 'accessTokenEndTime' ? getAccessTokens() : getRefreshTokens();
    }
}

storedTime('accessTokenEndTime');
storedTime('refreshTokenEndTime');

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

        startTokenTimer(ACCESS_TIMER_DURATION, 'accessTokenEndTime')
        console.log('токен выдан');

        } else {
            console.error('Ошибка', response.status);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
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

            if (token){
                localStorage.setItem('token', token);
            }
        startTokenTimer(REFRESH_TIMER_DURATION, 'refreshTokenEndTime');
        console.log('refresh токен выдан');

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