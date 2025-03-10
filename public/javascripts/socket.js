const socket = io();

const gameId = game;
const userId = id;
const userName = name;

let countdown;
let timeLeft = 10;
let questions = document.getElementById('questions');
let refresh = document.getElementById('refresh');
let bc = document.getElementById('b-c');

let requestSent = false;

const startCountdown = () => {
    countdown = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdown);
            document.getElementById('timer').innerHTML = '';
            questions.hidden = false;
            requestSent = false;
            refresh.style.display = 'none';
            bc.style.top = '11%';
            checkReload();
            gameTimerStart();
            soundTrackAuto();
        } else {
            document.getElementById('timer').innerHTML = `<p class="timer">${localeType === 'en' ? 'Before the game starts: ' + timeLeft : 'До начала игры: ' + timeLeft}</p>`;
            timeLeft--;
        }
    }, 1000);
};


let gameTimerCooldown;
let gameTimer = Number(gamesExpiresInSeconds);
let gameStartTime;

const updateTimer = () => {
    const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const remainingTime = Math.max(gameTimer - elapsedTime, 0);
    const time = document.querySelector('.game-timer');
    // console.log('elapsedTime:', elapsedTime | gameTimer);
    // console.log('remainingTime:', remainingTime);

    if (elapsedTime >= gameTimer) {
        console.log('Таймер завершен');
        document.getElementById('gameTimer').innerHTML = '<p class="game-timer">0</p>';
        questions.hidden = true;
        setInterval(function (){
            socket.emit('requestLeadersCount');
        }, 500);
        stopSound();
        const leaderGameTime = gamesExpiresInSeconds - Number(time.textContent);
        requestSent = true;
        fetch(`/user-leader/${gamesId}/${leaderGameTime}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => {
                if (response.ok)
                    console.log('ok');
            })
            .catch(error => {
                console.log('err', error);
            })

    }

    document.getElementById('gameTimer').innerHTML = `<p class="game-timer">${remainingTime}</p>`;

    if (requestSent === false) {
        gameTimerCooldown = setTimeout(updateTimer, 1000);
    }
    else {
        console.log('таймер остановлен');
    }
};

const gameTimerStart = () => {
    gameStartTime = Date.now();
    updateTimer();
};


socket.on('updateUserCount', (onlineCount) => {
    const getId = onlineCount.users.map(user => user.userId) || [];
    const checkAllId = getId.length !== new Set(getId).size;
    if (checkAllId){
        const errorMsg = localeType === 'en' ? 'You cannot log into the game from one account more than once.' : 'Вы не можете зайти в игру с одного аккаунта больше одного раза.';
        window.location.href = `/error?message=${encodeURIComponent(errorMsg)}`;
    }
    document.getElementById('onlineCount').innerText = `${localeType === 'en' ? 'online: ' + onlineCount.online  : 'Онлайн: ' + onlineCount.online}`;

    const users = document.getElementById('usersCount');
    if (users && Array.isArray(onlineCount.users)) {
        users.innerHTML = onlineCount.users
            .map(user => `
<div class="userImage checkUser" data-id="${user.userId}">
    <img src="data:image/png;base64,${user.userImage}" onmouseover="showUserName(event);">
    <div id="userName-${user.userId}" class="tooltip" hidden><span>${user.userName}</span></div>
</div>
`)
            .join('');
    }

    if (onlineCount.online < 2) {
        questions.hidden = true;
        console.log('Онлайна мало');
        clearInterval(countdown);
        timeLeft = 10;
        document.getElementById('timer').innerHTML = `
        <div class="progress">
            <div class="inner"></div>
        </div>
        <p class="pi">${localeType === 'en' ? 'Waiting for players...' : 'Ожидание игроков...'}</p>
        `;
        bc.style.top = '2%';
        stopSound();
    }
    if (onlineCount.online >= 2) {
        clearInterval(countdown);
        timeLeft = 10;
        console.log('Поехали!');
        startCountdown();
    }

    if (sessionStorage.getItem("redirectAfterReload") === "true"){
        sessionStorage.removeItem("redirectAfterReload");
    }

    socket.on('redirect', (return_id) => {
        window.location.href = '/return-menu';
        sessionStorage.setItem('return_id', return_id);
    });

    socket.on('gameOff', () => {
        window.location.href = '/';
    });

    socket.on('updateAnswersCount', (answersCount) => {
        document.getElementById('correctAnswersCount').innerHTML = `<span><p class="game_correct-answers">${answersCount[0].game_correct_answers || 0}</p> <p class="game_correct-answers-text">${localeType === 'en' ? 'Correct answers' : 'Правильных ответов'}</p></span>`;
        document.getElementById('answersCount').innerHTML = `<span><p class="game-answers">${answersCount[0].game_answers || 0}/${gameMaxQuestions}</p></span>`;
    });

    socket.on('updateLeaderBoard', (leaderBoard) => {
        const leaderB = document.getElementById('leaderBoard');

        if (leaderBoard && leaderBoard.length > 0) {
            leaderB.innerHTML = '';
            const fragment = document.createDocumentFragment();

            leaderBoard
                .sort((a, b) => b.correct_answers - a.correct_answers)
                .forEach((leader, index) => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                    <div class="color eerie-black">
                        #${index + 1} ${leader.name}
                        <span class="hex">
                    ${localeType === 'en' ? 
`|  Correct answers: ${leader.correct_answers}  |  Time: ${leader.time} sec.` : 
`|  Правильных ответов: ${leader.correct_answers}  |  Время: ${leader.time} сек.`
                    }
                        </span>
                    </div>
                `;
                    fragment.appendChild(div);
                });

            leaderB.appendChild(fragment);
        }
    });
});

socket.emit('joinGame', gameId, userId, userName);

function showUserName(event){
    const checkName = document.querySelectorAll('.checkUser');
    event.currentTarget.querySelector("img");

    checkName.forEach(hover => {
        hover.addEventListener('mouseover', function () {
            const dataId = this.getAttribute('data-id');
            const userName = document.getElementById('userName-'+dataId);
            userName.style.display = 'block';
        })
        hover.addEventListener('mouseout', function () {
            const dataId = this.getAttribute('data-id');
            const userName = document.getElementById('userName-'+dataId);
            userName.style.display = 'none';
        })
    })
}

